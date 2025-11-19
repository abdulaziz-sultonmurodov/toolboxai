from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
import requests
import os
from pathlib import Path
import uuid
import subprocess
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# AcoustID API key - Get yours free at https://acoustid.org/new-application
ACOUSTID_API_KEY = os.getenv("ACOUSTID_API_KEY", "")

def cleanup_file(path: str):
    """Delete file after processing"""
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        print(f"Error deleting file {path}: {e}")

def get_fpcalc_path():
    """Find fpcalc executable"""
    # Try common locations
    possible_paths = [
        "fpcalc.exe",
        "fpcalc",
        r"C:\Program Files\ffmpeg\bin\fpcalc.exe",
        r"C:\ffmpeg\bin\fpcalc.exe",
    ]
    
    for path in possible_paths:
        try:
            result = subprocess.run([path, "-version"], capture_output=True, timeout=5)
            if result.returncode == 0:
                return path
        except:
            continue
    
    return None

def generate_fingerprint(file_path: str):
    """Generate audio fingerprint using fpcalc"""
    fpcalc = get_fpcalc_path()
    
    if not fpcalc:
        raise Exception("fpcalc not found. Please download from https://acoustid.org/chromaprint and add to PATH")
    
    try:
        result = subprocess.run(
            [fpcalc, "-json", file_path],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode != 0:
            raise Exception(f"fpcalc failed: {result.stderr}")
        
        data = json.loads(result.stdout)
        return data.get('fingerprint'), data.get('duration')
    
    except subprocess.TimeoutExpired:
        raise Exception("Audio processing timeout")
    except json.JSONDecodeError:
        raise Exception("Failed to parse fpcalc output")
    except Exception as e:
        raise Exception(f"Fingerprint generation failed: {str(e)}")

@router.post("/recognize")
async def recognize_music(file: UploadFile = File(...)):
    """
    Recognize music from uploaded audio file using AcoustID (completely FREE!).
    Supports: MP3, WAV, M4A, FLAC, OGG, and other common audio formats.
    """
    if not ACOUSTID_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="Music recognition API key not configured. Please add ACOUSTID_API_KEY to your .env file. Get a FREE key at https://acoustid.org/new-application (no credit card required!)"
        )
    
    # Validate file type
    allowed_extensions = {'.mp3', '.wav', '.m4a', '.flac', '.ogg', '.webm', '.opus', '.aac', '.wma'}
    file_ext = Path(file.filename or "").suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed formats: {', '.join(allowed_extensions)}"
        )
    
    # Save uploaded file temporarily
    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = UPLOAD_DIR / temp_filename
    
    try:
        # Save file
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        
        # Generate fingerprint
        try:
            fingerprint, duration = generate_fingerprint(str(temp_path))
            if not fingerprint or not duration:
                raise Exception("Failed to extract audio fingerprint")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Audio processing error: {str(e)}. Please ensure fpcalc is installed. Download from: https://acoustid.org/chromaprint"
            )
        
        # Query AcoustID API
        try:
            url = "https://api.acoustid.org/v2/lookup"
            params = {
                'client': ACOUSTID_API_KEY,
                'duration': int(duration),
                'fingerprint': fingerprint,
                'meta': 'recordings releasegroups compress'
            }
            
            response = requests.get(url, params=params, timeout=15)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to communicate with music recognition service"
                )
            
            result = response.json()
            
            # Check API response
            if result.get('status') != 'ok':
                error_msg = result.get('error', {}).get('message', 'Unknown error')
                if 'key' in error_msg.lower():
                    raise HTTPException(status_code=401, detail="Invalid API key. Please check your ACOUSTID_API_KEY.")
                raise HTTPException(status_code=400, detail=f"API error: {error_msg}")
            
            results_list = result.get('results', [])
            
            if not results_list:
                return JSONResponse(
                    status_code=200,
                    content={
                        "recognized": False,
                        "message": "Song not recognized. Try recording 15-30 seconds of clear audio from a well-known song."
                    }
                )
            
            # Get best match
            best_match = results_list[0]
            score = best_match.get('score', 0)
            
            if score < 0.4:
                return JSONResponse(
                    status_code=200,
                    content={
                        "recognized": False,
                        "message": f"Low confidence match ({round(score*100, 1)}%). Try a clearer recording."
                    }
                )
            
            # Extract metadata
            recordings = best_match.get('recordings', [])
            if not recordings:
                return JSONResponse(
                    status_code=200,
                    content={
                        "recognized": False,
                        "message": "Audio matched but no song metadata available."
                    }
                )
            
            recording = recordings[0]
            
            # Build response
            response_data = {
                "recognized": True,
                "title": recording.get('title', 'Unknown'),
                "artist": 'Unknown',
                "album": 'Unknown',
                "confidence": round(score * 100, 1),
                "recording_id": recording.get('id', '')
            }
            
            # Get artist
            if recording.get('artists'):
                artists = [a.get('name', '') for a in recording['artists']]
                response_data['artist'] = ', '.join(filter(None, artists)) or 'Unknown'
            
            # Get album
            if recording.get('releasegroups'):
                response_data['album'] = recording['releasegroups'][0].get('title', 'Unknown')
            
            # Try to enrich with MusicBrainz and Spotify data
            spotify_track_id = None
            try:
                mb_url = f"https://musicbrainz.org/ws/2/recording/{recording.get('id')}"
                mb_params = {'inc': 'releases+url-rels', 'fmt': 'json'}
                mb_headers = {'User-Agent': 'MusicIDApp/1.0'}
                
                mb_response = requests.get(mb_url, params=mb_params, headers=mb_headers, timeout=5)
                
                if mb_response.status_code == 200:
                    mb_data = mb_response.json()
                    
                    # Get release date
                    if mb_data.get('releases'):
                        for release in mb_data['releases']:
                            if release.get('date'):
                                response_data['release_date'] = release['date']
                                break
                    
                    # Look for Spotify link and extract track ID
                    if mb_data.get('relations'):
                        for rel in mb_data['relations']:
                            url_res = rel.get('url', {}).get('resource', '')
                            if 'spotify.com/track/' in url_res:
                                response_data['spotify_url'] = url_res
                                # Extract Spotify track ID from URL
                                spotify_track_id = url_res.split('/track/')[-1].split('?')[0]
                                break
            except:
                pass  # MusicBrainz enrichment is optional
            
            # If we have a Spotify track ID, fetch preview URL and album art
            if spotify_track_id:
                try:
                    # Use Spotify's public API (no auth needed for track info)
                    spotify_api_url = f"https://api.spotify.com/v1/tracks/{spotify_track_id}"
                    
                    # Get Spotify access token (client credentials flow)
                    # Note: For production, you'd want to cache this token
                    token_url = "https://accounts.spotify.com/api/token"
                    token_data = {
                        'grant_type': 'client_credentials'
                    }
                    # Using a public client ID (you can replace with your own)
                    # For now, we'll try without auth and fall back gracefully
                    
                    # Try to get track info without auth (some endpoints work)
                    spotify_response = requests.get(
                        spotify_api_url,
                        headers={'Accept': 'application/json'},
                        timeout=5
                    )
                    
                    if spotify_response.status_code == 200:
                        spotify_data = spotify_response.json()
                        
                        # Get preview URL (30-second clip)
                        if spotify_data.get('preview_url'):
                            response_data['preview_url'] = spotify_data['preview_url']
                        
                        # Get album art
                        if spotify_data.get('album', {}).get('images'):
                            images = spotify_data['album']['images']
                            if images:
                                response_data['album_art'] = images[0]['url']  # Largest image
                except:
                    pass  # Spotify enrichment is optional
            
            return JSONResponse(status_code=200, content=response_data)
        
        except requests.exceptions.Timeout:
            raise HTTPException(status_code=408, detail="Request timeout. Please try again.")
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        cleanup_file(str(temp_path))

@router.get("/health")
async def health_check():
    """Check if the music recognition service is configured"""
    fpcalc_available = get_fpcalc_path() is not None
    
    return {
        "status": "healthy" if (ACOUSTID_API_KEY and fpcalc_available) else "degraded",
        "api_configured": bool(ACOUSTID_API_KEY),
        "fpcalc_available": fpcalc_available,
        "provider": "AcoustID (FREE - No credit card required!)",
        "note": "Download fpcalc from https://acoustid.org/chromaprint if not available" if not fpcalc_available else None
    }

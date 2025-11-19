from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from pydub import AudioSegment
import os
import shutil
from uuid import uuid4
from datetime import datetime, timedelta
from typing import Dict
import subprocess

router = APIRouter()

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Store uploaded files with metadata
# In production, use Redis or database
uploaded_files: Dict[str, dict] = {}

def check_ffmpeg_available():
    """Check if ffmpeg is available"""
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False

def cleanup_old_files():
    """Remove files older than 1 hour"""
    current_time = datetime.now()
    to_delete = []
    
    for file_id, metadata in uploaded_files.items():
        if current_time - metadata['uploaded_at'] > timedelta(hours=1):
            to_delete.append(file_id)
            # Delete physical file
            if os.path.exists(metadata['path']):
                os.remove(metadata['path'])
    
    for file_id in to_delete:
        del uploaded_files[file_id]

@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """Upload an audio file and get a file_id for further processing"""
    try:
        print(f"Upload request received: filename={file.filename}, content_type={file.content_type}")
        
        if not file.filename.endswith(('.mp3', '.wav', '.ogg', '.m4a', '.flac')):
            raise HTTPException(status_code=400, detail="Invalid file format. Supported: mp3, wav, ogg, m4a, flac")
        
        cleanup_old_files()
        
        file_id = str(uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
        
        print(f"Saving file to: {file_path}")
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        print(f"File saved, reading audio metadata...")
        
        # Get audio duration (optional - may fail without ffmpeg)
        duration = 0.0  # Default duration
        audio = None
        try:
            audio = AudioSegment.from_file(file_path)
            duration = len(audio) / 1000.0  # Convert to seconds
            print(f"Audio duration: {duration}s")
        except Exception as e:
            print(f"Warning: Could not read audio metadata (ffmpeg may not be installed): {str(e)}")
            print(f"Continuing with upload anyway...")
            # Ensure audio object is closed if it was created
            if audio is not None:
                del audio
        
        uploaded_files[file_id] = {
            'path': file_path,
            'original_filename': file.filename,
            'uploaded_at': datetime.now(),
            'duration': duration,
            'extension': file_extension
        }
        
        print(f"Upload successful: file_id={file_id}")
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "duration": duration,
            "warning": "Duration unavailable - install ffmpeg for full functionality" if duration == 0 else None
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in upload: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/trim/{file_id}")
async def trim_audio(
    file_id: str,
    start_time: float = Form(...),  # in seconds
    end_time: float = Form(...)     # in seconds
):
    """Trim an uploaded audio file"""
    if file_id not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found. Please upload the file first.")
    
    if not check_ffmpeg_available():
        raise HTTPException(
            status_code=400,
            detail="FFmpeg is required for audio trimming. Please install FFmpeg: https://ffmpeg.org/download.html"
        )
    
    metadata = uploaded_files[file_id]
    file_path = metadata['path']
    
    try:
        audio = AudioSegment.from_file(file_path)
        
        # pydub works in milliseconds
        start_ms = start_time * 1000
        end_ms = end_time * 1000
        
        if start_ms < 0 or end_ms > len(audio) or start_ms >= end_ms:
            raise HTTPException(status_code=400, detail="Invalid start or end time")
        
        trimmed_audio = audio[start_ms:end_ms]
        
        # Update the file in place
        trimmed_audio.export(file_path, format=metadata['extension'][1:])  # Remove the dot
        
        # Update metadata
        metadata['duration'] = len(trimmed_audio) / 1000.0
        
        return {
            "message": "Audio trimmed successfully",
            "file_id": file_id,
            "duration": metadata['duration']
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trim failed: {str(e)}")

@router.post("/speed/{file_id}")
async def change_speed(
    file_id: str,
    speed: float = Form(...)
):
    """Change the speed of an uploaded audio file"""
    if file_id not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found. Please upload the file first.")
    
    if not check_ffmpeg_available():
        raise HTTPException(
            status_code=400,
            detail="FFmpeg is required for speed changes. Please install FFmpeg: https://ffmpeg.org/download.html"
        )
    
    if speed < 0.5 or speed > 2.0:
        raise HTTPException(status_code=400, detail="Speed must be between 0.5 and 2.0")
    
    metadata = uploaded_files[file_id]
    file_path = metadata['path']
    temp_output = os.path.join(UPLOAD_DIR, f"temp_{file_id}{metadata['extension']}")
    
    try:
        # Try using ffmpeg first (better quality)
        try:
            command = [
                "ffmpeg", "-y",
                "-i", file_path,
                "-filter:a", f"atempo={speed}",
                "-vn",
                temp_output
            ]
            
            result = subprocess.run(
                command, 
                check=True, 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE,
                timeout=60
            )
            
            # Replace original with processed
            os.remove(file_path)
            shutil.move(temp_output, file_path)
            
            # Update duration
            audio = AudioSegment.from_file(file_path)
            metadata['duration'] = len(audio) / 1000.0
            
            return {
                "message": "Speed changed successfully (using ffmpeg)",
                "file_id": file_id,
                "duration": metadata['duration']
            }
            
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired) as ffmpeg_error:
            # Fallback to pydub (lower quality but works without ffmpeg)
            print(f"FFmpeg failed, using pydub fallback: {ffmpeg_error}")
            
            audio = AudioSegment.from_file(file_path)
            
            # Change speed using frame rate manipulation
            # This changes both speed and pitch
            sound_with_altered_frame_rate = audio._spawn(
                audio.raw_data,
                overrides={"frame_rate": int(audio.frame_rate * speed)}
            )
            
            # Convert back to normal frame rate (keeps the speed change)
            speed_changed = sound_with_altered_frame_rate.set_frame_rate(audio.frame_rate)
            
            # Export
            speed_changed.export(file_path, format=metadata['extension'][1:])
            
            # Update duration
            metadata['duration'] = len(speed_changed) / 1000.0
            
            return {
                "message": "Speed changed successfully (using pydub - install ffmpeg for better quality)",
                "file_id": file_id,
                "duration": metadata['duration'],
                "warning": "FFmpeg not found. For better quality, install ffmpeg: https://ffmpeg.org/download.html"
            }
    
    except Exception as e:
        # Clean up temp file if it exists
        if os.path.exists(temp_output):
            os.remove(temp_output)
        raise HTTPException(status_code=500, detail=f"Speed change failed: {str(e)}")

@router.get("/download/{file_id}")
async def download_audio(file_id: str):
    """Download the processed audio file"""
    if file_id not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    metadata = uploaded_files[file_id]
    return FileResponse(
        metadata['path'],
        media_type="audio/mpeg",
        filename=f"processed_{metadata['original_filename']}"
    )

@router.delete("/delete/{file_id}")
async def delete_audio(file_id: str):
    """Delete an uploaded audio file"""
    if file_id not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    metadata = uploaded_files[file_id]
    
    if os.path.exists(metadata['path']):
        os.remove(metadata['path'])
    
    del uploaded_files[file_id]
    
    return {"message": "File deleted successfully"}

@router.get("/info/{file_id}")
async def get_audio_info(file_id: str):
    """Get information about an uploaded audio file"""
    if file_id not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    metadata = uploaded_files[file_id]
    
    return {
        "file_id": file_id,
        "filename": metadata['original_filename'],
        "duration": metadata['duration'],
        "uploaded_at": metadata['uploaded_at'].isoformat()
    }

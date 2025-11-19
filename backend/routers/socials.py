from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
import yt_dlp
import os
import uuid
from pathlib import Path

router = APIRouter()

UPLOAD_DIR = Path("uploads")
PROCESSED_DIR = Path("processed")

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)

class SocialURL(BaseModel):
    url: str

def cleanup_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        print(f"Error deleting file {path}: {e}")

@router.post("/info")
async def get_info(data: SocialURL):
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
            'no_check_certificate': True,
            'socket_timeout': 10,  # 10 second timeout
            'extract_flat': False,  # We need full info
            'ignoreerrors': False,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(data.url, download=False)
            return {
                "title": info.get('title', 'Unknown'),
                "thumbnail": info.get('thumbnail', ''),
                "duration": info.get('duration', 0),
                "platform": info.get('extractor_key', 'Unknown'),
                "uploader": info.get('uploader', 'Unknown')
            }
    except Exception as e:
        error_msg = str(e)
        # Provide more user-friendly error messages
        if "Unsupported URL" in error_msg:
            raise HTTPException(status_code=400, detail="Unsupported URL. Please use Instagram, YouTube, TikTok, or other supported platforms.")
        elif "timeout" in error_msg.lower():
            raise HTTPException(status_code=408, detail="Request timeout. Please try again.")
        else:
            raise HTTPException(status_code=400, detail=f"Failed to fetch info: {error_msg}")

@router.post("/download")
async def download_media(data: SocialURL, type: str = "video"):
    try:
        filename = f"{uuid.uuid4()}"
        
        if type == "audio":
            ydl_opts = {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                'outtmpl': str(PROCESSED_DIR / f"{filename}.%(ext)s"),
                'quiet': True,
                'no_warnings': True,
                'socket_timeout': 30,
            }
            final_ext = "mp3"
        else:
            ydl_opts = {
                'format': 'best',
                'outtmpl': str(PROCESSED_DIR / f"{filename}.%(ext)s"),
                'quiet': True,
                'no_warnings': True,
                'socket_timeout': 30,
            }
            final_ext = "mp4" # This might vary, but usually mp4 for socials

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(data.url, download=True)
            ext = info.get('ext', 'mp4')
            if type == "audio":
                # yt-dlp with FFmpegExtractAudio converts to the preferred codec
                # so the file extension will be the preferred codec
                final_path = PROCESSED_DIR / f"{filename}.mp3"
            else:
                final_path = PROCESSED_DIR / f"{filename}.{ext}"
                
        if not final_path.exists():
             # Fallback check if extension was different
             found_files = list(PROCESSED_DIR.glob(f"{filename}.*"))
             if found_files:
                 final_path = found_files[0]
             else:
                raise HTTPException(status_code=500, detail="Download failed")

        # Return file as download
        media_type = "audio/mpeg" if type == "audio" else "video/mp4"
        return FileResponse(
            path=str(final_path),
            media_type=media_type,
            filename=f"social_media_{type}.{final_path.suffix.lstrip('.')}",
            background=BackgroundTasks().add_task(cleanup_file, str(final_path))
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

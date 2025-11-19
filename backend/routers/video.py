from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from moviepy import VideoFileClip
import os
import shutil
from uuid import uuid4

router = APIRouter()

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

@router.post("/remove-sound")
async def remove_sound(
    file: UploadFile = File(...)
):
    if not file.filename.endswith(('.mp4', '.mov', '.avi', '.mkv')):
        raise HTTPException(status_code=400, detail="Invalid file format")

    file_id = str(uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        video = VideoFileClip(file_path)
        new_video = video.without_audio()
        
        output_filename = f"muted_{file.filename}"
        output_path = os.path.join(PROCESSED_DIR, output_filename)
        
        new_video.write_videofile(output_path, codec="libx264", audio_codec=None)
        
        return FileResponse(output_path, media_type="video/mp4", filename=output_filename)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup upload
        if os.path.exists(file_path):
            os.remove(file_path)
        # Close video to release file handle
        try:
            if 'video' in locals(): video.close()
            if 'new_video' in locals(): new_video.close()
        except:
            pass

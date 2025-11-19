from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from PIL import Image, ImageFilter, ImageEnhance
import os
import shutil
from uuid import uuid4

router = APIRouter()

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

@router.post("/crop")
async def crop_image(
    file: UploadFile = File(...),
    left: int = Form(...),
    top: int = Form(...),
    right: int = Form(...),
    bottom: int = Form(...)
):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
        raise HTTPException(status_code=400, detail="Invalid file format")

    file_id = str(uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        img = Image.open(file_path)
        cropped_img = img.crop((left, top, right, bottom))
        
        output_filename = f"cropped_{file.filename}"
        output_path = os.path.join(PROCESSED_DIR, output_filename)
        
        cropped_img.save(output_path)
        
        return FileResponse(output_path, media_type="image/jpeg", filename=output_filename)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@router.post("/filter")
async def apply_filter(
    file: UploadFile = File(...),
    filter_type: str = Form(...)
):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
        raise HTTPException(status_code=400, detail="Invalid file format")

    file_id = str(uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        img = Image.open(file_path)
        
        if filter_type == "blur":
            processed_img = img.filter(ImageFilter.BLUR)
        elif filter_type == "contour":
            processed_img = img.filter(ImageFilter.CONTOUR)
        elif filter_type == "detail":
            processed_img = img.filter(ImageFilter.DETAIL)
        elif filter_type == "edge_enhance":
            processed_img = img.filter(ImageFilter.EDGE_ENHANCE)
        elif filter_type == "grayscale":
            processed_img = img.convert("L")
        else:
            processed_img = img
        
        output_filename = f"{filter_type}_{file.filename}"
        output_path = os.path.join(PROCESSED_DIR, output_filename)
        
        processed_img.save(output_path)
        
        return FileResponse(output_path, media_type="image/jpeg", filename=output_filename)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

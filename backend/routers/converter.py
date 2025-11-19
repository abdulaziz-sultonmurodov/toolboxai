from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from PIL import Image
import img2pdf
import os
import shutil
from uuid import uuid4
from typing import Optional
import io

router = APIRouter()

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

SUPPORTED_FORMATS = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'bmp', 'gif']

def detect_image_format(file_path: str) -> str:
    """Detect image format from file"""
    try:
        with Image.open(file_path) as img:
            return img.format.lower()
    except Exception:
        # Fallback to extension
        ext = os.path.splitext(file_path)[1][1:].lower()
        return ext if ext in SUPPORTED_FORMATS else None

@router.post("/image-to-pdf")
async def convert_image_to_pdf(
    file: UploadFile = File(...),
    format: Optional[str] = Form(None)  # Optional manual format override
):
    """Convert image to PDF with auto-detection or manual format selection"""
    try:
        print(f"Image to PDF conversion request: filename={file.filename}, manual_format={format}")
        
        file_id = str(uuid4())
        file_extension = os.path.splitext(file.filename)[1] if file.filename else '.png'
        input_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
        
        # Save uploaded file
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Detect format if not provided
        detected_format = detect_image_format(input_path)
        final_format = format.lower() if format else detected_format
        
        print(f"Detected format: {detected_format}, Final format: {final_format}")
        
        if not final_format or final_format not in SUPPORTED_FORMATS:
            os.remove(input_path)
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported or unknown image format. Supported: {', '.join(SUPPORTED_FORMATS)}"
            )
        
        # Convert to PDF
        output_filename = f"{os.path.splitext(file.filename)[0] if file.filename else 'converted'}.pdf"
        output_path = os.path.join(PROCESSED_DIR, f"{file_id}_{output_filename}")
        
        # Handle SVG separately (needs conversion to raster first)
        if final_format == 'svg':
            try:
                from cairosvg import svg2png
                # Convert SVG to PNG first, then to PDF
                png_data = svg2png(url=input_path)
                pdf_bytes = img2pdf.convert(png_data)
                with open(output_path, "wb") as f:
                    f.write(pdf_bytes)
            except ImportError:
                # Fallback: try to open with PIL (limited SVG support)
                with Image.open(input_path) as img:
                    # Convert to RGB if necessary
                    if img.mode in ('RGBA', 'LA', 'P'):
                        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'P':
                            img = img.convert('RGBA')
                        rgb_img.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                        img = rgb_img
                    
                    # Save as PDF
                    img.save(output_path, 'PDF', resolution=100.0)
        else:
            # For other formats, use img2pdf for better quality
            try:
                # Open image to check if conversion needed
                with Image.open(input_path) as img:
                    # img2pdf doesn't support RGBA, need to convert
                    if img.mode in ('RGBA', 'LA', 'P'):
                        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'P':
                            img = img.convert('RGBA')
                        if img.mode in ('RGBA', 'LA'):
                            rgb_img.paste(img, mask=img.split()[-1])
                        else:
                            rgb_img.paste(img)
                        
                        # Save as temporary RGB image
                        temp_rgb_path = os.path.join(UPLOAD_DIR, f"{file_id}_rgb.png")
                        rgb_img.save(temp_rgb_path, 'PNG')
                        
                        # Convert to PDF
                        with open(output_path, "wb") as f:
                            f.write(img2pdf.convert(temp_rgb_path))
                        
                        # Clean up temp file
                        os.remove(temp_rgb_path)
                    else:
                        # Direct conversion
                        with open(output_path, "wb") as f:
                            f.write(img2pdf.convert(input_path))
            except Exception as e:
                print(f"img2pdf failed, using PIL fallback: {e}")
                # Fallback to PIL
                with Image.open(input_path) as img:
                    if img.mode in ('RGBA', 'LA', 'P'):
                        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'P':
                            img = img.convert('RGBA')
                        if img.mode in ('RGBA', 'LA'):
                            rgb_img.paste(img, mask=img.split()[-1])
                        else:
                            rgb_img.paste(img)
                        img = rgb_img
                    img.save(output_path, 'PDF', resolution=100.0)
        
        # Clean up input file
        if os.path.exists(input_path):
            os.remove(input_path)
        
        print(f"Conversion successful: {output_path}")
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename=output_filename,
            headers={"X-Detected-Format": detected_format or "unknown"}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Conversion error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        # Clean up files
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


@router.post("/pdf-to-image")
async def convert_pdf_to_image(
    file: UploadFile = File(...),
    format: str = Form("png")  # Output format: png, jpg, jpeg, svg
):
    """Convert PDF to images (one image per page)"""
    try:
        import fitz  # PyMuPDF
        import zipfile
        from PIL import Image
        import io
        
        print(f"PDF to Image conversion request: filename={file.filename}, output_format={format}")
        
        if format.lower() not in ['png', 'jpg', 'jpeg', 'svg']:
            raise HTTPException(
                status_code=400,
                detail="Unsupported output format. Supported: png, jpg, jpeg, svg"
            )
        
        file_id = str(uuid4())
        input_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
        
        # Save uploaded PDF
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Convert PDF to images using PyMuPDF
        try:
            pdf_document = fitz.open(input_path)
            page_count = len(pdf_document)
            print(f"PDF has {page_count} page(s)")
        except Exception as e:
            os.remove(input_path)
            raise HTTPException(
                status_code=400,
                detail=f"Failed to read PDF file. Make sure it's a valid PDF. Error: {str(e)}"
            )
        
        # Determine output format
        is_svg = format.lower() == 'svg'
        output_format = 'JPEG' if format.lower() in ['jpg', 'jpeg'] else 'PNG'
        output_ext = format.lower() if format.lower() in ['jpg', 'jpeg', 'svg'] else 'png'
        
        base_filename = os.path.splitext(file.filename)[0] if file.filename else 'converted'
        
        # Convert pages to images
        output_files = []
        
        for page_num in range(page_count):
            page = pdf_document[page_num]
            
            if is_svg:
                # Extract SVG
                svg_content = page.get_svg_image()
                output_path = os.path.join(PROCESSED_DIR, f"{file_id}_page_{page_num+1}.svg")
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(svg_content)
                output_files.append(output_path)
            else:
                # Render page to pixmap (image) at 200 DPI
                mat = fitz.Matrix(200/72, 200/72)  # 200 DPI scaling
                pix = page.get_pixmap(matrix=mat)
                
                # Convert pixmap to PIL Image
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                
                output_path = os.path.join(PROCESSED_DIR, f"{file_id}_page_{page_num+1}.{output_ext}")
                img.save(output_path, output_format)
                output_files.append(output_path)
        
        pdf_document.close()
        
        # If single page, return single file
        if len(output_files) == 1:
            final_output_path = os.path.join(PROCESSED_DIR, f"{file_id}_{base_filename}.{output_ext}")
            # Rename the single file to the final name
            shutil.move(output_files[0], final_output_path)
            
            # Clean up input
            os.remove(input_path)
            
            print(f"Single page conversion successful: {final_output_path}")
            
            media_type = "image/svg+xml" if is_svg else f"image/{output_ext}"
            
            return FileResponse(
                final_output_path,
                media_type=media_type,
                filename=f"{base_filename}.{output_ext}"
            )
        
        # If multiple pages, create ZIP file
        else:
            zip_filename = f"{base_filename}_pages.zip"
            zip_path = os.path.join(PROCESSED_DIR, f"{file_id}_{zip_filename}")
            
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for i, file_path in enumerate(output_files, start=1):
                    image_filename = f"{base_filename}_page_{i}.{output_ext}"
                    zipf.write(file_path, image_filename)
                    
                    # Clean up individual file
                    os.remove(file_path)
            
            # Clean up input
            os.remove(input_path)
            
            print(f"Multi-page conversion successful: {zip_path}")
            
            return FileResponse(
                zip_path,
                media_type="application/zip",
                filename=zip_filename,
                headers={"X-Page-Count": str(len(output_files))}
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"PDF conversion error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        # Clean up files
        if 'input_path' in locals() and os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


@router.get("/supported-formats")
async def get_supported_formats():
    """Get list of supported image formats"""
    return {
        "formats": SUPPORTED_FORMATS,
        "note": "SVG support is limited and may require cairosvg for best results"
    }

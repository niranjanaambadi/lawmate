# backend/app/api/v1/endpoints/ocr.py

from app.api.deps import get_current_user
import pypdf
import io
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.db.models import User

router = APIRouter()

@router.post("/extract")
async def extract_text(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Extract text from uploaded PDF using OCR"""
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(400, "Only PDF files supported")
    
    try:
        # Read file
        contents = await file.read()
        
        # Extract text
        pdf = pypdf.PdfReader(io.BytesIO(contents))
        text = ""
        
        for page in pdf.pages:
            text += page.extract_text() + "\n\n"
        
        if not text.strip():
            raise HTTPException(400, "No text found in PDF. File might be scanned image.")
        
        return {
            "text": text,
            "pages": len(pdf.pages),
            "filename": file.filename
        }
        
    except Exception as e:
        raise HTTPException(500, f"OCR failed: {str(e)}")

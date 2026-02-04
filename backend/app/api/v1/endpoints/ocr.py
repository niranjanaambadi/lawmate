# backend/app/api/v1/endpoints/ocr.py
from fastapi import APIRouter, UploadFile, Depends, HTTPException
from app.api.deps import get_current_user
import pypdf
import io

router = APIRouter()

@router.post("/extract")
async def extract_text(file: UploadFile, current_user = Depends(get_current_user)):
    try:
        contents = await file.read()
        pdf = pypdf.PdfReader(io.BytesIO(contents))
        text = "\n".join(page.extract_text() for page in pdf.pages)
        return {"text": text}
    except Exception as e:
        raise HTTPException(500, str(e))

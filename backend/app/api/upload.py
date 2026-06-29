from fastapi import APIRouter, UploadFile, File, HTTPException
from uuid import uuid4
import os

from app.core.config import settings
from app.services.parsing_service import parse_document
from app.services.chunking_service import create_chunks_from_pages
from app.services.indexing_service import index_chunks
from app.models.document import DocumentUploadResponse

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = settings.MAX_FILE_SIZE_MB * 1024 * 1024


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):

    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Неподдерживаемый формат. Разрешены: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    content = await file.read()
    file_size = len(content)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Размер файла превышает {settings.MAX_FILE_SIZE_MB} МБ"
        )

    document_id = str(uuid4())

    try:
        pages_text = parse_document(content, file.filename)

        chunks = create_chunks_from_pages(
            pages_text=pages_text,
            document_id=document_id,
            file_name=file.filename
        )

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="Не удалось извлечь текст из документа или текст слишком короткий"
            )

        indexed_count = index_chunks(chunks)

        if indexed_count == 0:
            raise HTTPException(
                status_code=500,
                detail="Не удалось проиндексировать документ"
            )

        return DocumentUploadResponse(
            document_id=document_id,
            file_name=file.filename,
            status="indexed",
            chunks_count=indexed_count,
            message=f"Документ успешно загружен и проиндексирован ({indexed_count} чанков)"
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Внутренняя ошибка сервера: {str(e)}"
        )
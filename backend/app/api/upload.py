from fastapi import APIRouter, UploadFile, File, HTTPException
from uuid import uuid4
import os
from datetime import datetime
from typing import Optional

from app.core.config import settings
from app.core.elasticsearch import es_client
from app.services.parsing_service import parse_document
from app.services.chunking_service import create_chunks_from_pages
from app.services.indexing_service import index_chunks, INDEX_NAME
from app.models.document import DocumentUploadResponse, DocumentMetadata, PaginatedResponse

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = settings.MAX_FILE_SIZE_MB * 1024 * 1024


def get_document_metadata(document_id: str) -> Optional[dict]:
    """Получить метаданные документа из Elasticsearch."""
    try:
        response = es_client.get(index=INDEX_NAME, id=document_id)
        return response["_source"]
    except Exception:
        return None


def list_documents_from_es(page: int = 1, size: int = 10, status: Optional[str] = None) -> dict:
    """Получить список уникальных документов из Elasticsearch."""
    from_idx = (page - 1) * size

    if status and status != "all":
        query_body = {"term": {"status": status}}
    else:
        query_body = {"match_all": {}}

    response = es_client.search(
        index=INDEX_NAME,
        body={
            "size": 10000,
            "query": query_body,
            "sort": [{"upload_date": {"order": "desc"}}]
        }
    )

    # Группируем по document_id
    docs = {}
    for hit in response["hits"]["hits"]:
        source = hit["_source"]
        doc_id = source.get("document_id")
        if not doc_id:
            continue

        upload_date_str = source.get("upload_date")
        if upload_date_str:
            try:
                upload_date = datetime.fromisoformat(upload_date_str)
            except Exception:
                upload_date = datetime.now()
        else:
            upload_date = datetime.now()

        if doc_id not in docs:
            docs[doc_id] = {
            "id": doc_id,
            "name": source.get("file_name", "unknown"),
            "size": source.get("size", 0),
            "mimeType": source.get(
                "mime_type",
                "application/octet-stream",
            ),
            "pages": 1,
            "status": "ready",
            "progress": 100,
            "uploadedAt": upload_date,
            "indexedAt": upload_date,
            "error": None,
}
        else:
            docs[doc_id]["pages"] += 1

    all_items = list(docs.values())
    total = len(all_items)
    paginated = all_items[from_idx:from_idx + size]

    return {
        "items": paginated,
        "total": total,
        "page": page,
        "size": size,
        "totalPages": (total + size - 1) // size if total > 0 else 0
    }


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
            file_name=file.filename,
        )

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="Не удалось извлечь текст из документа или текст слишком короткий"
            )

        indexed_count = index_chunks(
            chunks,
            file_size=file_size,
            mime_type=file.content_type or "application/octet-stream",
            status="ready"
        )

        if indexed_count == 0:
            raise HTTPException(
                status_code=500,
                detail="Не удалось проиндексировать документ"
            )

        return DocumentUploadResponse(
            id=document_id,
            name=file.filename,
            size=file_size,
            mimeType=file.content_type or "application/octet-stream",
            pages=len(pages_text),
            status="ready",
            progress=100,
            uploadedAt=datetime.now(),
            indexedAt=datetime.now(),
            error=None,
            message=f"Документ успешно загружен и проиндексирован ({indexed_count} чанков)",
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Внутренняя ошибка сервера: {str(e)}"
        )


@router.get("/", response_model=PaginatedResponse[DocumentMetadata])
async def list_documents(
    page: int = 1,
    size: int = 10,
    status: Optional[str] = None
):
    """
    Получить список всех загруженных документов из Elasticsearch.
    """
    try:
        result = list_documents_from_es(page, size, status)
        return PaginatedResponse(
            items=result["items"],
            total=result["total"],
            page=result["page"],
            size=result["size"],
            totalPages=result["totalPages"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении списка документов: {str(e)}"
        )


@router.get("/{document_id}", response_model=DocumentMetadata)
async def get_document(document_id: str):
    """
    Получить информацию о конкретном документе по ID.
    """
    try:
        response = es_client.search(
            index=INDEX_NAME,
            body={
                "query": {"term": {"document_id": document_id}},
                "size": 1,
                "sort": [{"upload_date": {"order": "desc"}}]
            }
        )

        if not response["hits"]["hits"]:
            raise HTTPException(status_code=404, detail="Документ не найден")

        source = response["hits"]["hits"][0]["_source"]

        count_response = es_client.count(
            index=INDEX_NAME,
            body={"query": {"term": {"document_id": document_id}}}
        )


        upload_date_str = source.get("upload_date")
        if upload_date_str:
            upload_date = datetime.fromisoformat(upload_date_str)
        else:
            upload_date = datetime.now()

        return DocumentMetadata(
            id=document_id,
            name=source.get("file_name", "unknown"),
            size=source.get("size", 0),
            mimeType=source.get(
                "mime_type",
                "application/octet-stream",
            ),
            pages=count_response["count"],
            status="ready",
            progress=100,
            uploadedAt=upload_date,
            indexedAt=upload_date,
            error=None,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении документа: {str(e)}"
        )


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """
    Удалить документ из Elasticsearch через delete_by_query.
    """
    try:

        check_response = es_client.count(
            index=INDEX_NAME,
            body={"query": {"term": {"document_id": document_id}}}
        )

        if check_response["count"] == 0:
            raise HTTPException(status_code=404, detail="Документ не найден")

        response = es_client.delete_by_query(
            index=INDEX_NAME,
            body={
                "query": {
                    "term": {"document_id": document_id}
                }
            }
        )

        deleted_count = response.get("deleted", 0)

        return {
            "status": "deleted",
            "document_id": document_id,
            "chunks_deleted": deleted_count
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при удалении документа: {str(e)}"
        )

# @router.post("/")
# async def upload_document_root(file: UploadFile = File(...)):
#     """Перенаправляем на /upload для совместимости с фронтом."""
#     return await upload_document(file)

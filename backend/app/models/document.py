from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class DocumentUploadResponse(BaseModel):
    document_id: str
    file_name: str
    status: str
    chunks_count: int
    message: str

class DocumentMetadata(BaseModel):
    document_id: UUID
    file_name: str
    upload_date: datetime
    status: str  # "uploaded", "indexing", "indexed", "error"

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Поисковый запрос")
    page: int = Field(1, ge=1, description="Номер страницы")
    size: int = Field(10, ge=1, le=100, description="Количество результатов на странице")

class SearchResultItem(BaseModel):
    chunk_id: str
    file_name: str
    page: Optional[int] = None
    text: str
    score: float
    highlight: Optional[str] = None

class SearchResponse(BaseModel):
    results: list[SearchResultItem]
    total: int
    page: int
    size: int
    pages: int
from datetime import datetime
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")



class DocumentUploadResponse(BaseModel):
    id: str
    name: str
    size: int
    mimeType: str
    pages: int
    status: str
    progress: int
    uploadedAt: datetime
    indexedAt: Optional[datetime] = None
    error: Optional[str] = None
    message: str


class DocumentMetadata(BaseModel):
    id: str
    name: str
    size: int
    mimeType: str
    pages: Optional[int] = None
    status: str
    progress: int = 100
    uploadedAt: datetime
    indexedAt: Optional[datetime] = None
    error: Optional[str] = None



class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    page: int = Field(1, ge=1)
    size: int = Field(10, ge=1, le=100)



class SearchResultItem(BaseModel):
    id: str
    documentId: Optional[str] = None
    fileName: str
    page: Optional[int] = None
    snippet: str
    score: float
    highlights: List[dict] = []



class SearchResponse(BaseModel):
    items: List[SearchResultItem]
    total: int
    page: int
    size: int
    totalPages: int



class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    totalPages: int

class SearchHistoryItem(BaseModel):
    id: str
    query: str
    createdAt: str 
    resultsCount: int

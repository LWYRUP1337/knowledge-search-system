from fastapi import APIRouter, Query, HTTPException
from app.services.search_service import search_documents
from app.models.document import SearchResponse, SearchResultItem

router = APIRouter(prefix="/api/v1/search", tags=["search"])


@router.get("/", response_model=SearchResponse)
async def search(
        q: str = Query(..., min_length=1, description="Поисковый запрос"),
        page: int = Query(1, ge=1, description="Номер страницы"),
        size: int = Query(10, ge=1, le=100, description="Количество результатов на странице"),
        file: str = Query(None, description="Фильтр по имени файла (опционально)")
):
    try:
        results = search_documents(q, page, size, file)

        return SearchResponse(
            results=[SearchResultItem(**item) for item in results["results"]],
            total=results["total"],
            page=results["page"],
            size=results["size"],
            pages=results["pages"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при выполнении поиска: {str(e)}"
        )
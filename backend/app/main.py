from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from app.api.upload import router
from app.services.index_service import create_index
import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):

    try:
        create_index()
        logger.info("Индекс Elasticsearch успешно создан")
    except Exception as e:
        logger.error(f"Ошибка при создании индекса: {e}")
    yield


app = FastAPI(
    title="Knowledge Base API",
    description="API для загрузки документов и полнотекстового поиска",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Intelligent Search System API"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/metrics", response_class=PlainTextResponse)
async def metrics():
    # заглушка для Prometheus
    return "# HELP placeholder\n# TYPE placeholder gauge\nplaceholder 0\n"

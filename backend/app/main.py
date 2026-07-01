from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time

from app.api.upload import router as upload_router
from app.api.search import router as search_router
from app.services.index_service import create_index


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Создание индекса в Elasticsearch...")
    for attempt in range(10):
        try:
            create_index()
            print(f"Индекс создан (попытка {attempt + 1})")
            break
        except Exception as e:
            print(f"Попытка {attempt + 1}/10: {e}")
            if attempt < 9:
                time.sleep(5)
            else:
                print("Не удалось создать индекс после 10 попыток")
    yield
    print("Приложение останавливается...")

app = FastAPI(
    title="Knowledge Base API",
    description="API для загрузки документов и полнотекстового поиска",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(upload_router)
app.include_router(search_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Knowledge Base API"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}

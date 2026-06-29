from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.upload import router

app = FastAPI(
    title="Knowledge Base API",
    description="API для загрузки документов и полнотекстового поиска",
    version="1.0.0",
)

app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене ограничить
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
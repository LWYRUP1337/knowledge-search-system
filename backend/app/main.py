from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.upload import router as upload_router
from app.api.search import router as search_router

app = FastAPI(
    title="Knowledge Base API",
    description="API для загрузки документов и полнотекстового поиска",
    version="1.0.0",
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
from fastapi import FastAPI

app = FastAPI(title="Knowledge Base API")

#не удалять!!!!
@app.get("/health")
async def health():
    return {"status": "ok"}

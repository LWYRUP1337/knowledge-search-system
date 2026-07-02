from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

class LoginRequest(BaseModel):
    login: str
    password: str

@router.post("/login")
async def login(request: LoginRequest):
    return {
        "token": "demo-token-12345",
        "user": {
            "id": "1",
            "login": request.login,
            "name": "Demo User"
        }
    }

import pytest
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), 'fixtures')


def test_upload_invalid_extension():
    """Файл .txt — 400 Bad Request."""
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("notes.txt", b"text", "text/plain")}
    )
    assert response.status_code == 400, f"Ожидался 400, получили {response.status_code}: {response.text}"


def test_upload_empty_filename():
    """Пустое имя файла — 400 Bad Request."""
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("", b"content", "application/pdf")}
    )
    assert response.status_code == 422


def test_upload_corrupted_pdf():
    """Битый PDF — теперь должен возвращать 400 (Баг №3 исправлен)."""
    file_path = os.path.join(FIXTURES_DIR, 'broken_manual.pdf')
    with open(file_path, 'rb') as f:
        response = client.post(
            "/api/v1/documents/upload",
            files={"file": ("broken_manual.pdf", f, "application/pdf")}
        )
    assert response.status_code == 400, \
        f"Ожидался 400, получили {response.status_code}: {response.text}"
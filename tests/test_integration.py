# Интеграционные тесты, требующие Elasticsearch.
# Запускаются только локально, когда ES поднят.

import pytest
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
FIXTURES_DIR = os.path.join(os.path.dirname(__file__), 'fixtures')


@pytest.mark.integration  
def test_upload_valid_pdf():
    """Корректный PDF — 200 OK (требует Elasticsearch)."""
    file_path = os.path.join(FIXTURES_DIR, 'sample.pdf')
    with open(file_path, 'rb') as f:
        response = client.post(
            "/api/v1/documents/upload",
            files={"file": ("sample.pdf", f, "application/pdf")}
        )
    assert response.status_code == 200, f"Ожидался 200, получили {response.status_code}: {response.text}"
    data = response.json()
    assert "document_id" in data, f"Нет document_id в ответе: {data}"


@pytest.mark.integration
def test_upload_valid_docx():
    """Корректный DOCX — 200 OK (требует Elasticsearch)."""
    file_path = os.path.join(FIXTURES_DIR, 'sample.docx')
    with open(file_path, 'rb') as f:
        response = client.post(
            "/api/v1/documents/upload",
            files={"file": ("sample.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
        )
    assert response.status_code == 200, f"Ожидался 200, получили {response.status_code}: {response.text}"
    data = response.json()
    assert "document_id" in data
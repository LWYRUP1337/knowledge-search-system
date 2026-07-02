from fastapi.testclient import TestClient
import sys
import os


sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend', 'app'))


from main import app


client = TestClient(app)

def test_health_check():
    """Проверяем, что эндпоинт /health отвечает 200 и возвращает status ok."""
    response = client.get("/health")
    
    assert response.status_code == 200, f"Ожидался статус 200, получили {response.status_code}"
    
    json_data = response.json()
    assert json_data == {"status": "ok"}, f"Ожидался {{'status': 'ok'}}, получили {json_data}"
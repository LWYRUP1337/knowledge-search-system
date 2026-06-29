import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.index_service import create_index

if __name__ == "__main__":
    print("Создание индекса в Elasticsearch...")
    try:
        create_index()
        print("Индекс успешно создан!")
    except Exception as e:
        print(f"Ошибка при создании индекса: {e}")
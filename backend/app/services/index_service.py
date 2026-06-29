from app.core.elasticsearch import es_client
import logging

logger = logging.getLogger(__name__)

INDEX_NAME = "documents"


def create_index():
    settings = {
        "analysis": {
            "analyzer": {
                "russian_analyzer": {
                    "type": "custom",
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase",
                        "russian_stop",
                        "russian_stemmer"
                    ]
                }
            },
            "filter": {
                "russian_stop": {
                    "type": "stop",
                    "stopwords": "_russian_"
                },
                "russian_stemmer": {
                    "type": "stemmer",
                    "language": "russian"
                }
            }
        }
    }

    mappings = {
        "properties": {
            "chunk_id": {"type": "keyword"},
            "document_id": {"type": "keyword"},
            "file_name": {"type": "text", "analyzer": "russian_analyzer"},
            "page_number": {"type": "integer"},
            "text": {
                "type": "text",
                "analyzer": "russian_analyzer",
                "fields": {
                    "keyword": {"type": "keyword", "ignore_above": 256}
                }
            },
            "chunk_index": {"type": "integer"},
            "upload_date": {"type": "date"}
        }
    }

    if es_client.indices.exists(index=INDEX_NAME):
        logger.info(f"Индекс {INDEX_NAME} уже существует. Удаляем...")
        es_client.indices.delete(index=INDEX_NAME)

    es_client.indices.create(
        index=INDEX_NAME,
        settings=settings,
        mappings=mappings
    )
    logger.info(f"Индекс {INDEX_NAME} успешно создан")

    return True


if __name__ == "__main__":
    # Для проверки работы скрипта
    logging.basicConfig(level=logging.INFO)
    create_index()
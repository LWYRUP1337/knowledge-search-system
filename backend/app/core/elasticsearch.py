from elasticsearch import Elasticsearch
from app.core.config import settings

def get_elasticsearch_client() -> Elasticsearch:
    es = Elasticsearch(
        hosts=[f"http://{settings.ELASTICSEARCH_HOST}:{settings.ELASTICSEARCH_PORT}"],  # ← добавила http://
        retry_on_timeout=True,
        max_retries=3
    )
    return es

es_client = get_elasticsearch_client()
from typing import List, Dict, Any
from datetime import datetime
from app.core.elasticsearch import es_client
from app.services.index_service import INDEX_NAME
import logging

logger = logging.getLogger(__name__)


def index_chunks(chunks: List[Dict[str, Any]]) -> int:
    if not chunks:
        return 0

    indexed_count = 0

    for chunk in chunks:
        try:
            chunk["upload_date"] = datetime.now().isoformat()

            response = es_client.index(
                index=INDEX_NAME,
                id=chunk["chunk_id"],
                document=chunk
            )

            if response.get("result") in ["created", "updated"]:
                indexed_count += 1

        except Exception as e:
            logger.error(f"Ошибка при индексации чанка {chunk.get('chunk_id')}: {e}")

    if indexed_count > 0:
        es_client.indices.refresh(index=INDEX_NAME)

    return indexed_count
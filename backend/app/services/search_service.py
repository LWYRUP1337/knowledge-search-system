from typing import Dict, Any
from app.core.elasticsearch import es_client
from app.services.index_service import INDEX_NAME


def search_documents(query: str, page: int = 1, size: int = 10) -> Dict[str, Any]:
    from_idx = (page - 1) * size

    search_body = {
        "query": {
            "multi_match": {
                "query": query,
                "fields": ["text", "file_name"],
                "type": "best_fields",
                "fuzziness": "AUTO"
            }
        },
        "from": from_idx,
        "size": size,
        "highlight": {
            "fields": {
                "text": {
                    "fragment_size": 200,
                    "number_of_fragments": 1
                }
            }
        }
    }


    response = es_client.search(
        index=INDEX_NAME,
        body=search_body
    )

    results = []
    for hit in response["hits"]["hits"]:
        source = hit["_source"]
        results.append({
            "chunk_id": source.get("chunk_id"),
            "file_name": source.get("file_name"),
            "page": source.get("page_number"),
            "text": source.get("text"),
            "score": hit["_score"]
        })

    total = response["hits"]["total"]["value"]
    total_pages = (total + size - 1) // size if total > 0 else 0

    return {
        "results": results,
        "total": total,
        "page": page,
        "size": size,
        "pages": total_pages
    }
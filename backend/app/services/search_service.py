from typing import Dict, Any
from app.core.elasticsearch import es_client
from app.services.index_service import INDEX_NAME


def search_documents(query: str,
                     page: int = 1,
                     size: int = 10,
                     file_filter: str = None
                     ) -> Dict[str, Any]:
    from_idx = (page - 1) * size

    search_body = {
        "query": {
            "bool": {
                "must": [
                    {
                        "multi_match": {
                            "query": query,
                            "fields": ["text^2", "file_name^1.5"],
                            "type": "best_fields",
                            "fuzziness": "AUTO",
                            "operator": "or"
                        }
                    }
                ]
            }
        },
        "from": from_idx,
        "highlight": {
            "fields": {
                "text": {
                    "fragment_size": 200,
                    "number_of_fragments": 2,
                    "pre_tags": ["<mark>"],
                    "post_tags": ["</mark>"]
                }
            }
        },
        "sort": [
            {"_score": {"order": "desc"}}
        ]
    }

    if file_filter:
        search_body["query"]["bool"]["filter"] = [
            {"match": {"file_name": file_filter}}
        ]


    response = es_client.search(
        index=INDEX_NAME,
        body=search_body
    )

    results = []
    for hit in response["hits"]["hits"]:
        source = hit["_source"]
        result = {
            "chunk_id": source.get("chunk_id"),
            "file_name": source.get("file_name"),
            "page": source.get("page_number"),
            "text": source.get("text"),
            "score": hit["_score"],
            "highlight": hit.get("highlight", {}).get("text", [source.get("text")])[0]
        }
        results.append(result)

    total = response["hits"]["total"]["value"]
    total_pages = (total + size - 1) // size if total > 0 else 0

    return {
        "results": results,
        "total": total,
        "page": page,
        "size": size,
        "pages": total_pages
    }
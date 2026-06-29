from typing import List, Dict, Any
from app.core.config import settings


def split_text_into_chunks(text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
    if chunk_size is None:
        chunk_size = settings.CHUNK_SIZE

    if overlap is None:
        overlap = settings.CHUNK_OVERLAP

    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        if end < len(text):
            # Ищем ближайший пробел или точку перед end
            for i in range(end, max(start, end - 200), -1):
                if i < len(text) and text[i] in [' ', '.', '!', '?', '\n']:
                    end = i + 1
                    break

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start = end - overlap

        if start >= len(text):
            break

    return chunks


def create_chunks_from_pages(
        pages_text: List[tuple],
        document_id: str,
        file_name: str
) -> List[Dict[str, Any]]:

    chunks = []
    chunk_index = 0

    for page_num, text in pages_text:
        if not text.strip():
            continue

        text_chunks = split_text_into_chunks(text)

        for chunk_text in text_chunks:
            chunks.append({
                "chunk_id": f"{document_id}_{chunk_index}",
                "document_id": document_id,
                "file_name": file_name,
                "page_number": page_num,
                "text": chunk_text,
                "chunk_index": chunk_index
            })
            chunk_index += 1

    return chunks
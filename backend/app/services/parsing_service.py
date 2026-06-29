import io
import os
from typing import List, Tuple
import pdfplumber
from docx import Document


def parse_pdf(file_content: bytes, file_name: str) -> List[Tuple[int, str]]:
    pages_text = []

    try:
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                text = page.extract_text()
                if text and text.strip():
                    pages_text.append((page_num, text.strip()))
                else:
                    pages_text.append((page_num, ""))
    except Exception as e:
        raise ValueError(f"Ошибка при парсинге PDF: {str(e)}")

    if not pages_text or all(text == "" for _, text in pages_text):
        raise ValueError("Не удалось извлечь текст из PDF файла")

    return pages_text


def parse_docx(file_content: bytes, file_name: str) -> List[Tuple[int, str]]:
    try:
        doc = Document(io.BytesIO(file_content))
        full_text = []

        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                full_text.append(paragraph.text.strip())

        text = "\n".join(full_text)

        if not text.strip():
            raise ValueError("Не удалось извлечь текст из DOCX файла")

        return [(1, text)]

    except Exception as e:
        raise ValueError(f"Ошибка при парсинге DOCX: {str(e)}")


def parse_document(file_content: bytes, file_name: str) -> List[Tuple[int, str]]:
    file_extension = os.path.splitext(file_name)[1].lower()

    if file_extension == ".pdf":
        return parse_pdf(file_content, file_name)
    elif file_extension == ".docx":
        return parse_docx(file_content, file_name)
    else:
        raise ValueError(f"Неподдерживаемый формат: {file_extension}")
import pytest
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.parsing_service import parse_pdf, parse_docx, parse_document

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), 'fixtures')



def test_parse_pdf_valid():
    """Корректный PDF должен возвращать непустой список страниц."""
    file_path = os.path.join(FIXTURES_DIR, 'sample.pdf')
    with open(file_path, 'rb') as f:
        content = f.read()
    result = parse_pdf(content, 'sample.pdf')
    assert isinstance(result, list), "Результат должен быть списком"
    assert len(result) > 0, "Список не должен быть пустым"
    # Каждый элемент — кортеж (номер_страницы, текст)
    assert isinstance(result[0], tuple), "Элемент списка должен быть кортежем"
    assert isinstance(result[0][0], int), "Первый элемент кортежа — номер страницы"
    assert isinstance(result[0][1], str), "Второй элемент кортежа — текст"


def test_parse_pdf_empty():
    """Пустой PDF должен вызывать ValueError."""
    file_path = os.path.join(FIXTURES_DIR, 'empty.pdf')
    with open(file_path, 'rb') as f:
        content = f.read()
    with pytest.raises(ValueError, match="Ошибка при парсинге PDF"):
        parse_pdf(content, 'empty.pdf')


def test_parse_pdf_corrupted():
    """Битый PDF должен вызывать ValueError."""
    file_path = os.path.join(FIXTURES_DIR, 'broken_manual.pdf')
    with open(file_path, 'rb') as f:
        content = f.read()
    with pytest.raises(ValueError, match="Ошибка при парсинге PDF"):
        parse_pdf(content, 'broken_manual.pdf')




def test_parse_docx_valid():
    """Корректный DOCX должен возвращать список с одним элементом."""
    file_path = os.path.join(FIXTURES_DIR, 'sample.docx')
    with open(file_path, 'rb') as f:
        content = f.read()
    result = parse_docx(content, 'sample.docx')
    assert isinstance(result, list), "Результат должен быть списком"
    assert len(result) == 1, "DOCX возвращает одну страницу (номер 1)"
    assert isinstance(result[0][1], str), "Текст должен быть строкой"
    assert len(result[0][1]) > 0, "Текст не должен быть пустым"


def test_parse_docx_corrupted():
    """Битый DOCX должен вызывать ValueError."""
    file_path = os.path.join(FIXTURES_DIR, 'broken_report.docx')
    with open(file_path, 'rb') as f:
        content = f.read()
    with pytest.raises(ValueError, match="Ошибка при парсинге DOCX"):
        parse_docx(content, 'broken_report.docx')




def test_parse_document_pdf():
    """parse_document должен вызывать parse_pdf для PDF."""
    file_path = os.path.join(FIXTURES_DIR, 'sample.pdf')
    with open(file_path, 'rb') as f:
        content = f.read()
    result = parse_document(content, 'sample.pdf')
    assert len(result) > 0


def test_parse_document_docx():
    """parse_document должен вызывать parse_docx для DOCX."""
    file_path = os.path.join(FIXTURES_DIR, 'sample.docx')
    with open(file_path, 'rb') as f:
        content = f.read()
    result = parse_document(content, 'sample.docx')
    assert len(result) == 1


def test_parse_document_invalid_format():
    """Неподдерживаемый формат должен вызывать ValueError."""
    file_path = os.path.join(FIXTURES_DIR, 'sample.pdf')
    with open(file_path, 'rb') as f:
        content = f.read()
    with pytest.raises(ValueError, match="Неподдерживаемый формат"):
        parse_document(content, 'notes.txt')



from app.services.chunking_service import split_text_into_chunks


def test_chunk_basic_split():
    """Текст из 2500 символов должен дать 3 чанка."""
    text = "A" * 2500
    chunks = split_text_into_chunks(text, chunk_size=1000, overlap=100)
    assert len(chunks) == 3, f"Ожидалось 3 чанка, получено {len(chunks)}"


def test_chunk_size_limit():
    """Каждый чанк должен быть не больше chunk_size."""
    text = "B" * 3500
    chunks = split_text_into_chunks(text, chunk_size=1000, overlap=100)
    for i, chunk in enumerate(chunks):
        assert len(chunk) <= 1000, f"Чанк {i} имеет размер {len(chunk)}, что больше 1000"


def test_short_text_single_chunk():
    """Текст короче chunk_size — возвращается одним чанком."""
    text = "Короткий текст"
    chunks = split_text_into_chunks(text, chunk_size=1000, overlap=100)
    assert len(chunks) == 1, "Должен быть ровно 1 чанк"
    assert chunks[0] == text, "Текст чанка должен совпадать с исходным"


def test_empty_text_no_chunks():
    """Пустой текст — пустой список чанков."""
    chunks = split_text_into_chunks("", chunk_size=1000, overlap=100)
    assert chunks == [] or chunks == [""], \
        "Пустой текст должен дать пустой список или список с пустой строкой"
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend', 'app'))

def validate_file_format(filename: str) -> bool:
    """
    Заглушка функции валидации.
    Когда бэк напишет реальную функцию, заменим эту на импорт:
    from services.file_validator import validate_file_format
    """
    if not filename:
        return False
    if '.' not in filename:
        return False
    allowed = ['.pdf', '.docx']
    for ext in allowed:
        if filename.lower().endswith(ext):
            return True
    return False


def test_valid_pdf():
    """Корректный PDF должен проходить валидацию."""
    assert validate_file_format("лекция.pdf") == True


def test_valid_docx():
    """Корректный DOCX должен проходить валидацию."""
    assert validate_file_format("отчёт.docx") == True


def test_valid_uppercase():
    """Расширение в верхнем регистре тоже должно работать."""
    assert validate_file_format("FILE.PDF") == True


def test_invalid_exe():
    """EXE файл НЕ должен проходить валидацию."""
    assert validate_file_format("вирус.exe") == False


def test_invalid_no_extension():
    """Файл без расширения НЕ должен проходить валидацию."""
    assert validate_file_format("justfile") == False


def test_invalid_empty():
    """Пустая строка НЕ должна проходить валидацию."""
    assert validate_file_format("") == False


def test_invalid_txt():
    """TXT файл НЕ должен проходить валидацию."""
    assert validate_file_format("notes.txt") == False


def test_valid_mixed_case():
    """Смешанный регистр должен работать."""
    assert validate_file_format("DocUMent.DoCx") == True
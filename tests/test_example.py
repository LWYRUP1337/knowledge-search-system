
def fake_validate_file_format(filename: str) -> bool:
    """Заглушка функции, которую напишет бэкендер."""
    if not filename:
        return False
    if '.' not in filename:
        return False
    allowed = ['.pdf', '.docx']
    for ext in allowed:
        if filename.lower().endswith(ext):
            return True
    return False

def test_pdf_valid():
    assert fake_validate_file_format("лекция.pdf") == True

def test_exe_invalid():
    assert fake_validate_file_format("вирус.exe") == False

def test_empty_invalid():
    assert fake_validate_file_format("") == False
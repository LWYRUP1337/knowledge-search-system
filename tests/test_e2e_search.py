import pytest
import os
from playwright.sync_api import sync_playwright


BASE_URL = os.getenv("BASE_URL", "http://localhost:5173")


FIXTURES_DIR = os.path.join(os.path.dirname(__file__), 'fixtures')


@pytest.fixture(scope="module")
def browser():
    """Запускаем браузер один раз для всех тестов."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()


def test_full_user_scenario(browser):
    """
    Основной пользовательский сценарий:
    1. Открыть страницу загрузки.
    2. Загрузить PDF.
    3. Дождаться статуса "Готово".
    4. Перейти на страницу поиска.
    5. Ввести запрос и нажать Enter.
    6. Проверить, что появились результаты с подсветкой.
    """
    page = browser.new_page()

    page.goto(f"{BASE_URL}/login")
    page.wait_for_selector("text=Вход в систему", timeout=30000)

    page.fill('#login', 'demo')
    page.fill('#password', 'demo')

    page.click('button:has-text("Войти")')

    page.wait_for_url(f"{BASE_URL}/", timeout=30000)
    page.wait_for_selector("text=Документы", timeout=30000)

    file_path = os.path.join(FIXTURES_DIR, 'sample.pdf')
    file_input = page.locator('input[type="file"]')
    file_input.set_input_files(file_path)

    page.wait_for_selector("text=Готово", timeout=30000)

    page.goto(f"{BASE_URL}/search")
    page.wait_for_selector("text=Поиск по документам", timeout=30000)

    search_input = page.get_by_placeholder("Введите запрос, например: договор оплата")
    search_input.fill("договор")

    page.click('button:has-text("Найти")')

    page.wait_for_selector("text=Найдено", timeout=30000)

    page.screenshot(path="tests/e2e_success.png")

    page.screenshot(path="tests/e2e_success.png")
    page.close()

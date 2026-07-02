# Нагрузочный тест для эндпоинта /health (QA-04)

from locust import HttpUser, task, between

class HealthCheckUser(HttpUser):
    """
    Пользователь, который проверяет здоровье сервера.
    """
    wait_time = between(1, 2)  

    @task
    def check_health(self):
        """Отправляем GET-запрос на /health."""
        self.client.get("/health")
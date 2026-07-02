from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Приложение
    APP_NAME: str = "Intelligent Search System"
    APP_VERSION: str = "1.0.0"

    # PostgreSQL
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int

    # Redis
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_TTL: int = 300

    # Elasticsearch
    ELASTICSEARCH_HOST: str = "localhost"
    ELASTICSEARCH_PORT: int = 9200

    # Backend
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    MAX_FILE_SIZE_MB: int = 20

    # Frontend
    VITE_API_BASE_URL: str = "http://localhost/api"

    # Grafana
    GRAFANA_USER: str = "admin"
    GRAFANA_PASSWORD: str = "admin123"

    # Индексация
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 100

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

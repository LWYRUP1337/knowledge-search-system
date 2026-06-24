# Knowledge Search System

Интеллектуальная поисковая система по внутренней базе знаний университета.

## Стек
- Backend: Python 3.12 + FastAPI
- Frontend: React + TypeScript + Vite
- БД: PostgreSQL 16
- Поиск: Elasticsearch 8.13
- Кеш: Redis 7
- Инфраструктура: Docker + Docker Compose

## Быстрый старт

### Требования
- Docker Desktop

### Запуск
git clone https://github.com/LWYRUP1337/knowledge-search-system.git

cp .env.example .env

docker compose up --build

## Структура веток
- main стабильная версия через PR
- dev интеграционная ветка
- feat/back бэкенд
- feat/front фронтенд
- feat/devops инфраструктура
- feat/tests тесты

## Переменные окружения
Скопировать .env.example в .env и заполнить значения.
Файл .env никогда не коммитится в репозиторий!!

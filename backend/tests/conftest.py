"""
Общие фикстуры для API-тестов.

Хранилище схем подменяется на временный каталог (tmp_path), чтобы тесты
не трогали реальные данные в backend/app/schemes/ и не зависели друг от друга.
"""

import json

import pytest
from fastapi.testclient import TestClient

import app.main as app_main
from app.main import app

# Адрес клиента по умолчанию — имя папки хранилища для тестовых запросов
TEST_HOST = 'testclient'


class HostApp:
    """
    ASGI-обёртка: подставляет адрес клиента (хост) в scope запроса.
    Нужна, чтобы тесты к хосту не зависели от того, какая версия
    starlette/httpx формирует scope['client'] у TestClient.
    """

    def __init__(self, asgi_app, host):
        self._app = asgi_app
        self._host = host

    async def __call__(self, scope, receive, send):
        if scope['type'] == 'http':
            scope = dict(scope)
            scope['client'] = (self._host, 50000)
        await self._app(scope, receive, send)


def make_client(host=TEST_HOST):
    """Создаёт TestClient с заданным адресом клиента (хостом)."""
    return TestClient(HostApp(app, host))


@pytest.fixture
def storage(tmp_path, monkeypatch):
    """Временное хранилище схем вместо backend/app/schemes/."""
    root = tmp_path / 'schemes'
    monkeypatch.setattr(app_main, 'SCHEMES_PATH', root)
    return root


@pytest.fixture
def client(storage):
    """Клиент с адресом TEST_HOST и временным хранилищем."""
    return make_client()


@pytest.fixture
def client_for_host(storage):
    """Фабрика клиентов с произвольным хостом (проверка изоляции по хостам)."""
    return make_client


@pytest.fixture
def read_stored_scheme(storage):
    """Читатель nodes.json из временного хранилища: read_stored_scheme(имя, хост)."""

    def _read(name, host=TEST_HOST):
        path = storage / host / name / 'nodes.json'
        return json.loads(path.read_text(encoding='utf-8'))

    return _read


@pytest.fixture
def sample_payload():
    """Пример payload схемы в актуальной модели данных (id, typeId, channels)."""
    return {
        'schemeName': 'Тестовая схема',
        'nodes': [
            {'name': 'УК1', 'x': 10, 'y': 20, 'typeId': 1},
            {'name': 'УК2', 'x': 30, 'y': 40, 'typeId': 1},
        ],
        'channelTypes': [
            {'id': 1, 'name': 'Канал 1', 'bandwidth': 100, 'pricePerMeter': 5},
        ],
        'channels': [
            {'from': 0, 'to': 1, 'typeId': 1},
        ],
        'nodeTypes': [
            {'id': 1, 'name': 'Роутер', 'speed': 100, 'price': 1000},
        ],
        'traffic': {'unit': 'Мбит/с', 'matrix': [[0, 7], [7, 0]]},
    }

"""Тесты endpoint'а POST /create-scheme."""


def test_create_scheme_success(client, sample_payload, read_stored_scheme):
    """Успешное создание: 200 и файл с payload записан без изменений."""
    response = client.post('/create-scheme', json=sample_payload)

    assert response.status_code == 200
    assert response.json() == {'message': 'Success'}
    assert read_stored_scheme('Тестовая схема') == sample_payload


def test_create_scheme_duplicate(client, sample_payload, read_stored_scheme):
    """Повторное создание: 400, существующий файл не меняется."""
    client.post('/create-scheme', json=sample_payload)
    changed = {**sample_payload, 'nodes': []}

    response = client.post('/create-scheme', json=changed)

    assert response.status_code == 400
    assert response.json() == {'message': 'Scheme already exists'}
    assert read_stored_scheme('Тестовая схема') == sample_payload


def test_create_scheme_invalid_name(client, sample_payload):
    """
    Некорректное имя (попытка выхода из каталога): 400.
    create-scheme возвращает одно сообщение на любую ошибку — это его текущее поведение.
    """
    payload = {**sample_payload, 'schemeName': '../evil'}

    response = client.post('/create-scheme', json=payload)

    assert response.status_code == 400
    assert response.json() == {'message': 'Scheme already exists'}

"""Тесты GET /get-scheme-list и GET /get-scheme."""


def test_list_missing_host_dir(client):
    """Каталога хоста ещё нет: 404 Directory not found."""
    response = client.get('/get-scheme-list')

    assert response.status_code == 404
    assert response.json() == {'message': 'Directory not found'}


def test_list_returns_created_schemes(client, sample_payload):
    """После создания двух схем список содержит обе."""
    client.post('/create-scheme', json=sample_payload)
    other = {**sample_payload, 'schemeName': 'Вторая схема'}
    client.post('/create-scheme', json=other)

    response = client.get('/get-scheme-list')

    assert response.status_code == 200
    data = response.json()
    assert data['message'] == 'Success'
    assert sorted(data['schemes']) == sorted(['Тестовая схема', 'Вторая схема'])


def test_get_existing_scheme(client, sample_payload):
    """Существующая схема возвращается целиком."""
    client.post('/create-scheme', json=sample_payload)

    response = client.get('/get-scheme', params={'scheme_name': 'Тестовая схема'})

    assert response.status_code == 200
    assert response.json() == {'message': 'Success', 'scheme': sample_payload}


def test_get_missing_scheme(client):
    """Отсутствующая схема: 404 Scheme not found."""
    response = client.get('/get-scheme', params={'scheme_name': 'Нет такой'})

    assert response.status_code == 404
    assert response.json() == {'message': 'Scheme not found'}

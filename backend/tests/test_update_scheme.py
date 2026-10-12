"""Тесты POST /update-scheme."""

import copy


def test_update_scheme_success(client, sample_payload, read_stored_scheme):
    """Успешное обновление: 200, файл перезаписан новыми данными."""
    client.post('/create-scheme', json=sample_payload)
    updated = copy.deepcopy(sample_payload)
    updated['nodes'][0]['x'] = 999
    updated['traffic']['matrix'] = [[0, 1], [1, 0]]

    response = client.post('/update-scheme', json=updated)

    assert response.status_code == 200
    assert response.json() == {'message': 'Success'}
    assert read_stored_scheme('Тестовая схема') == updated


def test_update_missing_scheme(client, sample_payload):
    """Схемы нет на диске: 404 Scheme not found."""
    response = client.post('/update-scheme', json=sample_payload)

    assert response.status_code == 404
    assert response.json() == {'message': 'Scheme not found'}


def test_update_invalid_scheme_name(client, sample_payload):
    """Некорректное имя (слэш, пустая строка, точки): 400 Invalid scheme name."""
    for bad_name in ('../evil', '', 'имя/со слэшем'):
        response = client.post(
            '/update-scheme', json={**sample_payload, 'schemeName': bad_name}
        )

        assert response.status_code == 400
        assert response.json() == {'message': 'Invalid scheme name'}


def test_update_malformed_json(client):
    """Тело запроса не является JSON: 400 Invalid JSON."""
    response = client.post(
        '/update-scheme',
        content=b'not a json',
        headers={'Content-Type': 'application/json'},
    )

    assert response.status_code == 400
    assert response.json() == {'message': 'Invalid JSON'}


def test_update_json_not_an_object(client):
    """Корректный JSON, но не объект: 400 Invalid scheme name."""
    response = client.post('/update-scheme', json=[1, 2, 3])

    assert response.status_code == 400
    assert response.json() == {'message': 'Invalid scheme name'}


def test_update_does_not_touch_other_schemes(client, sample_payload, read_stored_scheme):
    """Обновление одной схемы не меняет другую."""
    client.post('/create-scheme', json=sample_payload)
    other = {**sample_payload, 'schemeName': 'Другая схема'}
    client.post('/create-scheme', json=other)

    updated = {**sample_payload, 'nodes': []}
    client.post('/update-scheme', json=updated)

    assert read_stored_scheme('Тестовая схема') == updated
    assert read_stored_scheme('Другая схема') == other


def test_update_scheme_other_host(client_for_host, sample_payload):
    """Схема, созданная для другого хоста, недоступна текущему: 404."""
    client_for_host('10.0.0.1').post('/create-scheme', json=sample_payload)

    response = client_for_host('10.0.0.2').post('/update-scheme', json=sample_payload)

    assert response.status_code == 404
    assert response.json() == {'message': 'Scheme not found'}

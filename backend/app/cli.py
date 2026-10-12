"""
Точка входа dev-сервера: используется консольным скриптом `uv run app`
и обратно-совместимым backend/main.py.
"""

from uvicorn import run


def main():
    """Запускает uvicorn на 127.0.0.1:1234 с автоперезагрузкой кода."""
    run('app.main:app', host='127.0.0.1', port=1234, log_level='info', reload=True)


if __name__ == '__main__':
    main()

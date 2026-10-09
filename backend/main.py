from uvicorn import run
from app.main import app


def main():
    run('app.main:app', host='127.0.0.1', port=1234, log_level='info', reload=True)


if __name__ == '__main__':
    main()

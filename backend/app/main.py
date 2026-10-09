"""
Здесь находится основное приложение FastAPI
"""

import os
import json
import re
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title='Application', root_path='/api')
# add_middleware регистрирует CORS-обработчик в стеке приложения,
# без этого браузерский preflight-запрос OPTIONS падает с 405
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173',
        'https://localhost:5173',
        'http://127.0.0.1:5173',
        'https://127.0.0.1:5173'
    ],
    allow_origin_regex=r'^(http|https)://(localhost|127\.0\.0\.1)(:\d{1,5})?/?$',
    allow_methods=['*'],
    allow_headers=['*'],
    allow_credentials=True
)

# Путь считается от расположения файла, чтобы не зависеть от текущей рабочей директории
SCHEMES_PATH = Path(__file__).resolve().parent / 'schemes'
SCHEME_NAME_PATTERN = re.compile(r'^[\w\s-]+$')
CLIENT_HOST_PATTERN = re.compile(r'[^\w.-]')


@app.post('/create-scheme')
async def create_scheme(request: Request):
    """
    Метод создает директорию для хранения схемы
    """

    try:
        content = await request.json()
        scheme_name = content['schemeName']
        if not isinstance(scheme_name, str) or not SCHEME_NAME_PATTERN.fullmatch(scheme_name):
            raise ValueError('Некорректное имя схемы')

        # Имя хоста очищается от символов, недопустимых в именах файлов (например, ':' у IPv6)
        host = CLIENT_HOST_PATTERN.sub('_', request.client.host) if request.client else 'unknown'
        # makedirs создаёт промежуточные директории и падает, если схема уже существует
        path = SCHEMES_PATH / host / scheme_name
        os.makedirs(path)

        with open(path.joinpath('nodes.json'), 'w', encoding='utf-8') as file:
            json.dump(content, file, ensure_ascii=False, indent=4)

    except Exception:
        return JSONResponse(content={'message': 'Scheme already exists'}, status_code=400)

    return JSONResponse(content={'message': 'Success'}, status_code=200)


# @app.get('/get-schemes')
# async def get_schemes(request: Request):
#     """
#     Метод для получения всех существующих схем
#     """

#     try:
#         if request.client:
#             path = SCHEMES_PATH.joinpath(request.client.host)
#             return JSONResponse(content={'schemes': [item.name for item in path.iterdir() if item.is_dir()]}, status_code=200)

#     except FileNotFoundError:
#         return JSONResponse(content={'message': 'Directory not found'}, status_code=404)


# @app.post('/init-node')
# async def init_node(content: dict):
#     """
#     Метод сохраняет в файл данные узла, создает файл с данными всех узлов, если его нет
#     """

#     try:
#         path = SCHEMES_PATH.joinpath(content["scheme_name"])
#         with open(path.joinpath('nodes.json'), 'a+', encoding='utf-8') as f:
#             json.dump(content, f, ensure_ascii=False, indent=4)

#     except FileNotFoundError:
#         return JSONResponse(content={'message': 'Scheme not found'}, status_code=404)

#     return JSONResponse(content={'message': 'Success'}, status_code=200)

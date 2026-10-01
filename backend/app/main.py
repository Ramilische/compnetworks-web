"""
Здесь находится основное приложение FastAPI
"""

import os
import json
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title='Application', root_path='/api')
middleware = CORSMiddleware(
    app,
    allow_origins=['http://localhost:5173', 'https://localhost:5173'],
    allow_methods=['*'],
    allow_headers=['*']
)
SCHEMES_DIRECTORY = 'backend/app/schemes'
SCHEMES_PATH = Path(SCHEMES_DIRECTORY)


@app.get('/create-scheme')
async def create_scheme(request: Request, scheme_name: str):
    """
    Метод создает директорию для хранения схемы
    """

    try:
        path = SCHEMES_PATH.joinpath(
            request.client.host + '/' if request.client else '',
            scheme_name
        )
        os.mkdir(path)

    except Exception:
        return JSONResponse(content={'message': 'Scheme already exists'}, status_code=400)

    return JSONResponse(content={'message': 'Success'}, status_code=200)


@app.get('/get-schemes')
async def get_schemes(request: Request):
    """
    Метод для получения всех существующих схем
    """

    try:
        if request.client:
            path = SCHEMES_PATH.joinpath(request.client.host)
            return JSONResponse(content={'schemes': [item.name for item in path.iterdir() if item.is_dir()]}, status_code=200)

    except FileNotFoundError:
        return JSONResponse(content={'message': 'Directory not found'}, status_code=404)

    return JSONResponse(content={'message': 'Success'}, status_code=200)


@app.post('/init-node')
async def init_node(content: dict):
    """
    Метод сохраняет в файл данные узла, создает файл с данными всех узлов, если его нет
    """

    try:
        path = SCHEMES_PATH.joinpath(content["scheme_name"])
        with open(path.joinpath('nodes.json'), 'a+', encoding='utf-8') as f:
            json.dump(content, f, ensure_ascii=False, indent=4)

    except FileNotFoundError:
        return JSONResponse(content={'message': 'Scheme not found'}, status_code=404)

    return JSONResponse(content={'message': 'Success'}, status_code=200)

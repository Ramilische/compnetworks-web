"""
Обратно-совместимая точка входа: `python main.py` запускает dev-сервер.
Основная логика запуска — в app/cli.py (console script `uv run app`).
"""

from app.cli import main


if __name__ == '__main__':
    main()

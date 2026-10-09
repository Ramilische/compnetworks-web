import { useNavigate } from 'react-router-dom';

import './styles/Start.css'


function Start() {
    const navigate = useNavigate();

    return <>
    <div className="start">
        <div className="start__card">
            <h1 className="start__title">Проектирование сети</h1>
            <p className="start__subtitle">Выберите действие, чтобы начать работу</p>

            <div className="start__actions">
                <button
                    type="button"
                    className="start__btn start__btn--primary"
                    onClick={() => navigate("/new-scheme")}
                >
                    Создать новую схему
                </button>
                {/* TODO: кнопка станет активной, когда появится страница со списком схем */}
                <button
                    type="button"
                    className="start__btn start__btn--secondary"
                    disabled
                >
                    Список схем
                </button>
            </div>
        </div>
    </div>
    </>
}

export default Start;
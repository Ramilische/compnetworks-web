import { useNavigate } from 'react-router-dom';

import { Actions, Button, PageHeader } from '../components/ui';
import './styles/Start.css';

function Start() {
    const navigate = useNavigate();

    return (
        <div className="start">
            <div className="start__card">
                <PageHeader
                    title="Проектирование сети"
                    subtitle="Выберите действие, чтобы начать работу"
                />

                <Actions className="start__actions">
                    <Button onClick={() => navigate('/new-scheme')}>
                        Создать новую схему
                    </Button>
                    {/* TODO: кнопка станет активной, когда появится страница со списком схем */}
                    <Button variant="ghost" disabled>
                        Список схем
                    </Button>
                </Actions>
            </div>
        </div>
    );
}

export default Start;
import { useNavigate } from 'react-router-dom';

import { Actions, Alert, Button, PageHeader } from '../components/ui';
import SchemeListCard from './choose-scheme/SchemeListCard.jsx';
import SchemePreviewCard from './choose-scheme/SchemePreviewCard.jsx';
import useChooseScheme from './choose-scheme/useChooseScheme.js';
import './styles/ChooseScheme.css';

/**
 * Страница «Выбор схемы».
 * Список схем приходит с бэкенда (get-scheme-list),
 * содержимое выбранной схемы — с get-scheme.
 * Состояние и логика — в хуке useChooseScheme,
 * секции — в ./choose-scheme/.
 */
export default function ChooseScheme() {
    const navigate = useNavigate();

    const {
        schemes,
        listLoading,
        listError,
        reloadList,
        selectedName,
        scheme,
        schemeLoading,
        schemeError,
        loadScheme,
    } = useChooseScheme();

    return (
        <div className="cs">
            <PageHeader
                title="Выбор схемы"
                subtitle="Загрузите сохранённую схему компьютерной сети с сервера"
            />

            {/* ---------- ОШИБКА СПИСКА ---------- */}
            <Alert>{listError}</Alert>

            {/* ---------- 1. СПИСОК СХЕМ ---------- */}
            <SchemeListCard
                schemes={schemes}
                loading={listLoading || schemeLoading}
                selectedName={selectedName}
                pendingName={selectedName}
                onLoad={loadScheme}
                onRefresh={reloadList}
            />

            {/* ---------- 2. СОДЕРЖИМОЕ СХЕМЫ ---------- */}
            <SchemePreviewCard
                scheme={scheme}
                loading={schemeLoading}
                error={schemeError}
            />

            {/* ---------- ДЕЙСТВИЯ ---------- */}
            <Actions>
                <Button onClick={() => navigate('/new-scheme')}>
                    Создать новую схему
                </Button>
                <Button variant="ghost" onClick={() => navigate('/')}>
                    На главную
                </Button>
            </Actions>
        </div>
    );
}

import { useNavigate, useParams } from 'react-router-dom';

import { Actions, Alert, Button, Card, Hint, PageHeader } from '../components/ui';
import ChannelsCard from './edit-scheme/ChannelsCard.jsx';
import NodesCard from './edit-scheme/NodesCard.jsx';
import SchemeMapCard from './edit-scheme/SchemeMapCard.jsx';
import useEditScheme from './edit-scheme/useEditScheme.js';
import './styles/EditScheme.css';

/**
 * Страница «Редактирование схемы» (пока — только просмотр):
 * карта сети, таблица узлов и таблица каналов.
 * Взаимодействие (клик по узлу, смена типов, добавление каналов)
 * будет добавлено позже.
 */
export default function EditScheme() {
    const navigate = useNavigate();
    const { schemeName } = useParams();

    const { scheme, loading, error, reload } = useEditScheme(schemeName);

    return (
        <div className="es">
            <PageHeader
                title={`Схема «${schemeName}»`}
                subtitle="Просмотр схемы компьютерной сети — редактирование появится позже"
            />

            {/* ---------- ОШИБКА ЗАГРУЗКИ ---------- */}
            <Alert>{error}</Alert>

            {/* ---------- ЗАГРУЗКА ---------- */}
            {loading && (
                <Card title="Схема" variant="result">
                    <Hint>Загрузка схемы…</Hint>
                </Card>
            )}

            {/* ---------- СОДЕРЖИМОЕ СХЕМЫ ---------- */}
            {!loading && !error && scheme && (
                <>
                    <SchemeMapCard scheme={scheme} />
                    <NodesCard nodes={scheme.nodes} nodeTypes={scheme.nodeTypes} />
                    <ChannelsCard
                        channels={scheme.channels}
                        nodes={scheme.nodes}
                        channelTypes={scheme.channelTypes}
                    />
                </>
            )}

            {/* ---------- ДЕЙСТВИЯ ---------- */}
            <Actions>
                {error && (
                    <Button onClick={reload}>Повторить загрузку</Button>
                )}
                <Button variant="ghost" onClick={() => navigate('/choose-scheme')}>
                    К выбору схем
                </Button>
                <Button variant="ghost" onClick={() => navigate('/')}>
                    На главную
                </Button>
            </Actions>
        </div>
    );
}

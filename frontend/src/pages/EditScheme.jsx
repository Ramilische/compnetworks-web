import { useNavigate, useParams } from 'react-router-dom';

import { Actions, Alert, Button, Card, Hint, PageHeader } from '../components/ui';
import ChannelsCard from './edit-scheme/ChannelsCard.jsx';
import NodesCard from './edit-scheme/NodesCard.jsx';
import SchemeMapCard from './edit-scheme/SchemeMapCard.jsx';
import useEditScheme from './edit-scheme/useEditScheme.js';
import './styles/EditScheme.css';

/**
 * Страница «Редактирование схемы»: карта сети, таблица узлов и таблица
 * каналов. По клику (ЛКМ) на узел открывается контекстное меню: изменить
 * тип / имя / координаты, удалить узел. Изменения пока применяются только
 * в памяти (флаг dirty) — сохранение на сервере появится позже.
 */
export default function EditScheme() {
    const navigate = useNavigate();
    const { schemeName } = useParams();

    const {
        scheme,
        loading,
        error,
        reload,
        dirty,
        selectedIndex,
        menuAction,
        draft,
        draftError,
        selectNode,
        closeMenu,
        openAction,
        updateDraft,
        applyAction,
        cancelAction,
        confirmDelete,
    } = useEditScheme(schemeName);

    return (
        <div className="es">
            <PageHeader
                title={`Схема «${schemeName}»`}
                subtitle="Кликните по узлу на карте, чтобы изменить его или удалить"
            />

            {/* ---------- ОШИБКА ЗАГРУЗКИ ---------- */}
            <Alert>{error}</Alert>

            {/* ---------- ЗАГРУЗКА ---------- */}
            {loading && (
                <Card title="Схема" variant="result">
                    <Hint>Загрузка схемы…</Hint>
                </Card>
            )}

            {/* ---------- НЕСОХРАНЁННЫЕ ИЗМЕНЕНИЯ ---------- */}
            {!loading && !error && dirty && (
                <Hint>
                    Есть несохранённые изменения — сохранение на сервере появится позже.
                    «Сбросить изменения» вернёт состояние, загруженное с сервера.
                </Hint>
            )}

            {/* ---------- СОДЕРЖИМОЕ СХЕМЫ ---------- */}
            {!loading && !error && scheme && (
                <>
                    <SchemeMapCard
                        scheme={scheme}
                        selectedIndex={selectedIndex}
                        menuAction={menuAction}
                        draft={draft}
                        draftError={draftError}
                        onSelectNode={selectNode}
                        onCloseMenu={closeMenu}
                        onAction={openAction}
                        onDraftChange={updateDraft}
                        onApply={applyAction}
                        onBack={cancelAction}
                        onDelete={confirmDelete}
                    />
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
                {dirty && !error && (
                    <Button onClick={reload}>Сбросить изменения</Button>
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

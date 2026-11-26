import { useNavigate, useParams } from 'react-router-dom';

import { Actions, Alert, Button, Card, Hint, PageHeader } from '../components/ui';
import Toolbar from './edit-scheme/Toolbar.jsx';
import ChannelsCard from './edit-scheme/ChannelsCard.jsx';
import NodesCard from './edit-scheme/NodesCard.jsx';
import SchemeMapCard from './edit-scheme/SchemeMapCard.jsx';
import useEditScheme from './edit-scheme/useEditScheme.js';
import './styles/EditScheme.css';

/**
 * Страница «Редактирование топологии»: карта сети, таблица узлов и таблица
 * каналов. По клику (ЛКМ) на узел открывается контекстное меню: изменить
 * тип / имя / координаты, удалить узел. Изменения применяются в памяти
 * (флаг dirty); кнопка «Сохранить» отправляет схему на POST /update-scheme.
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
        saving,
        saveError,
        saved,
        saveScheme,
        selectedIndex,
        menuAction,
        draft,
        draftError,
        activeTool,
        setActiveTool,
        channelStartIndex,
        generateTree,
        createNode,
        selectNode,
        closeMenu,
        openAction,
        updateDraft,
        applyAction,
        cancelAction,
        confirmDelete,
        selectedChannelIndex,
        channelMenuAction,
        channelDraft,
        channelDraftError,
        selectChannel,
        openChannelAction,
        updateChannelDraft,
        cancelChannelAction,
        applyChannelAction,
        confirmDeleteChannel,
    } = useEditScheme(schemeName);

    return (
        <div className="es">
            <PageHeader
                title={`Схема «${schemeName}»`}
                subtitle="Кликните по узлу на карте, чтобы изменить его или удалить"
            />

            {/* ---------- ПАНЕЛЬ ИНСТРУМЕНТОВ ---------- */}
            <Toolbar
                activeTool={activeTool}
                onToolChange={setActiveTool}
                onGenerateTree={generateTree}
            />

            {/* ---------- ОШИБКА ЗАГРУЗКИ ---------- */}
            <Alert>{error}</Alert>

            {/* ---------- ОШИБКА СОХРАНЕНИЯ ---------- */}
            <Alert>{saveError}</Alert>

            {/* ---------- ЗАГРУЗКА ---------- */}
            {loading && (
                <Card title="Проект" variant="result">
                    <Hint>Загрузка проекта…</Hint>
                </Card>
            )}

            {/* ---------- НЕСОХРАНЁННЫЕ ИЗМЕНЕНИЯ ---------- */}
            {!loading && !error && dirty && (
                <Hint>
                    Есть несохранённые изменения: «Сохранить» запишет их на сервер,
                    «Сбросить изменения» вернёт состояние, загруженное с сервера.
                </Hint>
            )}

            {/* ---------- ИЗМЕНЕНИЯ СОХРАНЕНЫ ---------- */}
            {!loading && !error && saved && !dirty && (
                <Alert variant="success">Изменения сохранены на сервере.</Alert>
            )}

            {/* ---------- СОДЕРЖИМОЕ ---------- */}
            {!loading && !error && scheme && (
                <>
                    <SchemeMapCard
                        scheme={scheme}
                        selectedIndex={selectedIndex}
                        channelStartIndex={channelStartIndex}
                        activeTool={activeTool}
                        menuAction={menuAction}
                        draft={draft}
                        draftError={draftError}
                        selectedChannelIndex={selectedChannelIndex}
                        channelMenuAction={channelMenuAction}
                        channelDraft={channelDraft}
                        channelDraftError={channelDraftError}
                        onSelectNode={selectNode}
                        onCloseMenu={closeMenu}
                        onCreateNode={createNode}
                        onSelectChannel={selectChannel}
                        onChannelAction={openChannelAction}
                        onChannelDraftChange={updateChannelDraft}
                        onChannelApply={applyChannelAction}
                        onChannelBack={cancelChannelAction}
                        onChannelDelete={confirmDeleteChannel}
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
                    <Button onClick={saveScheme} disabled={saving}>
                        {saving ? 'Сохранение…' : 'Сохранить'}
                    </Button>
                )}
                {dirty && !error && (
                    <Button variant="ghost" onClick={reload}>
                        Сбросить изменения
                    </Button>
                )}
                <Button variant="ghost" onClick={() => navigate('/choose-scheme')}>
                    К выбору проекта
                </Button>
                <Button variant="ghost" onClick={() => navigate('/')}>
                    На главную
                </Button>
            </Actions>
        </div>
    );
}

import { useCallback, useEffect, useState } from 'react';
import { fetchScheme, updateScheme } from './api.js';
import { deleteNodeAt, updateNodeAt, addChannel, removeChannel, computeTree, addNode, nextNodeName, defaultNodeTypeId, updateChannelAt } from './constants.js';

/**
 * Состояние страницы «Редактирование схемы».
 *
 * Загрузка: схема приходит с сервера по имени из параметров маршрута
 * (при смене schemeName — автоматическая перезагрузка).
 *
 * Редактирование: выбор узла на карте + контекстное меню с действиями
 * (изменить тип / имя / координаты, удалить). Изменения применяются
 * только в памяти — флаг dirty показывает, что схема не сохранена
 * на сервер (сохранение появится в следующем шаге).
 */
export default function useEditScheme(schemeName) {
    const [scheme, setScheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Выделение узла и открытое действие контекстного меню
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [menuAction, setMenuAction] = useState(null);
    const [draft, setDraft] = useState(null);
    const [draftError, setDraftError] = useState(null);
    const [dirty, setDirty] = useState(false);

    // Выделение канала и открытое действие контекстного меню
    const [selectedChannelIndex, setSelectedChannelIndex] = useState(null);
    const [channelMenuAction, setChannelMenuAction] = useState(null);
    const [channelDraft, setChannelDraft] = useState(null);
    const [channelDraftError, setChannelDraftError] = useState(null);

    // Активный инструмент панели редактирования: 'select' | 'make-channel' | 'generate-tree'
    const [activeTool, setActiveTool] = useState('select');

    // Узел-начало для создания канала (инструмент «Создать канал»)
    const [channelStartIndex, setChannelStartIndex] = useState(null);

    // Сохранение на сервер (POST /update-scheme)
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saved, setSaved] = useState(false);

    // Закрыть меню, снять выделение и очистить черновик
    const closeMenu = useCallback(() => {
        setSelectedIndex(null);
        setMenuAction(null);
        setDraft(null);
        setDraftError(null);
        setChannelStartIndex(null);
        setSelectedChannelIndex(null);
        setChannelMenuAction(null);
        setChannelDraft(null);
        setChannelDraftError(null);
    }, []);

    // Загрузка схемы: setState вызываются только в callback'ах promise'а,
    // не синхронно в эффекте (правило react-hooks/set-state-in-effect).
    // Заодно сбрасывает выделение и флаг dirty — используется при перезагрузке.
    const applyScheme = useCallback(
        () =>
            fetchScheme(schemeName)
                .then((content) => {
                    setScheme(content || null);
                    setError(content ? null : 'пустой ответ сервера');
                    closeMenu();
                    setDirty(false);
                    setSaved(false);
                    setSaveError(null);
                })
                .catch((err) => {
                    setScheme(null);
                    setError(`Не удалось загрузить схему «${schemeName}»: ${err.message}`);
                })
                .finally(() => setLoading(false)),
        [schemeName, closeMenu]
    );

    useEffect(() => {
        applyScheme();
    }, [applyScheme]);

    // Перезагрузка по кнопке — обработчик события, здесь setState можно
    // вызывать синхронно
    const reload = useCallback(() => {
        setLoading(true);
        applyScheme();
    }, [applyScheme]);

    // Escape закрывает меню: setState — внутри обработчика события, не в эффекте
    useEffect(() => {
        if (selectedIndex === null && selectedChannelIndex === null) return undefined;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') closeMenu();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedIndex, selectedChannelIndex, closeMenu]);

    // Клик где угодно на странице вне меню и узла закрывает контекстное меню
    useEffect(() => {
        if (selectedIndex === null && selectedChannelIndex === null) return undefined;
        const onDocumentClick = (event) => {
            // Не закрываем, если клик внутри меню, по узлу или по каналу
            if (event.target.closest('.es-menu')) return;
            if (event.target.closest('.ui-quickmenu')) return;
            if (event.target.closest('.es-map__node')) return;
            if (event.target.closest('.es-map__link')) return;
            if (event.target.closest('.ui-modal-backdrop')) return;
            closeMenu();
        };
        document.addEventListener('mousedown', onDocumentClick);
        return () => document.removeEventListener('mousedown', onDocumentClick);
    }, [selectedIndex, selectedChannelIndex, closeMenu]);

    // ---------- Редактирование узлов (только в памяти) ----------

    // Переключить канал между двумя узлами (только в памяти).
    // Если канал уже существует (в любом направлении) — удаляет его,
    // иначе — создаёт с типом первого доступного channelType.
    const toggleChannel = useCallback((from, to) => {
        if (!scheme) return;
        const channelTypes = scheme.channelTypes || [];
        const existing = (scheme.channels || []).find(
            (c) => (c.from === from && c.to === to) || (c.from === to && c.to === from)
        );
        if (existing) {
            setScheme((prev) => removeChannel(prev, from, to));
        } else if (channelTypes.length > 0) {
            setScheme((prev) => addChannel(prev, from, to, channelTypes[0].id));
        } else {
            setDraftError('В схеме нет типов каналов — создайте тип канала перед построением');
            return;
        }
        setDirty(true);
    }, [scheme]);

    // Построить оптимальное дерево (MST по Краскалу) между существующими узлами.
    // Добавляет каналы для рёбер дерева, которых ещё нет в схеме.
    const generateTree = useCallback(() => {
        if (!scheme) return;
        const nodes = scheme.nodes;
        if (nodes.length < 2) {
            setDraftError('Для дерева нужно не менее двух узлов');
            return;
        }
        const channelTypes = scheme.channelTypes || [];
        if (channelTypes.length === 0) {
            setDraftError('В схеме нет типов каналов — создайте тип канала перед построением');
            return;
        }
        const typeId = channelTypes[0].id;
        const tree = computeTree(nodes);
        let next = scheme;
        for (const { from, to } of tree) {
            const already = (next.channels || []).find(
                (c) => (c.from === from && c.to === to) || (c.from === to && c.to === from)
            );
            if (!already) {
                next = addChannel(next, from, to, typeId);
            }
        }
        setScheme(next);
        setDirty(true);
    }, [scheme]);

    // Создать новый узел в точке (x, y) клика (только в памяти).
    // Имя автогенерируется «УК1», «УК2»…, тип — первый nodeType,
    // координаты округляются до 0.01.
    const createNode = useCallback((x, y) => {
        if (!scheme) return;
        const typeId = defaultNodeTypeId(scheme.nodeTypes);
        if (typeId === null) {
            setDraftError('В схеме нет типов узлов — создайте тип узла перед добавлением');
            return;
        }
        const name = nextNodeName(scheme.nodes);
        const nx = Math.round(x * 100) / 100;
        const ny = Math.round(y * 100) / 100;
        setScheme((prev) => addNode(prev, name, nx, ny, typeId));
        setDirty(true);
    }, [scheme]);

    // Клик по узлу на карте: выделить узел и открыть меню действий.
    // В режиме «Создать канал»: первый клик помечает узел-начало,
    // второй клик (на другом узле) создаёт канал или удаляет существующий.
    // В режиме «Создать узел»: клик по существующему узлу выделяет его
    // (как в режиме «Выделить»), новый узел создаётся по клику на фоне.
    const selectNode = useCallback((index) => {
        if (activeTool === 'make-channel') {
            if (channelStartIndex === null) {
                // Первый клик — помечаем узел-начало
                setChannelStartIndex(index);
            } else if (channelStartIndex === index) {
                // Повторный клик на том же узле — отмена
                setChannelStartIndex(null);
            } else {
                // Второй клик на другом узле — переключить канал
                toggleChannel(channelStartIndex, index);
                setChannelStartIndex(null);
            }
            return;
        }
        setSelectedIndex(index);
        setMenuAction(null);
        setDraftError(null);
    }, [activeTool, channelStartIndex, toggleChannel]);

    // Открыть форму действия, предзаполнив черновик значениями узла
    const openAction = useCallback(
        (action) => {
            if (!scheme || selectedIndex === null) return;
            const node = scheme.nodes[selectedIndex];
            setDraft({ name: node.name, typeId: node.typeId, x: node.x, y: node.y });
            setMenuAction(action);
            setDraftError(null);
        },
        [scheme, selectedIndex]
    );

    // Обновить черновик (введённые значения пока не применены к схеме)
    const updateDraft = useCallback((patch) => {
        setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    }, []);

    // Вернуться из формы к списку действий
    const cancelAction = useCallback(() => {
        setMenuAction(null);
        setDraftError(null);
    }, []);

    // Применить действие: проверить черновик и изменить схему в памяти
    const applyAction = useCallback(() => {
        if (!scheme || selectedIndex === null || !menuAction || !draft) return;
        if (menuAction !== 'edit') return;

        const name = String(draft.name ?? '').trim();
        if (!name) {
            setDraftError('Имя узла не может быть пустым');
            return;
        }
        const nodeTypes = scheme.nodeTypes || [];
        if (!nodeTypes.some((t) => t.id === draft.typeId)) {
            setDraftError('Выбранный тип узла не существует');
            return;
        }
        const x = Number(draft.x);
        const y = Number(draft.y);
        if (draft.x === '' || draft.y === '' || !Number.isFinite(x) || !Number.isFinite(y)) {
            setDraftError('Координаты должны быть числами');
            return;
        }

        setScheme((prev) => updateNodeAt(prev, selectedIndex, { name, typeId: draft.typeId, x, y }));

        setDirty(true);
        setMenuAction(null);
        setDraftError(null);
    }, [scheme, selectedIndex, menuAction, draft]);

    // Удалить выбранный узел (с поправкой на каналы и traffic.matrix)
    const confirmDelete = useCallback(() => {
        if (!scheme || selectedIndex === null) return;
        setScheme((prev) => deleteNodeAt(prev, selectedIndex));
        setDirty(true);
        closeMenu();
    }, [scheme, selectedIndex, closeMenu]);

    // ---------- Редактирование каналов (только в памяти) ----------

    // Выделить канал на карте и открыть меню действий
    const selectChannel = useCallback((index) => {
        setSelectedChannelIndex(index);
        setChannelMenuAction(null);
        setChannelDraftError(null);
    }, []);

    // Открыть форму действия канала, предзаполнив черновик
    const openChannelAction = useCallback(
        (action) => {
            if (!scheme || selectedChannelIndex === null) return;
            const channel = scheme.channels[selectedChannelIndex];
            if (action === 'edit' || action === 'type') {
                setChannelDraft({ typeId: channel.typeId });
            }
            setChannelMenuAction(action);
            setChannelDraftError(null);
        },
        [scheme, selectedChannelIndex]
    );

    // Обновить черновик канала
    const updateChannelDraft = useCallback((patch) => {
        setChannelDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    }, []);

    // Вернуться из формы к списку действий канала
    const cancelChannelAction = useCallback(() => {
        setChannelMenuAction(null);
        setChannelDraftError(null);
    }, []);

    // Применить действие канала: изменить тип
    const applyChannelAction = useCallback(() => {
        if (!scheme || selectedChannelIndex === null || !channelMenuAction || !channelDraft) return;
        if (channelMenuAction !== 'edit') return;

        const channelTypes = scheme.channelTypes || [];
        if (!channelTypes.some((t) => t.id === channelDraft.typeId)) {
            setChannelDraftError('Выбранный тип канала не существует');
            return;
        }

        setScheme((prev) => updateChannelAt(prev, selectedChannelIndex, { typeId: channelDraft.typeId }));

        setDirty(true);
        setChannelMenuAction(null);
        setChannelDraftError(null);
    }, [scheme, selectedChannelIndex, channelMenuAction, channelDraft]);

    // Удалить выбранный канал
    const confirmDeleteChannel = useCallback(() => {
        if (!scheme || selectedChannelIndex === null) return;
        setScheme((prev) => {
            const channels = (prev.channels || []).filter((_, i) => i !== selectedChannelIndex);
            return { ...prev, channels };
        });
        setDirty(true);
        closeMenu();
    }, [scheme, selectedChannelIndex, closeMenu]);

    // Сохранить схему на сервер (POST /update-scheme перезаписывает nodes.json)
    const saveScheme = useCallback(() => {
        if (!scheme || saving) return;
        // В загруженной схеме schemeName есть, но подстрахуемся именем из маршрута
        const payload = scheme.schemeName ? scheme : { ...scheme, schemeName };
        setSaving(true);
        setSaveError(null);
        updateScheme(payload)
            .then(() => {
                setSaved(true);
                setDirty(false);
            })
            .catch((err) => {
                setSaved(false);
                setSaveError(`Не удалось сохранить схему: ${err.message}`);
            })
            .finally(() => setSaving(false));
    }, [scheme, schemeName, saving]);

    return {
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
        selectNode,
        closeMenu,
        openAction,
        updateDraft,
        applyAction,
        cancelAction,
        confirmDelete,
        generateTree,
        createNode,
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
    };
}

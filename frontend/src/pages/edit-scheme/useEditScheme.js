import { useCallback, useEffect, useState } from 'react';
import { fetchScheme } from './api.js';
import { deleteNodeAt, updateNodeAt } from './constants.js';

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

    // Закрыть меню, снять выделение и очистить черновик
    const closeMenu = useCallback(() => {
        setSelectedIndex(null);
        setMenuAction(null);
        setDraft(null);
        setDraftError(null);
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
        if (selectedIndex === null) return undefined;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') closeMenu();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedIndex, closeMenu]);

    // ---------- Редактирование узлов (только в памяти) ----------

    // Клик по узлу на карте: выделить узел и открыть меню действий
    const selectNode = useCallback((index) => {
        setSelectedIndex(index);
        setMenuAction(null);
        setDraftError(null);
    }, []);

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

        if (menuAction === 'name') {
            const name = String(draft.name ?? '').trim();
            if (!name) {
                setDraftError('Имя узла не может быть пустым');
                return;
            }
            setScheme((prev) => updateNodeAt(prev, selectedIndex, { name }));
        } else if (menuAction === 'type') {
            setScheme((prev) => updateNodeAt(prev, selectedIndex, { typeId: draft.typeId }));
        } else if (menuAction === 'coords') {
            const x = Number(draft.x);
            const y = Number(draft.y);
            if (draft.x === '' || draft.y === '' || !Number.isFinite(x) || !Number.isFinite(y)) {
                setDraftError('Координаты должны быть числами');
                return;
            }
            setScheme((prev) => updateNodeAt(prev, selectedIndex, { x, y }));
        }

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

    return {
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
    };
}

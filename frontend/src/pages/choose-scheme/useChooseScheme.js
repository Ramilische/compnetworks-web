import { useCallback, useEffect, useState } from 'react';
import { fetchScheme, fetchSchemeList } from './api.js';

/**
 * Состояние страницы «Выбор схемы»:
 * список схем на сервере + загрузка выбранной схемы.
 * Возвращает значения, колбэки и обработчики для карточек страницы.
 */
export default function useChooseScheme() {
    const [schemes, setSchemes] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState(null);

    const [selectedName, setSelectedName] = useState(null);
    const [scheme, setScheme] = useState(null);
    const [schemeLoading, setSchemeLoading] = useState(false);
    const [schemeError, setSchemeError] = useState(null);

    /* ---------------- СПИСОК СХЕМ ---------------- */

    // Все setState — только в callback'ах promise'а, не синхронно
    // в эффекте (правило react-hooks/set-state-in-effect); функцию
    // можно вызывать из effect и из кнопки «Обновить»
    const applyList = useCallback(
        () =>
            fetchSchemeList()
                .then((names) => {
                    setSchemes(names);
                    setListError(null);
                })
                .catch((err) => {
                    setSchemes([]);
                    setListError(`Не удалось получить список схем: ${err.message}`);
                })
                .finally(() => setListLoading(false)),
        []
    );

    // Начальная загрузка списка (listLoading=true — в начальном state)
    useEffect(() => {
        applyList();
    }, [applyList]);

    // Обновление списка кнопкой «Обновить»
    const reloadList = useCallback(() => {
        setListLoading(true);
        setListError(null);
        applyList();
    }, [applyList]);

    /* ---------------- ЗАГРУЗКА СХЕМЫ ---------------- */

    const loadScheme = useCallback(async (name) => {
        setSelectedName(name);
        setScheme(null);
        setSchemeError(null);
        setSchemeLoading(true);

        try {
            const content = await fetchScheme(name);
            if (!content) {
                throw new Error('пустой ответ сервера');
            }
            setScheme({ name, content });
        } catch (err) {
            setSchemeError(`Не удалось загрузить схему «${name}»: ${err.message}`);
        } finally {
            setSchemeLoading(false);
        }
    }, []);

    return {
        schemes,
        listLoading,
        listError,
        reloadList,
        selectedName,
        scheme,
        schemeLoading,
        schemeError,
        loadScheme,
    };
}

import { useCallback, useEffect, useState } from 'react';
import { fetchScheme } from './api.js';

/**
 * Состояние страницы «Редактирование схемы»: загрузка схемы с сервера
 * по имени из параметров маршрута. При смене schemeName схема
 * перезагружается автоматически.
 */
export default function useEditScheme(schemeName) {
    const [scheme, setScheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Загрузка схемы: setState вызываются только в callback'ах promise'а,
    // не синхронно в эффекте (правило react-hooks/set-state-in-effect)
    const applyScheme = useCallback(
        () =>
            fetchScheme(schemeName)
                .then((content) => {
                    setScheme(content || null);
                    setError(content ? null : 'пустой ответ сервера');
                })
                .catch((err) => {
                    setScheme(null);
                    setError(`Не удалось загрузить схему «${schemeName}»: ${err.message}`);
                })
                .finally(() => setLoading(false)),
        [schemeName]
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

    return { scheme, loading, error, reload };
}

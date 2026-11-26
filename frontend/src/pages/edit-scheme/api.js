// API страницы «Редактирование схемы».
// GET /get-scheme уже реализован в choose-scheme/api.js — переиспользуем,
// чтобы не дублировать URL и разбор ответа (unwrap).
import { fetchScheme } from '../choose-scheme/api.js';
import { UPDATE_SCHEME_URL } from './constants.js';

export { fetchScheme };

/**
 * Разбирает тело ответа и бросает понятную ошибку, если ответ не ok
 * (тот же паттерн unwrap, что в choose-scheme/api.js).
 */
async function unwrap(response) {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || `Сервер ответил с кодом ${response.status}`);
    }

    return data;
}

/**
 * Сохраняет схему на сервере: POST /update-scheme перезаписывает nodes.json
 * существующей схемы. Бросает ошибку с message схемы при ответе не ok.
 */
export async function updateScheme(scheme) {
    const response = await fetch(UPDATE_SCHEME_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheme),
    });
    await unwrap(response);
}

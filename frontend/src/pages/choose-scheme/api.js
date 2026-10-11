import { GET_SCHEME_LIST_URL, GET_SCHEME_URL } from './constants.js';

/**
 * Разбирает тело ответа и бросает понятную ошибку, если ответ не ok.
 * Бэкенд возвращает JSON вида { message, ... } — берём message, если он есть.
 */
async function unwrap(response) {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || `Сервер ответил с кодом ${response.status}`);
    }

    return data;
}

/**
 * Загружает список имён схем (папок) с сервера.
 * Бросает ошибку, если сервер недоступен или ответил не ok.
 */
export async function fetchSchemeList() {
    const data = await unwrap(await fetch(GET_SCHEME_LIST_URL));
    return Array.isArray(data?.schemes) ? data.schemes : [];
}

/**
 * Загружает содержимое схемы по её имени (файл nodes.json внутри папки).
 * Возвращает данные схемы (schemeName, nodes, channels, nodeTypes, traffic).
 */
export async function fetchScheme(schemeName) {
    const url = `${GET_SCHEME_URL}?scheme_name=${encodeURIComponent(schemeName)}`;
    const data = await unwrap(await fetch(url));
    return data?.scheme ?? null;
}

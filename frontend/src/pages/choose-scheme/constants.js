// Константы страницы «Выбор схемы».
// Базовый адрес берётся из общей константы формы проектирования,
// чтобы адрес backend не приходилось дублировать.
import { API_URL } from '../network-design-form/constants.js';

export const GET_SCHEME_LIST_URL = API_URL + 'get-scheme-list';
export const GET_SCHEME_URL = API_URL + 'get-scheme';

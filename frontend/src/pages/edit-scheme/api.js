// API страницы «Редактирование схемы».
// GET /get-scheme уже реализован в choose-scheme/api.js — переиспользуем,
// чтобы не дублировать URL и разбор ответа (unwrap).
import { fetchScheme } from '../choose-scheme/api.js';

export { fetchScheme };

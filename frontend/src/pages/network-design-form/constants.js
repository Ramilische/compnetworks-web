// Общие константы, фабрики и утилиты формы «Проектирование компьютерной сети».

export const uid = () => Math.random().toString(36).slice(2, 9);

// Следующее свободное имя узла вида «УК<n>» (с учётом ручных переименований)
export const nextNodeName = (nodes) => {
    let max = 0;
    nodes.forEach((n) => {
        const m = /^УК(\d+)$/.exec(n.name);
        if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return `УК${max + 1}`;
};

export const makeNode = (name) => ({ id: uid(), name, x: '', y: '' });
export const makeCable = () => ({ id: uid(), name: '', bandwidth: '', price: '' });
export const makeNodeType = () => ({ id: uid(), name: '', speed: '', price: '' });

// Стартовый набор узлов (новые id при каждом вызове — для initial state и сброса)
export const initialNodes = () => [makeNode('УК1'), makeNode('УК2'), makeNode('УК3')];

export const pairKey = (a, b) => (a < b ? `${a}:${b}` : `${b}:${a}`);

export const MAX_NODES = 10000;
export const MAX_CABLES = 20;
export const MAX_NODE_TYPES = 20;

// Разрешены только буквы, цифры, пробелы, дефис и подчёркивание
export const SCHEME_NAME_PATTERN = /^[\p{L}\p{N}\s_-]+$/u;

export const API_URL = 'http://localhost:1234/api/';
export const CREATE_SCHEME_URL = API_URL + 'create-scheme';

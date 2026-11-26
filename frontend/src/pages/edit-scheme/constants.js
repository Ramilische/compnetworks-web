// Константы и чистые хелперы страницы «Редактирование схемы».
// Базовый адрес берётся из общей константы формы проектирования,
// чтобы адрес backend не приходилось дублировать.
import { API_URL } from '../network-design-form/constants.js';

export const UPDATE_SCHEME_URL = API_URL + 'update-scheme';

// Геометрия карты (в координатах схемы): отступ от краёв, радиус узла
// и размер подписи — доли размаха координат (масштабируются с данными)
const PADDING_RATIO = 0.12;
const RADIUS_RATIO = 0.04;
const LABEL_RATIO = 0.05;
// Размах, если все узлы стоят в одной точке (синтетический экран)
const FALLBACK_SPAN = 100;

/** Приводит координату к числу (нечисловое значение → 0). */
const coord = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
};

/** Имя типа узла по его id (или «—», если тип не найден). */
export const nodeTypeName = (nodeTypes, typeId) =>
    (nodeTypes || []).find((t) => t.id === typeId)?.name ?? '—';

/** Название типа канала по его id (или «—», если тип не найден). */
export const channelTypeName = (channelTypes, typeId) =>
    (channelTypes || []).find((t) => t.id === typeId)?.name ?? '—';

/** Каналы с корректными индексами узлов (from/to внутри границ nodes). */
export const validChannels = (channels, nodes) =>
    (channels || []).filter(
        (c) =>
            Number.isInteger(c.from) &&
            Number.isInteger(c.to) &&
            c.from >= 0 &&
            c.to >= 0 &&
            c.from < nodes.length &&
            c.to < nodes.length
    );

/**
 * Строит layout карты: квадратный viewBox (равномерный масштаб —
 * окружности остаются кругами) и центры узлов в координатах схемы.
 * Для одного узла / совпадающих координат используется синтетический
 * размах, чтобы узел оказался по центру и не «раздувался».
 * Возвращает { x, y, size, points: [{ cx, cy }], radius, labelSize }.
 */
export function computeMapLayout(nodes) {
    const xs = nodes.map((n) => coord(n.x));
    const ys = nodes.map((n) => coord(n.y));

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const span = Math.max(spanX, spanY) || FALLBACK_SPAN;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const radius = span * RADIUS_RATIO;
    const labelSize = span * LABEL_RATIO;
    // Половина экрана: размах + отступ + радиус узла (подпись уходит вниз)
    const half = span / 2 + span * PADDING_RATIO + radius;

    return {
        x: centerX - half,
        y: centerY - half,
        size: half * 2,
        points: xs.map((cx, i) => ({ cx, cy: ys[i] })),
        radius,
        labelSize,
    };
}

/**
 * Возвращает копию схемы с изменённым узлом index
 * (patch — частичные поля узла: name / typeId / x / y).
 */
export function updateNodeAt(scheme, index, patch) {
    return {
        ...scheme,
        nodes: scheme.nodes.map((node, i) => (i === index ? { ...node, ...patch } : node)),
    };
}

/**
 * Возвращает копию схемы без узла index. Индексы узлов — это позиции в
 * nodes, поэтому: каналы с удалённым узлом удаляются, индексы остальных
 * сдвигаются на 1 вниз; из traffic.matrix удаляются строка и столбец
 * index, чтобы матрица осталась симметричной и согласованной с nodes.
 */
export function deleteNodeAt(scheme, index) {
    const nodes = scheme.nodes.filter((_, i) => i !== index);
    const channels = (scheme.channels || [])
        .filter((c) => c.from !== index && c.to !== index)
        .map((c) => ({
            ...c,
            from: c.from > index ? c.from - 1 : c.from,
            to: c.to > index ? c.to - 1 : c.to,
        }));
    const matrix = (scheme.traffic?.matrix || [])
        .filter((_, i) => i !== index)
        .map((row) => row.filter((_, j) => j !== index));
    return {
        ...scheme,
        nodes,
        channels,
        traffic: { ...scheme.traffic, matrix },
    };
}

/**
 * Возвращает копию схемы с добавленным каналом между узлами from и to.
 * typeId — id типа канала (ссылается на channelTypes[].id).
 * from и to — 0-based индексы в nodes.
 */
export function addChannel(scheme, from, to, typeId) {
    return {
        ...scheme,
        channels: [
            ...(scheme.channels || []),
            { from, to, typeId },
        ],
    };
}

/**
 * Возвращает копию схемы без канала между узлами from и to.
 * Канал ищется в любом направлении (from→to или to→from).
 */
export function removeChannel(scheme, from, to) {
    return {
        ...scheme,
        channels: (scheme.channels || []).filter(
            (c) => !((c.from === from && c.to === to) || (c.from === to && c.to === from))
        ),
    };
}

/**
 * Стиль позиционирования контекстного меню относительно рамки карты:
 * left/top — проценты центра узла, при положении узла у правого/нижнего
 * края меню переворачивается, чтобы не вылезать за рамку.
 */
export function menuAnchorStyle(layout, point) {
    const left = ((point.cx - layout.x) / layout.size) * 100;
    const top = ((point.cy - layout.y) / layout.size) * 100;
    const offsetX = left > 60 ? 'calc(-100% - 12px)' : '12px';
    const offsetY = top > 60 ? 'calc(-100% - 12px)' : '12px';
    return {
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(${offsetX}, ${offsetY})`,
    };
}

/** Евклидово расстояние между двумя узлами по их координатам. */
export const nodeDistance = (a, b) => {
    const dx = coord(a.x) - coord(b.x);
    const dy = coord(a.y) - coord(b.y);
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Minimum Spanning Tree по алгоритму Краскала.
 * Вершины — узлы схемы, рёбра — все пары узлов, вес — евклидово расстояние.
 * Возвращает массив рёбер [{ from, to }] (0-based индексы в nodes).
 */
export function computeTree(nodes) {
    const n = nodes.length;
    if (n < 2) return [];

    // Все рёбра с весами
    const edges = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            edges.push({
                from: i,
                to: j,
                weight: nodeDistance(nodes[i], nodes[j]),
            });
        }
    }
    edges.sort((a, b) => a.weight - b.weight);

    // Union-Find
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    const union = (a, b) => {
        const ra = find(a);
        const rb = find(b);
        if (ra === rb) return false;
        parent[rb] = ra;
        return true;
    };

    const tree = [];
    for (const edge of edges) {
        if (union(edge.from, edge.to)) {
            tree.push({ from: edge.from, to: edge.to });
        }
    }
    return tree;
}

/** Возвращает id первого типа узла (тип по умолчанию для новых узлов). */
export const defaultNodeTypeId = (nodeTypes) =>
    (nodeTypes || []).length > 0 ? (nodeTypes || [])[0].id : null;

/**
 * Генерирует следующее доступное имя узла «УК1», «УК2», …
 */
export const nextNodeName = (nodes) => {
    const existing = new Set((nodes || []).map((n) => n.name));
    let i = 1;
    while (existing.has(`УК${i}`)) i++;
    return `УК${i}`;
};

/**
 * Возвращает копию схемы с изменённым каналом index
 * (patch — частичные поля канала: typeId).
 */
export function updateChannelAt(scheme, index, patch) {
    return {
        ...scheme,
        channels: scheme.channels.map((c, i) =>
            i === index ? { ...c, ...patch } : c
        ),
    };
}

/**
 * Возвращает копию схемы с добавленным узлом.
 * name — имя узла, x/y — координаты, typeId — id типа узла.
 */
export function addNode(scheme, name, x, y, typeId) {
    return {
        ...scheme,
        nodes: [
            ...(scheme.nodes || []),
            { name, x, y, typeId },
        ],
    };
}

// Константы и чистые хелперы страницы «Редактирование схемы».

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

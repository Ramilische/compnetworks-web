import { CREATE_SCHEME_URL, pairKey } from './constants.js';

/**
 * Собирает итоговый payload для отправки на сервер
 * (значения приводятся к числам, матрица трафика — симметричная).
 */
export function buildPayload({ schemeName, nodes, channels, nodeTypes, traffic, trafficUnit }) {
    return {
        schemeName: schemeName.trim(),
        nodes: nodes.map((n) => ({
            name: n.name.trim(),
            x: Number(n.x),
            y: Number(n.y),
        })),
        // Каналы из формы сохраняются как типы каналов…
        channelTypes: channels.map((c) => ({
            name: c.name.trim(),
            bandwidth: Number(c.bandwidth),
            pricePerMeter: Number(c.price),
        })),
        // …а список каналов между узлами в новой схеме пока пустой
        channels: [],
        nodeTypes: nodeTypes.map((t) => ({
            name: t.name.trim(),
            speed: Number(t.speed),
            price: Number(t.price),
        })),
        traffic: {
            unit: trafficUnit,
            matrix: nodes.map((row) =>
                nodes.map((col) => {
                    if (row.id === col.id) return 0;
                    return Number(traffic[pairKey(row.id, col.id)] || 0);
                })
            ),
        },
    };
}

/**
 * Отправляет payload на сервер. Бросает ошибку, если ответ не ok.
 */
export async function sendScheme(payload) {
    const response = await fetch(CREATE_SCHEME_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Сервер ответил с кодом ${response.status}`);
    }

    return payload;
}

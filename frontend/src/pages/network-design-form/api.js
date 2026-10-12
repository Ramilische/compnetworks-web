import { CREATE_SCHEME_URL, pairKey } from './constants.js';

/**
 * Собирает итоговый payload для отправки на сервер
 * (значения приводятся к числам, матрица трафика — симметричная).
 * Идентификаторы типов назначаются автоматически: на них ссылаются
 * узлы (nodes[].typeId) и каналы (channels[].typeId).
 */
export function buildPayload({ schemeName, nodes, channels, nodeTypes, traffic, trafficUnit }) {
    // id типов — последовательные числа 1..N в пределах своего списка
    const nodeTypesWithIds = nodeTypes.map((t, i) => ({
        id: i + 1,
        name: t.name.trim(),
        speed: Number(t.speed),
        price: Number(t.price),
    }));
    const channelTypesWithIds = channels.map((c, i) => ({
        id: i + 1,
        name: c.name.trim(),
        bandwidth: Number(c.bandwidth),
        pricePerMeter: Number(c.price),
    }));

    // В форме нет выбора типа для узла — по умолчанию первый вариант УК
    // (validateForm гарантирует ≥1 тип до сборки payload)
    const defaultTypeId = nodeTypesWithIds.length > 0 ? nodeTypesWithIds[0].id : null;

    return {
        schemeName: schemeName.trim(),
        nodes: nodes.map((n) => ({
            name: n.name.trim(),
            x: Number(n.x),
            y: Number(n.y),
            typeId: defaultTypeId,
        })),
        // Каналы из формы сохраняются как типы каналов…
        channelTypes: channelTypesWithIds,
        // …а ссылки между узлами имеют вид { from, to, typeId }:
        // from/to — индексы узлов, typeId — id типа канала.
        // В новой схеме список пока пустой (заполнение — страницей редактирования)
        channels: [],
        nodeTypes: nodeTypesWithIds,
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

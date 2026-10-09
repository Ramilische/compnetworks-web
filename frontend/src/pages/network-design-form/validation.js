import { SCHEME_NAME_PATTERN, pairKey } from './constants.js';

/**
 * Проверка формы перед отправкой.
 * Возвращает объект ошибок вида { [ключ]: сообщение }.
 */
export function validateForm({ schemeName, nodes, cables, nodeTypes, traffic }) {
    const errs = {};

    const name = schemeName.trim();
    if (!name) {
        errs.schemeName = 'Укажите название схемы';
    } else if (!SCHEME_NAME_PATTERN.test(name)) {
        errs.schemeName = 'Не используйте специальные символы';
    }

    if (nodes.length < 2) errs.nodes = 'Нужно минимум 2 узла коммутации';

    nodes.forEach((n, i) => {
        if (!n.name.trim()) errs[`node-${i}-name`] = 'Укажите название';
        if (n.x === '' || Number.isNaN(Number(n.x))) errs[`node-${i}-x`] = 'Число';
        if (n.y === '' || Number.isNaN(Number(n.y))) errs[`node-${i}-y`] = 'Число';
    });

    if (cables.length === 0) errs.cables = 'Добавьте хотя бы один канал';
    cables.forEach((c, i) => {
        if (!c.name.trim()) errs[`cable-${i}-name`] = 'Укажите название';
        if (!(Number(c.bandwidth) > 0)) errs[`cable-${i}-bw`] = 'Должна быть > 0';
        if (c.price === '' || Number.isNaN(Number(c.price)) || Number(c.price) < 0)
            errs[`cable-${i}-price`] = 'Должна быть ≥ 0';
    });

    if (nodeTypes.length === 0) errs.nodeTypes = 'Добавьте хотя бы один вариант УК';
    nodeTypes.forEach((t, i) => {
        if (!t.name.trim()) errs[`ntype-${i}-name`] = 'Укажите название';
        if (!(Number(t.speed) > 0)) errs[`ntype-${i}-speed`] = 'Должна быть > 0';
        if (t.price === '' || Number.isNaN(Number(t.price)) || Number(t.price) < 0)
            errs[`ntype-${i}-price`] = 'Должна быть ≥ 0';
    });

    for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
            const key = pairKey(nodes[i].id, nodes[j].id);
            const v = traffic[key];
            if (v === undefined || v === '' || Number.isNaN(Number(v)) || Number(v) < 0) {
                errs[`traffic-${key}`] = 'Заполните';
            }
        }
    }

    return errs;
}

import { useState } from 'react';
import './styles/NetworkDesignForm.css';

const uid = () => Math.random().toString(36).slice(2, 9);

const nextNodeName = (nodes) => {
    let max = 0;
    nodes.forEach((n) => {
        const m = /^УК(\d+)$/.exec(n.name);
        if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return `УК${max + 1}`;
};

const makeNode = (name) => ({ id: uid(), name, x: '', y: '' });
const makeCable = () => ({ id: uid(), name: '', bandwidth: '', price: '' });
const makeNodeType = () => ({ id: uid(), name: '', speed: '', price: '' });

const pairKey = (a, b) => (a < b ? `${a}:${b}` : `${b}:${a}`);

const MAX_NODES = 10000;
const MAX_CABLES = 20;
const MAX_NODE_TYPES = 20;

// Разрешены только буквы, цифры, пробелы, дефис и подчёркивание
const SCHEME_NAME_PATTERN = /^[\p{L}\p{N}\s_-]+$/u;

const API_URL = 'http://localhost:1234/api/';
const CREATE_SCHEME_URL = API_URL + 'create-scheme';

export default function NetworkDesignForm() {
    const [schemeName, setSchemeName] = useState('');

    const [nodes, setNodes] = useState(() => [
        makeNode('УК1'),
        makeNode('УК2'),
        makeNode('УК3'),
    ]);

    const [cables, setCables] = useState(() => [makeCable()]);

    const [nodeTypes, setNodeTypes] = useState(() => [makeNodeType()]);

    const [trafficUnit, setTrafficUnit] = useState('Мбит/с');
    const [traffic, setTraffic] = useState({});

    const [errors, setErrors] = useState({});
    const [payload, setPayload] = useState(null);
    const [sendError, setSendError] = useState(null);

    const clearError = (key) =>
        setErrors((prev) => {
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });

    /* ---------------- УЗЛЫ ---------------- */

    const addNode = () => {
        setNodes((prev) => {
            if (prev.length >= MAX_NODES) return prev;
            return [...prev, makeNode(nextNodeName(prev))];
        });
        setPayload(null);
    };

    const removeNode = (id) => {
        setNodes((prev) => prev.filter((n) => n.id !== id));
        // Удаляем трафик, связанный с удалённым узлом
        setTraffic((prev) => {
            const next = {};
            for (const [k, v] of Object.entries(prev)) {
                const [a, b] = k.split(':');
                if (a !== id && b !== id) next[k] = v;
            }
            return next;
        });
        setPayload(null);
    };

    const updateNode = (id, field, value) => {
        setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, [field]: value } : n)));
        setPayload(null);
    };

    /* ---------------- КАНАЛЫ ---------------- */

    const addCable = () =>
        setCables((prev) => (prev.length >= MAX_CABLES ? prev : [...prev, makeCable()]));

    const removeCable = (id) => setCables((prev) => prev.filter((c) => c.id !== id));

    const updateCable = (id, field, value) => {
        setCables((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
        setPayload(null);
    };

    /* ---------------- ВАРИАНТЫ УК ---------------- */

    const addNodeType = () =>
        setNodeTypes((prev) => (prev.length >= MAX_NODE_TYPES ? prev : [...prev, makeNodeType()]));

    const removeNodeType = (id) => setNodeTypes((prev) => prev.filter((t) => t.id !== id));

    const updateNodeType = (id, field, value) => {
        setNodeTypes((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
        setPayload(null);
    };

    /* ---------------- ТРАФИК ---------------- */

    const setTrafficValue = (aId, bId, value) => {
        const key = pairKey(aId, bId);
        setTraffic((prev) => ({ ...prev, [key]: value }));
        clearError(`traffic-${key}`);
        setPayload(null);
    };

    /* ---------------- ВАЛИДАЦИЯ ---------------- */

    const validate = () => {
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);

        if (Object.keys(errs).length > 0) {
            setPayload(null);
            return;
        }

        const result = {
            schemeName: schemeName.trim(),
            nodes: nodes.map((n) => ({
                name: n.name.trim(),
                x: Number(n.x),
                y: Number(n.y),
            })),
            cables: cables.map((c) => ({
                name: c.name.trim(),
                bandwidth: Number(c.bandwidth),
                pricePerMeter: Number(c.price),
            })),
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

        setSendError(null);

        try {
            const response = await fetch(CREATE_SCHEME_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result),
            });

            if (!response.ok) {
                throw new Error(`Сервер ответил с кодом ${response.status}`);
            }

            setPayload(result);
        } catch (err) {
            setPayload(null);
            setSendError(
                `Не удалось отправить данные на сервер (${API_URL}): ${err.message}`
            );
        }
    };

    const handleReset = () => {
        setSchemeName('');
        setNodes([makeNode('УК1'), makeNode('УК2'), makeNode('УК3')]);
        setCables([makeCable()]);
        setNodeTypes([makeNodeType()]);
        setTraffic({});
        setTrafficUnit('Мбит/с');
        setErrors({});
        setPayload(null);
        setSendError(null);
    };

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <form className="ndf" onSubmit={handleSubmit} noValidate>
            <header className="ndf__header">
                <h1>Проектирование компьютерной сети</h1>
                <p className="subtitle">
                    Задайте узлы коммутации, каналы и ожидаемую интенсивность трафика
                </p>
            </header>

            {/* ---------- 0. НАЗВАНИЕ СХЕМЫ ---------- */}
            <section className="card">
                <div className="card__head">
                    <h2>Название схемы</h2>
                </div>

                <label className="field">
                    <input
                        type="text"
                        placeholder="Например: Схема сети 2 этажа"
                        value={schemeName}
                        className={errors.schemeName ? 'error' : ''}
                        onChange={(e) => {
                            setSchemeName(e.target.value);
                            setPayload(null);
                            clearError('schemeName');
                        }}
                    />
                </label>
                {errors.schemeName && <div className="err">{errors.schemeName}</div>}
                <p className="hint">
                    Допустимы буквы, цифры, пробелы, дефис и подчёркивание —
                    без специальных символов.
                </p>
            </section>

            {/* ---------- 1. УЗЛЫ ---------- */}
            <section className="card">
                <div className="card__head">
                    <h2>
                        <span className="num">1</span> Узлы коммутации (УК)
                    </h2>
                    <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={addNode}
                        disabled={nodes.length >= MAX_NODES}
                    >
                        + Добавить узел
                    </button>
                </div>

                {errors.nodes && <div className="err err--block">{errors.nodes}</div>}

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th className="col-idx">№</th>
                                <th>Название</th>
                                <th className="col-sm">Координата X</th>
                                <th className="col-sm">Координата Y</th>
                                <th className="col-act" />
                            </tr>
                        </thead>
                        <tbody>
                            {nodes.map((n, i) => (
                                <tr key={n.id}>
                                    <td className="idx">{i + 1}</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={n.name}
                                            className={errors[`node-${i}-name`] ? 'error' : ''}
                                            onChange={(e) => {
                                                updateNode(n.id, 'name', e.target.value);
                                                clearError(`node-${i}-name`);
                                            }}
                                        />
                                        {errors[`node-${i}-name`] && (
                                            <div className="err">{errors[`node-${i}-name`]}</div>
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="0"
                                            value={n.x}
                                            className={errors[`node-${i}-x`] ? 'error' : ''}
                                            onChange={(e) => {
                                                updateNode(n.id, 'x', e.target.value);
                                                clearError(`node-${i}-x`);
                                            }}
                                        />
                                        {errors[`node-${i}-x`] && (
                                            <div className="err">{errors[`node-${i}-x`]}</div>
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="0"
                                            value={n.y}
                                            className={errors[`node-${i}-y`] ? 'error' : ''}
                                            onChange={(e) => {
                                                updateNode(n.id, 'y', e.target.value);
                                                clearError(`node-${i}-y`);
                                            }}
                                        />
                                        {errors[`node-${i}-y`] && (
                                            <div className="err">{errors[`node-${i}-y`]}</div>
                                        )}
                                    </td>
                                    <td className="col-act">
                                        <button
                                            type="button"
                                            className="btn btn--icon"
                                            title="Удалить узел"
                                            onClick={() => removeNode(n.id)}
                                            disabled={nodes.length <= 1}
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="hint">
                    Максимум {MAX_NODES} узлов. Названия можно изменить вручную.
                </p>
            </section>

            {/* ---------- 2. КАНАЛЫ ---------- */}
            <section className="card">
                <div className="card__head">
                    <h2>
                        <span className="num">2</span> Каналы
                    </h2>
                    <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={addCable}
                        disabled={cables.length >= MAX_CABLES}
                    >
                        + Добавить канал
                    </button>
                </div>

                {errors.cables && <div className="err err--block">{errors.cables}</div>}

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th className="col-idx">№</th>
                                <th>Название</th>
                                <th className="col-sm">Пропускная способность, Мбит/с</th>
                                <th className="col-sm">Цена за метр, ₽</th>
                                <th className="col-act" />
                            </tr>
                        </thead>
                        <tbody>
                            {cables.map((c, i) => (
                                <tr key={c.id}>
                                    <td className="idx">{i + 1}</td>
                                    <td>
                                        <input
                                            type="text"
                                            placeholder="Наименование канала"
                                            value={c.name}
                                            className={errors[`cable-${i}-name`] ? 'error' : ''}
                                            onChange={(e) => {
                                                updateCable(c.id, 'name', e.target.value);
                                                clearError(`cable-${i}-name`);
                                            }}
                                        />
                                        {errors[`cable-${i}-name`] && (
                                            <div className="err">{errors[`cable-${i}-name`]}</div>
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            placeholder="1000"
                                            value={c.bandwidth}
                                            className={errors[`cable-${i}-bw`] ? 'error' : ''}
                                            onChange={(e) => {
                                                updateCable(c.id, 'bandwidth', e.target.value);
                                                clearError(`cable-${i}-bw`);
                                            }}
                                        />
                                        {errors[`cable-${i}-bw`] && (
                                            <div className="err">{errors[`cable-${i}-bw`]}</div>
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            placeholder="120"
                                            value={c.price}
                                            className={errors[`cable-${i}-price`] ? 'error' : ''}
                                            onChange={(e) => {
                                                updateCable(c.id, 'price', e.target.value);
                                                clearError(`cable-${i}-price`);
                                            }}
                                        />
                                        {errors[`cable-${i}-price`] && (
                                            <div className="err">{errors[`cable-${i}-price`]}</div>
                                        )}
                                    </td>
                                    <td className="col-act">
                                        <button
                                            type="button"
                                            className="btn btn--icon"
                                            title="Удалить канал"
                                            onClick={() => removeCable(c.id)}
                                            disabled={cables.length <= 1}
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ---------- 3. ВАРИАНТЫ УК ---------- */}
            <section className="card">
                <div className="card__head">
                    <h2>
                        <span className="num">3</span> Виды УК
                    </h2>
                    <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={addNodeType}
                        disabled={nodeTypes.length >= MAX_NODE_TYPES}
                    >
                        + Добавить вид
                    </button>
                </div>

                {errors.nodeTypes && <div className="err err--block">{errors.nodeTypes}</div>}

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th className="col-idx">№</th>
                                <th>Название</th>
                                <th className="col-sm">Пропускная способность, Мбит/с</th>
                                <th className="col-sm">Цена, ₽</th>
                                <th className="col-act" />
                            </tr>
                        </thead>
                        <tbody>
                            {nodeTypes.map((t, i) => (
                                <tr key={t.id}>
                                    <td className="idx">{i + 1}</td>
                                    <td>
                                        <input
                                            type="text"
                                            placeholder="Наименование вида УК"
                                            value={t.name}
                                            className={errors[`ntype-${i}-name`] ? 'error' : ''}
                                            onChange={(e) => {
                                                updateNodeType(t.id, 'name', e.target.value);
                                                clearError(`ntype-${i}-name`);
                                            }}
                                        />
                                        {errors[`ntype-${i}-name`] && (
                                            <div className="err">{errors[`ntype-${i}-name`]}</div>
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            placeholder="1000"
                                            value={t.speed}
                                            className={errors[`ntype-${i}-speed`] ? 'error' : ''}
                                            onChange={(e) => {
                                                updateNodeType(t.id, 'speed', e.target.value);
                                                clearError(`ntype-${i}-speed`);
                                            }}
                                        />
                                        {errors[`ntype-${i}-speed`] && (
                                            <div className="err">{errors[`ntype-${i}-speed`]}</div>
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            placeholder="5000"
                                            value={t.price}
                                            className={errors[`ntype-${i}-price`] ? 'error' : ''}
                                            onChange={(e) => {
                                                updateNodeType(t.id, 'price', e.target.value);
                                                clearError(`ntype-${i}-price`);
                                            }}
                                        />
                                        {errors[`ntype-${i}-price`] && (
                                            <div className="err">{errors[`ntype-${i}-price`]}</div>
                                        )}
                                    </td>
                                    <td className="col-act">
                                        <button
                                            type="button"
                                            className="btn btn--icon"
                                            title="Удалить вариант"
                                            onClick={() => removeNodeType(t.id)}
                                            disabled={nodeTypes.length <= 1}
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ---------- 4. ТРАФИК ---------- */}
            <section className="card">
                <div className="card__head">
                    <h2>
                        <span className="num">4</span> Ожидаемая интенсивность трафика
                    </h2>
                    <label className="field field--inline">
                        <span>Единица измерения</span>
                        <select value={trafficUnit} onChange={(e) => setTrafficUnit(e.target.value)}>
                            <option value="Мбит/с">Мбит/с</option>
                            <option value="Гбит/с">Гбит/с</option>
                        </select>
                    </label>
                </div>

                {nodes.length < 2 ? (
                    <p className="hint">Задайте минимум 2 узла коммутации, чтобы заполнить матрицу.</p>
                ) : (
                    <>
                        <p className="hint">
                            Укажите интенсивность для каждой пары узлов. Матрица симметрична —
                            достаточно заполнить значения выше диагонали.
                        </p>
                        <div className="table-wrap">
                            <table className="matrix">
                                <thead>
                                    <tr>
                                        <th className="corner" />
                                        {nodes.map((n) => (
                                            <th key={n.id} className="matrix__head">
                                                {n.name || '—'}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {nodes.map((row, i) => (
                                        <tr key={row.id}>
                                            <th className="matrix__head">{row.name || '—'}</th>
                                            {nodes.map((col, j) => {
                                                if (i === j) {
                                                    return (
                                                        <td key={col.id} className="matrix__diag">
                                                            —
                                                        </td>
                                                    );
                                                }
                                                const key = pairKey(row.id, col.id);
                                                if (j < i) {
                                                    const v = traffic[key];
                                                    return (
                                                        <td key={col.id} className="matrix__mirror">
                                                            {v === undefined || v === '' ? '—' : v}
                                                        </td>
                                                    );
                                                }
                                                return (
                                                    <td key={col.id} className="matrix__cell">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="any"
                                                            placeholder="0"
                                                            value={traffic[key] ?? ''}
                                                            className={errors[`traffic-${key}`] ? 'error' : ''}
                                                            onChange={(e) => setTrafficValue(row.id, col.id, e.target.value)}
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>

            {/* ---------- ДЕЙСТВИЯ ---------- */}
            <div className="actions">
                <button type="submit" className="btn btn--primary">
                    Сформировать файл с исходными данными
                </button>
                <button type="button" className="btn btn--ghost" onClick={handleReset}>
                    Сбросить
                </button>
            </div>

            {hasErrors && (
                <div className="alert alert--error">
                    Проверьте форму: есть незаполненные или некорректные поля.
                </div>
            )}

            {sendError && (
                <div className="alert alert--error">{sendError}</div>
            )}

            {payload && (
                <section className="card card--result">
                    <h2>Результат</h2>
                    <div className="summary">
                        <div>
                            <span className="summary__value">{payload.nodes.length}</span>
                            <span className="summary__label">узлов</span>
                        </div>
                        <div>
                            <span className="summary__value">{payload.cables.length}</span>
                            <span className="summary__label">каналов</span>
                        </div>
                        <div>
                            <span className="summary__value">{payload.nodeTypes.length}</span>
                            <span className="summary__label">вариантов УК</span>
                        </div>
                        <div>
                            <span className="summary__value">{payload.traffic.unit}</span>
                            <span className="summary__label">единица трафика</span>
                        </div>
                    </div>
                    <pre className="json">{JSON.stringify(payload, null, 2)}</pre>
                </section>
            )}
        </form>
    );
}
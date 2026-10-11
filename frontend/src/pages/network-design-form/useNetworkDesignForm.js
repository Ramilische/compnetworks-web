import { useState } from 'react';
import { buildPayload, sendScheme } from './api.js';
import {
    API_URL,
    MAX_CHANNELS,
    MAX_NODES,
    MAX_NODE_TYPES,
    initialNodes,
    makeChannel,
    makeNode,
    makeNodeType,
    nextNodeName,
    pairKey,
} from './constants.js';
import { validateForm } from './validation.js';

/**
 * Состояние и обработчики формы «Проектирование компьютерной сети».
 * Возвращает значения формы, колбэки для секций и обработчики отправки/сброса.
 */
export default function useNetworkDesignForm() {
    const [schemeName, setSchemeName] = useState('');

    const [nodes, setNodes] = useState(initialNodes);

    const [channels, setChannels] = useState(() => [makeChannel()]);

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

    /* ---------------- НАЗВАНИЕ СХЕМЫ ---------------- */

    const updateSchemeName = (value) => {
        setSchemeName(value);
        setPayload(null);
        clearError('schemeName');
    };

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

    const addChannel = () =>
        setChannels((prev) => (prev.length >= MAX_CHANNELS ? prev : [...prev, makeChannel()]));

    const removeChannel = (id) => setChannels((prev) => prev.filter((c) => c.id !== id));

    const updateChannel = (id, field, value) => {
        setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
        setPayload(null);
    };

    /* ---------------- ВАРИАНТЫ УК ---------------- */

    const addNodeType = () =>
        setNodeTypes((prev) =>
            prev.length >= MAX_NODE_TYPES ? prev : [...prev, makeNodeType()]
        );

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

    /* ---------------- ОТПРАВКА / СБРОС ---------------- */

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validateForm({ schemeName, nodes, channels, nodeTypes, traffic });
        setErrors(errs);

        if (Object.keys(errs).length > 0) {
            setPayload(null);
            return;
        }

        const result = buildPayload({
            schemeName,
            nodes,
            channels,
            nodeTypes,
            traffic,
            trafficUnit,
        });

        setSendError(null);

        try {
            await sendScheme(result);
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
        setNodes(initialNodes());
        setChannels([makeChannel()]);
        setNodeTypes([makeNodeType()]);
        setTraffic({});
        setTrafficUnit('Мбит/с');
        setErrors({});
        setPayload(null);
        setSendError(null);
    };

    const hasErrors = Object.keys(errors).length > 0;

    return {
        schemeName,
        updateSchemeName,
        nodes,
        addNode,
        removeNode,
        updateNode,
        channels,
        addChannel,
        removeChannel,
        updateChannel,
        nodeTypes,
        addNodeType,
        removeNodeType,
        updateNodeType,
        traffic,
        setTrafficValue,
        trafficUnit,
        setTrafficUnit,
        errors,
        clearError,
        payload,
        sendError,
        hasErrors,
        handleSubmit,
        handleReset,
    };
}

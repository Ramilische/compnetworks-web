import { Actions, Button, PageHeader } from '../components/ui';
import CablesCard from './network-design-form/CablesCard.jsx';
import FormResult from './network-design-form/FormResult.jsx';
import NodeTypesCard from './network-design-form/NodeTypesCard.jsx';
import NodesCard from './network-design-form/NodesCard.jsx';
import SchemeNameCard from './network-design-form/SchemeNameCard.jsx';
import TrafficCard from './network-design-form/TrafficCard.jsx';
import useNetworkDesignForm from './network-design-form/useNetworkDesignForm.js';
import './styles/NetworkDesignForm.css';

/**
 * Страница «Проектирование компьютерной сети».
 * Состояние и логика — в хуке useNetworkDesignForm,
 * секции формы — в ./network-design-form/.
 */
export default function NetworkDesignForm() {
    const {
        schemeName,
        updateSchemeName,
        nodes,
        addNode,
        removeNode,
        updateNode,
        cables,
        addCable,
        removeCable,
        updateCable,
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
    } = useNetworkDesignForm();

    return (
        <form className="ndf" onSubmit={handleSubmit} noValidate>
            <PageHeader
                title="Проектирование компьютерной сети"
                subtitle="Задайте узлы коммутации, каналы и ожидаемую интенсивность трафика"
            />

            {/* ---------- 0. НАЗВАНИЕ СХЕМЫ ---------- */}
            <SchemeNameCard
                value={schemeName}
                error={errors.schemeName}
                onChange={updateSchemeName}
            />

            {/* ---------- 1. УЗЛЫ ---------- */}
            <NodesCard
                nodes={nodes}
                errors={errors}
                clearError={clearError}
                onAdd={addNode}
                onRemove={removeNode}
                onUpdate={updateNode}
            />

            {/* ---------- 2. КАНАЛЫ ---------- */}
            <CablesCard
                cables={cables}
                errors={errors}
                clearError={clearError}
                onAdd={addCable}
                onRemove={removeCable}
                onUpdate={updateCable}
            />

            {/* ---------- 3. ВАРИАНТЫ УК ---------- */}
            <NodeTypesCard
                nodeTypes={nodeTypes}
                errors={errors}
                clearError={clearError}
                onAdd={addNodeType}
                onRemove={removeNodeType}
                onUpdate={updateNodeType}
            />

            {/* ---------- 4. ТРАФИК ---------- */}
            <TrafficCard
                nodes={nodes}
                traffic={traffic}
                trafficUnit={trafficUnit}
                errors={errors}
                onUnitChange={setTrafficUnit}
                onCellChange={setTrafficValue}
            />

            {/* ---------- ДЕЙСТВИЯ ---------- */}
            <Actions>
                <Button type="submit">
                    Сформировать файл с исходными данными
                </Button>
                <Button variant="ghost" onClick={handleReset}>
                    Сбросить
                </Button>
            </Actions>

            {/* ---------- РЕЗУЛЬТАТ / ОШИБКИ ---------- */}
            <FormResult hasErrors={hasErrors} sendError={sendError} payload={payload} />
        </form>
    );
}

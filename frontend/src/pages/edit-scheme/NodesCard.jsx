import { Card, DataTable, Hint } from '../../components/ui';
import { nodeTypeName } from './constants.js';

/**
 * Карточка с таблицей узлов: имя, координаты и тип (по nodes[].typeId).
 */
export default function NodesCard({ nodes = [], nodeTypes = [] }) {
    const columns = [
        { key: 'name', title: 'Имя' },
        { key: 'x', title: 'X' },
        { key: 'y', title: 'Y' },
        { key: 'type', title: 'Тип УК' },
    ];

    const rows = nodes.map((node) => ({
        name: node.name,
        x: node.x,
        y: node.y,
        type: nodeTypeName(nodeTypes, node.typeId),
    }));

    return (
        <Card title="Узлы">
            {nodes.length === 0 ? (
                <Hint>В схеме нет узлов.</Hint>
            ) : (
                <DataTable columns={columns} rows={rows} rowKey={(row, i) => i} />
            )}
        </Card>
    );
}

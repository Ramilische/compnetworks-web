import {
    Button,
    Card,
    DataTable,
    ErrorText,
    Hint,
    TextInput,
} from '../../components/ui';
import { MAX_NODES } from './constants.js';

/**
 * Шаг 1: узлы коммутации (УК).
 * onAdd() / onRemove(id) / onUpdate(id, field, value) / clearError(key).
 */
export default function NodesCard({ nodes, errors, clearError, onAdd, onRemove, onUpdate }) {
    return (
        <Card
            step={1}
            title="Узлы коммутации (УК)"
            action={
                <Button
                    variant="ghost"
                    onClick={onAdd}
                    disabled={nodes.length >= MAX_NODES}
                >
                    + Добавить узел
                </Button>
            }
        >
            <ErrorText block>{errors.nodes}</ErrorText>

            <DataTable
                rows={nodes}
                rowKey={(n) => n.id}
                remove={{
                    title: 'Удалить узел',
                    onClick: (n) => onRemove(n.id),
                    disabled: nodes.length <= 1,
                }}
                columns={[
                    {
                        key: 'name',
                        title: 'Название',
                        render: (n, i) => (
                            <TextInput
                                value={n.name}
                                error={errors[`node-${i}-name`]}
                                onChange={(e) => {
                                    onUpdate(n.id, 'name', e.target.value);
                                    clearError(`node-${i}-name`);
                                }}
                            />
                        ),
                    },
                    {
                        key: 'x',
                        title: 'Координата X',
                        className: 'col-sm',
                        render: (n, i) => (
                            <TextInput
                                type="number"
                                step="any"
                                placeholder="0"
                                value={n.x}
                                error={errors[`node-${i}-x`]}
                                onChange={(e) => {
                                    onUpdate(n.id, 'x', e.target.value);
                                    clearError(`node-${i}-x`);
                                }}
                            />
                        ),
                    },
                    {
                        key: 'y',
                        title: 'Координата Y',
                        className: 'col-sm',
                        render: (n, i) => (
                            <TextInput
                                type="number"
                                step="any"
                                placeholder="0"
                                value={n.y}
                                error={errors[`node-${i}-y`]}
                                onChange={(e) => {
                                    onUpdate(n.id, 'y', e.target.value);
                                    clearError(`node-${i}-y`);
                                }}
                            />
                        ),
                    },
                ]}
            />
            <Hint>
                Максимум {MAX_NODES} узлов. Названия можно изменить вручную.
            </Hint>
        </Card>
    );
}

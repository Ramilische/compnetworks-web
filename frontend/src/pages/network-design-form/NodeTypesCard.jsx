import {
    Button,
    Card,
    DataTable,
    ErrorText,
    TextInput,
} from '../../components/ui';
import { MAX_NODE_TYPES } from './constants.js';

/**
 * Шаг 3: варианты (виды) УК.
 * onAdd() / onRemove(id) / onUpdate(id, field, value) / clearError(key).
 */
export default function NodeTypesCard({
    nodeTypes,
    errors,
    clearError,
    onAdd,
    onRemove,
    onUpdate,
}) {
    return (
        <Card
            step={3}
            title="Виды УК"
            action={
                <Button
                    variant="ghost"
                    onClick={onAdd}
                    disabled={nodeTypes.length >= MAX_NODE_TYPES}
                >
                    + Добавить вид
                </Button>
            }
        >
            <ErrorText block>{errors.nodeTypes}</ErrorText>

            <DataTable
                rows={nodeTypes}
                rowKey={(t) => t.id}
                remove={{
                    title: 'Удалить вариант',
                    onClick: (t) => onRemove(t.id),
                    disabled: nodeTypes.length <= 1,
                }}
                columns={[
                    {
                        key: 'name',
                        title: 'Название',
                        render: (t, i) => (
                            <TextInput
                                placeholder="Наименование вида УК"
                                value={t.name}
                                error={errors[`ntype-${i}-name`]}
                                onChange={(e) => {
                                    onUpdate(t.id, 'name', e.target.value);
                                    clearError(`ntype-${i}-name`);
                                }}
                            />
                        ),
                    },
                    {
                        key: 'speed',
                        title: 'Пропускная способность, Мбит/с',
                        className: 'col-sm',
                        render: (t, i) => (
                            <TextInput
                                type="number"
                                min="0"
                                step="any"
                                placeholder="1000"
                                value={t.speed}
                                error={errors[`ntype-${i}-speed`]}
                                onChange={(e) => {
                                    onUpdate(t.id, 'speed', e.target.value);
                                    clearError(`ntype-${i}-speed`);
                                }}
                            />
                        ),
                    },
                    {
                        key: 'price',
                        title: 'Цена, ₽',
                        className: 'col-sm',
                        render: (t, i) => (
                            <TextInput
                                type="number"
                                min="0"
                                step="any"
                                placeholder="5000"
                                value={t.price}
                                error={errors[`ntype-${i}-price`]}
                                onChange={(e) => {
                                    onUpdate(t.id, 'price', e.target.value);
                                    clearError(`ntype-${i}-price`);
                                }}
                            />
                        ),
                    },
                ]}
            />
        </Card>
    );
}

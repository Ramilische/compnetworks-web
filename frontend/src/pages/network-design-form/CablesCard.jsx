import {
    Button,
    Card,
    DataTable,
    ErrorText,
    TextInput,
} from '../../components/ui';
import { MAX_CABLES } from './constants.js';

/**
 * Шаг 2: каналы связи.
 * onAdd() / onRemove(id) / onUpdate(id, field, value) / clearError(key).
 */
export default function CablesCard({ cables, errors, clearError, onAdd, onRemove, onUpdate }) {
    return (
        <Card
            step={2}
            title="Каналы"
            action={
                <Button
                    variant="ghost"
                    onClick={onAdd}
                    disabled={cables.length >= MAX_CABLES}
                >
                    + Добавить канал
                </Button>
            }
        >
            <ErrorText block>{errors.cables}</ErrorText>

            <DataTable
                rows={cables}
                rowKey={(c) => c.id}
                remove={{
                    title: 'Удалить канал',
                    onClick: (c) => onRemove(c.id),
                    disabled: cables.length <= 1,
                }}
                columns={[
                    {
                        key: 'name',
                        title: 'Название',
                        render: (c, i) => (
                            <TextInput
                                placeholder="Наименование канала"
                                value={c.name}
                                error={errors[`cable-${i}-name`]}
                                onChange={(e) => {
                                    onUpdate(c.id, 'name', e.target.value);
                                    clearError(`cable-${i}-name`);
                                }}
                            />
                        ),
                    },
                    {
                        key: 'bandwidth',
                        title: 'Пропускная способность, Мбит/с',
                        className: 'col-sm',
                        render: (c, i) => (
                            <TextInput
                                type="number"
                                min="0"
                                step="any"
                                placeholder="1000"
                                value={c.bandwidth}
                                error={errors[`cable-${i}-bw`]}
                                onChange={(e) => {
                                    onUpdate(c.id, 'bandwidth', e.target.value);
                                    clearError(`cable-${i}-bw`);
                                }}
                            />
                        ),
                    },
                    {
                        key: 'price',
                        title: 'Цена за метр, ₽',
                        className: 'col-sm',
                        render: (c, i) => (
                            <TextInput
                                type="number"
                                min="0"
                                step="any"
                                placeholder="120"
                                value={c.price}
                                error={errors[`cable-${i}-price`]}
                                onChange={(e) => {
                                    onUpdate(c.id, 'price', e.target.value);
                                    clearError(`cable-${i}-price`);
                                }}
                            />
                        ),
                    },
                ]}
            />
        </Card>
    );
}

import {
    Button,
    Card,
    DataTable,
    ErrorText,
    TextInput,
} from '../../components/ui/index.js';
import { MAX_CHANNELS } from './constants.js';

/**
 * Шаг 2: каналы связи.
 * onAdd() / onRemove(id) / onUpdate(id, field, value) / clearError(key).
 */
export default function ChannelsCard({ channels, errors, clearError, onAdd, onRemove, onUpdate }) {
    return (
        <Card
            step={2}
            title="Каналы"
            action={
                <Button
                    variant="ghost"
                    onClick={onAdd}
                    disabled={channels.length >= MAX_CHANNELS}
                >
                    + Добавить канал
                </Button>
            }
        >
            <ErrorText block>{errors.channels}</ErrorText>

            <DataTable
                rows={channels}
                rowKey={(c) => c.id}
                remove={{
                    title: 'Удалить канал',
                    onClick: (c) => onRemove(c.id),
                    disabled: channels.length <= 1,
                }}
                columns={[
                    {
                        key: 'name',
                        title: 'Название',
                        render: (c, i) => (
                            <TextInput
                                placeholder="Наименование канала"
                                value={c.name}
                                error={errors[`channel-${i}-name`]}
                                onChange={(e) => {
                                    onUpdate(c.id, 'name', e.target.value);
                                    clearError(`channel-${i}-name`);
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
                                error={errors[`channel-${i}-price`]}
                                onChange={(e) => {
                                    onUpdate(c.id, 'price', e.target.value);
                                    clearError(`channel-${i}-price`);
                                }}
                            />
                        ),
                    },
                ]}
            />
        </Card>
    );
}

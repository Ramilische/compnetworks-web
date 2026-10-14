import { Card, DataTable, Hint } from '../../components/ui';
import { channelTypeName, validChannels } from './constants.js';

/**
 * Карточка с таблицей каналов: концы (узлы) и тип канала
 * (по channels[].typeId). Показываются только каналы
 * с корректными индексами узлов.
 */
export default function ChannelsCard({ channels = [], nodes = [], channelTypes = [] }) {
    const visibleChannels = validChannels(channels, nodes);

    const columns = [
        { key: 'ends', title: 'Узлы' },
        { key: 'type', title: 'Тип канала' },
    ];

    const rows = visibleChannels.map((channel) => ({
        ends: `${nodes[channel.from].name} → ${nodes[channel.to].name}`,
        type: channelTypeName(channelTypes, channel.typeId),
    }));

    return (
        <Card title="Каналы">
            {visibleChannels.length === 0 ? (
                <Hint>Каналов пока нет.</Hint>
            ) : (
                <DataTable columns={columns} rows={rows} rowKey={(row, i) => i} />
            )}
        </Card>
    );
}

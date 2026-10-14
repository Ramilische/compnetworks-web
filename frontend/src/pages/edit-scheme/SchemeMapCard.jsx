import { Card, Hint } from '../../components/ui';
import {
    channelTypeName,
    computeMapLayout,
    nodeTypeName,
    validChannels,
} from './constants.js';

/**
 * Карточка с картой сети: узлы — окружности с подписями по координатам
 * x/y, каналы — линии между центрами узлов. Наведение на элемент
 * показывает всплывающую подсказку (тип узла / концы и тип канала).
 */
export default function SchemeMapCard({ scheme = {} }) {
    const { nodes = [], channels = [], nodeTypes = [], channelTypes = [] } = scheme;

    if (nodes.length === 0) {
        return (
            <Card title="Карта сети">
                <Hint>В схеме нет узлов.</Hint>
            </Card>
        );
    }

    const layout = computeMapLayout(nodes);
    const visibleChannels = validChannels(channels, nodes);

    return (
        <Card
            title="Карта сети"
            action={<span className="es-map__caption">Координаты узлов — поля x / y</span>}
        >
            <div className="es-map">
                <svg
                    className="es-map__svg"
                    viewBox={`${layout.x} ${layout.y} ${layout.size} ${layout.size}`}
                    preserveAspectRatio="xMidYMid meet"
                    role="img"
                    aria-label={`Карта схемы: узлов — ${nodes.length}`}
                >
                    {/* Каналы — линии между центрами узлов */}
                    {visibleChannels.map((channel, i) => (
                        <line
                            key={`channel-${i}`}
                            className="es-map__link"
                            x1={layout.points[channel.from].cx}
                            y1={layout.points[channel.from].cy}
                            x2={layout.points[channel.to].cx}
                            y2={layout.points[channel.to].cy}
                        >
                            <title>{`Канал «${channelTypeName(channelTypes, channel.typeId)}»: ${nodes[channel.from].name} — ${nodes[channel.to].name}`}</title>
                        </line>
                    ))}

                    {/* Узлы — окружность + подпись снизу */}
                    {nodes.map((node, i) => {
                        const point = layout.points[i];
                        return (
                            <g key={`node-${i}`} className="es-map__node">
                                <circle
                                    className="es-map__node-circle"
                                    cx={point.cx}
                                    cy={point.cy}
                                    r={layout.radius}
                                >
                                    <title>{`${node.name} — тип: ${nodeTypeName(nodeTypes, node.typeId)}`}</title>
                                </circle>
                                <text
                                    className="es-map__label"
                                    x={point.cx}
                                    y={point.cy + layout.radius + layout.labelSize * 0.95}
                                    fontSize={layout.labelSize}
                                    textAnchor="middle"
                                >
                                    {node.name}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </Card>
    );
}

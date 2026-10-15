import { Card, Hint } from '../../components/ui';
import {
    channelTypeName,
    computeMapLayout,
    menuAnchorStyle,
    nodeTypeName,
    validChannels,
} from './constants.js';
import NodeContextMenu from './NodeContextMenu.jsx';

/**
 * Карточка с картой сети: узлы — окружности с подписями по координатам
 * x/y, каналы — линии между центрами узлов. Клик по узлу (ЛКМ) выделяет
 * его и открывает контекстное меню действий; клик по фону или Escape
 * закрывают меню (обработчик Escape — в хуке страницы).
 */
export default function SchemeMapCard({
    scheme = {},
    selectedIndex = null,
    menuAction = null,
    draft = null,
    draftError = null,
    onSelectNode,
    onCloseMenu,
    onAction,
    onDraftChange,
    onApply,
    onBack,
    onDelete,
}) {
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
    const selectedNode = selectedIndex !== null ? nodes[selectedIndex] : null;

    return (
        <Card
            title="Карта сети"
            action={
                <span className="es-map__caption">Кликните по узлу, чтобы открыть меню действий</span>
            }
        >
            <div className="es-map">
                {/* Рамка задаёт геометрию карты; меню позиционируется в ней же */}
                <div className="es-map__frame">
                    <svg
                        className="es-map__svg"
                        viewBox={`${layout.x} ${layout.y} ${layout.size} ${layout.size}`}
                        preserveAspectRatio="xMidYMid meet"
                        role="img"
                        aria-label={`Карта схемы: узлов — ${nodes.length}`}
                        onClick={onCloseMenu}
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

                        {/* Узлы — окружность + подпись снизу; клик открывает меню */}
                        {nodes.map((node, i) => {
                            const point = layout.points[i];
                            return (
                                <g
                                    key={`node-${i}`}
                                    className={`es-map__node${i === selectedIndex ? ' es-map__node--selected' : ''}`}
                                    onClick={(event) => {
                                        // Клик по узлу не должен всплывать к фону (иначе меню сразу закроется)
                                        event.stopPropagation();
                                        onSelectNode(i);
                                    }}
                                >
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

                    {/* Контекстное меню выделенного узла */}
                    {selectedNode && (
                        <NodeContextMenu
                            node={selectedNode}
                            nodeTypes={nodeTypes}
                            action={menuAction}
                            draft={draft}
                            draftError={draftError}
                            style={menuAnchorStyle(layout, layout.points[selectedIndex])}
                            onAction={onAction}
                            onDraftChange={onDraftChange}
                            onApply={onApply}
                            onBack={onBack}
                            onClose={onCloseMenu}
                            onDelete={onDelete}
                        />
                    )}
                </div>
            </div>
        </Card>
    );
}
import { useRef, useCallback } from 'react';
import { Card, Hint } from '../../components/ui';
import {
    channelTypeName,
    computeMapLayout,
    menuAnchorStyle,
    nodeTypeName,
    validChannels,
} from './constants.js';
import NodeContextMenu from './NodeContextMenu.jsx';
import ChannelContextMenu from './ChannelContextMenu.jsx';

/**
 * Карточка с картой сети: узлы — окружности с подписями по координатам
 * x/y, каналы — линии между центрами узлов. Клик по узлу (ЛКМ) выделяет
 * его и открывает контекстное меню действий; клик по фону или Escape
 * закрывают меню (обработчик Escape — в хуке страницы).
 */
export default function SchemeMapCard({
    scheme = {},
    selectedIndex = null,
    channelStartIndex = null,
    activeTool = 'select',
    menuAction = null,
    draft = null,
    draftError = null,
    selectedChannelIndex = null,
    channelMenuAction = null,
    channelDraft = null,
    channelDraftError = null,
    onSelectNode,
    onCloseMenu,
    onCreateNode,
    onSelectChannel,
    onChannelAction,
    onChannelDraftChange,
    onChannelApply,
    onChannelBack,
    onChannelDelete,
    onAction,
    onDraftChange,
    onApply,
    onBack,
    onDelete,
}) {
    const { nodes = [], channels = [], nodeTypes = [], channelTypes = [] } = scheme;

    const isMakeChannel = activeTool === 'make-channel';
    const isCreateNode = activeTool === 'create-node';

    const svgRef = useRef(null);

    const handleSvgClick = useCallback(
        (event) => {
            // Клик по фону SVG (не по узлу — узлы останавливают проброс)
            if (isCreateNode && onCreateNode && svgRef.current) {
                const pt = svgRef.current.createSVGPoint();
                pt.x = event.clientX;
                pt.y = event.clientY;
                const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
                onCreateNode(Math.round(svgP.x * 100) / 100, Math.round(svgP.y * 100) / 100);
                return;
            }
            onCloseMenu();
        },
        [isCreateNode, onCreateNode, onCloseMenu]
    );

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
    const channelStartNode = channelStartIndex !== null ? nodes[channelStartIndex] : null;

    return (
        <Card
            title="Карта сети"
            action={
                <span className="es-map__caption">
                    {isCreateNode
                        ? 'Кликните на карте, чтобы создать новый узел'
                        : isMakeChannel
                        ? channelStartNode
                            ? `Узел «${channelStartNode.name}» выбран как начало канала. Укажите второй узел.`
                            : 'Выберите первый узел канала.'
                        : 'Кликните по узлу, чтобы открыть меню действий'}
                </span>
            }
        >
            <div className="es-map">
                <div className="es-map__frame">
                    <svg
                        ref={svgRef}
                        className={`es-map__svg${isCreateNode ? ' es-map__svg--create-node' : ''}`}
                        viewBox={`${layout.x} ${layout.y} ${layout.size} ${layout.size}`}
                        preserveAspectRatio="xMidYMid meet"
                        role="img"
                        aria-label={`Карта схемы: узлов — ${nodes.length}`}
                        onClick={handleSvgClick}
                    >
                        {/* Каналы — линии между центрами узлов */}
                        {visibleChannels.map((channel, i) => {
                            const actualIndex = channels.indexOf(channel);
                            return (
                                <g key={`channel-${i}`}>
                                    <line
                                        className={`es-map__link${actualIndex === selectedChannelIndex ? ' es-map__link--selected' : ''}`}
                                        x1={layout.points[channel.from].cx}
                                        y1={layout.points[channel.from].cy}
                                        x2={layout.points[channel.to].cx}
                                        y2={layout.points[channel.to].cy}
                                    />
                                    {/* Невидимая широкая область клика для канала */}
                                    <line
                                        className="es-map__link-hitarea"
                                        x1={layout.points[channel.from].cx}
                                        y1={layout.points[channel.from].cy}
                                        x2={layout.points[channel.to].cx}
                                        y2={layout.points[channel.to].cy}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            if (activeTool === 'select' && onSelectChannel) {
                                                onSelectChannel(actualIndex);
                                            }
                                        }}
                                        style={{ cursor: activeTool === 'select' ? 'pointer' : 'default' }}
                                    >
                                        <title>{`Канал «${channelTypeName(channelTypes, channel.typeId)}»: ${nodes[channel.from].name} — ${nodes[channel.to].name}`}</title>
                                    </line>
                                </g>
                            );
                        })}

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
                                        className={`es-map__node-circle${i === channelStartIndex ? ' es-map__node--channel-start' : ''}`}
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

                    {/* Контекстное меню выделенного узла (только в режиме «Выделить») */}
                    {selectedNode && activeTool === 'select' && (
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
                            onDelete={onDelete}
                        />
                    )}

                    {/* Контекстное меню выделенного канала (только в режиме «Выделить») */}
                    {selectedChannelIndex !== null &&
                        activeTool === 'select' &&
                        scheme.channels[selectedChannelIndex] && (
                            <ChannelContextMenu
                                channel={scheme.channels[selectedChannelIndex]}
                                nodes={nodes}
                                channelTypes={channelTypes}
                                action={channelMenuAction}
                                draft={channelDraft}
                                draftError={channelDraftError}
                                style={menuAnchorStyle(layout, {
                                    cx:
                                        (layout.points[scheme.channels[selectedChannelIndex].from].cx +
                                            layout.points[scheme.channels[selectedChannelIndex].to].cx) /
                                        2,
                                    cy:
                                        (layout.points[scheme.channels[selectedChannelIndex].from].cy +
                                            layout.points[scheme.channels[selectedChannelIndex].to].cy) /
                                        2,
                                })}
                                onAction={onChannelAction}
                                onDraftChange={onChannelDraftChange}
                                onApply={onChannelApply}
                                onBack={onChannelBack}
                                onDelete={onChannelDelete}
                            />
                        )}
                </div>
            </div>
        </Card>
    );
}
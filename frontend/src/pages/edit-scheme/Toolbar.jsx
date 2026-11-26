import { Button } from '../../components/ui';

/**
 * Панель инструментов страницы редактирования.
 * Переключает активный инструмент:
 * - 'select' — выделение узла/канала (по умолчанию)
 * - 'create-node' — создание узла по клику на карте
 * - 'make-channel' — создание канала между двумя узлами
 * - 'generate-tree' — построение оптимального дерева каналов
 *
 * @param {string} activeTool — id текущего активного инструмента
 * @param {function} onToolChange — обработчик смены инструмента
 * @param {function} onGenerateTree — обработчик построения дерева (одноразовое действие)
 */
export default function Toolbar({ activeTool, onToolChange, onGenerateTree }) {
    const tools = [
        {
            id: 'select',
            label: 'Выделить',
            icon: (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M8,13.75L9.98,11h4.25L8,6.1v7.65ZM13.78,22l-3.63-7.8L6,20V2L20,13H12.9l3.6,7.73L13.78,22ZM9.98,11Z" />
                </svg>
            ),
        },
        {
            id: 'create-node',
            label: 'Создать узел',
            icon: (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M11,13H5V11h6V5h2v6h6v2H13v6H11V13Z" />
                </svg>
            ),
        },
        {
            id: 'make-channel',
            label: 'Создать канал',
            icon: (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M19,9q-1.43,0-2.47-0.85T15.13,6H8.85Q8.58,7.05 7.81,7.81T6,8.85v6.28q1.3,0.35 2.15,1.4Q9,17.58 9,19q0,1.65-1.17,2.82T5,23T2.18,21.83T1,19q0-1.43 0.85-2.48Q2.7,15.48 4,15.13V8.85Q2.7,8.5 1.85,7.45T1,5Q1,3.35 2.18,2.17T5,1Q6.4,1 7.45,1.85T8.85,4h6.28q0.35-1.3 1.4-2.15T19,1q1.65,0 2.83,1.17T23,5T21.83,7.82T19,9ZM5,21q0.83,0 1.41-0.6T7,19q0-0.82-0.59-1.41T5,17q-0.8,0-1.4,0.59Q3,18.18 3,19q0,0.8 0.6,1.4T5,21ZM5,7Q5.83,7 6.41,6.41T7,5Q7,4.17 6.41,3.59T5,3Q4.2,3 3.6,3.59T3,5Q3,5.82 3.6,6.41T5,7ZM19,23q-1.65,0-2.82-1.18T15,19t1.18-2.82T19,15t2.83,1.18T23,19t-1.17,2.82T19,23Zm0-2q0.83,0 1.41-0.6T21,19q0-0.82-0.59-1.41T19,17q-0.82,0-1.41,0.59Q17,18.18 17,19q0,0.8 0.59,1.4T19,21ZM19,7q0.83,0 1.41-0.59T21,5q0-0.83-0.59-1.41T19,3q-0.82,0-1.41,0.59T17,5q0,0.82 0.59,1.41T19,7ZM5,19ZM5,5ZM19,19ZM19,5Z" />
                </svg>
            ),
        },
        {
            id: 'generate-tree',
            label: 'Построить оптимальное дерево',
            icon: (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M4,23V17H6.5V15H4V9H6.5V7H4V1h7V7H8.5V9H11v2h3V9h7v6H14V13H11v2H8.5v2H11v6H4Zm2-2H9V19H6v2Zm0-8H9V11H6v2Zm10,0h3V11H16v2ZM6,5H9V3H6V5ZM7.5,4Zm0,8Zm10,0Zm-10,8Z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="es-toolbar">
            {tools.map((tool) => {
                const isActive = activeTool === tool.id;
                const handleClick = () => {
                    if (tool.id === 'generate-tree' && onGenerateTree) {
                        onGenerateTree();
                        return;
                    }
                    onToolChange(tool.id);
                };
                return (
                    <Button
                        key={tool.id}
                        variant={isActive ? 'primary' : 'ghost'}
                        className={isActive ? 'es-toolbar__btn--active' : ''}
                        onClick={handleClick}
                    >
                        {tool.icon}
                        <span className="es-toolbar__label">{tool.label}</span>
                    </Button>
                );
            })}
        </div>
    );
}
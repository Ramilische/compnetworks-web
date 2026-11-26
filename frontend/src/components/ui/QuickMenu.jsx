import './ui.css';

/**
 * Позиционированное всплывающее меню (popover): контейнер с опциональным
 * заголовком и произвольным содержимым. Позицию задаёт родитель через style
 * (например, якорь на элемент карты). Используется как оболочка для
 * контекстных меню; само содержимое остаётся специфичным для страницы.
 */
export default function QuickMenu({ title, style, ariaLabel, children }) {
    return (
        <div
            className="ui-quickmenu"
            style={style}
            role="dialog"
            aria-label={ariaLabel || (typeof title === 'string' ? title : undefined)}
        >
            {title && <div className="ui-quickmenu__title">{title}</div>}
            {children}
        </div>
    );
}
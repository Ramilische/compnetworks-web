import './ui.css';

/**
 * Текст ошибки под полем.
 * block — отдельный блок с фоном и рамкой (для ошибок секции целиком).
 * Без children не рендерится.
 */
export default function ErrorText({
    block = false,
    className = '',
    children,
    ...rest
}) {
    if (!children) return null;

    const classes = ['err', block && 'err--block', className]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} {...rest}>
            {children}
        </div>
    );
}
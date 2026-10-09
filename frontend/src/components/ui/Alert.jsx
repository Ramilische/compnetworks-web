import './ui.css';

/**
 * Блок-уведомление. variant: 'error' | 'success' | 'info'.
 * Без children не рендерится (удобно для условных сообщений).
 */
export default function Alert({ variant = 'error', className = '', children, ...rest }) {
    if (!children) return null;

    const classes = ['alert', `alert--${variant}`, className]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} {...rest}>
            {children}
        </div>
    );
}
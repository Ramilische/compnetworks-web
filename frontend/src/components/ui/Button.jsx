import './ui.css';

/**
 * Универсальная кнопка.
 * variant: 'primary' | 'ghost' | 'icon'; type по умолчанию 'button'.
 */
export default function Button({
    variant = 'primary',
    type = 'button',
    className = '',
    children,
    ...rest
}) {
    const classes = ['btn', `btn--${variant}`, className]
        .filter(Boolean)
        .join(' ');

    return (
        <button type={type} className={classes} {...rest}>
            {children}
        </button>
    );
}
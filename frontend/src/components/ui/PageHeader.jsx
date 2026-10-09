import './ui.css';

/** Шапка страницы: заголовок + подзаголовок. */
export default function PageHeader({
    title,
    subtitle,
    className = '',
    children,
    ...rest
}) {
    const classes = ['page-header', className].filter(Boolean).join(' ');

    return (
        <header className={classes} {...rest}>
            <h1>{title}</h1>
            {subtitle && <p className="subtitle">{subtitle}</p>}
            {children}
        </header>
    );
}
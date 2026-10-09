import './ui.css';

/**
 * Подпись поля ввода (label). label — текст подписи;
 * inline — расположить подпись и контрол в одну строку; as — тег (по умолчанию label).
 */
export default function Field({
    label,
    inline = false,
    as: Tag = 'label',
    className = '',
    children,
    ...rest
}) {
    const classes = ['field', inline && 'field--inline', className]
        .filter(Boolean)
        .join(' ');

    return (
        <Tag className={classes} {...rest}>
            {label != null && <span>{label}</span>}
            {children}
        </Tag>
    );
}
import './ui.css';

/**
 * Поле ввода (text/number и др.).
 * error — строка: подсветка ошибки + текст ошибки под полем;
 * invalid — boolean: только подсветка без текста (например, ячейки матрицы).
 * Остальные props (value, onChange, placeholder, min, step…) передаются в <input>.
 */
export default function TextInput({
    type = 'text',
    error,
    invalid = false,
    className = '',
    ...rest
}) {
    const hasError = Boolean(error) || invalid;
    const classes = ['ui-input', hasError && 'error', className]
        .filter(Boolean)
        .join(' ');

    return (
        <>
            <input {...rest} type={type} className={classes} />
            {error && <div className="err">{error}</div>}
        </>
    );
}
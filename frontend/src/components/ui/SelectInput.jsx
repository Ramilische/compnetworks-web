import './ui.css';

/**
 * Выпадающий список.
 * options — массив [{ value, label? }] (label по умолчанию равен value);
 * либо передайте children с <option>. error — как у TextInput.
 */
export default function SelectInput({
    options = [],
    error,
    invalid = false,
    className = '',
    children,
    ...rest
}) {
    const hasError = Boolean(error) || invalid;
    const classes = ['ui-select', hasError && 'error', className]
        .filter(Boolean)
        .join(' ');

    return (
        <>
            <select {...rest} className={classes}>
                {options.length > 0
                    ? options.map((o) => (
                          <option key={o.value} value={o.value}>
                              {o.label ?? o.value}
                          </option>
                      ))
                    : children}
            </select>
            {error && <div className="err">{error}</div>}
        </>
    );
}
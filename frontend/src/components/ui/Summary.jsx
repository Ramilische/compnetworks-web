import './ui.css';

/** Сводка ключевых значений (например, над результатом). items: [{ value, label }] */
export default function Summary({ items = [], className = '', ...rest }) {
    const classes = ['summary', className].filter(Boolean).join(' ');

    return (
        <div className={classes} {...rest}>
            {items.map((item, i) => (
                <div key={item.label ?? i}>
                    <span className="summary__value">{item.value}</span>
                    <span className="summary__label">{item.label}</span>
                </div>
            ))}
        </div>
    );
}
import './ui.css';

/**
 * Карточка-секция.
 * title — заголовок; step — номер шага (круглый бейдж слева от заголовка);
 * action — элемент справа от заголовка (обычно кнопка);
 * variant — модификатор, например 'result'; as — тег (по умолчанию section).
 */
export default function Card({
    title,
    step,
    action,
    variant,
    as: Tag = 'section',
    className = '',
    children,
    ...rest
}) {
    const hasHead = title != null || action != null;
    const classes = ['card', variant && `card--${variant}`, className]
        .filter(Boolean)
        .join(' ');

    return (
        <Tag className={classes} {...rest}>
            {hasHead && (
                <div className="card__head">
                    {title != null && (
                        <h2>
                            {step != null && <span className="num">{step}</span>}
                            {title}
                        </h2>
                    )}
                    {action}
                </div>
            )}
            {children}
        </Tag>
    );
}
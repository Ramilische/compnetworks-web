import './ui.css';

/** Блок с данными в виде форматированного JSON (или готовой строки). */
export default function JsonBlock({ data, className = '', ...rest }) {
    const classes = ['json', className].filter(Boolean).join(' ');

    return (
        <pre className={classes} {...rest}>
            {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
        </pre>
    );
}
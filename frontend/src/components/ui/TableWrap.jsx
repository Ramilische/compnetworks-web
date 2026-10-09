import './ui.css';

/** Обёртка таблицы: горизонтальный скролл, рамка, скругление. */
export default function TableWrap({ className = '', children, ...rest }) {
    const classes = ['table-wrap', className].filter(Boolean).join(' ');

    return (
        <div className={classes} {...rest}>
            {children}
        </div>
    );
}
import './ui.css';

/** Ряд кнопок-действий внизу формы. */
export default function Actions({ className = '', children, ...rest }) {
    const classes = ['actions', className].filter(Boolean).join(' ');

    return (
        <div className={classes} {...rest}>
            {children}
        </div>
    );
}
import './ui.css';

/** Серая подсказка под элементом управления. */
export default function Hint({ className = '', children, ...rest }) {
    const classes = ['hint', className].filter(Boolean).join(' ');

    return (
        <p className={classes} {...rest}>
            {children}
        </p>
    );
}
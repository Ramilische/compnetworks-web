import { useEffect } from 'react';
import './ui.css';

/**
 * Модальное окно с затемнённым фоном (backdrop). Центрируется на экране,
 * закрывается по клику на фон, по клавише Escape или через onClose.
 * Содержимое передаётся в children.
 */
export default function Modal({ title, children, onClose, width }) {
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <div className="ui-modal-backdrop" onClick={onClose}>
            <div
                className="ui-modal"
                style={width ? { maxWidth: width } : undefined}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={typeof title === 'string' ? title : undefined}
            >
                {title && <div className="ui-modal__title">{title}</div>}
                {children}
            </div>
        </div>
    );
}
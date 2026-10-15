import { Button, ErrorText, Field, SelectInput, TextInput } from '../../components/ui';

/**
 * Контекстное меню узла на карте: заголовок с именем узла и 4 действия —
 * изменить тип, имя, координаты, удалить узел. Выбранное действие открывает
 * небольшую форму прямо в меню; «Применить» подтверждает изменение,
 * «Отмена» возвращает к списку действий. Позицию меню задаёт карта
 * через style (якорь на узел).
 */
export default function NodeContextMenu({
    node,
    nodeTypes = [],
    action = null,
    draft = null,
    draftError = null,
    style,
    onAction,
    onDraftChange,
    onApply,
    onBack,
    onClose,
    onDelete,
}) {
    return (
        <div
            className="es-menu"
            style={style}
            role="dialog"
            aria-label={`Действия с узлом «${node.name}»`}
        >
            <div className="es-menu__title">Узел «{node.name}»</div>

            {/* ---------- СПИСОК ДЕЙСТВИЙ ---------- */}
            {action === null && (
                <div className="es-menu__buttons">
                    <Button onClick={() => onAction('type')}>Изменить тип</Button>
                    <Button onClick={() => onAction('name')}>Изменить имя</Button>
                    <Button onClick={() => onAction('coords')}>Изменить координаты</Button>
                    <Button variant="danger" onClick={() => onAction('delete')}>
                        Удалить узел
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        Закрыть
                    </Button>
                </div>
            )}

            {/* ---------- СМЕНА ТИПА ---------- */}
            {action === 'type' && (
                <div className="es-menu__form">
                    <Field label="Тип узла">
                        <SelectInput
                            value={draft?.typeId}
                            onChange={(e) => onDraftChange({ typeId: Number(e.target.value) })}
                            options={nodeTypes.map((t) => ({ value: t.id, label: t.name }))}
                        />
                    </Field>
                    <div className="es-menu__row">
                        <Button onClick={onApply}>Применить</Button>
                        <Button variant="ghost" onClick={onBack}>
                            Отмена
                        </Button>
                    </div>
                </div>
            )}

            {/* ---------- СМЕНА ИМЕНИ ---------- */}
            {action === 'name' && (
                <div className="es-menu__form">
                    <Field label="Имя узла">
                        <TextInput
                            value={draft?.name ?? ''}
                            onChange={(e) => onDraftChange({ name: e.target.value })}
                            error={draftError || undefined}
                            autoFocus
                        />
                    </Field>
                    <div className="es-menu__row">
                        <Button onClick={onApply}>Применить</Button>
                        <Button variant="ghost" onClick={onBack}>
                            Отмена
                        </Button>
                    </div>
                </div>
            )}

            {/* ---------- СМЕНА КООРДИНАТ ---------- */}
            {action === 'coords' && (
                <div className="es-menu__form">
                    <Field label="Координата X">
                        <TextInput
                            type="number"
                            step="any"
                            value={draft?.x ?? ''}
                            onChange={(e) => onDraftChange({ x: e.target.value })}
                            autoFocus
                        />
                    </Field>
                    <Field label="Координата Y">
                        <TextInput
                            type="number"
                            step="any"
                            value={draft?.y ?? ''}
                            onChange={(e) => onDraftChange({ y: e.target.value })}
                        />
                    </Field>
                    {draftError && <ErrorText>{draftError}</ErrorText>}
                    <div className="es-menu__row">
                        <Button onClick={onApply}>Применить</Button>
                        <Button variant="ghost" onClick={onBack}>
                            Отмена
                        </Button>
                    </div>
                </div>
            )}

            {/* ---------- УДАЛЕНИЕ (С ПОДТВЕРЖДЕНИЕМ) ---------- */}
            {action === 'delete' && (
                <div className="es-menu__form">
                    <div className="es-menu__confirm">
                        Удалить узел «{node.name}»? Каналы с его участием и его строка и столбец
                        в таблице трафика будут удалены.
                    </div>
                    <div className="es-menu__row">
                        <Button variant="danger" onClick={onDelete}>
                            Да, удалить
                        </Button>
                        <Button variant="ghost" onClick={onBack}>
                            Отмена
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
import { Button, ErrorText, Field, Modal, QuickMenu, SelectInput, TextInput } from '../../components/ui';

/**
 * Контекстное меню узла на карте: заголовок с именем узла и 2 действия —
 * «Редактировать» (открывает модальное окно со всеми свойствами узла) и
 * «Удалить узел» (с подтверждением). Позицию меню задаёт карта через style.
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
    onDelete,
}) {
    const modalOpen = action === 'edit';

    return (
        <>
            <QuickMenu
                title={`Узел «${node.name}»`}
                style={style}
                ariaLabel={`Действия с узлом «${node.name}»`}
            >
                {action === null && (
                    <div className="es-menu__buttons">
                        <Button onClick={() => onAction('edit')}>Редактировать</Button>
                        <Button variant="danger" onClick={() => onAction('delete')}>
                            Удалить узел
                        </Button>
                    </div>
                )}

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
            </QuickMenu>

            {modalOpen && (
                <Modal
                    title={`Редактирование узла «${node.name}»`}
                    onClose={onBack}
                >
                    <Field label="Имя узла">
                        <TextInput
                            value={draft?.name ?? ''}
                            onChange={(e) => onDraftChange({ name: e.target.value })}
                            autoFocus
                        />
                    </Field>
                    <Field label="Тип узла">
                        <SelectInput
                            value={draft?.typeId}
                            onChange={(e) => onDraftChange({ typeId: Number(e.target.value) })}
                            options={nodeTypes.map((t) => ({ value: t.id, label: t.name }))}
                        />
                    </Field>
                    <Field label="Координата X">
                        <TextInput
                            type="number"
                            step="any"
                            value={draft?.x ?? ''}
                            onChange={(e) => onDraftChange({ x: e.target.value })}
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
                    <div className="ui-modal__actions">
                        <Button onClick={onApply}>Сохранить</Button>
                        <Button variant="ghost" onClick={onBack}>
                            Отмена
                        </Button>
                        <Button variant="danger" onClick={onDelete}>
                            Удалить
                        </Button>
                    </div>
                </Modal>
            )}
        </>
    );
}

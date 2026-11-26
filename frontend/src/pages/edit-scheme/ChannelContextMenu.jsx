import { Button, ErrorText, Field, Modal, QuickMenu, SelectInput } from '../../components/ui';

/**
 * Контекстное меню канала на карте: заголовок с концами канала и 2 действия —
 * «Редактировать» (открывает модальное окно со свойствами канала) и
 * «Удалить канал» (с подтверждением). Позицию меню задаёт карта через style.
 */
export default function ChannelContextMenu({
    channel,
    nodes,
    channelTypes = [],
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
    const fromNode = nodes?.[channel.from];
    const toNode = nodes?.[channel.to];
    const modalOpen = action === 'edit';

    return (
        <>
            <QuickMenu
                title={`Канал «${fromNode?.name} — ${toNode?.name}»`}
                style={style}
                ariaLabel={`Действия с каналом «${fromNode?.name} — ${toNode?.name}»`}
            >
                {action === null && (
                    <div className="es-menu__buttons">
                        <Button onClick={() => onAction('edit')}>Редактировать</Button>
                        <Button variant="danger" onClick={() => onAction('delete')}>
                            Удалить канал
                        </Button>
                    </div>
                )}

                {action === 'delete' && (
                    <div className="es-menu__form">
                        <div className="es-menu__confirm">
                            Удалить канал «{fromNode?.name} — {toNode?.name}»?
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
                    title={`Редактирование канала «${fromNode?.name} — ${toNode?.name}»`}
                    onClose={onBack}
                >
                    <Field label="Тип канала">
                        <SelectInput
                            value={draft?.typeId}
                            onChange={(e) => onDraftChange({ typeId: Number(e.target.value) })}
                            options={channelTypes.map((t) => ({ value: t.id, label: t.name }))}
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

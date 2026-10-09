import { Alert, Card, JsonBlock, Summary } from '../../components/ui';

/** Сообщения об ошибках отправки и карточка с результатом. */
export default function FormResult({ hasErrors, sendError, payload }) {
    return (
        <>
            {hasErrors && (
                <Alert>
                    Проверьте форму: есть незаполненные или некорректные поля.
                </Alert>
            )}

            <Alert>{sendError}</Alert>

            {payload && (
                <Card title="Результат" variant="result">
                    <Summary
                        items={[
                            { value: payload.nodes.length, label: 'узлов' },
                            { value: payload.cables.length, label: 'каналов' },
                            {
                                value: payload.nodeTypes.length,
                                label: 'вариантов УК',
                            },
                            {
                                value: payload.traffic.unit,
                                label: 'единица трафика',
                            },
                        ]}
                    />
                    <JsonBlock data={payload} />
                </Card>
            )}
        </>
    );
}

import { Alert, Card, Hint, JsonBlock, Summary } from '../../components/ui';

/**
 * Карточка с содержимым загруженной схемы.
 * scheme — { name, content } | null; loading — схема загружается;
 * error — текст ошибки загрузки.
 */
export default function SchemePreviewCard({ scheme, loading, error }) {
    if (loading) {
        return (
            <Card title="Содержимое схемы" variant="result">
                <Hint>Загрузка схемы…</Hint>
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Содержимое схемы" variant="result">
                <Alert>{error}</Alert>
            </Card>
        );
    }

    if (!scheme) {
        return (
            <Card title="Содержимое схемы" variant="result">
                <Hint>Выберите схему в списке выше и нажмите «Загрузить».</Hint>
            </Card>
        );
    }

    const {
        nodes = [],
        channels = [],
        channelTypes = [],
        nodeTypes = [],
        traffic = {},
    } = scheme.content;

    return (
        <Card title={`Схема «${scheme.name}»`} variant="result">
            <Summary
                items={[
                    { value: nodes.length, label: 'узлов' },
                    { value: channelTypes.length, label: 'типов каналов' },
                    { value: channels.length, label: 'каналов' },
                    { value: nodeTypes.length, label: 'вариантов УК' },
                    { value: traffic.unit ?? '—', label: 'единица трафика' },
                ]}
            />
            <JsonBlock data={scheme.content} />
        </Card>
    );
}

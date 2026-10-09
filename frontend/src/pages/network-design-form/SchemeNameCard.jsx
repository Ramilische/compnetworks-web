import { Card, Hint, TextInput } from '../../components/ui';

/**
 * Шаг 0: название схемы.
 * value — текущее значение; error — текст ошибки; onChange(value).
 */
export default function SchemeNameCard({ value, error, onChange }) {
    return (
        <Card title="Название схемы">
            <TextInput
                placeholder="Например: Схема сети 2 этажа"
                value={value}
                error={error}
                onChange={(e) => onChange(e.target.value)}
            />
            <Hint>
                Допустимы буквы, цифры, пробелы, дефис и подчёркивание —
                без специальных символов.
            </Hint>
        </Card>
    );
}

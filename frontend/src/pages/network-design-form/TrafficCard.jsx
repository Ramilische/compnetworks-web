import { Card, Field, Hint, SelectInput, TableWrap, TextInput } from '../../components/ui';
import { pairKey } from './constants.js';

/**
 * Шаг 4: матрица ожидаемой интенсивности трафика.
 * onUnitChange(value) — единица измерения; onCellChange(aId, bId, value).
 */
export default function TrafficCard({
    nodes,
    traffic,
    trafficUnit,
    errors,
    onUnitChange,
    onCellChange,
}) {
    return (
        <Card
            step={4}
            title="Ожидаемая интенсивность трафика"
            action={
                <Field label="Единица измерения" inline>
                    <SelectInput
                        value={trafficUnit}
                        onChange={(e) => onUnitChange(e.target.value)}
                        options={[{ value: 'Мбит/с' }, { value: 'Гбит/с' }]}
                    />
                </Field>
            }
        >
            {nodes.length < 2 ? (
                <Hint>
                    Задайте минимум 2 узла коммутации, чтобы заполнить матрицу.
                </Hint>
            ) : (
                <>
                    <Hint>
                        Укажите интенсивность для каждой пары узлов. Матрица
                        симметрична — достаточно заполнить значения выше
                        диагонали.
                    </Hint>
                    <TableWrap>
                        <table className="ui-table matrix">
                            <thead>
                                <tr>
                                    <th className="corner" />
                                    {nodes.map((n) => (
                                        <th key={n.id} className="matrix__head">
                                            {n.name || '—'}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {nodes.map((row, i) => (
                                    <tr key={row.id}>
                                        <th className="matrix__head">
                                            {row.name || '—'}
                                        </th>
                                        {nodes.map((col, j) => {
                                            if (i === j) {
                                                return (
                                                    <td
                                                        key={col.id}
                                                        className="matrix__diag"
                                                    >
                                                        —
                                                    </td>
                                                );
                                            }
                                            const key = pairKey(row.id, col.id);
                                            if (j < i) {
                                                const v = traffic[key];
                                                return (
                                                    <td
                                                        key={col.id}
                                                        className="matrix__mirror"
                                                    >
                                                        {v === undefined || v === ''
                                                            ? '—'
                                                            : v}
                                                    </td>
                                                );
                                            }
                                            return (
                                                <td
                                                    key={col.id}
                                                    className="matrix__cell"
                                                >
                                                    <TextInput
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        placeholder="0"
                                                        value={traffic[key] ?? ''}
                                                        invalid={Boolean(
                                                            errors[`traffic-${key}`]
                                                        )}
                                                        onChange={(e) =>
                                                            onCellChange(
                                                                row.id,
                                                                col.id,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableWrap>
                </>
            )}
        </Card>
    );
}

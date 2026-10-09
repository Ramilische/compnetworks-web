import './ui.css';
import Button from './Button.jsx';
import TableWrap from './TableWrap.jsx';

/**
 * Таблица с колонками, нумерацией строк и кнопкой удаления.
 * columns: [{ key, title, className?, cellClassName?, render?: (row, index) => ReactNode }]
 *   — className применяется к <th> (ширина колонки), render переопределяет ячейку.
 * rows — массив строк; rowKey — (row, index) => key.
 * remove: { title?, onClick(row), disabled? } — колонка с кнопкой «✕».
 * showIndex — колонка «№» (по умолчанию true).
 */
export default function DataTable({
    columns = [],
    rows = [],
    rowKey,
    showIndex = true,
    remove = null,
    className = '',
    ...rest
}) {
    const tableClasses = ['ui-table', className].filter(Boolean).join(' ');

    return (
        <TableWrap>
            <table {...rest} className={tableClasses}>
                <thead>
                    <tr>
                        {showIndex && <th className="col-idx">№</th>}
                        {columns.map((col) => (
                            <th key={col.key} className={col.className}>
                                {col.title}
                            </th>
                        ))}
                        {remove && <th className="col-act" />}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={rowKey ? rowKey(row, i) : i}>
                            {showIndex && <td className="idx">{i + 1}</td>}
                            {columns.map((col) => (
                                <td key={col.key} className={col.cellClassName}>
                                    {col.render ? col.render(row, i) : row[col.key]}
                                </td>
                            ))}
                            {remove && (
                                <td className="col-act">
                                    <Button
                                        variant="icon"
                                        title={remove.title}
                                        onClick={() => remove.onClick(row)}
                                        disabled={remove.disabled}
                                    >
                                        ✕
                                    </Button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </TableWrap>
    );
}
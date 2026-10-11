import { Button, Card, DataTable, Hint } from '../../components/ui';

/**
 * Карточка со списком схем (папок) на сервере.
 * schemes — имена схем; loading — идёт загрузка списка или схемы;
 * selectedName — имя открытой схемы; pendingName — имя загружаемой схемы;
 * onLoad(name) — загрузить схему; onRefresh() — обновить список.
 */
export default function SchemeListCard({
    schemes,
    loading,
    selectedName,
    pendingName,
    onLoad,
    onRefresh,
}) {
    const columns = [
        { key: 'name', title: 'Название схемы' },
        {
            key: 'action',
            title: '',
            className: 'cs__col-action',
            render: (row) => {
                const isSelected = row.name === selectedName;
                const isPending = row.name === pendingName && loading;

                return (
                    <Button
                        variant={isSelected ? 'primary' : 'ghost'}
                        disabled={loading}
                        onClick={() => onLoad(row.name)}
                    >
                        {isPending ? 'Загрузка…' : 'Загрузить'}
                    </Button>
                );
            },
        },
    ];

    return (
        <Card
            title="Список схем"
            action={
                <Button variant="ghost" disabled={loading} onClick={onRefresh}>
                    Обновить
                </Button>
            }
        >
            {loading && schemes.length === 0 && <Hint>Загрузка списка схем…</Hint>}

            {!loading && schemes.length === 0 && (
                <Hint>
                    Схем пока нет — создайте новую на странице
                    «Проектирование компьютерной сети».
                </Hint>
            )}

            {schemes.length > 0 && (
                <DataTable
                    columns={columns}
                    rows={schemes.map((name) => ({ name }))}
                    rowKey={(row) => row.name}
                    showIndex={false}
                />
            )}
        </Card>
    );
}

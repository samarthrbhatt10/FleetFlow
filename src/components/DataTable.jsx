import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

export default function DataTable({
    columns,
    data,
    searchKeys = [],
    actions,
    emptyMessage = 'No data found',
    toolbar,
    filters,
}) {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    const filteredData = useMemo(() => {
        let result = data;
        if (search && searchKeys.length > 0) {
            const q = search.toLowerCase();
            result = result.filter(row =>
                searchKeys.some(key => String(row[key] ?? '').toLowerCase().includes(q))
            );
        }
        if (sortKey) {
            result = [...result].sort((a, b) => {
                const av = a[sortKey] ?? '';
                const bv = b[sortKey] ?? '';
                if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
                return sortDir === 'asc'
                    ? String(av).localeCompare(String(bv))
                    : String(bv).localeCompare(String(av));
            });
        }
        return result;
    }, [data, search, searchKeys, sortKey, sortDir]);

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    return (
        <div className="data-table-container">
            <div className="data-table-toolbar">
                <div className="topbar-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {filters}
                {toolbar}
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={sortKey === col.key ? 'sorted' : ''}
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                    style={col.width ? { width: col.width } : undefined}
                                >
                                    {col.label}
                                    {sortKey === col.key && (
                                        <span className="sort-icon">
                                            {sortDir === 'asc' ? ' ▲' : ' ▼'}
                                        </span>
                                    )}
                                </th>
                            ))}
                            {actions && <th style={{ width: '120px' }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="data-table-empty">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((row, i) => (
                                <tr key={row.id || i}>
                                    {columns.map(col => (
                                        <td key={col.key}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td>
                                            <div className="data-table-actions">
                                                {actions(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

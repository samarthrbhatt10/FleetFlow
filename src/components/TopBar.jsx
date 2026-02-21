import { Search } from 'lucide-react';

export default function TopBar({ title, subtitle, actions, search, onSearchChange }) {
    return (
        <div className="topbar">
            <div className="topbar-left">
                <div>
                    <h1 className="topbar-title">{title}</h1>
                    {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
                </div>
            </div>
            <div className="topbar-actions">
                {search !== undefined && (
                    <div className="topbar-search">
                        <Search />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={e => onSearchChange(e.target.value)}
                        />
                    </div>
                )}
                {actions}
            </div>
        </div>
    );
}

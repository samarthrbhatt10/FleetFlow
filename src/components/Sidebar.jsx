import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import {
    LayoutDashboard, Truck, Route, Wrench, Receipt, Users, BarChart3, LogOut, Zap
} from 'lucide-react';

const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vehicles', label: 'Vehicle Registry', icon: Truck },
    { to: '/trips', label: 'Trip Dispatcher', icon: Route },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/expenses', label: 'Trip & Expense', icon: Receipt },
    { to: '/drivers', label: 'Performance', icon: Users },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
    const { currentUser, logout } = useApp();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon"><Zap size={18} /></div>
                <h1>FleetFlow</h1>
            </div>

            <nav className="sidebar-nav">
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <Icon />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{currentUser?.name || 'User'}</div>
                        <div className="sidebar-user-role">{currentUser?.role || 'user'}</div>
                    </div>
                    <button className="sidebar-logout" onClick={handleLogout} title="Logout">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

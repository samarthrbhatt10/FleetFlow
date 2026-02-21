import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import TopBar from '../components/TopBar';
import KPICard from '../components/KPICard';
import StatusPill from '../components/StatusPill';
import { Truck, AlertTriangle, Activity, Package, Plus, Route } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
    const { vehicles, trips, drivers, getDashboardKPIs } = useApp();
    const navigate = useNavigate();
    const kpis = getDashboardKPIs();

    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const types = ['All', 'Truck', 'Van', 'Bike'];
    const statuses = ['All', 'Available', 'On Trip', 'In Shop', 'Retired'];

    const filteredTrips = useMemo(() => {
        return trips.filter(t => {
            const vehicle = vehicles.find(v => v.id === t.vehicleId);
            if (typeFilter !== 'All' && vehicle?.type !== typeFilter) return false;
            if (statusFilter !== 'All' && t.status !== statusFilter) return false;
            return true;
        }).slice(0, 8);
    }, [trips, vehicles, typeFilter, statusFilter]);

    const statusCounts = useMemo(() => {
        const counts = { Available: 0, 'On Trip': 0, 'In Shop': 0, Retired: 0 };
        vehicles.forEach(v => { if (counts[v.status] !== undefined) counts[v.status]++; });
        return counts;
    }, [vehicles]);

    const chartData = {
        labels: Object.keys(statusCounts),
        datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#64748b'],
            borderColor: 'transparent',
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, usePointStyle: true, pointStyleWidth: 8, font: { size: 12 } } },
        },
    };

    return (
        <>
            <TopBar
                title="Command Center"
                subtitle="Fleet overview and key performance indicators"
                actions={
                    <>
                        <button className="btn btn-primary" onClick={() => navigate('/trips')}>
                            <Route size={16} /> New Trip
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/vehicles')}>
                            <Plus size={16} /> New Vehicle
                        </button>
                    </>
                }
            />

            <div className="page-content">
                <div className="kpi-grid">
                    <KPICard
                        icon={<Truck size={20} />}
                        label="Active Fleet"
                        value={kpis.activeFleet}
                        trend={`${vehicles.filter(v => v.status !== 'Retired').length} total active vehicles`}
                        accentColor="var(--accent-blue)"
                    />
                    <KPICard
                        icon={<AlertTriangle size={20} />}
                        label="Maintenance Alerts"
                        value={kpis.maintenanceAlerts}
                        trend="Vehicles currently in shop"
                        accentColor="var(--accent-amber)"
                    />
                    <KPICard
                        icon={<Activity size={20} />}
                        label="Utilization Rate"
                        value={`${kpis.utilizationRate}%`}
                        trend="Fleet assigned vs idle"
                        accentColor="var(--accent-emerald)"
                    />
                    <KPICard
                        icon={<Package size={20} />}
                        label="Pending Cargo"
                        value={kpis.pendingCargo}
                        trend="Shipments awaiting delivery"
                        accentColor="var(--accent-purple)"
                    />
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div className="filter-group">
                        {types.map(t => (
                            <button key={t} className={`filter-pill ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
                        ))}
                    </div>
                    <div style={{ width: 1, background: 'var(--border-default)', margin: '0 4px' }} />
                    <div className="filter-group">
                        {statuses.map(s => (
                            <button key={s} className={`filter-pill ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
                    <div className="data-table-container">
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Trips</h3>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Trip</th>
                                        <th>Vehicle</th>
                                        <th>Driver</th>
                                        <th>Route</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTrips.length === 0 ? (
                                        <tr><td colSpan={5} className="data-table-empty">No trips match filters</td></tr>
                                    ) : filteredTrips.map(trip => {
                                        const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                                        const driver = drivers.find(d => d.id === trip.driverId);
                                        return (
                                            <tr key={trip.id}>
                                                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{trip.id.toUpperCase()}</td>
                                                <td>{vehicle?.name || '—'}</td>
                                                <td>{driver?.name || '—'}</td>
                                                <td>{trip.origin} → {trip.destination}</td>
                                                <td><StatusPill status={trip.status} /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="chart-card">
                        <div className="chart-card-title">Fleet Status Distribution</div>
                        <div style={{ height: 260 }}>
                            <Doughnut data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

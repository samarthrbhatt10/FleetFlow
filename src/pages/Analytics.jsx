import { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import TopBar from '../components/TopBar';
import KPICard from '../components/KPICard';
import { Download, TrendingUp, Fuel, DollarSign, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

export default function Analytics() {
    const { vehicles, trips, expenses, maintenance, getVehicleCosts, getVehicleRevenue } = useApp();

    const vehicleAnalytics = useMemo(() => {
        return vehicles.filter(v => v.status !== 'Retired').map(v => {
            const costs = getVehicleCosts(v.id);
            const revenue = getVehicleRevenue(v.id);
            const vExpenses = expenses.filter(e => e.vehicleId === v.id);
            const totalDist = vExpenses.reduce((s, e) => s + (Number(e.distance) || 0), 0);
            const totalFuel = vExpenses.reduce((s, e) => s + (Number(e.fuelExpense) || 0), 0);
            const fuelEff = totalDist > 0 && totalFuel > 0 ? (totalDist / (totalFuel / 80)).toFixed(1) : 'N/A';
            const roi = v.acquisitionCost > 0 ? (((revenue - costs.total) / v.acquisitionCost) * 100).toFixed(1) : 'N/A';
            const costPerKm = totalDist > 0 ? (costs.total / totalDist).toFixed(1) : 'N/A';
            return { ...v, ...costs, revenue, totalDist, fuelEff, roi, costPerKm };
        });
    }, [vehicles, expenses, maintenance, getVehicleCosts, getVehicleRevenue]);

    const totalRevenue = vehicleAnalytics.reduce((s, v) => s + v.revenue, 0);
    const totalCosts = vehicleAnalytics.reduce((s, v) => s + v.total, 0);
    const totalTrips = trips.filter(t => t.status === 'Completed').length;

    const barData = {
        labels: vehicleAnalytics.map(v => v.name),
        datasets: [
            { label: 'Fuel Cost', data: vehicleAnalytics.map(v => v.fuelCost), backgroundColor: '#3b82f6', borderRadius: 4 },
            { label: 'Maintenance', data: vehicleAnalytics.map(v => v.maintCost), backgroundColor: '#f59e0b', borderRadius: 4 },
            { label: 'Misc', data: vehicleAnalytics.map(v => v.miscCost), backgroundColor: '#8b5cf6', borderRadius: 4 },
        ],
    };

    const lineData = {
        labels: vehicleAnalytics.map(v => v.name),
        datasets: [{
            label: 'Fuel Efficiency (km/L)',
            data: vehicleAnalytics.map(v => v.fuelEff === 'N/A' ? 0 : Number(v.fuelEff)),
            borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointRadius: 6, pointBackgroundColor: '#10b981',
        }],
    };

    const chartOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } },
        scales: {
            x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { color: 'rgba(148,163,184,0.08)' } },
            y: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { color: 'rgba(148,163,184,0.08)' } },
        },
    };

    const exportCSV = () => {
        const headers = ['Vehicle', 'Type', 'Fuel Cost', 'Maint Cost', 'Misc Cost', 'Total Cost', 'Revenue', 'ROI %', 'Fuel Eff (km/L)', 'Cost/km'];
        const rows = vehicleAnalytics.map(v => [v.name, v.type, v.fuelCost, v.maintCost, v.miscCost, v.total, v.revenue, v.roi, v.fuelEff, v.costPerKm]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'fleetflow_report.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <TopBar title="Operational Analytics" subtitle="Data-driven insights and financial reports" actions={
                <button className="btn btn-primary" onClick={exportCSV}><Download size={16} /> Export CSV</button>
            } />
            <div className="page-content">
                <div className="kpi-grid">
                    <KPICard icon={<DollarSign size={20} />} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} accentColor="var(--accent-emerald)" />
                    <KPICard icon={<TrendingUp size={20} />} label="Total Costs" value={`₹${totalCosts.toLocaleString()}`} accentColor="var(--accent-rose)" />
                    <KPICard icon={<Fuel size={20} />} label="Completed Trips" value={totalTrips} accentColor="var(--accent-blue)" />
                    <KPICard icon={<BarChart3 size={20} />} label="Net Profit" value={`₹${(totalRevenue - totalCosts).toLocaleString()}`} accentColor="var(--accent-purple)" />
                </div>

                <div className="charts-grid">
                    <div className="chart-card">
                        <div className="chart-card-title">Cost Breakdown by Vehicle</div>
                        <div style={{ height: 300 }}><Bar data={barData} options={chartOpts} /></div>
                    </div>
                    <div className="chart-card">
                        <div className="chart-card-title">Fuel Efficiency (km/L)</div>
                        <div style={{ height: 300 }}><Line data={lineData} options={chartOpts} /></div>
                    </div>
                </div>

                {/* Vehicle ROI Table */}
                <div className="data-table-container" style={{ marginTop: 24 }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Vehicle ROI & Performance</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Vehicle</th><th>Type</th><th>Total Cost</th><th>Revenue</th><th>ROI</th><th>Fuel Eff</th><th>Cost/km</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicleAnalytics.map(v => (
                                    <tr key={v.id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v.name}</td>
                                        <td>{v.type}</td>
                                        <td>₹{v.total.toLocaleString()}</td>
                                        <td style={{ color: 'var(--accent-emerald)' }}>₹{v.revenue.toLocaleString()}</td>
                                        <td style={{ color: v.roi !== 'N/A' && Number(v.roi) > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                                            {v.roi === 'N/A' ? '—' : `${v.roi}%`}
                                        </td>
                                        <td>{v.fuelEff === 'N/A' ? '—' : `${v.fuelEff} km/L`}</td>
                                        <td>{v.costPerKm === 'N/A' ? '—' : `₹${v.costPerKm}/km`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

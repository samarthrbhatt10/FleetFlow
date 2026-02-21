import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import TopBar from '../components/TopBar';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';

const emptyExpense = { tripId: '', driverId: '', vehicleId: '', distance: '', fuelExpense: '', miscExpense: '', status: 'Pending' };

export default function Expenses() {
    const { expenses, trips, vehicles, drivers, addExpense, getVehicleCosts } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyExpense);

    const completedTrips = trips.filter(t => t.status === 'Completed');

    const handleTripSelect = (tripId) => {
        const trip = trips.find(t => t.id === tripId);
        if (trip) {
            setForm({ ...form, tripId, driverId: trip.driverId, vehicleId: trip.vehicleId });
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        await addExpense({ ...form, distance: Number(form.distance), fuelExpense: Number(form.fuelExpense), miscExpense: Number(form.miscExpense) });
        setShowModal(false);
        setForm(emptyExpense);
    };

    const vehicleCostSummary = useMemo(() => {
        const uniqueVehicles = [...new Set(expenses.map(e => e.vehicleId))];
        return uniqueVehicles.map(vid => {
            const v = vehicles.find(x => x.id === vid);
            const costs = getVehicleCosts(vid);
            return { vehicleName: v?.name || vid, ...costs };
        });
    }, [expenses, vehicles, getVehicleCosts]);

    const columns = [
        { key: 'tripId', label: 'Trip ID', render: (v) => <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v?.toUpperCase()}</span> },
        { key: 'driverId', label: 'Driver', render: (_, row) => drivers.find(d => d.id === row.driverId)?.name || '—' },
        { key: 'vehicleId', label: 'Vehicle', render: (_, row) => vehicles.find(v => v.id === row.vehicleId)?.name || '—' },
        { key: 'distance', label: 'Distance', render: (v) => `${Number(v).toLocaleString()} km` },
        { key: 'fuelExpense', label: 'Fuel Expense', render: (v) => `₹${Number(v).toLocaleString()}` },
        { key: 'miscExpense', label: 'Misc Expense', render: (v) => `₹${Number(v).toLocaleString()}` },
        { key: 'status', label: 'Status', render: (v) => <StatusPill status={v} /> },
    ];

    return (
        <>
            <TopBar title="Trip Expenses & Fuel Logging" subtitle="Track operational costs per trip and vehicle" actions={
                <button className="btn btn-primary" onClick={() => { setForm(emptyExpense); setShowModal(true); }}><Plus size={16} /> Add an Expense</button>
            } />

            <div className="page-content">
                {/* Cost Summary Cards */}
                {vehicleCostSummary.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Total Operational Cost by Vehicle</h3>
                        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                            {vehicleCostSummary.map((s, i) => (
                                <div className="kpi-card" key={i} style={{ '--kpi-accent': 'var(--accent-cyan)' }}>
                                    <div className="kpi-card-label">{s.vehicleName}</div>
                                    <div className="kpi-card-value" style={{ fontSize: 22 }}>₹{s.total.toLocaleString()}</div>
                                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                                        <span>Fuel: ₹{s.fuelCost.toLocaleString()}</span>
                                        <span>Maint: ₹{s.maintCost.toLocaleString()}</span>
                                        <span>Misc: ₹{s.miscCost.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <DataTable columns={columns} data={expenses} searchKeys={['tripId']} />
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Expense"
                footer={<>
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleCreate}>Create</button>
                </>}>
                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label className="form-label">Trip ID</label>
                        <select className="form-select" value={form.tripId} onChange={e => handleTripSelect(e.target.value)} required>
                            <option value="">— Select Completed Trip —</option>
                            {completedTrips.map(t => (
                                <option key={t.id} value={t.id}>{t.id.toUpperCase()} — {t.origin} → {t.destination}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Driver</label>
                            <input className="form-input" value={drivers.find(d => d.id === form.driverId)?.name || ''} readOnly style={{ opacity: 0.7 }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Vehicle</label>
                            <input className="form-input" value={vehicles.find(v => v.id === form.vehicleId)?.name || ''} readOnly style={{ opacity: 0.7 }} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Distance (km)</label>
                        <input className="form-input" type="number" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Fuel Cost (₹)</label>
                            <input className="form-input" type="number" value={form.fuelExpense} onChange={e => setForm({ ...form, fuelExpense: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Misc Expense (₹)</label>
                            <input className="form-input" type="number" value={form.miscExpense} onChange={e => setForm({ ...form, miscExpense: e.target.value })} />
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
}

import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import TopBar from '../components/TopBar';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';
import { Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const emptyTrip = { vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', estimatedFuelCost: '' };

export default function TripDispatcher() {
    const { trips, vehicles, drivers, createTrip, completeTrip, cancelTrip, getAvailableVehicles, getAvailableDrivers } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyTrip);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [completeModal, setCompleteModal] = useState(null);
    const [finalOdometer, setFinalOdometer] = useState('');

    const availVehicles = getAvailableVehicles();
    const availDrivers = getAvailableDrivers();

    const selectedVehicle = vehicles.find(v => v.id === form.vehicleId);

    const filtered = statusFilter === 'All' ? trips : trips.filter(t => t.status === statusFilter);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        const result = await createTrip({ ...form, cargoWeight: Number(form.cargoWeight), estimatedFuelCost: Number(form.estimatedFuelCost) });
        if (result.success) { setShowModal(false); setForm(emptyTrip); }
        else setError(result.error);
    };

    const handleComplete = async () => {
        await completeTrip(completeModal, Number(finalOdometer) || 0);
        setCompleteModal(null);
        setFinalOdometer('');
    };

    const columns = [
        { key: 'id', label: 'Trip', render: (v) => <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v.toUpperCase()}</span> },
        {
            key: 'vehicleId', label: 'Vehicle', render: (_, row) => {
                const v = vehicles.find(x => x.id === row.vehicleId);
                return v ? `${v.name} (${v.type})` : '—';
            }
        },
        {
            key: 'driverId', label: 'Driver', render: (_, row) => {
                const d = drivers.find(x => x.id === row.driverId);
                return d?.name || '—';
            }
        },
        { key: 'origin', label: 'Origin' },
        { key: 'destination', label: 'Destination' },
        { key: 'cargoWeight', label: 'Cargo (kg)', render: (v) => `${Number(v).toLocaleString()} kg` },
        { key: 'status', label: 'Status', render: (v) => <StatusPill status={v} /> },
    ];

    return (
        <>
            <TopBar title="Trip Dispatcher" subtitle="Create, manage, and track deliveries" actions={
                <button className="btn btn-primary" onClick={() => { setError(''); setForm(emptyTrip); setShowModal(true); }}><Plus size={16} /> New Trip</button>
            } />

            <div className="page-content">
                <DataTable
                    columns={columns}
                    data={filtered}
                    searchKeys={['id', 'origin', 'destination']}
                    filters={
                        <div className="filter-group">
                            {['All', 'Dispatched', 'Completed', 'Cancelled'].map(s => (
                                <button key={s} className={`filter-pill ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
                            ))}
                        </div>
                    }
                    actions={(row) => (
                        <>
                            {row.status === 'Dispatched' && (
                                <>
                                    <button className="btn btn-success btn-sm" onClick={() => { setCompleteModal(row.id); setFinalOdometer(''); }}>
                                        <CheckCircle size={14} /> Complete
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => cancelTrip(row.id)}>
                                        <XCircle size={14} /> Cancel
                                    </button>
                                </>
                            )}
                        </>
                    )}
                />
            </div>

            {/* Create Trip Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Trip — Dispatch"
                footer={<>
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleCreate}>Confirm & Dispatch Trip</button>
                </>}>
                <form onSubmit={handleCreate}>
                    {error && <div className="form-error"><AlertCircle size={16} /> {error}</div>}

                    <div className="form-group">
                        <label className="form-label">Select Vehicle</label>
                        <select className="form-select" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} required>
                            <option value="">— Select Available Vehicle —</option>
                            {availVehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.name} ({v.type}) — Max {v.maxCapacity}kg</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Cargo Weight (kg)</label>
                        <input className="form-input" type="number" value={form.cargoWeight} onChange={e => setForm({ ...form, cargoWeight: e.target.value })} required
                            placeholder={selectedVehicle ? `Max: ${selectedVehicle.maxCapacity}kg` : 'Select vehicle first'} />
                        {selectedVehicle && Number(form.cargoWeight) > selectedVehicle.maxCapacity && (
                            <div className="form-error" style={{ marginTop: 8, marginBottom: 0 }}>
                                <AlertCircle size={14} /> Exceeds max capacity ({selectedVehicle.maxCapacity}kg)!
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Select Driver</label>
                        <select className="form-select" value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })} required>
                            <option value="">— Select Available Driver —</option>
                            {availDrivers.map(d => (
                                <option key={d.id} value={d.id}>{d.name} — License: {d.licenseCategory}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Origin Address</label>
                            <input className="form-input" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Destination</label>
                            <input className="form-input" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Estimated Fuel Cost (₹)</label>
                        <input className="form-input" type="number" value={form.estimatedFuelCost} onChange={e => setForm({ ...form, estimatedFuelCost: e.target.value })} />
                    </div>
                </form>
            </Modal>

            {/* Complete Trip Modal */}
            <Modal isOpen={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete Trip"
                footer={<>
                    <button className="btn btn-secondary" onClick={() => setCompleteModal(null)}>Cancel</button>
                    <button className="btn btn-success" onClick={handleComplete}>Mark as Completed</button>
                </>}>
                <div className="form-group">
                    <label className="form-label">Final Odometer Reading (km)</label>
                    <input className="form-input" type="number" value={finalOdometer} onChange={e => setFinalOdometer(e.target.value)} placeholder="Enter current odometer reading" />
                </div>
            </Modal>
        </>
    );
}

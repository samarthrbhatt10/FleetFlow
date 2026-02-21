import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import TopBar from '../components/TopBar';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';
import { Plus, Edit3, Power } from 'lucide-react';

const emptyVehicle = { name: '', model: '', plate: '', type: 'Truck', maxCapacity: '', odometer: '', region: 'West', acquisitionCost: '' };

export default function VehicleRegistry() {
    const { vehicles, addVehicle, updateVehicle, toggleVehicleRetired } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyVehicle);
    const [typeFilter, setTypeFilter] = useState('All');

    const filtered = typeFilter === 'All' ? vehicles : vehicles.filter(v => v.type === typeFilter);

    const openCreate = () => { setForm(emptyVehicle); setEditing(null); setShowModal(true); };
    const openEdit = (v) => { setForm({ ...v }); setEditing(v.id); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { ...form, maxCapacity: Number(form.maxCapacity), odometer: Number(form.odometer), acquisitionCost: Number(form.acquisitionCost) || 0 };
        if (editing) await updateVehicle(editing, data);
        else await addVehicle(data);
        setShowModal(false);
    };

    const columns = [
        { key: 'name', label: 'Vehicle Name', render: (v) => <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v}</span> },
        { key: 'model', label: 'Model' },
        { key: 'plate', label: 'License Plate', render: (v) => <code style={{ background: 'var(--bg-input)', padding: '2px 8px', borderRadius: 4, fontSize: 12, color: 'var(--accent-cyan)' }}>{v}</code> },
        { key: 'type', label: 'Type' },
        { key: 'maxCapacity', label: 'Max Load (kg)', render: (v) => `${v?.toLocaleString()} kg` },
        { key: 'odometer', label: 'Odometer (km)', render: (v) => `${v?.toLocaleString()} km` },
        { key: 'region', label: 'Region' },
        { key: 'status', label: 'Status', render: (v) => <StatusPill status={v} /> },
    ];

    return (
        <>
            <TopBar title="Vehicle Registry" subtitle="Manage your fleet assets" actions={
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Vehicle</button>
            } />

            <div className="page-content">
                <DataTable
                    columns={columns}
                    data={filtered}
                    searchKeys={['name', 'model', 'plate', 'type', 'region']}
                    filters={
                        <div className="filter-group">
                            {['All', 'Truck', 'Van', 'Bike'].map(t => (
                                <button key={t} className={`filter-pill ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
                            ))}
                        </div>
                    }
                    actions={(row) => (
                        <>
                            <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => openEdit(row)}><Edit3 size={14} /></button>
                            <button className="btn btn-ghost btn-sm btn-icon" title={row.status === 'Retired' ? 'Reactivate' : 'Retire'}
                                onClick={() => toggleVehicleRetired(row.id)}
                                style={{ color: row.status === 'Retired' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                                <Power size={14} />
                            </button>
                        </>
                    )}
                />
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Vehicle' : 'Add New Vehicle'}
                footer={<>
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Save Changes' : 'Add Vehicle'}</button>
                </>}>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Vehicle Name</label>
                            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Model</label>
                            <input className="form-input" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">License Plate</label>
                            <input className="form-input" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <option>Truck</option><option>Van</option><option>Bike</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Max Capacity (kg)</label>
                            <input className="form-input" type="number" value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Odometer (km)</label>
                            <input className="form-input" type="number" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Region</label>
                            <select className="form-select" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
                                <option>West</option><option>North</option><option>South</option><option>East</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Acquisition Cost (₹)</label>
                            <input className="form-input" type="number" value={form.acquisitionCost} onChange={e => setForm({ ...form, acquisitionCost: e.target.value })} />
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
}

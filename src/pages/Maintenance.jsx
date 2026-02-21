import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import TopBar from '../components/TopBar';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';
import { Plus, CheckCircle } from 'lucide-react';

const emptyService = { vehicleId: '', issue: '', cost: '', date: '' };

export default function Maintenance() {
    const { maintenance, vehicles, createMaintenance, completeMaintenance } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyService);

    const handleCreate = async (e) => {
        e.preventDefault();
        await createMaintenance({ ...form, cost: Number(form.cost) });
        setShowModal(false);
        setForm(emptyService);
    };

    const columns = [
        { key: 'id', label: 'Log ID', render: (v) => <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v.toUpperCase()}</span> },
        {
            key: 'vehicleId', label: 'Vehicle', render: (_, row) => {
                const v = vehicles.find(x => x.id === row.vehicleId);
                return v ? `${v.name} (${v.plate})` : '—';
            }
        },
        { key: 'issue', label: 'Issue / Service' },
        { key: 'date', label: 'Date' },
        { key: 'cost', label: 'Cost', render: (v) => `₹${Number(v).toLocaleString()}` },
        { key: 'status', label: 'Status', render: (v) => <StatusPill status={v} /> },
    ];

    const availableForService = vehicles.filter(v => v.status !== 'Retired');

    return (
        <>
            <TopBar title="Maintenance & Service Logs" subtitle="Track repairs and preventive maintenance" actions={
                <button className="btn btn-primary" onClick={() => { setForm({ ...emptyService, date: new Date().toISOString().split('T')[0] }); setShowModal(true); }}>
                    <Plus size={16} /> Create New Service
                </button>
            } />

            <div className="page-content">
                <DataTable
                    columns={columns}
                    data={maintenance}
                    searchKeys={['id', 'issue']}
                    actions={(row) => (
                        <>
                            {row.status === 'In Progress' && (
                                <button className="btn btn-success btn-sm" onClick={() => completeMaintenance(row.id)}>
                                    <CheckCircle size={14} /> Complete
                                </button>
                            )}
                        </>
                    )}
                />
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Service Log"
                footer={<>
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleCreate}>Create</button>
                </>}>
                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label className="form-label">Vehicle</label>
                        <select className="form-select" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} required>
                            <option value="">— Select Vehicle —</option>
                            {availableForService.map(v => (
                                <option key={v.id} value={v.id}>{v.name} — {v.plate} ({v.status})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Issue / Service</label>
                        <input className="form-input" value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })} placeholder="e.g., Oil Change, Brake Repair" required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Cost (₹)</label>
                            <input className="form-input" type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
}

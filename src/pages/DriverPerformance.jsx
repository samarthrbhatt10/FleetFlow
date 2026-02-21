import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import TopBar from '../components/TopBar';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';
import { Plus, CheckCircle, AlertTriangle } from 'lucide-react';

const emptyDriver = { name: '', licenseNumber: '', licenseExpiry: '', licenseCategory: 'Van' };

export default function DriverPerformance() {
    const { drivers, addDriver, updateDriver, isDriverLicenseValid } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyDriver);
    const [statusFilter, setStatusFilter] = useState('All');

    const openCreate = () => { setForm(emptyDriver); setEditing(null); setShowModal(true); };
    const openEdit = (d) => { setForm({ ...d }); setEditing(d.id); setShowModal(true); };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) updateDriver(editing, form);
        else addDriver(form);
        setShowModal(false);
    };

    const filtered = statusFilter === 'All' ? drivers : drivers.filter(d => d.status === statusFilter);
    const getScoreColor = (s) => s >= 90 ? 'var(--accent-emerald)' : s >= 75 ? 'var(--accent-amber)' : 'var(--accent-rose)';

    return (
        <>
            <TopBar title="Driver Performance & Safety" subtitle="Manage driver profiles and compliance" actions={
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Driver</button>
            } />
            <div className="page-content">
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    <div className="filter-group">
                        {['All', 'Available', 'On Trip', 'On Duty', 'Off Duty', 'Suspended'].map(s => (
                            <button key={s} className={`filter-pill ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
                        ))}
                    </div>
                </div>
                <div className="driver-grid">
                    {filtered.map(driver => {
                        const valid = isDriverLicenseValid(driver);
                        const days = Math.ceil((new Date(driver.licenseExpiry) - new Date()) / 86400000);
                        return (
                            <div className="driver-card" key={driver.id}>
                                <div className="driver-card-header">
                                    <div className="driver-card-avatar">{driver.name.charAt(0)}</div>
                                    <div>
                                        <div className="driver-card-name">{driver.name}</div>
                                        <div className="driver-card-license">License: {driver.licenseNumber}</div>
                                    </div>
                                    <div style={{ marginLeft: 'auto' }}><StatusPill status={driver.status} /></div>
                                </div>
                                <div className="driver-card-stats">
                                    <div className="driver-stat">
                                        <div className="driver-stat-value" style={{ color: getScoreColor(driver.safetyScore) }}>{driver.safetyScore}%</div>
                                        <div className="driver-stat-label">Safety Score</div>
                                    </div>
                                    <div className="driver-stat">
                                        <div className="driver-stat-value">{driver.completionRate}%</div>
                                        <div className="driver-stat-label">Completion</div>
                                    </div>
                                    <div className="driver-stat">
                                        <div className="driver-stat-value">{driver.complaints}</div>
                                        <div className="driver-stat-label">Complaints</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                                    Categories: <span style={{ color: 'var(--accent-cyan)' }}>{driver.licenseCategory}</span>
                                </div>
                                <div className="driver-card-footer">
                                    <div>
                                        {valid ? (
                                            <span className="license-ok"><CheckCircle size={14} /> Valid ({days}d left)</span>
                                        ) : (
                                            <span className="license-warning"><AlertTriangle size={14} /> Expired!</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(driver)}>Edit</button>
                                        <select className="form-select" style={{ width: 'auto', padding: '4px 8px', fontSize: 11 }}
                                            value={driver.status} onChange={e => updateDriver(driver.id, { status: e.target.value })}>
                                            <option>Available</option><option>On Duty</option><option>Off Duty</option><option>Suspended</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Driver' : 'Add Driver'}
                footer={<>
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Save' : 'Add'}</button>
                </>}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">License Number</label>
                            <input className="form-input" value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">License Expiry</label>
                            <input className="form-input" type="date" value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">License Category</label>
                        <select className="form-select" value={form.licenseCategory} onChange={e => setForm({ ...form, licenseCategory: e.target.value })}>
                            <option value="Truck">Truck</option><option value="Van">Van</option><option value="Bike">Bike</option>
                            <option value="Truck,Van">Truck, Van</option><option value="Van,Bike">Van, Bike</option>
                            <option value="Truck,Van,Bike">All</option>
                        </select>
                    </div>
                </form>
            </Modal>
        </>
    );
}

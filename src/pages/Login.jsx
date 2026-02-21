import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
    const { login } = useApp();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(email, password);
            if (result.success) navigate('/');
            else setError(result.error);
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-orb login-bg-orb-1" />
            <div className="login-bg-orb login-bg-orb-2" />
            <div className="login-bg-orb login-bg-orb-3" />

            <div className="login-card">
                <div className="login-header">
                    <div className="login-header-icon"><Zap size={28} color="white" /></div>
                    <h1>FleetFlow</h1>
                    <p>Fleet & Logistics Management</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="form-error">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="you@fleetflow.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                style={{ paddingLeft: 38 }}
                            />
                            <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{ paddingLeft: 38 }}
                            />
                            <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        </div>
                    </div>

                    <div className="login-forgot">
                        <a href="#" onClick={e => { e.preventDefault(); alert('Password reset email sent (demo).'); }}>
                            Forgot Password?
                        </a>
                    </div>

                    <button type="submit" className="btn btn-primary login-submit">
                        Sign In
                    </button>
                </form>

                <div className="login-demo">
                    <p>Demo Accounts (password: <code>admin123</code>)</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                        {[
                            { email: 'manager@fleetflow.com', role: 'Fleet Manager' },
                            { email: 'dispatch@fleetflow.com', role: 'Dispatcher' },
                            { email: 'safety@fleetflow.com', role: 'Safety Officer' },
                            { email: 'finance@fleetflow.com', role: 'Financial Analyst' },
                        ].map(d => (
                            <button key={d.email} className="btn btn-ghost btn-sm" onClick={() => { setEmail(d.email); setPassword('admin123'); }}
                                style={{ justifyContent: 'space-between', fontSize: 12 }}>
                                <code>{d.email}</code>
                                <span style={{ color: 'var(--accent-cyan)', fontSize: 11 }}>{d.role}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

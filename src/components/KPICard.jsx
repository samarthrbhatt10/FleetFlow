export default function KPICard({ icon, label, value, trend, accentColor }) {
    return (
        <div className="kpi-card" style={{ '--kpi-accent': accentColor }}>
            <div className="kpi-card-header">
                <span className="kpi-card-label">{label}</span>
                <div className="kpi-card-icon" style={{ background: accentColor }}>
                    {icon}
                </div>
            </div>
            <div className="kpi-card-value">{value}</div>
            {trend && <div className="kpi-card-trend">{trend}</div>}
        </div>
    );
}

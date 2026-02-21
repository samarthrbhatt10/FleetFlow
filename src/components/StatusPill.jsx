export default function StatusPill({ status }) {
    const cls = `status-${(status || '').replace(/\s+/g, '-')}`;
    return (
        <span className={`status-pill ${cls}`}>
            <span className="status-pill-dot" />
            {status}
        </span>
    );
}

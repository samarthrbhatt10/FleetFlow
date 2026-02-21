import { Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function ProtectedRoute({ children }) {
    const { currentUser } = useApp();
    if (!currentUser) return <Navigate to="/login" replace />;
    return children;
}

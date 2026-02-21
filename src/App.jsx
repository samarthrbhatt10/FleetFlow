import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import TripDispatcher from './pages/TripDispatcher';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import DriverPerformance from './pages/DriverPerformance';
import Analytics from './pages/Analytics';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
      <Route path="/vehicles" element={<ProtectedPage><VehicleRegistry /></ProtectedPage>} />
      <Route path="/trips" element={<ProtectedPage><TripDispatcher /></ProtectedPage>} />
      <Route path="/maintenance" element={<ProtectedPage><Maintenance /></ProtectedPage>} />
      <Route path="/expenses" element={<ProtectedPage><Expenses /></ProtectedPage>} />
      <Route path="/drivers" element={<ProtectedPage><DriverPerformance /></ProtectedPage>} />
      <Route path="/analytics" element={<ProtectedPage><Analytics /></ProtectedPage>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

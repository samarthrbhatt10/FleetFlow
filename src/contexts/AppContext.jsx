import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);
const API = '/api';

async function api(path, opts = {}) {
    const res = await fetch(`${API}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...opts,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json();
    if (!res.ok && !data.success && data.error) throw new Error(data.error);
    return data;
}

export function AppProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('fleetflow_currentUser')); } catch { return null; }
    });
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [maintenance, setMaintenance] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loaded, setLoaded] = useState(false);

    // Save user to localStorage for session persistence
    useEffect(() => {
        localStorage.setItem('fleetflow_currentUser', JSON.stringify(currentUser));
    }, [currentUser]);

    // Load all data from API on mount
    const refreshAll = useCallback(async () => {
        try {
            const [v, d, t, m, e] = await Promise.all([
                api('/vehicles'), api('/drivers'), api('/trips'), api('/maintenance'), api('/expenses'),
            ]);
            setVehicles(v); setDrivers(d); setTrips(t); setMaintenance(m); setExpenses(e);
            setLoaded(true);
        } catch (err) {
            console.error('Failed to load data from API:', err);
            setLoaded(true);
        }
    }, []);

    useEffect(() => { if (currentUser) refreshAll(); }, [currentUser, refreshAll]);

    // AUTH
    const login = useCallback(async (email, password) => {
        try {
            const data = await api('/auth/login', { method: 'POST', body: { email, password } });
            if (data.success) { setCurrentUser(data.user); return { success: true }; }
            return { success: false, error: data.error };
        } catch (err) {
            return { success: false, error: err.message || 'Invalid email or password' };
        }
    }, []);

    const logout = useCallback(() => { setCurrentUser(null); setLoaded(false); }, []);

    // VEHICLES
    const addVehicle = useCallback(async (v) => {
        const nv = await api('/vehicles', { method: 'POST', body: v });
        await refreshAll();
        return nv;
    }, [refreshAll]);

    const updateVehicle = useCallback(async (id, updates) => {
        await api(`/vehicles/${id}`, { method: 'PUT', body: updates });
        await refreshAll();
    }, [refreshAll]);

    const toggleVehicleRetired = useCallback(async (id) => {
        await api(`/vehicles/${id}/toggle-retired`, { method: 'PATCH' });
        await refreshAll();
    }, [refreshAll]);

    const getAvailableVehicles = useCallback(() => {
        return vehicles.filter(v => v.status === 'Available');
    }, [vehicles]);

    // DRIVERS
    const addDriver = useCallback(async (d) => {
        const nd = await api('/drivers', { method: 'POST', body: d });
        await refreshAll();
        return nd;
    }, [refreshAll]);

    const updateDriver = useCallback(async (id, updates) => {
        if (updates.status && Object.keys(updates).length === 1) {
            await api(`/drivers/${id}/status`, { method: 'PATCH', body: { status: updates.status } });
        } else {
            await api(`/drivers/${id}`, { method: 'PUT', body: updates });
        }
        await refreshAll();
    }, [refreshAll]);

    const isDriverLicenseValid = useCallback((driver) => {
        return new Date(driver.licenseExpiry) > new Date();
    }, []);

    const getAvailableDrivers = useCallback(() => {
        return drivers.filter(d => d.status === 'Available' && isDriverLicenseValid(d));
    }, [drivers, isDriverLicenseValid]);

    // TRIPS
    const createTrip = useCallback(async (tripData) => {
        try {
            const result = await api('/trips', { method: 'POST', body: tripData });
            await refreshAll();
            return result;
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, [refreshAll]);

    const completeTrip = useCallback(async (tripId, finalOdometer) => {
        await api(`/trips/${tripId}/complete`, { method: 'PATCH', body: { finalOdometer } });
        await refreshAll();
    }, [refreshAll]);

    const cancelTrip = useCallback(async (tripId) => {
        await api(`/trips/${tripId}/cancel`, { method: 'PATCH' });
        await refreshAll();
    }, [refreshAll]);

    // MAINTENANCE
    const createMaintenance = useCallback(async (data) => {
        const entry = await api('/maintenance', { method: 'POST', body: data });
        await refreshAll();
        return entry;
    }, [refreshAll]);

    const completeMaintenance = useCallback(async (id) => {
        await api(`/maintenance/${id}/complete`, { method: 'PATCH' });
        await refreshAll();
    }, [refreshAll]);

    // EXPENSES
    const addExpense = useCallback(async (data) => {
        const entry = await api('/expenses', { method: 'POST', body: data });
        await refreshAll();
        return entry;
    }, [refreshAll]);

    // COMPUTED (client-side from loaded data)
    const getVehicleCosts = useCallback((vehicleId) => {
        const fuelCost = expenses.filter(e => e.vehicleId === vehicleId).reduce((s, e) => s + (Number(e.fuelExpense) || 0), 0);
        const maintCost = maintenance.filter(m => m.vehicleId === vehicleId).reduce((s, m) => s + (Number(m.cost) || 0), 0);
        const miscCost = expenses.filter(e => e.vehicleId === vehicleId).reduce((s, e) => s + (Number(e.miscExpense) || 0), 0);
        return { fuelCost, maintCost, miscCost, total: fuelCost + maintCost + miscCost };
    }, [expenses, maintenance]);

    const getVehicleRevenue = useCallback((vehicleId) => {
        return trips.filter(t => t.vehicleId === vehicleId && t.status === 'Completed').reduce((s, t) => s + (Number(t.fuelCost) || 0) * 1.5, 0);
    }, [trips]);

    const getDashboardKPIs = useCallback(() => {
        const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
        const maintenanceAlerts = vehicles.filter(v => v.status === 'In Shop').length;
        const totalActive = vehicles.filter(v => v.status !== 'Retired').length;
        const assigned = vehicles.filter(v => v.status === 'On Trip').length;
        const utilizationRate = totalActive > 0 ? Math.round((assigned / totalActive) * 100) : 0;
        const pendingCargo = trips.filter(t => t.status === 'Dispatched').length;
        return { activeFleet, maintenanceAlerts, utilizationRate, pendingCargo };
    }, [vehicles, trips]);

    const resetData = useCallback(() => { }, []);

    const value = {
        currentUser, login, logout, loaded,
        vehicles, addVehicle, updateVehicle, toggleVehicleRetired, getAvailableVehicles,
        drivers, addDriver, updateDriver, isDriverLicenseValid, getAvailableDrivers,
        trips, createTrip, completeTrip, cancelTrip,
        maintenance, createMaintenance, completeMaintenance,
        expenses, addExpense,
        getVehicleCosts, getVehicleRevenue, getDashboardKPIs, resetData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}

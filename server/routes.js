import { Router } from 'express';
import { getDB, saveDB } from './db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ═══════ HELPERS ═══════
function all(sql, params = []) { return getDB().exec(sql, params); }
function allRows(sql, params = []) {
    const stmt = getDB().prepare(sql);
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
}
function getOne(sql, params = []) {
    const stmt = getDB().prepare(sql);
    if (params.length) stmt.bind(params);
    const row = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return row;
}
function run(sql, params = []) {
    getDB().run(sql, params);
    saveDB();
}

// ═══════ AUTH ═══════
router.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = getOne('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (user) res.json({ success: true, user });
    else res.status(401).json({ success: false, error: 'Invalid email or password' });
});

// ═══════ VEHICLES ═══════
router.get('/vehicles', (req, res) => {
    res.json(allRows('SELECT * FROM vehicles ORDER BY createdAt DESC'));
});

router.post('/vehicles', (req, res) => {
    const { name, model, plate, type, maxCapacity, odometer, region, acquisitionCost } = req.body;
    const id = 'v' + uuidv4().slice(0, 8);
    run('INSERT INTO vehicles (id,name,model,plate,type,maxCapacity,odometer,status,region,acquisitionCost) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [id, name, model, plate, type, maxCapacity || 0, odometer || 0, 'Available', region || 'West', acquisitionCost || 0]);
    res.json(getOne('SELECT * FROM vehicles WHERE id = ?', [id]));
});

router.put('/vehicles/:id', (req, res) => {
    const { name, model, plate, type, maxCapacity, odometer, region, acquisitionCost, status } = req.body;
    run(`UPDATE vehicles SET name=?, model=?, plate=?, type=?, maxCapacity=?, odometer=?, region=?, acquisitionCost=?, status=COALESCE(?,status) WHERE id=?`,
        [name, model, plate, type, maxCapacity, odometer, region, acquisitionCost, status || null, req.params.id]);
    res.json(getOne('SELECT * FROM vehicles WHERE id = ?', [req.params.id]));
});

router.patch('/vehicles/:id/toggle-retired', (req, res) => {
    const v = getOne('SELECT status FROM vehicles WHERE id = ?', [req.params.id]);
    if (!v) return res.status(404).json({ error: 'Vehicle not found' });
    const newStatus = v.status === 'Retired' ? 'Available' : 'Retired';
    run('UPDATE vehicles SET status = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json(getOne('SELECT * FROM vehicles WHERE id = ?', [req.params.id]));
});

// ═══════ DRIVERS ═══════
router.get('/drivers', (req, res) => {
    res.json(allRows('SELECT * FROM drivers ORDER BY createdAt DESC'));
});

router.post('/drivers', (req, res) => {
    const { name, licenseNumber, licenseExpiry, licenseCategory } = req.body;
    const id = 'd' + uuidv4().slice(0, 8);
    run('INSERT INTO drivers (id,name,licenseNumber,licenseExpiry,licenseCategory,safetyScore,completionRate,status,complaints) VALUES (?,?,?,?,?,100,100,?,0)',
        [id, name, licenseNumber, licenseExpiry, licenseCategory, 'Available']);
    res.json(getOne('SELECT * FROM drivers WHERE id = ?', [id]));
});

router.put('/drivers/:id', (req, res) => {
    const { name, licenseNumber, licenseExpiry, licenseCategory, status } = req.body;
    run('UPDATE drivers SET name=?, licenseNumber=?, licenseExpiry=?, licenseCategory=?, status=COALESCE(?,status) WHERE id=?',
        [name, licenseNumber, licenseExpiry, licenseCategory, status || null, req.params.id]);
    res.json(getOne('SELECT * FROM drivers WHERE id = ?', [req.params.id]));
});

router.patch('/drivers/:id/status', (req, res) => {
    const { status } = req.body;
    run('UPDATE drivers SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json(getOne('SELECT * FROM drivers WHERE id = ?', [req.params.id]));
});

// ═══════ TRIPS ═══════
router.get('/trips', (req, res) => {
    res.json(allRows('SELECT * FROM trips ORDER BY createdAt DESC'));
});

router.post('/trips', (req, res) => {
    const { vehicleId, driverId, origin, destination, cargoWeight, estimatedFuelCost } = req.body;

    // Validations
    const vehicle = getOne('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);
    const driver = getOne('SELECT * FROM drivers WHERE id = ?', [driverId]);

    if (!vehicle) return res.status(400).json({ success: false, error: 'Vehicle not found' });
    if (!driver) return res.status(400).json({ success: false, error: 'Driver not found' });
    if (vehicle.status !== 'Available') return res.status(400).json({ success: false, error: 'Vehicle is not available' });
    if (driver.status !== 'Available') return res.status(400).json({ success: false, error: 'Driver is not available' });

    // License expiry check
    if (new Date(driver.licenseExpiry) <= new Date()) {
        return res.status(400).json({ success: false, error: 'Driver license has expired. Cannot assign.' });
    }

    // License category check
    if (!driver.licenseCategory.split(',').includes(vehicle.type)) {
        return res.status(400).json({ success: false, error: `Driver is not licensed for ${vehicle.type} category` });
    }

    // Cargo weight check
    if (Number(cargoWeight) > vehicle.maxCapacity) {
        return res.status(400).json({ success: false, error: `Too heavy! Cargo (${cargoWeight}kg) exceeds max capacity (${vehicle.maxCapacity}kg)` });
    }

    const id = 't' + uuidv4().slice(0, 8);
    const today = new Date().toISOString().split('T')[0];

    run('INSERT INTO trips (id,vehicleId,driverId,origin,destination,cargoWeight,status,fuelCost,estimatedFuelCost,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [id, vehicleId, driverId, origin, destination, cargoWeight, 'Dispatched', estimatedFuelCost || 0, estimatedFuelCost || 0, today]);

    // Update statuses
    run('UPDATE vehicles SET status = ? WHERE id = ?', ['On Trip', vehicleId]);
    run('UPDATE drivers SET status = ? WHERE id = ?', ['On Trip', driverId]);

    res.json({ success: true, trip: getOne('SELECT * FROM trips WHERE id = ?', [id]) });
});

router.patch('/trips/:id/complete', (req, res) => {
    const { finalOdometer } = req.body;
    const trip = getOne('SELECT * FROM trips WHERE id = ?', [req.params.id]);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const today = new Date().toISOString().split('T')[0];
    run('UPDATE trips SET status = ?, completedAt = ? WHERE id = ?', ['Completed', today, req.params.id]);

    if (finalOdometer) {
        run('UPDATE vehicles SET status = ?, odometer = ? WHERE id = ?', ['Available', finalOdometer, trip.vehicleId]);
    } else {
        run('UPDATE vehicles SET status = ? WHERE id = ?', ['Available', trip.vehicleId]);
    }

    // Update driver completion rate
    const totalTrips = allRows('SELECT COUNT(*) as cnt FROM trips WHERE driverId = ?', [trip.driverId])[0].cnt;
    const completedTrips = allRows("SELECT COUNT(*) as cnt FROM trips WHERE driverId = ? AND status = 'Completed'", [trip.driverId])[0].cnt;
    const rate = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 100;
    run('UPDATE drivers SET status = ?, completionRate = ? WHERE id = ?', ['Available', rate, trip.driverId]);

    res.json(getOne('SELECT * FROM trips WHERE id = ?', [req.params.id]));
});

router.patch('/trips/:id/cancel', (req, res) => {
    const trip = getOne('SELECT * FROM trips WHERE id = ?', [req.params.id]);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const today = new Date().toISOString().split('T')[0];
    run('UPDATE trips SET status = ?, completedAt = ? WHERE id = ?', ['Cancelled', today, req.params.id]);
    run('UPDATE vehicles SET status = ? WHERE id = ?', ['Available', trip.vehicleId]);
    run('UPDATE drivers SET status = ? WHERE id = ?', ['Available', trip.driverId]);

    res.json(getOne('SELECT * FROM trips WHERE id = ?', [req.params.id]));
});

// ═══════ MAINTENANCE ═══════
router.get('/maintenance', (req, res) => {
    res.json(allRows('SELECT * FROM maintenance'));
});

router.post('/maintenance', (req, res) => {
    const { vehicleId, issue, cost, date } = req.body;
    const id = 'm' + uuidv4().slice(0, 8);
    run('INSERT INTO maintenance (id,vehicleId,issue,cost,date,status) VALUES (?,?,?,?,?,?)',
        [id, vehicleId, issue, cost || 0, date, 'In Progress']);
    // Auto-set vehicle to In Shop
    run('UPDATE vehicles SET status = ? WHERE id = ?', ['In Shop', vehicleId]);
    res.json(getOne('SELECT * FROM maintenance WHERE id = ?', [id]));
});

router.patch('/maintenance/:id/complete', (req, res) => {
    const entry = getOne('SELECT * FROM maintenance WHERE id = ?', [req.params.id]);
    if (!entry) return res.status(404).json({ error: 'Maintenance record not found' });
    run('UPDATE maintenance SET status = ? WHERE id = ?', ['Completed', req.params.id]);
    run('UPDATE vehicles SET status = ? WHERE id = ?', ['Available', entry.vehicleId]);
    res.json(getOne('SELECT * FROM maintenance WHERE id = ?', [req.params.id]));
});

// ═══════ EXPENSES ═══════
router.get('/expenses', (req, res) => {
    res.json(allRows('SELECT * FROM expenses'));
});

router.post('/expenses', (req, res) => {
    const { tripId, driverId, vehicleId, distance, fuelExpense, miscExpense, status } = req.body;
    const id = 'e' + uuidv4().slice(0, 8);
    run('INSERT INTO expenses (id,tripId,driverId,vehicleId,distance,fuelExpense,miscExpense,status) VALUES (?,?,?,?,?,?,?,?)',
        [id, tripId, driverId, vehicleId, distance || 0, fuelExpense || 0, miscExpense || 0, status || 'Pending']);
    res.json(getOne('SELECT * FROM expenses WHERE id = ?', [id]));
});

// ═══════ ANALYTICS / DASHBOARD ═══════
router.get('/dashboard/kpis', (req, res) => {
    const activeFleet = allRows("SELECT COUNT(*) as cnt FROM vehicles WHERE status = 'On Trip'")[0].cnt;
    const maintenanceAlerts = allRows("SELECT COUNT(*) as cnt FROM vehicles WHERE status = 'In Shop'")[0].cnt;
    const totalActive = allRows("SELECT COUNT(*) as cnt FROM vehicles WHERE status != 'Retired'")[0].cnt;
    const utilizationRate = totalActive > 0 ? Math.round((activeFleet / totalActive) * 100) : 0;
    const pendingCargo = allRows("SELECT COUNT(*) as cnt FROM trips WHERE status = 'Dispatched'")[0].cnt;
    res.json({ activeFleet, maintenanceAlerts, utilizationRate, pendingCargo });
});

router.get('/analytics/vehicle-costs', (req, res) => {
    const vehicles = allRows("SELECT * FROM vehicles WHERE status != 'Retired'");
    const result = vehicles.map(v => {
        const fuelRow = allRows('SELECT COALESCE(SUM(fuelExpense),0) as total FROM expenses WHERE vehicleId = ?', [v.id]);
        const maintRow = allRows('SELECT COALESCE(SUM(cost),0) as total FROM maintenance WHERE vehicleId = ?', [v.id]);
        const miscRow = allRows('SELECT COALESCE(SUM(miscExpense),0) as total FROM expenses WHERE vehicleId = ?', [v.id]);
        const revRow = allRows("SELECT COALESCE(SUM(fuelCost * 1.5),0) as total FROM trips WHERE vehicleId = ? AND status = 'Completed'", [v.id]);
        const distRow = allRows('SELECT COALESCE(SUM(distance),0) as total FROM expenses WHERE vehicleId = ?', [v.id]);

        const fuelCost = fuelRow[0].total;
        const maintCost = maintRow[0].total;
        const miscCost = miscRow[0].total;
        const totalCost = fuelCost + maintCost + miscCost;
        const revenue = revRow[0].total;
        const totalDist = distRow[0].total;
        const fuelEff = totalDist > 0 && fuelCost > 0 ? (totalDist / (fuelCost / 80)).toFixed(1) : 'N/A';
        const roi = v.acquisitionCost > 0 ? (((revenue - totalCost) / v.acquisitionCost) * 100).toFixed(1) : 'N/A';
        const costPerKm = totalDist > 0 ? (totalCost / totalDist).toFixed(1) : 'N/A';

        return { ...v, fuelCost, maintCost, miscCost, total: totalCost, revenue, totalDist, fuelEff, roi, costPerKm };
    });
    res.json(result);
});

export default router;

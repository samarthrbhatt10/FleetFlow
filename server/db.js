import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'fleetflow.db');

let db;

export async function initDB() {
    const SQL = await initSqlJs();

    if (existsSync(DB_PATH)) {
        const buf = readFileSync(DB_PATH);
        db = new SQL.Database(buf);
    } else {
        db = new SQL.Database();
        createTables();
        seedData();
        saveDB();
    }
    return db;
}

export function getDB() {
    return db;
}

export function saveDB() {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
}

function createTables() {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL
    );
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      model TEXT NOT NULL,
      plate TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('Truck','Van','Bike')),
      maxCapacity INTEGER NOT NULL,
      odometer INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Available' CHECK(status IN ('Available','On Trip','In Shop','Retired')),
      region TEXT DEFAULT 'West',
      acquisitionCost REAL DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      licenseNumber TEXT UNIQUE NOT NULL,
      licenseExpiry TEXT NOT NULL,
      licenseCategory TEXT NOT NULL,
      safetyScore INTEGER DEFAULT 100,
      completionRate INTEGER DEFAULT 100,
      status TEXT DEFAULT 'Available' CHECK(status IN ('Available','On Trip','On Duty','Off Duty','Suspended')),
      complaints INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      vehicleId TEXT NOT NULL,
      driverId TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      cargoWeight REAL NOT NULL,
      status TEXT DEFAULT 'Dispatched' CHECK(status IN ('Draft','Dispatched','Completed','Cancelled')),
      fuelCost REAL DEFAULT 0,
      estimatedFuelCost REAL DEFAULT 0,
      createdAt TEXT DEFAULT (date('now')),
      completedAt TEXT,
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
      FOREIGN KEY (driverId) REFERENCES drivers(id)
    );
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS maintenance (
      id TEXT PRIMARY KEY,
      vehicleId TEXT NOT NULL,
      issue TEXT NOT NULL,
      cost REAL DEFAULT 0,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'In Progress' CHECK(status IN ('In Progress','Completed')),
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id)
    );
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      tripId TEXT NOT NULL,
      driverId TEXT NOT NULL,
      vehicleId TEXT NOT NULL,
      distance REAL DEFAULT 0,
      fuelExpense REAL DEFAULT 0,
      miscExpense REAL DEFAULT 0,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','Done')),
      FOREIGN KEY (tripId) REFERENCES trips(id),
      FOREIGN KEY (driverId) REFERENCES drivers(id),
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id)
    );
  `);
}

function seedData() {
    // Users
    const users = [
        ['u1', 'manager@fleetflow.com', 'admin123', 'manager', 'Sarah Chen'],
        ['u2', 'dispatch@fleetflow.com', 'admin123', 'dispatcher', 'Mike Torres'],
        ['u3', 'safety@fleetflow.com', 'admin123', 'safety', 'Rachel Kumar'],
        ['u4', 'finance@fleetflow.com', 'admin123', 'analyst', 'David Park'],
    ];
    const insUser = db.prepare('INSERT INTO users (id,email,password,role,name) VALUES (?,?,?,?,?)');
    users.forEach(u => insUser.run(u));
    insUser.free();

    // Vehicles
    const vehicles = [
        ['v1', 'Hauler Prime', 'Volvo FH16', 'MH-01-AB-1234', 'Truck', 8000, 45200, 'Available', 'West', 3500000],
        ['v2', 'City Runner', 'Tata Ace', 'MH-02-CD-5678', 'Van', 1000, 32100, 'On Trip', 'West', 800000],
        ['v3', 'Swift Cargo', 'Ashok Leyland', 'DL-03-EF-9012', 'Truck', 12000, 78500, 'In Shop', 'North', 4200000],
        ['v4', 'Metro Flash', 'Mahindra Bolero', 'KA-04-GH-3456', 'Van', 500, 15800, 'Available', 'South', 650000],
        ['v5', 'Express Bike', 'Bajaj RE', 'TN-05-IJ-7890', 'Bike', 150, 8900, 'Available', 'South', 250000],
        ['v6', 'Titan Hauler', 'BharatBenz 1617', 'GJ-06-KL-2345', 'Truck', 10000, 92300, 'Retired', 'West', 3800000],
    ];
    const insV = db.prepare('INSERT INTO vehicles (id,name,model,plate,type,maxCapacity,odometer,status,region,acquisitionCost) VALUES (?,?,?,?,?,?,?,?,?,?)');
    vehicles.forEach(v => insV.run(v));
    insV.free();

    // Drivers
    const drivers = [
        ['d1', 'Alex Sharma', 'DL-2023-45678', '2027-06-15', 'Truck,Van', 94, 98, 'On Trip', 1],
        ['d2', 'Priya Patel', 'DL-2022-78901', '2026-12-01', 'Van,Bike', 88, 95, 'Available', 3],
        ['d3', 'Raj Verma', 'DL-2021-12345', '2025-03-20', 'Truck,Van,Bike', 72, 85, 'Available', 7],
        ['d4', 'Nisha Gupta', 'DL-2024-56789', '2028-09-30', 'Van,Bike', 97, 100, 'Off Duty', 0],
    ];
    const insD = db.prepare('INSERT INTO drivers (id,name,licenseNumber,licenseExpiry,licenseCategory,safetyScore,completionRate,status,complaints) VALUES (?,?,?,?,?,?,?,?,?)');
    drivers.forEach(d => insD.run(d));
    insD.free();

    // Trips
    const trips = [
        ['t1', 'v2', 'd1', 'Mumbai', 'Pune', 800, 'Dispatched', 3500, 3000, '2026-02-18', null],
        ['t2', 'v1', 'd2', 'Delhi', 'Jaipur', 5000, 'Completed', 8500, 8000, '2026-02-10', '2026-02-12'],
        ['t3', 'v4', 'd3', 'Bangalore', 'Chennai', 350, 'Completed', 4200, 4000, '2026-02-05', '2026-02-06'],
        ['t4', 'v5', 'd4', 'Hyderabad', 'Vijayawada', 100, 'Completed', 1800, 1500, '2026-01-28', '2026-01-29'],
        ['t5', 'v1', 'd3', 'Ahmedabad', 'Surat', 6000, 'Cancelled', 0, 5000, '2026-02-15', null],
    ];
    const insT = db.prepare('INSERT INTO trips (id,vehicleId,driverId,origin,destination,cargoWeight,status,fuelCost,estimatedFuelCost,createdAt,completedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
    trips.forEach(t => insT.run(t));
    insT.free();

    // Maintenance
    const maint = [
        ['m1', 'v3', 'Engine Overhaul', 45000, '2026-02-19', 'In Progress'],
        ['m2', 'v1', 'Oil Change & Filter', 3500, '2026-02-08', 'Completed'],
        ['m3', 'v6', 'Brake Pad Replacement', 12000, '2026-01-20', 'Completed'],
    ];
    const insM = db.prepare('INSERT INTO maintenance (id,vehicleId,issue,cost,date,status) VALUES (?,?,?,?,?,?)');
    maint.forEach(m => insM.run(m));
    insM.free();

    // Expenses
    const expenses = [
        ['e1', 't2', 'd2', 'v1', 280, 8500, 1200, 'Done'],
        ['e2', 't3', 'd3', 'v4', 350, 4200, 500, 'Done'],
        ['e3', 't4', 'd4', 'v5', 275, 1800, 300, 'Done'],
        ['e4', 't1', 'd1', 'v2', 150, 3500, 800, 'Pending'],
    ];
    const insE = db.prepare('INSERT INTO expenses (id,tripId,driverId,vehicleId,distance,fuelExpense,miscExpense,status) VALUES (?,?,?,?,?,?,?,?)');
    expenses.forEach(e => insE.run(e));
    insE.free();
}

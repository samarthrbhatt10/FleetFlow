export const seedUsers = [
  { id: 'u1', email: 'manager@fleetflow.com', password: 'admin123', role: 'manager', name: 'Sarah Chen' },
  { id: 'u2', email: 'dispatch@fleetflow.com', password: 'admin123', role: 'dispatcher', name: 'Mike Torres' },
  { id: 'u3', email: 'safety@fleetflow.com', password: 'admin123', role: 'safety', name: 'Rachel Kumar' },
  { id: 'u4', email: 'finance@fleetflow.com', password: 'admin123', role: 'analyst', name: 'David Park' },
];

export const seedVehicles = [
  { id: 'v1', name: 'Hauler Prime', model: 'Volvo FH16', plate: 'MH-01-AB-1234', type: 'Truck', maxCapacity: 8000, odometer: 45200, status: 'Available', region: 'West', acquisitionCost: 3500000 },
  { id: 'v2', name: 'City Runner', model: 'Tata Ace', plate: 'MH-02-CD-5678', type: 'Van', maxCapacity: 1000, odometer: 32100, status: 'On Trip', region: 'West', acquisitionCost: 800000 },
  { id: 'v3', name: 'Swift Cargo', model: 'Ashok Leyland', plate: 'DL-03-EF-9012', type: 'Truck', maxCapacity: 12000, odometer: 78500, status: 'In Shop', region: 'North', acquisitionCost: 4200000 },
  { id: 'v4', name: 'Metro Flash', model: 'Mahindra Bolero', plate: 'KA-04-GH-3456', type: 'Van', maxCapacity: 500, odometer: 15800, status: 'Available', region: 'South', acquisitionCost: 650000 },
  { id: 'v5', name: 'Express Bike', model: 'Bajaj RE', plate: 'TN-05-IJ-7890', type: 'Bike', maxCapacity: 150, odometer: 8900, status: 'Available', region: 'South', acquisitionCost: 250000 },
  { id: 'v6', name: 'Titan Hauler', model: 'BharatBenz 1617', plate: 'GJ-06-KL-2345', type: 'Truck', maxCapacity: 10000, odometer: 92300, status: 'Retired', region: 'West', acquisitionCost: 3800000 },
];

export const seedDrivers = [
  { id: 'd1', name: 'Alex Sharma', licenseNumber: 'DL-2023-45678', licenseExpiry: '2027-06-15', licenseCategory: 'Truck,Van', safetyScore: 94, completionRate: 98, status: 'On Trip', complaints: 1 },
  { id: 'd2', name: 'Priya Patel', licenseNumber: 'DL-2022-78901', licenseExpiry: '2026-12-01', licenseCategory: 'Van,Bike', safetyScore: 88, completionRate: 95, status: 'Available', complaints: 3 },
  { id: 'd3', name: 'Raj Verma', licenseNumber: 'DL-2021-12345', licenseExpiry: '2025-03-20', licenseCategory: 'Truck,Van,Bike', safetyScore: 72, completionRate: 85, status: 'Available', complaints: 7 },
  { id: 'd4', name: 'Nisha Gupta', licenseNumber: 'DL-2024-56789', licenseExpiry: '2028-09-30', licenseCategory: 'Van,Bike', safetyScore: 97, completionRate: 100, status: 'Off Duty', complaints: 0 },
];

export const seedTrips = [
  { id: 't1', vehicleId: 'v2', driverId: 'd1', origin: 'Mumbai', destination: 'Pune', cargoWeight: 800, status: 'Dispatched', fuelCost: 3500, estimatedFuelCost: 3000, createdAt: '2026-02-18', completedAt: null },
  { id: 't2', vehicleId: 'v1', driverId: 'd2', origin: 'Delhi', destination: 'Jaipur', cargoWeight: 5000, status: 'Completed', fuelCost: 8500, estimatedFuelCost: 8000, createdAt: '2026-02-10', completedAt: '2026-02-12' },
  { id: 't3', vehicleId: 'v4', driverId: 'd3', origin: 'Bangalore', destination: 'Chennai', cargoWeight: 350, status: 'Completed', fuelCost: 4200, estimatedFuelCost: 4000, createdAt: '2026-02-05', completedAt: '2026-02-06' },
  { id: 't4', vehicleId: 'v5', driverId: 'd4', origin: 'Hyderabad', destination: 'Vijayawada', cargoWeight: 100, status: 'Completed', fuelCost: 1800, estimatedFuelCost: 1500, createdAt: '2026-01-28', completedAt: '2026-01-29' },
  { id: 't5', vehicleId: 'v1', driverId: 'd3', origin: 'Ahmedabad', destination: 'Surat', cargoWeight: 6000, status: 'Cancelled', fuelCost: 0, estimatedFuelCost: 5000, createdAt: '2026-02-15', completedAt: null },
];

export const seedMaintenance = [
  { id: 'm1', vehicleId: 'v3', issue: 'Engine Overhaul', cost: 45000, date: '2026-02-19', status: 'In Progress' },
  { id: 'm2', vehicleId: 'v1', issue: 'Oil Change & Filter', cost: 3500, date: '2026-02-08', status: 'Completed' },
  { id: 'm3', vehicleId: 'v6', issue: 'Brake Pad Replacement', cost: 12000, date: '2026-01-20', status: 'Completed' },
];

export const seedExpenses = [
  { id: 'e1', tripId: 't2', driverId: 'd2', vehicleId: 'v1', distance: 280, fuelExpense: 8500, miscExpense: 1200, status: 'Done' },
  { id: 'e2', tripId: 't3', driverId: 'd3', vehicleId: 'v4', distance: 350, fuelExpense: 4200, miscExpense: 500, status: 'Done' },
  { id: 'e3', tripId: 't4', driverId: 'd4', vehicleId: 'v5', distance: 275, fuelExpense: 1800, miscExpense: 300, status: 'Done' },
  { id: 'e4', tripId: 't1', driverId: 'd1', vehicleId: 'v2', distance: 150, fuelExpense: 3500, miscExpense: 800, status: 'Pending' },
];

-- SPYZIER Fleet Monitoring System - Seed Data
-- V2__seed_data.sql
-- Admin password: Admin@123 (BCrypt encoded)

INSERT INTO users (username, email, password, first_name, last_name, role, active, created_at, updated_at)
VALUES (
    'admin',
    'admin@spyzier.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6FbmW',
    'System',
    'Administrator',
    'ADMIN',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, email, password, first_name, last_name, role, active, created_at, updated_at)
VALUES (
    'manager1',
    'manager1@spyzier.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6FbmW',
    'Fleet',
    'Manager',
    'MANAGER',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, email, password, first_name, last_name, role, active, created_at, updated_at)
VALUES (
    'operator1',
    'operator1@spyzier.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6FbmW',
    'Fleet',
    'Operator',
    'OPERATOR',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- Sample vehicles
INSERT INTO vehicles (vehicle_id, name, type, make, model, year, license_plate, vin, status, tenant_id, latitude, longitude, fuel_level, engine_status, odometer, created_at, updated_at)
VALUES
    ('VH-001', 'Truck Alpha', 'TRUCK', 'Volvo', 'FH16', 2021, 'SPZ-001', '1HGCM82633A004352', 'ACTIVE', 'tenant-001', 40.7128, -74.0060, 85.5, 'RUNNING', 45230.5, NOW(), NOW()),
    ('VH-002', 'Van Beta', 'VAN', 'Mercedes', 'Sprinter', 2022, 'SPZ-002', '2T1BURHE0JC036478', 'ACTIVE', 'tenant-001', 40.7580, -73.9855, 72.3, 'RUNNING', 18750.0, NOW(), NOW()),
    ('VH-003', 'Car Gamma', 'CAR', 'Toyota', 'Camry', 2023, 'SPZ-003', '3VWFE21C04M000001', 'INACTIVE', 'tenant-001', 40.6892, -74.0445, 60.0, 'OFF', 5200.0, NOW(), NOW()),
    ('VH-004', 'Heavy Mach Delta', 'HEAVY_MACHINERY', 'Caterpillar', '390F', 2020, 'SPZ-004', '4T1BF3EK9AU115520', 'MAINTENANCE', 'tenant-001', 40.7282, -73.7949, 45.0, 'OFF', 12000.0, NOW(), NOW()),
    ('VH-005', 'Motorcycle Epsilon', 'MOTORCYCLE', 'Honda', 'CB500F', 2022, 'SPZ-005', '5YJSA1DN5CFP01657', 'ACTIVE', 'tenant-002', 40.7484, -73.9967, 95.0, 'RUNNING', 3200.0, NOW(), NOW())
ON CONFLICT (vehicle_id) DO NOTHING;

-- Sample drivers
INSERT INTO drivers (employee_id, first_name, last_name, license_number, license_expiry, phone, email, status, vehicle_id, tenant_id, created_at, updated_at)
VALUES
    ('EMP-001', 'John', 'Doe', 'DL123456', '2026-12-31', '+1-555-0101', 'john.doe@spyzier.com', 'ON_DUTY', 1, 'tenant-001', NOW(), NOW()),
    ('EMP-002', 'Jane', 'Smith', 'DL789012', '2025-06-30', '+1-555-0102', 'jane.smith@spyzier.com', 'ON_DUTY', 2, 'tenant-001', NOW(), NOW()),
    ('EMP-003', 'Bob', 'Johnson', 'DL345678', '2027-03-15', '+1-555-0103', 'bob.johnson@spyzier.com', 'AVAILABLE', NULL, 'tenant-001', NOW(), NOW()),
    ('EMP-004', 'Alice', 'Williams', 'DL901234', '2026-09-20', '+1-555-0104', 'alice.williams@spyzier.com', 'OFF_DUTY', NULL, 'tenant-002', NOW(), NOW())
ON CONFLICT (employee_id) DO NOTHING;

-- Sample telemetry
INSERT INTO telemetry (vehicle_id, timestamp, latitude, longitude, speed, heading, altitude, fuel_level, engine_temp, oil_pressure, battery_voltage, rpm, odometer, ignition_status, engine_status)
VALUES
    ('VH-001', NOW() - INTERVAL '5 minutes', 40.7128, -74.0060, 65.5, 180.0, 10.0, 85.5, 90.2, 45.0, 12.6, 2200.0, 45230.5, TRUE, 'RUNNING'),
    ('VH-001', NOW() - INTERVAL '10 minutes', 40.7100, -74.0020, 70.2, 175.0, 10.0, 86.0, 89.8, 44.5, 12.7, 2350.0, 45228.3, TRUE, 'RUNNING'),
    ('VH-002', NOW() - INTERVAL '3 minutes', 40.7580, -73.9855, 45.0, 90.0, 8.0, 72.3, 88.5, 43.0, 12.5, 1800.0, 18750.0, TRUE, 'RUNNING'),
    ('VH-005', NOW() - INTERVAL '1 minute', 40.7484, -73.9967, 80.0, 45.0, 12.0, 95.0, 75.0, 40.0, 12.8, 4000.0, 3200.0, TRUE, 'RUNNING')
ON CONFLICT DO NOTHING;

-- Sample maintenance records
INSERT INTO maintenance_records (vehicle_id, type, description, scheduled_date, status, technician, mileage_at_service, notes, created_at, updated_at)
VALUES
    ('VH-001', 'PREVENTIVE', 'Oil change and filter replacement', CURRENT_DATE + INTERVAL '7 days', 'SCHEDULED', 'Mike Tech', 45000.0, 'Regular 10,000km service', NOW(), NOW()),
    ('VH-002', 'INSPECTION', 'Annual safety inspection', CURRENT_DATE + INTERVAL '15 days', 'SCHEDULED', 'Sarah Tech', 18000.0, 'Annual DOT inspection required', NOW(), NOW()),
    ('VH-004', 'CORRECTIVE', 'Engine diagnostic and repair', CURRENT_DATE - INTERVAL '2 days', 'IN_PROGRESS', 'Tom Engineer', 12000.0, 'Check engine light on', NOW(), NOW()),
    ('VH-003', 'PREVENTIVE', 'Tire rotation and brake check', CURRENT_DATE - INTERVAL '10 days', 'COMPLETED', 'Mike Tech', 5000.0, 'Completed successfully', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Sample alerts
INSERT INTO alerts (vehicle_id, driver_id, type, severity, message, timestamp, acknowledged)
VALUES
    ('VH-001', 1, 'SPEEDING', 'HIGH', 'Vehicle VH-001 exceeded speed limit: 95 km/h in 80 km/h zone', NOW() - INTERVAL '30 minutes', FALSE),
    ('VH-002', 2, 'LOW_FUEL', 'MEDIUM', 'Vehicle VH-002 fuel level below 30%: current level 28%', NOW() - INTERVAL '1 hour', FALSE),
    ('VH-004', NULL, 'ENGINE_FAULT', 'CRITICAL', 'Vehicle VH-004 engine fault detected - check engine light', NOW() - INTERVAL '2 days', TRUE),
    ('VH-003', NULL, 'MAINTENANCE_DUE', 'LOW', 'Vehicle VH-003 scheduled maintenance overdue by 5 days', NOW() - INTERVAL '5 days', TRUE)
ON CONFLICT DO NOTHING;

-- Sample geofences
INSERT INTO geofences (name, description, tenant_id, type, center_latitude, center_longitude, radius, active, alert_on_entry, alert_on_exit, created_at)
VALUES
    ('New York Depot', 'Main vehicle depot in New York', 'tenant-001', 'CIRCLE', 40.7128, -74.0060, 500.0, TRUE, TRUE, TRUE, NOW()),
    ('Manhattan Zone', 'Restricted Manhattan operating zone', 'tenant-001', 'CIRCLE', 40.7831, -73.9712, 5000.0, TRUE, FALSE, TRUE, NOW()),
    ('Warehouse District', 'Warehouse and logistics zone', 'tenant-002', 'CIRCLE', 40.7580, -73.9855, 1000.0, TRUE, TRUE, TRUE, NOW())
ON CONFLICT DO NOTHING;

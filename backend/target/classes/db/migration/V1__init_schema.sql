-- SPYZIER Fleet Monitoring System - Initial Schema
-- V1__init_schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'VIEWER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    license_plate VARCHAR(20),
    vin VARCHAR(17),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    current_driver_id BIGINT,
    tenant_id VARCHAR(50),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    last_location_update TIMESTAMP,
    fuel_level DOUBLE PRECISION,
    engine_status VARCHAR(20),
    odometer DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_id ON vehicles(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant_id ON vehicles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    license_expiry DATE,
    phone VARCHAR(20),
    email VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    vehicle_id BIGINT,
    tenant_id VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drivers_employee_id ON drivers(employee_id);
CREATE INDEX IF NOT EXISTS idx_drivers_tenant_id ON drivers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);

-- Telemetry table
CREATE TABLE IF NOT EXISTS telemetry (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    altitude DOUBLE PRECISION,
    fuel_level DOUBLE PRECISION,
    engine_temp DOUBLE PRECISION,
    oil_pressure DOUBLE PRECISION,
    battery_voltage DOUBLE PRECISION,
    rpm DOUBLE PRECISION,
    odometer DOUBLE PRECISION,
    ignition_status BOOLEAN,
    engine_status VARCHAR(20),
    raw_data TEXT
);

CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle_id_timestamp ON telemetry(vehicle_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle_id ON telemetry(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp DESC);

-- Maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT,
    scheduled_date DATE,
    completed_date DATE,
    cost NUMERIC(10, 2),
    technician VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    mileage_at_service DOUBLE PRECISION,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_id ON maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_scheduled_date ON maintenance_records(scheduled_date);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50),
    driver_id BIGINT,
    type VARCHAR(30) NOT NULL,
    severity VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

CREATE INDEX IF NOT EXISTS idx_alerts_vehicle_id ON alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);

-- GeoFences table
CREATE TABLE IF NOT EXISTS geofences (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    tenant_id VARCHAR(50),
    type VARCHAR(10) NOT NULL,
    center_latitude DOUBLE PRECISION,
    center_longitude DOUBLE PRECISION,
    radius DOUBLE PRECISION,
    polygon_coordinates TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    alert_on_entry BOOLEAN NOT NULL DEFAULT TRUE,
    alert_on_exit BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geofences_tenant_id ON geofences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_geofences_active ON geofences(active);

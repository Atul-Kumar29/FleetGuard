-- Database Schema for FleetGuard Predictive Maintenance

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Vehicles Table (Existing Table Representation)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin VARCHAR UNIQUE NOT NULL,
    license_plate VARCHAR UNIQUE NOT NULL,
    make VARCHAR,
    model VARCHAR,
    year INTEGER,
    type VARCHAR,
    status VARCHAR DEFAULT 'Active',
    current_mileage INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Maintenance Logs Table (New Table)
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    service_date DATE NOT NULL,
    service_mileage INTEGER NOT NULL,
    notes TEXT,
    mechanic_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for performance optimization on common query filters
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_vehicle_id ON maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_service_date ON maintenance_logs(service_date DESC);

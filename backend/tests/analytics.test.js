const request = require('supertest');
const app = require('../server');
const supabase = require('../config/supabase');

// Mock the Supabase client
jest.mock('../config/supabase', () => {
  const mockSelect = jest.fn();
  const mockFrom = jest.fn(() => ({
    select: mockSelect
  }));

  const mockClient = {
    from: mockFrom,
    auth: {
      getUser: jest.fn()
    }
  };

  return {
    from: mockFrom,
    supabase: mockClient,
    getSupabaseClient: () => mockClient,
    // Expose select for mock setup inside tests
    _mockSelect: mockSelect,
    _mockFrom: mockFrom
  };
});

describe('Fleet Analytics API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/admin/metrics - Successful calculations with database data', async () => {
    // Define mock data for the tables
    const mockVehicles = [
      { id: 'v1', current_mileage: 48000 },
      { id: 'v2', current_mileage: 22000 }
    ];

    const mockCompliance = [
      { vehicle_id: 'v1', status: 'ACTIVE', expiration_date: '2026-10-15' }, // Compliant
      { vehicle_id: 'v2', status: 'EXPIRED', expiration_date: '2026-05-10' }, // Expired document
      { vehicle_id: 'v2', status: 'ACTIVE', expiration_date: '2026-08-10' }  // Upcoming expiry (expires in ~12 days from July 28, 2026)
    ];

    const mockLogs = [
      { vehicle_id: 'v1', service_date: '2026-01-01', odometer_reading: 39000, cost: 1500.50 }, // distance = 9000 (MEDIUM)
      { vehicle_id: 'v2', service_date: '2026-02-15', odometer_reading: 10000, cost: 2500.00 },
      { vehicle_id: 'v2', service_date: '2026-03-15', odometer_reading: 11000, cost: 3000.00 }  // latest for v2, distance = 11000 (HIGH)
    ];

    // Mock select chain to resolve different data based on the table name parameter
    supabase._mockFrom.mockImplementation((table) => {
      let data = [];
      if (table === 'vehicles') data = mockVehicles;
      else if (table === 'compliance_items') data = mockCompliance;
      else if (table === 'service_logs') data = mockLogs;

      return {
        select: jest.fn().mockResolvedValue({ data, error: null })
      };
    });

    const response = await request(app)
      .get('/api/admin/metrics')
      .expect('Content-Type', /json/)
      .expect(200);

    const metrics = response.body;

    expect(metrics).toBeDefined();
    // 1. Total Vehicles: 2
    expect(metrics.totalVehicles).toBe(2);
    // 2. Compliant Vehicles: 1 (v1 is compliant, v2 is not because of expired doc c2)
    expect(metrics.compliantVehicles).toBe(1);
    // 3. Expired Documents: 1 (c2 status=EXPIRED and past date)
    expect(metrics.expiredVehicles).toBe(1);
    // 4. Upcoming Expiry Documents: 1 (c3 expiry date is 2026-08-10 which is within 30 days of July 29, 2026)
    expect(metrics.upcomingExpiryVehicles).toBe(1);
    // 5. Total Maintenance Cost: 1500.50 + 2500.00 + 3000.00 = 7000.50
    expect(metrics.totalMaintenanceCost).toBe(7000.50);
    // 6. High Risk Vehicles: 1 (v2 is HIGH, v1 is MEDIUM)
    expect(metrics.highRiskVehicles).toBe(1);
  });

  test('GET /api/admin/metrics - Database connection error returns 500 status', async () => {
    supabase._mockFrom.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ data: null, error: { message: 'Supabase connection timed out' } })
    }));

    const response = await request(app)
      .get('/api/admin/metrics')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('details', 'Database error while generating fleet analytics: Supabase connection timed out');
  });
});

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
    // Expose selectors for easy assertion configuration in test cases
    _mockSelect: mockSelect
  };
});

describe('Predictive Maintenance API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/admin/predictive-maintenance - Successful response with correct calculations', async () => {
    // Set up mock data
    const mockVehicles = [
      {
        id: 'uuid-1',
        license_plate: 'KA19AB1234',
        make: 'Tata',
        model: 'Prima',
        current_mileage: 48000,
        service_logs: [
          { odometer_reading: 39000, service_date: '2026-01-01' }
        ]
      },
      {
        id: 'uuid-2',
        license_plate: 'MH12CD5678',
        make: 'Mahindra',
        model: 'Blazo',
        current_mileage: 22000,
        service_logs: [
          { odometer_reading: 18000, service_date: '2026-02-15' },
          { odometer_reading: 10000, service_date: '2025-10-10' } // older log
        ]
      },
      {
        id: 'uuid-3',
        license_plate: 'DL01EF9012',
        make: 'Ashok Leyland',
        model: 'U-Truck',
        current_mileage: 15000,
        service_logs: [] // No service history
      },
      {
        id: 'uuid-4',
        license_plate: 'KA03GH3456',
        make: 'Volvo',
        model: 'FMX',
        current_mileage: 30000,
        service_logs: [
          { odometer_reading: 19000, service_date: '2026-03-01' } // distance = 11000 (HIGH)
        ]
      }
    ];

    // Configure the mock select function to resolve successfully
    supabase._mockSelect.mockResolvedValueOnce({
      data: mockVehicles,
      error: null
    });

    const response = await request(app)
      .get('/api/admin/predictive-maintenance')
      .expect('Content-Type', /json/)
      .expect(200);

    const data = response.body;

    expect(data).toHaveLength(4);

    // Verify Vehicle 1: 48000 - 39000 = 9000 -> MEDIUM
    const v1 = data.find(v => v.vehicleId === 'uuid-1');
    expect(v1).toBeDefined();
    expect(v1.distanceSinceLastService).toBe(9000);
    expect(v1.lastServiceMileage).toBe(39000);
    expect(v1.risk).toBe('MEDIUM');

    // Verify Vehicle 2: 22000 - 18000 (latest service) = 4000 -> LOW
    const v2 = data.find(v => v.vehicleId === 'uuid-2');
    expect(v2).toBeDefined();
    expect(v2.distanceSinceLastService).toBe(4000);
    expect(v2.lastServiceMileage).toBe(18000);
    expect(v2.risk).toBe('LOW');

    // Verify Vehicle 3: No history -> 15000 - 0 = 15000 -> HIGH
    const v3 = data.find(v => v.vehicleId === 'uuid-3');
    expect(v3).toBeDefined();
    expect(v3.distanceSinceLastService).toBe(15000);
    expect(v3.lastServiceMileage).toBe(0);
    expect(v3.risk).toBe('HIGH');

    // Verify Vehicle 4: 30000 - 19000 = 11000 -> HIGH
    const v4 = data.find(v => v.vehicleId === 'uuid-4');
    expect(v4).toBeDefined();
    expect(v4.distanceSinceLastService).toBe(11000);
    expect(v4.lastServiceMileage).toBe(19000);
    expect(v4.risk).toBe('HIGH');
  });

  test('GET /api/admin/predictive-maintenance - Database error returns 500 status', async () => {
    supabase._mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database connection failed' }
    });

    const response = await request(app)
      .get('/api/admin/predictive-maintenance')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('details', 'Database error while fetching predictive risk: Database connection failed');
  });
});

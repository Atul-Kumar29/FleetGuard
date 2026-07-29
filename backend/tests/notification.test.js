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
    _mockSelect: mockSelect
  };
});

describe('Notifications API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/admin/notifications - Successful response with correct calculations, weights, and sorting', async () => {
    const todayStr = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())).toISOString().split('T')[0];
    
    // Mock Compliance items (1 expired, 1 expiring in 3 days, 1 valid)
    const mockComplianceData = [
      {
        id: 'comp-1',
        vehicle_id: 'v-1',
        document_type: 'INSURANCE',
        expiration_date: '2020-01-01' // Expired (CRITICAL)
      },
      {
        id: 'comp-2',
        vehicle_id: 'v-2',
        document_type: 'SAFETY_INSPECTION',
        expiration_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Expiring in 3 days (WARNING)
      },
      {
        id: 'comp-3',
        vehicle_id: 'v-3',
        document_type: 'EMISSIONS',
        expiration_date: '2030-12-31' // Valid (No notification)
      }
    ];

    // Mock Vehicles (1 overdue by date, 1 overdue by mileage, 1 healthy)
    const mockVehiclesData = [
      {
        id: 'v-1',
        current_mileage: 1000,
        next_service_due_date: '2020-01-01', // Overdue (WARNING)
        next_service_due_mileage: 5000
      },
      {
        id: 'v-2',
        current_mileage: 12000,
        next_service_due_date: '2030-12-31',
        next_service_due_mileage: 10000 // Overdue mileage (WARNING)
      },
      {
        id: 'v-3',
        current_mileage: 2000,
        next_service_due_date: '2030-12-31',
        next_service_due_mileage: 5000
      }
    ];

    // Mock Assignment overrides (1 event -> INFO)
    const mockOverridesData = [
      {
        id: 'over-1',
        vehicle_id: 'v-1',
        driver_id: 'd-1',
        approved_by: 'm-1',
        justification: 'Emergency assignment',
        created_at: '2026-07-29T10:00:00Z'
      }
    ];

    // Setup mocking filters chain
    supabase._mockSelect.mockImplementation(function() {
      // Find which table is queried based on mock calls
      const lastTable = supabase.from.mock.calls[supabase.from.mock.calls.length - 1][0];
      let resData = [];
      if (lastTable === 'compliance_items') resData = mockComplianceData;
      else if (lastTable === 'vehicles') resData = mockVehiclesData;
      else if (lastTable === 'assignment_overrides') resData = mockOverridesData;

      return {
        order: jest.fn().mockResolvedValue({ data: resData, error: null }),
        then: function(resolve) {
          resolve({ data: resData, error: null });
        }
      };
    });

    const response = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', 'Bearer token_4'); // Admin Demo Token

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(5); // 1 Critical, 3 Warnings, 1 Info

    const data = response.body.data;
    
    // Check sorting precedence (CRITICAL > WARNING > INFO)
    expect(data[0].severity).toBe('CRITICAL'); // Expiry of INSURANCE
    expect(data[1].severity).toBe('WARNING');
    expect(data[2].severity).toBe('WARNING');
    expect(data[3].severity).toBe('WARNING');
    expect(data[4].severity).toBe('INFO'); // Override

    // Detail checks
    expect(data[0].title).toBe('Insurance Expired');
    expect(data[4].title).toBe('Assignment Override');
  });

  it('GET /api/admin/notifications - Unauthorized with invalid/missing token', async () => {
    const response = await request(app)
      .get('/api/admin/notifications');

    expect(response.status).toBe(401);
  });

  it('GET /api/admin/notifications - Forbidden for non-Admin', async () => {
    const response = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', 'Bearer token_2'); // Driver token

    expect(response.status).toBe(403);
  });
});

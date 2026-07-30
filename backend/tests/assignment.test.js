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

describe('Assignment Overrides Admin API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/admin/overrides - Successful response with sorted and formatted data (Admin)', async () => {
    const mockData = [
      {
        id: 'override-1',
        justification: 'Driver key lost, manual override needed',
        created_at: '2026-07-29T10:00:00Z',
        vehicle: {
          id: 'v-1',
          license_plate: 'PLATE-1',
          make: 'Toyota',
          model: 'Prius'
        },
        driver: {
          id: 'd-1',
          full_name: 'John Driver',
          email: 'driver@example.com'
        },
        manager: {
          id: 'm-1',
          full_name: 'Manager Smith',
          email: 'manager@example.com'
        }
      }
    ];

    // Configure the query chain mock
    const mockOrder = jest.fn().mockResolvedValue({
      data: mockData,
      error: null
    });

    const mockSelectChain = jest.fn().mockReturnValue({
      order: mockOrder
    });

    supabase._mockSelect.mockImplementation(mockSelectChain);

    const response = await request(app)
      .get('/api/admin/overrides')
      .set('Authorization', 'Bearer token_4'); // Admin Demo Token

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      count: 1,
      data: [
        {
          id: 'override-1',
          vehicle: {
            id: 'v-1',
            licensePlate: 'PLATE-1',
            make: 'Toyota',
            model: 'Prius'
          },
          driver: {
            id: 'd-1',
            fullName: 'John Driver',
            email: 'driver@example.com'
          },
          manager: {
            id: 'm-1',
            fullName: 'Manager Smith',
            email: 'manager@example.com'
          },
          overrideReason: 'Driver key lost, manual override needed',
          createdAt: '2026-07-29T10:00:00Z'
        }
      ]
    });

    expect(supabase.from).toHaveBeenCalledWith('assignment_overrides');
    expect(mockSelectChain).toHaveBeenCalled();
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('GET /api/admin/overrides - Database error returns 500 status', async () => {
    const mockOrder = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' }
    });

    const mockSelectChain = jest.fn().mockReturnValue({
      order: mockOrder
    });

    supabase._mockSelect.mockImplementation(mockSelectChain);

    const response = await request(app)
      .get('/api/admin/overrides')
      .set('Authorization', 'Bearer token_4');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: 'Database error while fetching assignment overrides: Database connection failed'
    });
  });

  it('GET /api/admin/overrides - Forbidden for non-Admin role', async () => {
    const response = await request(app)
      .get('/api/admin/overrides')
      .set('Authorization', 'Bearer token_2'); // Driver Demo Token

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'You do not have permission to perform this action.'
    });
  });

  it('GET /api/admin/overrides - Unauthorized with no credentials', async () => {
    const response = await request(app)
      .get('/api/admin/overrides');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Authentication token is required.'
    });
  });
});

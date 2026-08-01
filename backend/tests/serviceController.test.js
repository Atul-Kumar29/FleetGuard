jest.mock('../config/supabase', () => ({
  getSupabaseClient: () => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [{ id: '30000000-0000-0000-0000-000000000001', service_name: 'Oil Change' }],
        error: null,
      }),
    })),
  }),
}));

const serviceController = require('../controllers/serviceController');

describe('serviceController.getServiceTypes', () => {
  it('returns available service types from Supabase', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await serviceController.getServiceTypes(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: '30000000-0000-0000-0000-000000000001', service_name: 'Oil Change' }]);
  });
});

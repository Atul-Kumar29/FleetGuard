const test = require('node:test');
const assert = require('node:assert/strict');

const { createAssignment, overrideAssignment } = require('../controllers/assignmentController');
const { getDriverVehicle, submitPreTripChecklist } = require('../controllers/driverController');

// Helper to create mock req and res
function createMockReqRes(reqData = {}) {
  let statusCode = 200;
  let responseData = null;

  const req = {
    body: reqData.body || {},
    query: reqData.query || {},
    headers: reqData.headers || {}
  };

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    getStatusCode() {
      return statusCode;
    },
    getResponseData() {
      return responseData;
    }
  };

  return { req, res };
}

// -------------------------------------------------------------
// Endpoint #15: POST /api/assignments - Compliance-Gated Assignment
// -------------------------------------------------------------

test('Endpoint #15: POST /api/assignments - returns 400 when required fields are missing', async () => {
  const { req, res } = createMockReqRes({
    body: { vehicle_id: 'v123', assigned_by: 'manager1' } // missing driver_id
  });

  await createAssignment(req, res);

  assert.equal(res.getStatusCode(), 400);
  assert.equal(res.getResponseData().error, 'Missing required fields');
});

// -------------------------------------------------------------
// Endpoint #16: POST /api/assignments/override - Override Processing
// -------------------------------------------------------------

test('Endpoint #16: POST /api/assignments/override - returns 400 when manager justification is missing', async () => {
  const { req, res } = createMockReqRes({
    body: { driver_id: 'd1', vehicle_id: 'v1', assigned_by: 'm1' }
  });

  await overrideAssignment(req, res);

  assert.equal(res.getStatusCode(), 400);
  assert.equal(res.getResponseData().error, 'Missing required fields');
});

test('Endpoint #16: POST /api/assignments/override - returns 400 when manager justification < 10 characters', async () => {
  const { req, res } = createMockReqRes({
    body: {
      driver_id: 'd1',
      vehicle_id: 'v1',
      assigned_by: 'm1',
      justification: 'Too short' // 9 chars
    }
  });

  await overrideAssignment(req, res);

  assert.equal(res.getStatusCode(), 400);
  assert.equal(res.getResponseData().error, 'Invalid justification');
  assert.match(res.getResponseData().message, /at least 10 characters/);
});

// -------------------------------------------------------------
// Endpoint #17: GET /api/driver/vehicle - Vehicle Legal Status
// -------------------------------------------------------------

test('Endpoint #17: GET /api/driver/vehicle - returns 400 when driver_id is missing', async () => {
  const { req, res } = createMockReqRes({
    query: {},
    headers: {}
  });

  await getDriverVehicle(req, res);

  assert.equal(res.getStatusCode(), 400);
  assert.equal(res.getResponseData().error, 'Missing required fields');
});

// -------------------------------------------------------------
// Endpoint #18: POST /api/driver/pre-trip - Pre-Trip Checklist Submission
// -------------------------------------------------------------

test('Endpoint #18: POST /api/driver/pre-trip - returns 400 when driver_id or vehicle_id missing', async () => {
  const { req, res } = createMockReqRes({
    body: { driver_id: 'd1' } // missing vehicle_id
  });

  await submitPreTripChecklist(req, res);

  assert.equal(res.getStatusCode(), 400);
  assert.equal(res.getResponseData().error, 'Missing required fields');
});

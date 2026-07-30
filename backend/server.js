require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Route imports
const vehicleRoutes = require('./routes/vehicleRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const serviceRoutes = require('./routes/serviceRoutes'); 
const assignmentRoutes = require('./routes/assignmentRoutes');
const driverRoutes = require('./routes/driverRoutes');
const predictiveMaintenanceRoutes = require('./routes/predictiveMaintenance.routes');
const fleetAnalyticsRoutes = require('./routes/fleetAnalytics.routes');
const authRoutes = require('./routes/authRoutes');

// Compliance scheduler service
const { startComplianceMonitoring } = require('./services/complianceScheduler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', predictiveMaintenanceRoutes);
app.use('/api/admin', fleetAnalyticsRoutes);

// Catch-all route for unhandled endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// Start listening if not running in a test environment
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`FleetGuard backend listening on port ${port}`);

    if (process.env.COMPLIANCE_MONITOR_ENABLED !== 'false') {
      startComplianceMonitoring();
    }
  });
}

// Export app for test runner (supertest) testing compatibility
module.exports = app;

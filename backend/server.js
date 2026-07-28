const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(__dirname, './.env') });

const predictiveMaintenanceRoutes = require('./routes/predictiveMaintenance.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend connectivity
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Mount the predictive maintenance routes under /api/admin
app.use('/api/admin', predictiveMaintenanceRoutes);

// Catch-all route for unhandled endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// Listen on the port only if we are not running tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`FleetGuard Backend Server running on port ${PORT}`);
  });
}

// Export app for test runner testing
module.exports = app;

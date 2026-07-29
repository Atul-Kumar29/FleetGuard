require('dotenv').config();
const express = require('express');
const cors = require('cors');
const vehicleRoutes = require('./routes/vehicleRoutes');
const complianceRoutes = require('./routes/complianceRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/compliance', complianceRoutes);

app.listen(port, () => {
  console.log(`FleetGuard backend listening on port ${port}`);
});

module.exports = app;

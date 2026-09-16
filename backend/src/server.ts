import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import vehicleRoutes from './routes/vehicleRoutes.js';
import complianceRoutes from './routes/complianceRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import predictiveMaintenanceRoutes from './routes/predictiveMaintenance.routes.js';
import fleetAnalyticsRoutes from './routes/fleetAnalytics.routes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { startComplianceMonitoring } from './services/complianceScheduler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', predictiveMaintenanceRoutes);
app.use('/api/admin', fleetAnalyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', notificationRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`FleetGuard backend listening on port ${port}`);

    if (process.env.COMPLIANCE_MONITOR_ENABLED !== 'false') {
      startComplianceMonitoring();
    }
  });
}

export { app };
export default app;

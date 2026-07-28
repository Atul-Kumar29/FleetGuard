require('dotenv').config();
const express = require('express');
const cors = require('cors');

const serviceRoutes = require('./routes/serviceRoutes'); 

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/services', serviceRoutes);

app.listen(port, () => {
  console.log(`FleetGuard backend listening on port ${port}`);
});

module.exports = app;
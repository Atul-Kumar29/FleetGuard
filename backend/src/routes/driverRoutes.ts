const express = require("express");

const router = express.Router();

const {
    getDriverVehicle,
    submitPreTripChecklist,
    getDrivers
} = require("../controllers/driverController");

router.get("/list", getDrivers);
router.get("/vehicle", getDriverVehicle);
router.post("/pre-trip", submitPreTripChecklist);

module.exports = router;

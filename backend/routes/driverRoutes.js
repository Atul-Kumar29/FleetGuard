const express = require("express");

const router = express.Router();

const {
    getDriverVehicle,
    submitPreTripChecklist
} = require("../controllers/driverController");

router.get("/vehicle", getDriverVehicle);
router.post("/pre-trip", submitPreTripChecklist);

module.exports = router;

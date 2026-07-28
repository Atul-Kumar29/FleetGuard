const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/serviceController");

router.get("/queue", serviceController.getServiceQueue);
router.post("/complete", serviceController.completeService);
module.exports = router;
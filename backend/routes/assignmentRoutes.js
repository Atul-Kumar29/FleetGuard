const express = require("express");

const router = express.Router();

const {
    createAssignment,
    overrideAssignment,
    unassignDriver
} = require("../controllers/assignmentController");

router.post("/", createAssignment);
router.post("/override", overrideAssignment);
router.post("/unassign", unassignDriver);
router.delete("/unassign/:vehicleId", unassignDriver);
router.delete("/:vehicleId", unassignDriver);

module.exports = router;
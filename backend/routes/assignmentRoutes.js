const express = require("express");

const router = express.Router();

const {
    createAssignment,
    overrideAssignment
} = require("../controllers/assignmentController");


router.post("/", createAssignment);
router.post("/override", overrideAssignment);

module.exports = router;
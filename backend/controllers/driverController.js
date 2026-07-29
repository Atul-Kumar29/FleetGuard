

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.supabaseurl || "https://ovndedlpvibrugmaghyy.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || process.env.supabasekey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bmRlZGxwdmlicnVnbWFnaHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMDcxNDksImV4cCI6MjEwMDc4MzE0OX0.rqnpBck-NOIJpgeucM6lDwJj7zzzwfIV6gGwwSe17zM";

const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
        realtime: {
            transport: class DummyWebSocket {}
        }
    }
);

const getDriverVehicle = async (req, res) => {
    try {
        const driver_id = req.query.driver_id || req.headers["x-driver-id"] || req.headers["driver-id"];

        if (!driver_id) {
            return res.status(400).json({
                error: "Missing required fields",
                message: "driver_id is required as a query parameter (?driver_id=...) or header (x-driver-id)"
            });
        }

        // 1. Verify driver exists and is active
        const { data: driver, error: driverError } = await supabase
            .from("users")
            .select("id, role, status")
            .eq("id", driver_id)
            .single();

        if (driverError || !driver) {
            return res.status(404).json({
                error: "Driver not found"
            });
        }

        if (driver.role !== "DRIVER" || driver.status !== "ACTIVE") {
            return res.status(400).json({
                error: "Invalid driver",
                message: "The specified user is not an active driver"
            });
        }

        // 2. Fetch active assignment for driver
        const { data: assignment, error: assignmentError } = await supabase
            .from("assignments")
            .select("*")
            .eq("driver_id", driver_id)
            .eq("status", "ACTIVE")
            .maybeSingle();

        if (assignmentError) {
            console.error(assignmentError);

            return res.status(500).json({
                error: "Failed to fetch assignment details"
            });
        }

        if (!assignment) {
            return res.status(404).json({
                error: "No active assignment found",
                message: "This driver currently has no active vehicle assignment"
            });
        }

        // 3. Fetch vehicle details
        const { data: vehicle, error: vehicleError } = await supabase
            .from("vehicles")
            .select("*")
            .eq("id", assignment.vehicle_id)
            .single();

        if (vehicleError || !vehicle) {
            return res.status(404).json({
                error: "Assigned vehicle details not found"
            });
        }

        // 4. Fetch compliance items for vehicle
        const { data: complianceItems, error: complianceError } = await supabase
            .from("compliance_items")
            .select("*")
            .eq("vehicle_id", vehicle.id);

        if (complianceError) {
            console.error(complianceError);

            return res.status(500).json({
                error: "Failed to fetch vehicle compliance status"
            });
        }

        const formattedCompliance = (complianceItems || []).map((item) => {
            const isExpired = item.status === "EXPIRED" || new Date(item.expiration_date) < new Date();
            return {
                id: item.id,
                document_type: item.document_type,
                expiration_date: item.expiration_date,
                status: item.status,
                is_expired: isExpired
            };
        });

        const hasExpiredDoc = formattedCompliance.some((item) => item.is_expired);
        const isCompliant = !hasExpiredDoc;

        return res.status(200).json({
            driver: {
                id: driver.id,
                role: driver.role,
                status: driver.status
            },
            assignment: {
                id: assignment.id,
                assigned_at: assignment.created_at || assignment.assigned_at,
                assigned_by: assignment.assigned_by,
                status: assignment.status
            },
            vehicle: vehicle,
            is_compliant: isCompliant,
            compliance_items: formattedCompliance
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

const submitPreTripChecklist = async (req, res) => {
    try {
        const {
            driver_id,
            vehicle_id,
            status,
            passed,
            checklist_items,
            checks,
            notes,
            issues_reported
        } = req.body;

        if (!driver_id || !vehicle_id) {
            return res.status(400).json({
                error: "Missing required fields",
                message: "driver_id and vehicle_id are required"
            });
        }

        // 1. Verify driver exists and is active
        const { data: driver, error: driverError } = await supabase
            .from("users")
            .select("id, role, status")
            .eq("id", driver_id)
            .single();

        if (driverError || !driver) {
            return res.status(404).json({
                error: "Driver not found"
            });
        }

        if (driver.role !== "DRIVER" || driver.status !== "ACTIVE") {
            return res.status(400).json({
                error: "Invalid driver",
                message: "The specified user is not an active driver"
            });
        }

        // 2. Verify vehicle exists
        const { data: vehicle, error: vehicleError } = await supabase
            .from("vehicles")
            .select("id, status")
            .eq("id", vehicle_id)
            .single();

        if (vehicleError || !vehicle) {
            return res.status(404).json({
                error: "Vehicle not found"
            });
        }

        // 3. Determine pass/fail status
        const items = checklist_items || checks || {};
        let isPassed = true;

        if (typeof passed === "boolean") {
            isPassed = passed;
        } else if (typeof status === "string") {
            isPassed = status.toUpperCase() === "PASS";
        } else if (Array.isArray(items)) {
            isPassed = !items.some(item => (typeof item === "object" ? item.status === "FAIL" || item.passed === false : item === "FAIL"));
        } else if (typeof items === "object" && items !== null) {
            isPassed = !Object.values(items).some(val => val === "FAIL" || val === false);
        }

        const overallStatus = isPassed ? "PASS" : "FAIL";

        // 4. Record pre-trip checklist submission
        const recordData = {
            driver_id,
            vehicle_id,
            status: overallStatus,
            checklist_items: items,
            notes: notes || issues_reported || null,
            created_at: new Date().toISOString()
        };

        const { data: createdChecklist, error: insertError } = await supabase
            .from("pre_trip_checklists")
            .insert([recordData])
            .select()
            .single();

        if (insertError) {
            console.error("Supabase pre_trip_checklists table note:", insertError.message);
        }

        return res.status(201).json({
            message: "Pre-trip checklist submitted successfully",
            checklist: createdChecklist || recordData,
            overall_status: overallStatus,
            passed: isPassed
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

module.exports = {
    getDriverVehicle,
    submitPreTripChecklist
};

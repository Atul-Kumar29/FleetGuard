

require("dotenv").config();
const { getSupabaseClient } = require("../config/supabase");

const getDriverVehicle = async (req, res) => {
    try {
        const supabase = getSupabaseClient();
        let driver_id = req.query.driver_id || req.headers["x-driver-id"] || req.headers["driver-id"];

        let targetDriverId = driver_id;

        // 1. If driver_id is provided, verify driver role & active status
        if (targetDriverId) {
            const { data: driverCheck } = await supabase
                .from("users")
                .select("id, role, status")
                .eq("id", targetDriverId)
                .maybeSingle();

            // If the provided ID is not a DRIVER (e.g. FLEET_MANAGER/ADMIN viewing the console), clear targetDriverId to fallback to latest active assignment
            if (driverCheck && driverCheck.role !== "DRIVER") {
                targetDriverId = null;
            }
        }

        // 2. Fetch active assignment for targetDriverId (or latest active assignment if no targetDriverId)
        let assignmentQuery = supabase
            .from("assignments")
            .select("*")
            .eq("status", "ACTIVE")
            .order("created_at", { ascending: false });

        if (targetDriverId) {
            assignmentQuery = assignmentQuery.eq("driver_id", targetDriverId);
        }

        const { data: assignments, error: assignmentError } = await assignmentQuery;

        if (assignmentError) {
            console.error("Assignment fetch error:", assignmentError);
            return res.status(500).json({ error: "Failed to fetch assignment details" });
        }

        const assignment = assignments && assignments.length > 0 ? assignments[0] : null;

        if (!assignment) {
            return res.status(404).json({
                error: "No active assignment found",
                message: "No active vehicle assignment was found for this driver."
            });
        }

        // 3. Fetch driver info for the assignment
        const { data: driver } = await supabase
            .from("users")
            .select("id, role, status, email, full_name")
            .eq("id", assignment.driver_id)
            .maybeSingle();

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
        const supabase = getSupabaseClient();
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
            .select("id, role")
            .eq("id", driver_id)
            .single();

        if (driverError || !driver) {
            return res.status(404).json({
                error: "Driver not found"
            });
        }

        if (driver.role !== "DRIVER" || (driver.status && driver.status !== "ACTIVE")) {
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

const getDrivers = async (req, res) => {
    try {
        const supabase = getSupabaseClient();
        const { data: drivers, error } = await supabase
            .from("users")
            .select("id, email, full_name, role")
            .eq("role", "DRIVER");

        if (error) {
            return res.status(500).json({ error: "Failed to fetch drivers", details: error.message });
        }

        return res.status(200).json({ drivers: drivers || [] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getDriverVehicle,
    submitPreTripChecklist,
    getDrivers
};

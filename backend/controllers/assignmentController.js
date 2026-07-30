require("dotenv").config();
const { getSupabaseClient } = require("../config/supabase");

const createAssignment = async (req, res) => {
    try {
        const supabase = getSupabaseClient();
        const {
            driver_id,
            vehicle_id,
            assigned_by
        } = req.body;

        // 1. Check required fields
        if (!driver_id || !vehicle_id || !assigned_by) {
            return res.status(400).json({
                error: "Missing required fields",
                message: "driver_id, vehicle_id and assigned_by are required"
            });
        }


        const { data: driver, error: driverError } = await supabase
            .from("users")
            .select("id, role")
            .eq("id", driver_id)
            .single();

        if (driverError || !driver) {
            console.error("Driver fetch error:", driverError);
            return res.status(404).json({
                error: "Driver not found",
                details: driverError ? driverError.message : "No driver record found",
                code: driverError ? driverError.code : null
            });
        }


        if (
            driver.role !== "DRIVER" ||
            (driver.status && driver.status !== "ACTIVE")
        ) {
            return res.status(400).json({
                error: "Invalid driver",
                message: "The selected user is not an active driver"
            });
        }

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


        if (vehicle.status !== "ACTIVE") {
            return res.status(400).json({
                error: "Vehicle unavailable",
                message: "The vehicle is not active"
            });
        }


        const {
            data: complianceItems,
            error: complianceError
        } = await supabase
            .from("compliance_items")
            .select(
                "id, document_type, expiration_date, status"
            )
            .eq("vehicle_id", vehicle_id);

        if (complianceError) {
            console.error(complianceError);

            return res.status(500).json({
                error: "Compliance check failed"
            });
        }


        const expiredDocuments = complianceItems.filter(
            (item) =>
                item.status === "EXPIRED" ||
                new Date(item.expiration_date) < new Date()
        );


        if (expiredDocuments.length > 0) {
            return res.status(403).json({
                error: "Vehicle is not compliant",
                message:
                    "Vehicle cannot be assigned because one or more compliance documents have expired.",
                expired_documents: expiredDocuments.map((item) => ({
                    document_type: item.document_type,
                    expiration_date: item.expiration_date
                }))
            });
        }


        const {
            data: existingAssignment,
            error: existingAssignmentError
        } = await supabase
            .from("assignments")
            .select("id")
            .eq("vehicle_id", vehicle_id)
            .eq("status", "ACTIVE")
            .maybeSingle();

        if (existingAssignmentError) {
            console.error(existingAssignmentError);

            return res.status(500).json({
                error: "Unable to check existing assignment"
            });
        }

        if (existingAssignment) {
            return res.status(409).json({
                error: "Vehicle already assigned",
                message:
                    "This vehicle already has an active driver assignment."
            });
        }

        // 8. Create the assignment
        const {
            data: assignment,
            error: assignmentError
        } = await supabase
            .from("assignments")
            .insert({
                driver_id: driver_id,
                vehicle_id: vehicle_id,
                assigned_by: assigned_by,
                status: "ACTIVE"
            })
            .select()
            .single();


        if (assignmentError) {
            console.error(assignmentError);

            return res.status(500).json({
                error: "Assignment creation failed"
            });
        }


        return res.status(201).json({
            message: "Vehicle assigned successfully",
            assignment: assignment
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

const overrideAssignment = async (req, res) => {
    try {
        const supabase = getSupabaseClient();
        const {
            driver_id,
            vehicle_id,
            assigned_by,
            justification,
            justification_text,
            reason
        } = req.body;

        const managerJustification = justification || justification_text || reason;

        // 1. Check required fields
        if (!driver_id || !vehicle_id || !assigned_by || !managerJustification) {
            return res.status(400).json({
                error: "Missing required fields",
                message: "driver_id, vehicle_id, assigned_by and manager justification text are required"
            });
        }

        // 2. Validate manager justification length (>= 10 characters)
        if (typeof managerJustification !== "string" || managerJustification.trim().length < 10) {
            return res.status(400).json({
                error: "Invalid justification",
                message: "Manager justification text must be at least 10 characters long"
            });
        }

        // 3. Verify driver exists and is active
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

        if (
            driver.role !== "DRIVER" ||
            (driver.status && driver.status !== "ACTIVE")
        ) {
            return res.status(400).json({
                error: "Invalid driver",
                message: "The selected user is not an active driver"
            });
        }

        // 4. Verify vehicle exists and is active
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

        if (vehicle.status !== "ACTIVE") {
            return res.status(400).json({
                error: "Vehicle unavailable",
                message: "The vehicle is not active"
            });
        }

        // 5. Check existing active assignment
        const {
            data: existingAssignment,
            error: existingAssignmentError
        } = await supabase
            .from("assignments")
            .select("id")
            .eq("vehicle_id", vehicle_id)
            .eq("status", "ACTIVE")
            .maybeSingle();

        if (existingAssignmentError) {
            console.error(existingAssignmentError);

            return res.status(500).json({
                error: "Unable to check existing assignment"
            });
        }

        if (existingAssignment) {
            return res.status(409).json({
                error: "Vehicle already assigned",
                message: "This vehicle already has an active driver assignment."
            });
        }

        // 6. Create the override assignment (bypassing compliance checks)
        const {
            data: assignment,
            error: assignmentError
        } = await supabase
            .from("assignments")
            .insert({
                driver_id: driver_id,
                vehicle_id: vehicle_id,
                assigned_by: assigned_by,
                status: "ACTIVE"
            })
            .select()
            .single();

        if (assignmentError) {
            console.error(assignmentError);

            return res.status(500).json({
                error: "Assignment creation failed"
            });
        }

        return res.status(201).json({
            message: "Assignment override processed successfully",
            assignment: assignment,
            justification: managerJustification.trim()
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

module.exports = {
    createAssignment,
    overrideAssignment
};
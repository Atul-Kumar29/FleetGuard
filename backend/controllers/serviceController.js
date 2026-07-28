const { getSupabaseClient } = require("../config/supabase");
const supabase = getSupabaseClient();

exports.getServiceQueue = async (req, res) => {
    try {
        const {
            search = "",
            status = "all",
            sort = "due_date"
        } = req.query;

        const { data: vehicles, error } = await supabase
            .from("vehicles")
            .select(`
                id,
                license_plate,
                make,
                model,
                current_mileage,
                last_service_date,
                last_service_mileage,
                next_service_due_date,
                next_service_due_mileage,
                maintenance_risk,
                status
            `)
            .eq("status", "ACTIVE");

        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        const today = new Date().toISOString().split("T")[0];

        let serviceQueue = vehicles.map((vehicle) => {
            let queueStatus = "Scheduled";

            if (
                vehicle.next_service_due_date &&
                vehicle.next_service_due_date <= today
            ) {
                queueStatus = "Overdue";
            } else if (
                vehicle.next_service_due_mileage !== null &&
                vehicle.next_service_due_mileage !== undefined &&
                vehicle.current_mileage >= vehicle.next_service_due_mileage
            ) {
                queueStatus = "Due";
            }

            return {
                id: vehicle.id,
                licensePlate: vehicle.license_plate,
                vehicle: `${vehicle.make} ${vehicle.model}`,
                currentMileage: vehicle.current_mileage,
                lastServiceDate: vehicle.last_service_date,
                lastServiceMileage: vehicle.last_service_mileage,
                nextServiceDate: vehicle.next_service_due_date,
                nextServiceMileage: vehicle.next_service_due_mileage,
                maintenanceRisk: vehicle.maintenance_risk || "LOW",
                status: queueStatus
            };
        });

      
        if (search.trim()) {
            const keyword = search.toLowerCase();

            serviceQueue = serviceQueue.filter((vehicle) =>
                (vehicle.licensePlate || "").toLowerCase().includes(keyword) ||
                (vehicle.vehicle || "").toLowerCase().includes(keyword)
            );
        }

        if (status.toLowerCase() !== "all") {
            serviceQueue = serviceQueue.filter(
                (vehicle) =>
                    vehicle.status.toLowerCase() === status.toLowerCase()
            );
        }

       
        if (sort === "mileage") {
            serviceQueue.sort(
                (a, b) =>
                    (a.nextServiceMileage ?? Number.MAX_SAFE_INTEGER) -
                    (b.nextServiceMileage ?? Number.MAX_SAFE_INTEGER)
            );
        } else {
            serviceQueue.sort((a, b) =>
                (a.nextServiceDate || "9999-12-31").localeCompare(
                    b.nextServiceDate || "9999-12-31"
                )
            );
        }

        return res.status(200).json({
            success: true,
            count: serviceQueue.length,
            data: serviceQueue
        });

    } catch (err) {
        console.error("Service Queue Error:", err);

        return res.status(500).json({
            success: false,
            error: "Failed to fetch service queue."
        });
    }
};
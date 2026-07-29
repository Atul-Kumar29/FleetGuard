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

exports.completeService = async (req, res) => {
    try {
        const {
            vehicleId,
            serviceTypeId,
            serviceDate,
            odometerReading,
            serviceCenter,
            mechanicName,
            cost,
            notes,
            nextServiceDate,
            nextServiceKm
        } = req.body;

       
        if (
            !vehicleId ||
            !serviceTypeId ||
            !serviceDate ||
            odometerReading === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields."
            });
        }

      
        const { data: vehicle, error: vehicleError } = await supabase
            .from("vehicles")
            .select("*")
            .eq("id", vehicleId)
            .single();

        if (vehicleError || !vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found."
            });
        }

        
        // Debug logs to help trace why service type may not be found
        console.log('========== DEBUG ==========');
        console.log('Request Body:', req.body);
        console.log('Vehicle ID:', vehicleId);
        console.log('Service Type ID:', serviceTypeId);

        // Fetch and log all service types (id and service_name)
        const { data: allServiceTypes, error: allServiceTypesError } = await supabase
            .from("service_types")
            .select('id, service_name');
        console.log('All Service Types:', allServiceTypes, 'fetchError:', allServiceTypesError);

        const { data: serviceType, error: serviceTypeError } = await supabase
            .from("service_types")
            .select("*")
            .eq("id", serviceTypeId)
            .single();

        console.log('Matched Service Type:', serviceType);
        console.log('Service Type Error:', serviceTypeError);
        console.log('===========================');

        if (serviceTypeError || !serviceType) {
            return res.status(404).json({
                success: false,
                message: "Service type not found."
            });
        }

        const serviceLogData = {
            vehicle_id: vehicleId,
            service_type_id: serviceTypeId,
            service_date: serviceDate,
            odometer_reading: Number(odometerReading),
            service_center: serviceCenter,
            mechanic_name: mechanicName,
            cost: cost != null ? Number(cost) : null,
            notes,
            next_service_date: nextServiceDate,
            next_service_km: nextServiceKm != null ? Number(nextServiceKm) : null
        };

        console.log('========== SERVICE LOG DATA ==========', serviceLogData);

        const { error: logError } = await supabase
            .from("service_logs")
            .insert(serviceLogData);

        if (logError) {
            console.log('========== INSERT ERROR ==========', logError);
            return res.status(500).json({
                success: false,
                message: logError.message
            });
        }

        const vehicleUpdateData = {
            current_mileage: Number(odometerReading),
            last_service_date: serviceDate,
            last_service_mileage: Number(odometerReading),
            next_service_due_date: nextServiceDate,
            next_service_due_mileage: nextServiceKm != null ? Number(nextServiceKm) : null,
            maintenance_risk: "LOW"
        };

        console.log('========== VEHICLE UPDATE DATA ==========', vehicleUpdateData);

        const { error: updateError } = await supabase
            .from("vehicles")
            .update(vehicleUpdateData)
            .eq("id", vehicleId);

        if (updateError) {
            console.log('========== UPDATE ERROR ==========', updateError);
            return res.status(500).json({
                success: false,
                message: updateError.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "Service completed successfully."
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};



exports.getServiceHistory = async (req, res) => {
    try {
        const vehicleId = req.params.vehicleId;

    
        if (!vehicleId) {
            return res.status(400).json({
                success: false,
                message: "Vehicle ID is required."
            });
        }

  
        const { data: vehicle, error: vehicleError } = await supabase
            .from("vehicles")
            .select("id, license_plate, make, model")
            .eq("id", vehicleId)
            .single();

        if (vehicleError || !vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found."
            });
        }

        const { data: services, error } = await supabase
            .from("service_logs")
            .select(`
                id,
                service_date,
                odometer_reading,
                service_center,
                mechanic_name,
                cost,
                notes,
                next_service_date,
                next_service_km,
                service_types(service_name)
            `)
            .eq("vehicle_id", vehicleId)
            .order("service_date", { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        const serviceHistory = services.map((item) => {
            return {
                id: item.id,
                serviceDate: item.service_date,
                serviceType: item.service_types?.service_name,
                odometerReading: item.odometer_reading,
                serviceCenter: item.service_center,
                mechanicName: item.mechanic_name,
                cost: item.cost,
                notes: item.notes,
                nextServiceDate: item.next_service_date,
                nextServiceKm: item.next_service_km
            };
        });

        res.status(200).json({
            success: true,
            vehicle: {
                id: vehicle.id,
                licensePlate: vehicle.license_plate,
                vehicleName: `${vehicle.make} ${vehicle.model}`
            },
            count: serviceHistory.length,
            data: serviceHistory
        });

    } catch (err) {
        console.error("Service History Error:", err);

        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    }
};


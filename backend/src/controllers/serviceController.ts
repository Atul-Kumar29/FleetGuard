import type { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase.js';

type ControllerRequest = Request;
type ServiceRecord = Record<string, any>;

const supabase = getSupabaseClient();

export async function getServiceQueue(req: ControllerRequest, res: Response) {
	try {
		const { search = '', status = 'all', sort = 'due_date' } = req.query as Record<string, any>;
		const { data: vehicles, error } = await supabase.from('vehicles').select('id, license_plate, make, model, current_mileage, last_service_date, last_service_mileage, next_service_due_date, next_service_due_mileage, maintenance_risk, status').in('status', ['ACTIVE', 'IN_MAINTENANCE']);
		if (error) return res.status(500).json({ success: false, error: error.message });
		const today = new Date().toISOString().split('T')[0] || '';
		let serviceQueue = (vehicles || []).map((vehicle: ServiceRecord) => {
			if (vehicle.status === 'IN_MAINTENANCE') return { id: vehicle.id, licensePlate: vehicle.license_plate, vehicle: `${vehicle.make} ${vehicle.model}`, currentMileage: vehicle.current_mileage, lastServiceDate: vehicle.last_service_date, lastServiceMileage: vehicle.last_service_mileage, nextServiceDate: vehicle.next_service_due_date, nextServiceMileage: vehicle.next_service_due_mileage, maintenanceRisk: vehicle.maintenance_risk || 'LOW', status: 'In Service', vehicleStatus: 'IN_MAINTENANCE' };
			let queueStatus = 'Scheduled';
			if (vehicle.next_service_due_date && vehicle.next_service_due_date <= today) queueStatus = 'Overdue';
			else if (vehicle.next_service_due_mileage !== null && vehicle.next_service_due_mileage !== undefined && vehicle.current_mileage >= vehicle.next_service_due_mileage) queueStatus = 'Due';
			return { id: vehicle.id, licensePlate: vehicle.license_plate, vehicle: `${vehicle.make} ${vehicle.model}`, currentMileage: vehicle.current_mileage, lastServiceDate: vehicle.last_service_date, lastServiceMileage: vehicle.last_service_mileage, nextServiceDate: vehicle.next_service_due_date, nextServiceMileage: vehicle.next_service_due_mileage, maintenanceRisk: vehicle.maintenance_risk || 'LOW', status: queueStatus, vehicleStatus: 'ACTIVE' };
		});
		if (search.trim()) { const keyword = search.toLowerCase(); serviceQueue = serviceQueue.filter((vehicle: ServiceRecord) => (vehicle.licensePlate || '').toLowerCase().includes(keyword) || (vehicle.vehicle || '').toLowerCase().includes(keyword)); }
		if (status.toLowerCase() !== 'all') serviceQueue = serviceQueue.filter((vehicle: ServiceRecord) => vehicle.status.toLowerCase() === status.toLowerCase());
		if (sort === 'mileage') serviceQueue.sort((a: ServiceRecord, b: ServiceRecord) => (a.nextServiceMileage ?? Number.MAX_SAFE_INTEGER) - (b.nextServiceMileage ?? Number.MAX_SAFE_INTEGER));
		else serviceQueue.sort((a: ServiceRecord, b: ServiceRecord) => (a.nextServiceDate || '9999-12-31').localeCompare(b.nextServiceDate || '9999-12-31'));
		return res.status(200).json({ success: true, count: serviceQueue.length, data: serviceQueue });
	} catch (err) { console.error('Service Queue Error:', err); return res.status(500).json({ success: false, error: 'Failed to fetch service queue.' }); }
}

export async function getServiceTypes(_req: ControllerRequest, res: Response) {
	try {
		const { data, error } = await supabase.from('service_types').select('id, service_name').order('service_name', { ascending: true });
		if (error) return res.status(500).json({ success: false, message: error.message });
		return res.status(200).json(data || []);
	} catch (err) { console.error('Get Service Types Error:', err); return res.status(500).json({ success: false, message: 'Failed to fetch service types.' }); }
}

export async function startService(req: ControllerRequest, res: Response) {
	try {
		const { vehicleId } = req.body;
		if (!vehicleId) return res.status(400).json({ success: false, message: 'vehicleId is required.' });
		const { data: vehicle, error: vehicleError } = await supabase.from('vehicles').select('id, status, license_plate, make, model').eq('id', vehicleId).single();
		if (vehicleError || !vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
		if (vehicle.status === 'IN_MAINTENANCE') return res.status(409).json({ success: false, message: 'Service is already in progress for this vehicle.' });
		if (vehicle.status !== 'ACTIVE') return res.status(400).json({ success: false, message: `Vehicle is currently ${vehicle.status} and cannot be serviced.` });
		const { error: updateError } = await supabase.from('vehicles').update({ status: 'IN_MAINTENANCE', updated_at: new Date().toISOString() }).eq('id', vehicleId);
		if (updateError) { console.error('Start Service Update Error:', updateError); return res.status(500).json({ success: false, message: updateError.message }); }
		return res.status(200).json({ success: true, message: `Service started for ${vehicle.make} ${vehicle.model} (${vehicle.license_plate}).` });
	} catch (err) { console.error('Start Service Error:', err); return res.status(500).json({ success: false, message: 'Internal Server Error.' }); }
}

export async function completeService(req: ControllerRequest, res: Response) {
	try {
		const { vehicleId, serviceTypeId, serviceDate, odometerReading, serviceCenter, mechanicName, cost, notes, nextServiceDate, nextServiceKm } = req.body;
		if (!vehicleId || !serviceTypeId || !serviceDate || odometerReading === undefined) return res.status(400).json({ success: false, message: 'Missing required fields.' });
		const { data: vehicle, error: vehicleError } = await supabase.from('vehicles').select('*').eq('id', vehicleId).single();
		if (vehicleError || !vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
		const { data: serviceType, error: serviceTypeError } = await supabase.from('service_types').select('id, service_name').eq('id', serviceTypeId).maybeSingle();
		if (serviceTypeError || !serviceType) return res.status(404).json({ success: false, message: 'Service type not found.' });
		const serviceLogData = { vehicle_id: vehicleId, service_type_id: serviceTypeId, service_date: serviceDate, odometer_reading: Number(odometerReading), service_center: serviceCenter, mechanic_name: mechanicName, cost: cost != null ? Number(cost) : null, notes, next_service_date: nextServiceDate, next_service_km: nextServiceKm != null ? Number(nextServiceKm) : null };
		const { error: logError } = await supabase.from('service_logs').insert(serviceLogData);
		if (logError) { console.log('========== INSERT ERROR ==========', logError); return res.status(500).json({ success: false, message: logError.message }); }
		const { data: latestServiceLog, error: latestServiceLogError } = await supabase.from('service_logs').select('service_date, odometer_reading, next_service_date, next_service_km').eq('vehicle_id', vehicleId).order('service_date', { ascending: false }).limit(1).single();
		if (latestServiceLogError || !latestServiceLog) return res.status(500).json({ success: false, message: latestServiceLogError?.message || 'Failed to retrieve latest service log.' });
		const vehicleUpdateData = { status: 'ACTIVE', current_mileage: Number(latestServiceLog.odometer_reading), last_service_date: latestServiceLog.service_date, last_service_mileage: Number(latestServiceLog.odometer_reading), next_service_due_date: latestServiceLog.next_service_date, next_service_due_mileage: latestServiceLog.next_service_km != null ? Number(latestServiceLog.next_service_km) : null, maintenance_risk: 'LOW', updated_at: new Date().toISOString() };
		const { error: updateError } = await supabase.from('vehicles').update(vehicleUpdateData).eq('id', vehicleId);
		if (updateError) return res.status(500).json({ success: false, message: updateError.message });
		return res.status(200).json({ success: true, message: 'Service completed successfully.' });
	} catch (err) { console.error(err); return res.status(500).json({ success: false, message: 'Internal Server Error.' }); }
}

export async function getServiceHistory(req: ControllerRequest, res: Response) {
	try {
		const vehicleId = req.params.vehicleId;
		if (!vehicleId) return res.status(400).json({ success: false, message: 'Vehicle ID is required.' });
		const { data: vehicle, error: vehicleError } = await supabase.from('vehicles').select('id, license_plate, make, model').eq('id', vehicleId).single();
		if (vehicleError || !vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
		const { data: services, error } = await supabase.from('service_logs').select('id, service_date, odometer_reading, service_center, mechanic_name, cost, notes, next_service_date, next_service_km, service_types(service_name)').eq('vehicle_id', vehicleId).order('service_date', { ascending: false });
		if (error) return res.status(500).json({ success: false, message: error.message });
		const serviceHistory = (services || []).map((item: ServiceRecord) => ({ id: item.id, serviceDate: item.service_date, serviceType: item.service_types?.service_name, odometerReading: item.odometer_reading, serviceCenter: item.service_center, mechanicName: item.mechanic_name, cost: item.cost, notes: item.notes, nextServiceDate: item.next_service_date, nextServiceKm: item.next_service_km }));
		return res.status(200).json({ success: true, vehicle: { id: vehicle.id, licensePlate: vehicle.license_plate, vehicleName: `${vehicle.make} ${vehicle.model}` }, count: serviceHistory.length, data: serviceHistory });
	} catch (err) { console.error('Service History Error:', err); return res.status(500).json({ success: false, message: 'Something went wrong.' }); }
}

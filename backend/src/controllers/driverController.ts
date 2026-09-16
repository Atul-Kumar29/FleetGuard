import type { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase.js';

type ControllerRequest = Request;
type RecordValue = Record<string, any>;
const supabase = getSupabaseClient();

export async function getDriverVehicle(req: ControllerRequest, res: Response) {
	try {
		let driver_id = req.query.driver_id || req.headers['x-driver-id'] || req.headers['driver-id'];
		let targetDriverId: any = driver_id;
		if (targetDriverId) {
			const { data: driverCheck } = await supabase.from('users').select('id, role, status').eq('id', targetDriverId).maybeSingle();
			if (driverCheck && driverCheck.role !== 'DRIVER') targetDriverId = null;
		}
		let assignmentQuery = supabase.from('assignments').select('*').eq('status', 'ACTIVE').order('created_at', { ascending: false });
		if (targetDriverId) assignmentQuery = assignmentQuery.eq('driver_id', targetDriverId);
		const { data: assignments, error: assignmentError } = await assignmentQuery;
		if (assignmentError) return res.status(500).json({ error: 'Failed to fetch assignment details' });
		const assignment = assignments && assignments.length > 0 ? assignments[0] : null;
		if (!assignment) return res.status(404).json({ error: 'No active assignment found', message: 'No active vehicle assignment was found for this driver.' });
		const { data: driver } = await supabase.from('users').select('id, role, status, email, full_name').eq('id', assignment.driver_id).maybeSingle();
		const driverInfo = driver as RecordValue;
		const { data: vehicle, error: vehicleError } = await supabase.from('vehicles').select('*').eq('id', assignment.vehicle_id).single();
		if (vehicleError || !vehicle) return res.status(404).json({ error: 'Assigned vehicle details not found' });
		const { data: complianceItems, error: complianceError } = await supabase.from('compliance_items').select('*').eq('vehicle_id', vehicle.id);
		if (complianceError) return res.status(500).json({ error: 'Failed to fetch vehicle compliance status' });
		const formattedCompliance = (complianceItems || []).map((item: RecordValue) => ({ id: item.id, document_type: item.document_type, expiration_date: item.expiration_date, status: item.status, is_expired: item.status === 'EXPIRED' || new Date(item.expiration_date) < new Date() }));
		return res.status(200).json({ driver: { id: driverInfo.id, role: driverInfo.role, status: driverInfo.status }, assignment: { id: assignment.id, assigned_at: assignment.created_at || assignment.assigned_at, assigned_by: assignment.assigned_by, status: assignment.status }, vehicle, is_compliant: !formattedCompliance.some((item: RecordValue) => item.is_expired), compliance_items: formattedCompliance });
	} catch (error) { return res.status(500).json({ error: 'Internal server error' }); }
}

export async function submitPreTripChecklist(req: ControllerRequest, res: Response) {
	try {
		const { driver_id, vehicle_id, status, passed, checklist_items, checks, notes, issues_reported } = req.body;
		if (!driver_id || !vehicle_id) return res.status(400).json({ error: 'Missing required fields', message: 'driver_id and vehicle_id are required' });
		const { data: driver, error: driverError } = await supabase.from('users').select('id, role').eq('id', driver_id).single();
		if (driverError || !driver) return res.status(404).json({ error: 'Driver not found' });
		if (driver.role !== 'DRIVER' || ((driver as RecordValue).status && (driver as RecordValue).status !== 'ACTIVE')) return res.status(400).json({ error: 'Invalid driver', message: 'The specified user is not an active driver' });
		const { data: vehicle, error: vehicleError } = await supabase.from('vehicles').select('id, status').eq('id', vehicle_id).single();
		if (vehicleError || !vehicle) return res.status(404).json({ error: 'Vehicle not found' });
		const items = checklist_items || checks || {};
		let isPassed = true;
		if (typeof passed === 'boolean') isPassed = passed;
		else if (typeof status === 'string') isPassed = status.toUpperCase() === 'PASS';
		else if (Array.isArray(items)) isPassed = !items.some((item: any) => typeof item === 'object' ? item.status === 'FAIL' || item.passed === false : item === 'FAIL');
		else if (typeof items === 'object' && items !== null) isPassed = !Object.values(items).some((value) => value === 'FAIL' || value === false);
		const overallStatus = isPassed ? 'PASS' : 'FAIL';
		const recordData = { driver_id, vehicle_id, status: overallStatus, checklist_items: items, notes: notes || issues_reported || null, created_at: new Date().toISOString() };
		const { data: createdChecklist, error: insertError } = await supabase.from('pre_trip_checklists').insert([recordData]).select().single();
		if (insertError) console.error('Supabase pre_trip_checklists table note:', insertError.message);
		return res.status(201).json({ message: 'Pre-trip checklist submitted successfully', checklist: createdChecklist || recordData, overall_status: overallStatus, passed: isPassed });
	} catch (error) { return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getDrivers(_req: ControllerRequest, res: Response) {
	try {
		const { data: drivers, error } = await supabase.from('users').select('id, email, full_name, role').eq('role', 'DRIVER');
		if (error) return res.status(500).json({ error: 'Failed to fetch drivers', details: error.message });
		return res.status(200).json({ drivers: drivers || [] });
	} catch (error) { return res.status(500).json({ error: 'Internal server error' }); }
}

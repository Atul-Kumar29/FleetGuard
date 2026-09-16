import type { Request, Response } from 'express';
import { getPredictiveMaintenanceRisk } from '../services/predictiveMaintenance.service.js';

async function getPredictiveMaintenanceRiskController(
  _req: Request,
  res: Response
): Promise<Response> {
  try {
    const riskReport = await getPredictiveMaintenanceRisk();
    return res.status(200).json(riskReport);
  } catch (error) {
    console.error('Error in getPredictiveMaintenanceRisk Controller:', error);
    return res.status(500).json({
      error: 'An internal server error occurred while calculating predictive maintenance risk.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export {
  getPredictiveMaintenanceRiskController as getPredictiveMaintenanceRisk
};

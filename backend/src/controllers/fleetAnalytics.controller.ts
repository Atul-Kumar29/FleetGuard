import type { Request, Response } from 'express';
import { getFleetMetrics as getFleetMetricsFromService } from '../services/fleetAnalytics.service.js';

async function getFleetMetrics(
  _req: Request,
  res: Response
): Promise<Response> {
  try {
    const metrics = await getFleetMetricsFromService();
    return res.status(200).json(metrics);
  } catch (error) {
    console.error('Error in getFleetMetrics Controller:', error);
    return res.status(500).json({
      error: 'An internal server error occurred while generating fleet analytics metrics.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export { getFleetMetrics };

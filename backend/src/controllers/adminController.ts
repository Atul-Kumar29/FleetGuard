import type { Request, Response } from 'express';
import { getAssignmentOverrides } from '../services/adminService.js';

async function getAssignmentOverridesController(
  _req: Request,
  res: Response
): Promise<Response> {
  try {
    const data = await getAssignmentOverrides();
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

export { getAssignmentOverridesController as getAssignmentOverrides };

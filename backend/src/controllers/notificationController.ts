import type { Request, Response } from 'express';
import { getNotifications as getNotificationsFromService } from '../services/notificationService.js';

async function getNotifications(
  _req: Request,
  res: Response
): Promise<Response> {
  try {
    const data = await getNotificationsFromService();
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

export { getNotifications };

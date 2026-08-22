import type { NextFunction, Request, Response } from "express";
import { ok } from "../../lib/apiResponse";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./notifications.service";

export async function getNotificationsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const notifications = await getNotifications(req.user!.id);
    ok(res, { notifications });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsReadController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    await markNotificationAsRead(String(id), req.user!.id);
    ok(res, { success: true });
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsAsReadController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await markAllNotificationsAsRead(req.user!.id);
    ok(res, { success: true });
  } catch (error) {
    next(error);
  }
}

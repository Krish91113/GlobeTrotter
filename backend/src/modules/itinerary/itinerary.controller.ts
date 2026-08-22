import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ValidationError } from "../../errors/AppError";
import { ok } from "../../lib/apiResponse";
import {
  addItemSchema,
  reorderItemsSchema,
  updateItemSchema,
} from "./itinerary.schema";
import { itineraryService } from "./itinerary.service";

const uuidSchema = z.string().uuid();

function buildFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.map((segment) => String(segment)).join(".");
    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}

function uuidParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || !uuidSchema.safeParse(value).success) {
    throw new ValidationError(`Invalid ${name} parameter`);
  }
  return value;
}

export class ItineraryController {
  async addItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const parsed = addItemSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          "Itinerary item validation failed",
          buildFieldErrors(parsed.error),
        );
      }

      const { item, warning } = await itineraryService.addItem(
        uuidParam(req, "tripId"),
        uuidParam(req, "dayId"),
        parsed.data,
        req.user?.userId as string,
      );

      ok(res, item, 201, warning ? { warning } : undefined);
    } catch (error) {
      next(error);
    }
  }

  async updateItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const parsed = updateItemSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          "Itinerary item validation failed",
          buildFieldErrors(parsed.error),
        );
      }

      const { item, warning } = await itineraryService.updateItem(
        uuidParam(req, "tripId"),
        uuidParam(req, "dayId"),
        uuidParam(req, "itemId"),
        parsed.data,
        req.user?.userId as string,
      );

      ok(res, item, 200, warning ? { warning } : undefined);
    } catch (error) {
      next(error);
    }
  }

  async removeItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await itineraryService.removeItem(
        uuidParam(req, "tripId"),
        uuidParam(req, "dayId"),
        uuidParam(req, "itemId"),
        req.user?.userId as string,
      );

      ok(res, {}, 204);
    } catch (error) {
      next(error);
    }
  }

  async reorderItems(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const parsed = reorderItemsSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          "Reorder validation failed",
          buildFieldErrors(parsed.error),
        );
      }

      await itineraryService.reorderItems(
        uuidParam(req, "tripId"),
        uuidParam(req, "dayId"),
        parsed.data,
        req.user?.userId as string,
      );

      ok(res, {});
    } catch (error) {
      next(error);
    }
  }
}

export const itineraryController = new ItineraryController();

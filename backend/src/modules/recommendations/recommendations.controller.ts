import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ValidationError } from "../../errors/AppError";
import { ok } from "../../lib/apiResponse";
import { feedbackSchema, generateSchema } from "./recommendations.schema";
import { recommendationsService } from "./recommendations.service";

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

export class RecommendationsController {
  async generate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const parsed = generateSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          "Recommendation request validation failed",
          buildFieldErrors(parsed.error),
        );
      }

      const result = await recommendationsService.generateRecommendations(
        parsed.data,
        req.user!.id,
      );

      ok(res, {
        recommendations: result.recommendations,
        insights: result.insights,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitFeedback(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const parsed = feedbackSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          "Feedback validation failed",
          buildFieldErrors(parsed.error),
        );
      }

      const feedback = await recommendationsService.submitFeedback(
        uuidParam(req, "recId"),
        parsed.data,
        req.user!.id,
      );

      ok(res, feedback, 201);
    } catch (error) {
      next(error);
    }
  }
  async getFilterOptions(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const options = await recommendationsService.getFilterOptions();
      ok(res, options);
    } catch (error) {
      next(error);
    }
  }
}

export const recommendationsController = new RecommendationsController();

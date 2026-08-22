import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { budgetService } from './budget.service';
import {
  updateBudgetSchema,
  addExpenseSchema,
  updateExpenseSchema,
} from './budget.schema';
import { ok } from '../../lib/apiResponse';
import { ValidationError } from '../../errors/AppError';

const uuidSchema = z.string().uuid();

function buildFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.map((segment) => String(segment)).join('.');
    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}

function uuidParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string' || !uuidSchema.safeParse(value).success) {
    throw new ValidationError(`Invalid ${name} parameter`);
  }
  return value;
}

export class BudgetController {
  async getBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await budgetService.getBudget(
        uuidParam(req, 'tripId'),
        req.user!.userId
      );
      ok(res, budget);
    } catch (error) {
      next(error);
    }
  }

  async upsertBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = updateBudgetSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          'Budget validation failed',
          buildFieldErrors(parsed.error)
        );
      }

      const budget = await budgetService.upsertBudget(
        uuidParam(req, 'tripId'),
        parsed.data,
        req.user!.userId
      );
      ok(res, budget, 201);
    } catch (error) {
      next(error);
    }
  }

  async getBudgetSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await budgetService.getBudgetSummary(
        uuidParam(req, 'tripId'),
        req.user!.userId
      );
      ok(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async addExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = addExpenseSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          'Expense validation failed',
          buildFieldErrors(parsed.error)
        );
      }

      const expense = await budgetService.addExpense(
        uuidParam(req, 'tripId'),
        parsed.data,
        req.user!.userId
      );
      ok(res, expense, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = updateExpenseSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          'Expense validation failed',
          buildFieldErrors(parsed.error)
        );
      }

      const expense = await budgetService.updateExpense(
        uuidParam(req, 'tripId'),
        uuidParam(req, 'expenseId'),
        parsed.data,
        req.user!.userId
      );
      ok(res, expense);
    } catch (error) {
      next(error);
    }
  }

  async listExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expenses = await budgetService.listExpenses(
        uuidParam(req, 'tripId'),
        req.user!.userId
      );
      ok(res, expenses);
    } catch (error) {
      next(error);
    }
  }

  async deleteExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await budgetService.deleteExpense(
        uuidParam(req, 'tripId'),
        uuidParam(req, 'expenseId'),
        req.user!.userId
      );
      ok(res, {}, 204);
    } catch (error) {
      next(error);
    }
  }
}

export const budgetController = new BudgetController();

import type { NextFunction, Request, Response } from "express";
import {
  getCategories,
  getCurrencies,
  getExpenseCategories,
} from "./reference.service";

/**
 * GET /reference/currencies
 */
export async function getCurrenciesController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const currencies = await getCurrencies();
    res.status(200).json({ currencies });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /reference/categories
 */
export async function getCategoriesController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categories = await getCategories();
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /reference/expense-categories
 */
export async function getExpenseCategoriesController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const expenseCategories = await getExpenseCategories();
    res.status(200).json({ expenseCategories });
  } catch (error) {
    next(error);
  }
}

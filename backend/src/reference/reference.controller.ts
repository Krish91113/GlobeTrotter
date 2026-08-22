import { Request, Response, NextFunction } from 'express';
import { getCurrencies, getCategories, getExpenseCategories } from './reference.service';

/**
 * GET /reference/currencies
 */
export async function getCurrenciesController(
  req: Request,
  res: Response,
  next: NextFunction
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
  req: Request,
  res: Response,
  next: NextFunction
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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const expenseCategories = await getExpenseCategories();
    res.status(200).json({ expenseCategories });
  } catch (error) {
    next(error);
  }
}
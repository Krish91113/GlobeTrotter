import { Router } from 'express';
import {
  getCurrenciesController,
  getCategoriesController,
  getExpenseCategoriesController,
} from './reference.controller';

const router = Router();

// Public endpoints - no authentication required

/**
 * GET /reference/currencies
 * Get all available currencies
 */
router.get('/currencies', getCurrenciesController);

/**
 * GET /reference/categories
 * Get all activity categories
 */
router.get('/categories', getCategoriesController);

/**
 * GET /reference/expense-categories
 * Get all expense categories
 */
router.get('/expense-categories', getExpenseCategoriesController);

export default router;
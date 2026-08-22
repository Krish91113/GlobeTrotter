import { Router } from 'express';
import { budgetController } from './budget.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

// Mounted under /api/v1/trips

router.get('/:tripId/budget/summary', requireAuth, (req, res, next) =>
  budgetController.getBudgetSummary(req, res, next)
);

router.get('/:tripId/budget', requireAuth, (req, res, next) =>
  budgetController.getBudget(req, res, next)
);

router.put('/:tripId/budget', requireAuth, (req, res, next) =>
  budgetController.upsertBudget(req, res, next)
);

router.get('/:tripId/expenses', requireAuth, (req, res, next) =>
  budgetController.listExpenses(req, res, next)
);

router.post('/:tripId/expenses', requireAuth, (req, res, next) =>
  budgetController.addExpense(req, res, next)
);

router.patch('/:tripId/expenses/:expenseId', requireAuth, (req, res, next) =>
  budgetController.updateExpense(req, res, next)
);

router.delete('/:tripId/expenses/:expenseId', requireAuth, (req, res, next) =>
  budgetController.deleteExpense(req, res, next)
);

export default router;

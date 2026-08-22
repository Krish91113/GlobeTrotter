import { z } from 'zod';

const decimalString = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a decimal string, e.g. "1200.00"');

const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a date string in YYYY-MM-DD format');

export const updateBudgetSchema = z.object({
  targetAmount: decimalString,
  currencyId: z.string().uuid('Invalid currency id'),
});

export type UpdateBudgetRequest = z.infer<typeof updateBudgetSchema>;

export const addExpenseSchema = z.object({
  expenseCategoryId: z.string().uuid('Invalid expense category id'),
  amount: decimalString,
  currencyId: z.string().uuid('Invalid currency id'),
  expenseDate: isoDateString,
  description: z.string().max(200, 'Description must be at most 200 characters').optional(),
  isEstimate: z.boolean().default(true),
  itineraryItemId: z.string().uuid('Invalid itinerary item id').optional(),
});

export type AddExpenseRequest = z.infer<typeof addExpenseSchema>;

export const updateExpenseSchema = z.object({
  expenseCategoryId: z.string().uuid('Invalid expense category id').optional(),
  amount: decimalString.optional(),
  currencyId: z.string().uuid('Invalid currency id').optional(),
  expenseDate: isoDateString.optional(),
  description: z.string().max(200, 'Description must be at most 200 characters').nullable().optional(),
  isEstimate: z.boolean().optional(),
  itineraryItemId: z.string().uuid('Invalid itinerary item id').nullable().optional(),
});

export type UpdateExpenseRequest = z.infer<typeof updateExpenseSchema>;
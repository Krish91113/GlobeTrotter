import { z } from "zod";

const decimalString = z
  .union([
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a decimal string, e.g. "1200.00"'),
    z.number().positive(),
  ])
  .transform((val) => (typeof val === "number" ? val.toFixed(2) : val));

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/, "Must be a date string in YYYY-MM-DD format")
  .transform((val) => val.slice(0, 10));

export const updateBudgetSchema = z.object({
  targetAmount: decimalString,
  currencyId: z.string().uuid("Invalid currency id").optional(),
  currency: z.string().optional(),
});

export type UpdateBudgetRequest = z.infer<typeof updateBudgetSchema>;

export const addExpenseSchema = z.object({
  expenseCategoryId: z.string().uuid("Invalid expense category id").optional(),
  category: z.string().optional(),
  amount: decimalString,
  currencyId: z.string().uuid("Invalid currency id").optional(),
  currency: z.string().optional(),
  expenseDate: isoDateString,
  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional(),
  isEstimate: z.boolean().default(false),
  itineraryItemId: z.string().uuid("Invalid itinerary item id").optional(),
  splitCount: z.number().int().min(1).default(1),
  splitParticipants: z.string().optional(),
});

export type AddExpenseRequest = z.infer<typeof addExpenseSchema>;

export const updateExpenseSchema = z.object({
  expenseCategoryId: z.string().uuid("Invalid expense category id").optional(),
  category: z.string().optional(),
  amount: decimalString.optional(),
  currencyId: z.string().uuid("Invalid currency id").optional(),
  currency: z.string().optional(),
  expenseDate: isoDateString.optional(),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .nullable()
    .optional(),
  isEstimate: z.boolean().optional(),
  itineraryItemId: z
    .string()
    .uuid("Invalid itinerary item id")
    .nullable()
    .optional(),
  splitCount: z.number().int().min(1).optional(),
  splitParticipants: z.string().nullable().optional(),
});

export type UpdateExpenseRequest = z.infer<typeof updateExpenseSchema>;


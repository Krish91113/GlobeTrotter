import { z } from "zod";

export const createTripSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency: z.string().optional(),
  totalBudget: z.number().optional(),
  visibilityId: z.string().uuid().optional(),
  statusId: z.string().uuid().optional(),
  defaultCurrencyId: z.string().uuid().optional(),
});

export const updateTripSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).nullable().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  currency: z.string().optional(),
  totalBudget: z.number().nullable().optional(),
  visibilityId: z.string().uuid().optional(),
  statusId: z.string().uuid().optional(),
  defaultCurrencyId: z.string().uuid().nullable().optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;

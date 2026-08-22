import { z } from 'zod';
import { isValidDateString } from '../../utils/date';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(isValidDateString, 'Date must be a valid calendar date');

export const CreateTripBaseObjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must not exceed 120 characters')
    .trim(),
  description: z.string().max(2000, 'Description must not exceed 2000 characters').optional(),
  startDate: dateString,
  endDate: dateString,
  defaultCurrencyId: z.string().uuid('defaultCurrencyId must be a valid UUID').optional(),
  targetBudget: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'targetBudget must be a decimal string like "1250.50"')
    .optional(),
  visibilityId: z.string().uuid('visibilityId must be a valid UUID').optional(),
});

export const CreateTripSchema = CreateTripBaseObjectSchema.refine(
  (data) => data.startDate <= data.endDate,
  {
    message: 'startDate must be before or equal to endDate',
    path: ['startDate'],
  }
).refine((data) => !data.targetBudget || !!data.defaultCurrencyId, {
  message: 'defaultCurrencyId is required when targetBudget is provided',
  path: ['defaultCurrencyId'],
});

export const UpdateTripSchema = CreateTripBaseObjectSchema.partial().refine(
  (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
  {
    message: 'startDate must be before or equal to endDate',
    path: ['startDate'],
  }
);

export const ListTripsQuerySchema = z.object({
  status: z.string().max(40).optional(),
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit must not exceed 50')
    .default(20),
  sort: z.enum(['nearest', 'newest', 'oldest']).default('nearest'),
});

export type CreateTripInput = z.infer<typeof CreateTripSchema>;
export type UpdateTripInput = z.infer<typeof UpdateTripSchema>;
export type ListTripsQuery = z.infer<typeof ListTripsQuerySchema>;

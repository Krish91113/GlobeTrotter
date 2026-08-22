import { z } from 'zod';

export const CreateTripSchema = z
  .object({
    name: z.string().min(1).max(100).trim(),
    description: z.string().max(500).trim().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD'),
    currency: z.string().length(3).toUpperCase().default('EUR'),
    totalBudget: z.coerce.number().min(0).optional(),
    coverImage: z.string().url().optional(),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: 'startDate must be before or equal to endDate',
    path: ['startDate'],
  });

export type CreateTripRequest = z.infer<typeof CreateTripSchema>;

export const UpdateTripSchema = z
  .object({
    name: z.string().min(1).max(100).trim().optional(),
    description: z.string().max(500).trim().nullable().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    currency: z.string().length(3).toUpperCase().optional(),
    totalBudget: z.coerce.number().min(0).nullable().optional(),
    coverImage: z.string().url().nullable().optional(),
  })
  .refine(
    (d) => {
      if (d.startDate && d.endDate) return d.startDate <= d.endDate;
      return true;
    },
    { message: 'startDate must be before or equal to endDate', path: ['startDate'] }
  );

export type UpdateTripRequest = z.infer<typeof UpdateTripSchema>;

export const TripFiltersSchema = z.object({
  status: z.enum(['upcoming', 'ongoing', 'completed', 'all']).optional(),
});
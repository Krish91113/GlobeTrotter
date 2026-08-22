import { z } from 'zod';
import { isValidDateString } from '../../utils/date';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(isValidDateString, 'Date must be a valid calendar date');

export const AddStopSchema = z
  .object({
    locationId: z.string().uuid('locationId must be a valid UUID'),
    arrivalDate: dateString,
    departureDate: dateString,
    notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
  })
  .refine((data) => data.arrivalDate <= data.departureDate, {
    message: 'arrivalDate must be before or equal to departureDate',
    path: ['arrivalDate'],
  });

export const UpdateStopSchema = z
  .object({
    locationId: z.string().uuid('locationId must be a valid UUID').optional(),
    arrivalDate: dateString.optional(),
    departureDate: dateString.optional(),
    notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
  })
  .refine(
    (data) =>
      !data.arrivalDate || !data.departureDate || data.arrivalDate <= data.departureDate,
    {
      message: 'arrivalDate must be before or equal to departureDate',
      path: ['arrivalDate'],
    }
  );

export const ReorderStopsSchema = z
  .object({
    stops: z
      .array(
        z.object({
          stopId: z.string().uuid('stopId must be a valid UUID'),
          sequenceNo: z.coerce.number().int().min(1, 'sequenceNo must be at least 1'),
        })
      )
      .min(1, 'At least one stop is required'),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<number>();
    const seenStopIds = new Set<string>();
    for (const [index, stop] of data.stops.entries()) {
      if (seen.has(stop.sequenceNo)) {
        ctx.addIssue({
          code: 'custom',
          path: ['stops', index, 'sequenceNo'],
          message: 'Duplicate sequenceNo values are not allowed',
        });
      }
      seen.add(stop.sequenceNo);
      if (seenStopIds.has(stop.stopId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['stops', index, 'stopId'],
          message: 'Duplicate stopId values are not allowed',
        });
      }
      seenStopIds.add(stop.stopId);
    }
  });

export type AddStopInput = z.infer<typeof AddStopSchema>;
export type UpdateStopInput = z.infer<typeof UpdateStopSchema>;
export type ReorderStopsInput = z.infer<typeof ReorderStopsSchema>;

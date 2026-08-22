import { z } from 'zod';

const decimalString = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a decimal string, e.g. "1200.00"');

const isoDateTimeWithOffset = z.string().datetime({ offset: true });

export const addItemSchema = z
  .object({
    catalogItemId: z.string().uuid('Invalid catalog item id'),
    plannedStartAt: isoDateTimeWithOffset.optional(),
    plannedEndAt: isoDateTimeWithOffset.optional(),
    estimatedCost: decimalString.optional(),
    currencyId: z.string().uuid('Invalid currency id').optional(),
    durationMinutes: z.coerce.number().int().min(1).max(10080).optional(),
    notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
  })
  .refine(
    (data) => {
      if (data.plannedStartAt && data.plannedEndAt) {
        return new Date(data.plannedStartAt) < new Date(data.plannedEndAt);
      }
      return true;
    },
    {
      message: 'plannedStartAt must be before plannedEndAt',
      path: ['plannedStartAt'],
    }
  );

export type AddItemRequest = z.infer<typeof addItemSchema>;

export const updateItemSchema = z
  .object({
    plannedStartAt: isoDateTimeWithOffset.optional(),
    plannedEndAt: isoDateTimeWithOffset.optional(),
    estimatedCost: decimalString.optional(),
    currencyId: z.string().uuid('Invalid currency id').nullable().optional(),
    durationMinutes: z.coerce.number().int().min(1).max(10080).nullable().optional(),
    notes: z.string().max(500, 'Notes must be at most 500 characters').nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.plannedStartAt && data.plannedEndAt) {
        return new Date(data.plannedStartAt) < new Date(data.plannedEndAt);
      }
      return true;
    },
    {
      message: 'plannedStartAt must be before plannedEndAt',
      path: ['plannedStartAt'],
    }
  );

export type UpdateItemRequest = z.infer<typeof updateItemSchema>;

export const reorderItemsSchema = z
  .object({
    items: z
      .array(
        z.object({
          itemId: z.string().uuid('Invalid itinerary item id'),
          sequenceNo: z.coerce.number().int().min(1),
        })
      )
      .min(1, 'At least one item is required'),
  })
  .refine(
    (data) => {
      const sequenceNos = data.items.map((i) => i.sequenceNo);
      return new Set(sequenceNos).size === sequenceNos.length;
    },
    {
      message: 'sequenceNo values must be unique',
      path: ['items'],
    }
  )
  .refine(
    (data) => {
      const itemIds = data.items.map((i) => i.itemId);
      return new Set(itemIds).size === itemIds.length;
    },
    {
      message: 'itemId values must be unique',
      path: ['items'],
    }
  );

export type ReorderItemsRequest = z.infer<typeof reorderItemsSchema>;

export interface OverlapWarning {
  code: 'ITINERARY_OVERLAP';
  message: string;
}
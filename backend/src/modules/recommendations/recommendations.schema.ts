import { z } from 'zod';

const decimalString = z
  .string()
  .regex(/^\d+(\.\d{1,6})?$/, 'Must be a decimal string, e.g. "0.85"');

const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a date string in YYYY-MM-DD format');

export const generateSchema = z.object({
  tripId: z.string().uuid('Invalid trip id'),
  cityId: z.string().uuid('Invalid city id'),
  date: isoDateString.optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export type GenerateRequest = z.infer<typeof generateSchema>;

export const feedbackSchema = z.object({
  actionType: z.enum(['like', 'dislike', 'save', 'dismiss']),
  feedbackValue: decimalString.nullable().optional(),
  itineraryItemId: z.string().uuid('Invalid itinerary item id').nullable().optional(),
});

export type FeedbackRequest = z.infer<typeof feedbackSchema>;

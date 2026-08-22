import { z } from 'zod';

export const LocationSearchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Search query must be at least 1 character')
    .max(100, 'Search query must not exceed 100 characters')
    .optional(),
  query: z
    .string()
    .min(1, 'Search query must be at least 1 character')
    .max(100, 'Search query must not exceed 100 characters')
    .optional(),
  country: z
    .string()
    .length(2, 'Country code must be exactly 2 characters')
    .toUpperCase()
    .optional(),
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit must not exceed 50')
    .default(20),
}).transform(({ query, ...value }) => ({
  ...value,
  q: value.q ?? query,
}));

export type LocationSearchQuery = z.infer<typeof LocationSearchQuerySchema>;

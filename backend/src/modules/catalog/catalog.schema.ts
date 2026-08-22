import { z } from "zod";

export const CatalogSearchQuerySchema = z.object({
  q: z.string().min(1).max(100).optional(),
  query: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(100).optional(),
  locationId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  minCost: z.coerce.number().min(0).optional(),
  maxCost: z.coerce.number().min(0).optional(),
  ratingMin: z.coerce.number().min(0).max(5).optional(),
  durationMax: z.coerce.number().int().min(1).optional(),
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(50, "Limit must not exceed 50")
    .default(20),
}).transform(({ query, ...value }) => ({ ...value, q: value.q ?? query }));

export type CatalogSearchQuery = z.infer<typeof CatalogSearchQuerySchema>;

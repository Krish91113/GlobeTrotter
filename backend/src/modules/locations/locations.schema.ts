// ============================================================================
// locations.schema.ts  — Extended with region filter
// ============================================================================

import { z } from "zod";

export const REGIONS = [
  "All",
  "Europe",
  "Asia",
  "Americas",
  "Africa",
  "Oceania",
] as const;

export const LocationSearchQuerySchema = z
  .object({
    q: z
      .string()
      .min(1, "Search query must be at least 1 character")
      .max(100, "Search query must not exceed 100 characters")
      .optional(),
    query: z
      .string()
      .min(1)
      .max(100)
      .optional(),
    country: z
      .string()
      .length(2, "Country code must be exactly 2 characters")
      .toUpperCase()
      .optional(),
    region: z
      .enum(REGIONS)
      .optional(),
    cursor: z.string().optional(),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(20),
  })
  .transform(({ query, ...value }) => ({
    ...value,
    q: value.q ?? query,
  }));

export type LocationSearchQuery = z.infer<typeof LocationSearchQuerySchema>;

export const NearbyQuerySchema = z.object({
  radiusKm: z.coerce.number().int().min(100).max(20000).default(5000),
  limit: z.coerce.number().int().min(1).max(12).default(6),
});
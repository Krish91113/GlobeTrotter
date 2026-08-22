import { z } from "zod";

/**
 * Validates IANA timezone strings
 * Uses Intl.supportedValuesOf if available (Node 18+)
 */
const isValidTimezone = (tz: string): boolean => {
  try {
    // Check if timezone is valid by trying to create a formatter
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export const UpdateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(80, "Display name must not exceed 80 characters")
    .trim()
    .optional(),
  preferredLocale: z
    .string()
    .min(2, "Locale must be at least 2 characters")
    .max(10, "Locale must not exceed 10 characters")
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Locale must be in format: en or en-US")
    .optional(),
  // profileImageUri will be added when file upload is implemented
});

export const UpsertPreferencesSchema = z.object({
  preferredCurrency: z
    .string()
    .length(3, "Currency code must be exactly 3 characters")
    .toUpperCase()
    .optional(),
  preferredTimezone: z
    .string()
    .refine(isValidTimezone, "Invalid IANA timezone")
    .optional(),
  theme: z
    .enum(["light", "dark"], {
      error: () => 'Theme must be either "light" or "dark"',
    })
    .optional(),
  notificationsEnabled: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpsertPreferencesInput = z.infer<typeof UpsertPreferencesSchema>;

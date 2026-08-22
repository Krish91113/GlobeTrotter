import { z } from "zod";

// ── Auth ──
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name must be at most 80 characters")
      .transform((v) => v.trim()),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address")
      .transform((v) => v.trim().toLowerCase()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Trip ──
export const createTripSchema = z
  .object({
    name: z
      .string()
      .min(2, "Trip name must be at least 2 characters")
      .max(120, "Trip name must be at most 120 characters")
      .transform((v) => v.trim()),
    description: z.string().max(500).optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    currency: z.string().min(1, "Currency is required"),
    totalBudget: z
      .number({ invalid_type_error: "Budget must be a number" })
      .min(0, "Budget must be 0 or greater"),
    coverImage: z.string().optional(),
    firstDestination: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.startDate) <= new Date(data.endDate);
    },
    { message: "Start date must be before or equal to end date", path: ["endDate"] }
  );

export const updateTripSchema = z
  .object({
    name: z
      .string()
      .min(2, "Trip name must be at least 2 characters")
      .max(120)
      .transform((v) => v.trim())
      .optional(),
    description: z.string().max(500).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    currency: z.string().optional(),
    totalBudget: z.number().min(0, "Budget must be 0 or greater").optional(),
    coverImage: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.startDate) <= new Date(data.endDate);
    },
    { message: "Start date must be before or equal to end date", path: ["endDate"] }
  );

// ── Stop ──
export const addStopSchema = z
  .object({
    locationId: z.string().min(1, "Location is required"),
    arrivalDate: z.string().min(1, "Arrival date is required"),
    departureDate: z.string().min(1, "Departure date is required"),
  })
  .refine(
    (data) => {
      if (!data.arrivalDate || !data.departureDate) return true;
      return new Date(data.arrivalDate) <= new Date(data.departureDate);
    },
    { message: "Arrival must be before or equal to departure", path: ["departureDate"] }
  );

// ── Activity / Itinerary Item ──
export const addActivitySchema = z
  .object({
    activityId: z.string().min(1, "Activity is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    estimatedCost: z.number().min(0, "Cost must be 0 or greater").optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return data.startTime < data.endTime;
    },
    { message: "End time must be after start time", path: ["endTime"] }
  );

// ── Expense ──
export const addExpenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .transform((v) => v.trim()),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .min(0, "Amount must be 0 or greater"),
  date: z.string().min(1, "Date is required"),
});

// ── Profile ──
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80)
    .transform((v) => v.trim()),
  email: z.string().email("Enter a valid email"),
  currency: z.string().min(1),
  locale: z.string().min(1),
});

export const preferencesSchema = z.object({
  culture: z.number().min(0).max(100),
  food: z.number().min(0).max(100),
  adventure: z.number().min(0).max(100),
  nature: z.number().min(0).max(100),
  relaxation: z.number().min(0).max(100),
  travelPace: z.enum(["slow", "moderate", "fast"]),
  budgetLevel: z.enum(["budget", "moderate", "luxury"]),
});

// ── Inferred Types ──
export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type CreateTripFormValues = z.infer<typeof createTripSchema>;
export type UpdateTripFormValues = z.infer<typeof updateTripSchema>;
export type AddStopFormValues = z.infer<typeof addStopSchema>;
export type AddActivityFormValues = z.infer<typeof addActivitySchema>;
export type AddExpenseFormValues = z.infer<typeof addExpenseSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PreferencesFormValues = z.infer<typeof preferencesSchema>;

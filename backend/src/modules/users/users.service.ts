import { UpdateProfileInput, UpsertPreferencesInput } from './users.schema';
import { ProfileDto, PreferencesDto, toProfileDto, toPreferencesDto } from './users.dto';
import { createError } from '../../lib/errors';
import prisma from '../../lib/prisma';

/**
 * Get user profile by ID
 */
export async function getProfile(userId: string): Promise<ProfileDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      profileImageUri: true,
      preferredLocale: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw createError('NOT_FOUND', 'User not found');
  }

  return toProfileDto(user);
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<ProfileDto> {
  // Verify user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw createError('NOT_FOUND', 'User not found');
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.displayName && { displayName: data.displayName }),
      ...(data.preferredLocale && { preferredLocale: data.preferredLocale }),
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      profileImageUri: true,
      preferredLocale: true,
      isVerified: true,
      createdAt: true,
    },
  });

  return toProfileDto(updatedUser);
}

/**
 * Get user preferences
 * Creates default preferences if they don't exist
 */
export async function getPreferences(userId: string): Promise<PreferencesDto> {
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError('NOT_FOUND', 'User not found');
  }

  // Upsert preferences (create if missing)
  const preferences = await prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      theme: 'light',
      notificationsEnabled: true,
      emailNotifications: true,
      cultureWeight: 80, foodWeight: 80, adventureWeight: 50,
      natureWeight: 50, relaxationWeight: 50, travelPace: 'moderate', budgetLevel: 'moderate',
    },
    update: {},
    select: {
      preferredCurrency: true,
      preferredTimezone: true,
      theme: true,
      notificationsEnabled: true,
      emailNotifications: true,
      cultureWeight: true, foodWeight: true, adventureWeight: true,
      natureWeight: true, relaxationWeight: true, travelPace: true, budgetLevel: true,
    },
  });

  return toPreferencesDto(preferences);
}

/**
 * Update or create user preferences
 */
export async function upsertPreferences(
  userId: string,
  data: UpsertPreferencesInput
): Promise<PreferencesDto> {
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError('NOT_FOUND', 'User not found');
  }

  // If currency is provided, verify it exists
  if (data.preferredCurrency) {
    const currency = await prisma.currency.findUnique({
      where: { isoCode: data.preferredCurrency },
    });

    if (!currency) {
      throw createError('VALIDATION_ERROR', `Currency ${data.preferredCurrency} not found`);
    }
  }

  // Upsert preferences
  const preferences = await prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      preferredCurrency: data.preferredCurrency ?? null,
      preferredTimezone: data.preferredTimezone ?? null,
      theme: data.theme ?? 'light',
      notificationsEnabled: data.notificationsEnabled ?? true,
      emailNotifications: data.emailNotifications ?? true,
      cultureWeight: data.cultureWeight ?? 80,
      foodWeight: data.foodWeight ?? 80,
      adventureWeight: data.adventureWeight ?? 50,
      natureWeight: data.natureWeight ?? 50,
      relaxationWeight: data.relaxationWeight ?? 50,
      travelPace: data.travelPace ?? 'moderate',
      budgetLevel: data.budgetLevel ?? 'moderate',
    },
    update: {
      ...(data.preferredCurrency !== undefined && { preferredCurrency: data.preferredCurrency }),
      ...(data.preferredTimezone !== undefined && { preferredTimezone: data.preferredTimezone }),
      ...(data.theme !== undefined && { theme: data.theme }),
      ...(data.notificationsEnabled !== undefined && { notificationsEnabled: data.notificationsEnabled }),
      ...(data.emailNotifications !== undefined && { emailNotifications: data.emailNotifications }),
      ...(data.cultureWeight !== undefined && { cultureWeight: data.cultureWeight }),
      ...(data.foodWeight !== undefined && { foodWeight: data.foodWeight }),
      ...(data.adventureWeight !== undefined && { adventureWeight: data.adventureWeight }),
      ...(data.natureWeight !== undefined && { natureWeight: data.natureWeight }),
      ...(data.relaxationWeight !== undefined && { relaxationWeight: data.relaxationWeight }),
      ...(data.travelPace !== undefined && { travelPace: data.travelPace }),
      ...(data.budgetLevel !== undefined && { budgetLevel: data.budgetLevel }),
    },
    select: {
      preferredCurrency: true,
      preferredTimezone: true,
      theme: true,
      notificationsEnabled: true,
      emailNotifications: true,
      cultureWeight: true, foodWeight: true, adventureWeight: true,
      natureWeight: true, relaxationWeight: true, travelPace: true, budgetLevel: true,
    },
  });

  return toPreferencesDto(preferences);
}

import fs from "node:fs/promises";
import path from "node:path";
import { createError } from "../../lib/errors";
import prisma from "../../lib/prisma";
import {
  type PreferencesDto,
  type ProfileDto,
  type SavedLocationDto,
  toPreferencesDto,
  toProfileDto,
} from "./users.dto";
import type {
  UpdateProfileInput,
  UpsertPreferencesInput,
} from "./users.schema";

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
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw createError("NOT_FOUND", "User not found");
  }

  return toProfileDto(user);
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileInput,
): Promise<ProfileDto> {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw createError("NOT_FOUND", "User not found");
  }

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
      role: true,
      createdAt: true,
    },
  });

  return toProfileDto(updatedUser);
}

/**
 * Upload and update profile image
 */
export async function updateProfileImage(
  userId: string,
  imageUrl: string,
): Promise<ProfileDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profileImageUri: true },
  });

  if (!user) {
    throw createError("NOT_FOUND", "User not found");
  }

  // If old image exists locally, attempt to clean it up
  if (user.profileImageUri && user.profileImageUri.startsWith("/uploads/avatars/")) {
    const oldPath = path.join(process.cwd(), user.profileImageUri);
    fs.unlink(oldPath).catch(() => {});
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { profileImageUri: imageUrl },
    select: {
      id: true,
      email: true,
      displayName: true,
      profileImageUri: true,
      preferredLocale: true,
      isVerified: true,
      role: true,
      createdAt: true,
    },
  });

  return toProfileDto(updated);
}

/**
 * Remove profile image
 */
export async function removeProfileImage(userId: string): Promise<ProfileDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profileImageUri: true },
  });

  if (!user) {
    throw createError("NOT_FOUND", "User not found");
  }

  if (user.profileImageUri && user.profileImageUri.startsWith("/uploads/avatars/")) {
    const oldPath = path.join(process.cwd(), user.profileImageUri);
    fs.unlink(oldPath).catch(() => {});
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { profileImageUri: null },
    select: {
      id: true,
      email: true,
      displayName: true,
      profileImageUri: true,
      preferredLocale: true,
      isVerified: true,
      role: true,
      createdAt: true,
    },
  });

  return toProfileDto(updated);
}

/**
 * Get user preferences
 */
export async function getPreferences(userId: string): Promise<PreferencesDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError("NOT_FOUND", "User not found");
  }

  const preferences = await prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      theme: "light",
      notificationsEnabled: true,
      emailNotifications: true,
      cultureWeight: 80,
      foodWeight: 90,
      adventureWeight: 60,
      natureWeight: 50,
      relaxationWeight: 40,
      travelPace: "moderate",
      budgetLevel: "moderate",
    },
    update: {},
    select: {
      preferredCurrency: true,
      preferredTimezone: true,
      theme: true,
      notificationsEnabled: true,
      emailNotifications: true,
      cultureWeight: true,
      foodWeight: true,
      adventureWeight: true,
      natureWeight: true,
      relaxationWeight: true,
      travelPace: true,
      budgetLevel: true,
    },
  });

  return toPreferencesDto(preferences);
}

/**
 * Update or create user preferences
 */
export async function upsertPreferences(
  userId: string,
  data: UpsertPreferencesInput,
): Promise<PreferencesDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError("NOT_FOUND", "User not found");
  }

  if (data.preferredCurrency) {
    const currency = await prisma.currency.findUnique({
      where: { isoCode: data.preferredCurrency },
    });

    if (!currency) {
      throw createError(
        "VALIDATION_ERROR",
        `Currency ${data.preferredCurrency} not found`,
      );
    }
  }

  const preferences = await prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      preferredCurrency: data.preferredCurrency ?? null,
      preferredTimezone: data.preferredTimezone ?? null,
      theme: data.theme ?? "light",
      notificationsEnabled: data.notificationsEnabled ?? true,
      emailNotifications: data.emailNotifications ?? true,
      cultureWeight: data.cultureWeight ?? 80,
      foodWeight: data.foodWeight ?? 90,
      adventureWeight: data.adventureWeight ?? 60,
      natureWeight: data.natureWeight ?? 50,
      relaxationWeight: data.relaxationWeight ?? 40,
      travelPace: data.travelPace ?? "moderate",
      budgetLevel: data.budgetLevel ?? "moderate",
    },
    update: {
      ...(data.preferredCurrency !== undefined && {
        preferredCurrency: data.preferredCurrency,
      }),
      ...(data.preferredTimezone !== undefined && {
        preferredTimezone: data.preferredTimezone,
      }),
      ...(data.theme !== undefined && { theme: data.theme }),
      ...(data.notificationsEnabled !== undefined && {
        notificationsEnabled: data.notificationsEnabled,
      }),
      ...(data.emailNotifications !== undefined && {
        emailNotifications: data.emailNotifications,
      }),
      ...(data.cultureWeight !== undefined && {
        cultureWeight: data.cultureWeight,
      }),
      ...(data.foodWeight !== undefined && {
        foodWeight: data.foodWeight,
      }),
      ...(data.adventureWeight !== undefined && {
        adventureWeight: data.adventureWeight,
      }),
      ...(data.natureWeight !== undefined && {
        natureWeight: data.natureWeight,
      }),
      ...(data.relaxationWeight !== undefined && {
        relaxationWeight: data.relaxationWeight,
      }),
      ...(data.travelPace !== undefined && {
        travelPace: data.travelPace,
      }),
      ...(data.budgetLevel !== undefined && {
        budgetLevel: data.budgetLevel,
      }),
    },
    select: {
      preferredCurrency: true,
      preferredTimezone: true,
      theme: true,
      notificationsEnabled: true,
      emailNotifications: true,
      cultureWeight: true,
      foodWeight: true,
      adventureWeight: true,
      natureWeight: true,
      relaxationWeight: true,
      travelPace: true,
      budgetLevel: true,
    },
  });

  return toPreferencesDto(preferences);
}

/**
 * Saved Destinations
 */
export async function getSavedLocations(userId: string): Promise<SavedLocationDto[]> {
  const saved = await prisma.savedLocation.findMany({
    where: { userId },
    include: {
      location: {
        select: {
          id: true,
          name: true,
          description: true,
          latitude: true,
          longitude: true,
          country: {
            select: {
              iso2Code: true,
              displayName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return saved.map((s) => ({
    id: s.id,
    locationId: s.locationId,
    savedAt: s.createdAt.toISOString(),
    location: {
      id: s.location.id,
      name: s.location.name,
      description: s.location.description,
      latitude: s.location.latitude,
      longitude: s.location.longitude,
      country: {
        iso2Code: s.location.country?.iso2Code ?? "XX",
        displayName: s.location.country?.displayName ?? "Unknown",
      },
    },
  }));
}

export async function saveLocation(
  userId: string,
  locationId: string,
): Promise<{ success: boolean; savedLocation: SavedLocationDto }> {
  const location = await prisma.location.findUnique({
    where: { id: locationId },
  });
  if (!location) {
    throw createError("NOT_FOUND", "Location not found");
  }

  const saved = await prisma.savedLocation.upsert({
    where: {
      userId_locationId: { userId, locationId },
    },
    create: { userId, locationId },
    update: {},
    include: {
      location: {
        select: {
          id: true,
          name: true,
          description: true,
          latitude: true,
          longitude: true,
          country: {
            select: {
              iso2Code: true,
              displayName: true,
            },
          },
        },
      },
    },
  });

  return {
    success: true,
    savedLocation: {
      id: saved.id,
      locationId: saved.locationId,
      savedAt: saved.createdAt.toISOString(),
      location: {
        id: saved.location.id,
        name: saved.location.name,
        description: saved.location.description,
        latitude: saved.location.latitude,
        longitude: saved.location.longitude,
        country: {
          iso2Code: saved.location.country?.iso2Code ?? "XX",
          displayName: saved.location.country?.displayName ?? "Unknown",
        },
      },
    },
  };
}

export async function unsaveLocation(userId: string, locationId: string): Promise<void> {
  await prisma.savedLocation.deleteMany({
    where: { userId, locationId },
  });
}

/**
 * Delete User Account completely
 */
export async function deleteAccount(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, profileImageUri: true },
  });

  if (!user) {
    throw createError("NOT_FOUND", "User not found");
  }

  if (user.profileImageUri && user.profileImageUri.startsWith("/uploads/avatars/")) {
    const oldPath = path.join(process.cwd(), user.profileImageUri);
    fs.unlink(oldPath).catch(() => {});
  }

  await prisma.user.delete({
    where: { id: userId },
  });
}


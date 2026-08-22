/**
 * Profile data transfer object
 */
export type ProfileDto = {
  id: string;
  email: string;
  displayName: string;
  profileImageUri: string | null;
  preferredLocale: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
};

export type SavedLocationDto = {
  id: string;
  locationId: string;
  savedAt: string;
  location: {
    id: string;
    name: string;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
    country: {
      iso2Code: string;
      displayName: string;
    };
  };
};

/**
 * User preferences data transfer object
 */
export type PreferencesDto = {
  preferredCurrency: string | null;
  preferredTimezone: string | null;
  theme: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  cultureWeight: number;
  foodWeight: number;
  adventureWeight: number;
  natureWeight: number;
  relaxationWeight: number;
  travelPace: string;
  budgetLevel: string;
};

/**
 * Maps Prisma User to ProfileDto
 */
export function toProfileDto(user: {
  id: string;
  email: string;
  displayName: string;
  profileImageUri: string | null;
  preferredLocale: string;
  isVerified: boolean;
  role?: string;
  createdAt: Date;
}): ProfileDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    profileImageUri: user.profileImageUri,
    preferredLocale: user.preferredLocale,
    isVerified: user.isVerified,
    role: user.role || "TRAVELER",
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Maps Prisma UserPreferences to PreferencesDto
 */
export function toPreferencesDto(prefs: {
  preferredCurrency: string | null;
  preferredTimezone: string | null;
  theme: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  cultureWeight: number;
  foodWeight: number;
  adventureWeight: number;
  natureWeight: number;
  relaxationWeight: number;
  travelPace: string;
  budgetLevel: string;
}): PreferencesDto {
  return {
    preferredCurrency: prefs.preferredCurrency,
    preferredTimezone: prefs.preferredTimezone,
    theme: prefs.theme,
    notificationsEnabled: prefs.notificationsEnabled,
    emailNotifications: prefs.emailNotifications,
    cultureWeight: prefs.cultureWeight,
    foodWeight: prefs.foodWeight,
    adventureWeight: prefs.adventureWeight,
    natureWeight: prefs.natureWeight,
    relaxationWeight: prefs.relaxationWeight,
    travelPace: prefs.travelPace,
    budgetLevel: prefs.budgetLevel,
  };
}

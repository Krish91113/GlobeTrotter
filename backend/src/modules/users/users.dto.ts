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
  createdAt: string;
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
  createdAt: Date;
}): ProfileDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    profileImageUri: user.profileImageUri,
    preferredLocale: user.preferredLocale,
    isVerified: user.isVerified,
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
}): PreferencesDto {
  return {
    preferredCurrency: prefs.preferredCurrency,
    preferredTimezone: prefs.preferredTimezone,
    theme: prefs.theme,
    notificationsEnabled: prefs.notificationsEnabled,
    emailNotifications: prefs.emailNotifications,
  };
}
import { apiClient } from "@/lib/api-client";
import type { UserProfile } from "@/types";

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
      const [prof, pref] = await Promise.all([
        apiClient<any>("/users/me/profile"),
        apiClient<any>("/users/me/preferences").catch(() => null),
      ]);

      return {
        id: prof.id || "",
        name: prof.displayName || "Traveler",
        email: prof.email || "",
        avatarUrl: prof.profileImageUri || "",
        currency: pref?.preferredCurrency || "EUR",
        locale: prof.preferredLocale || "en-US",
        preferences: {
          culture: pref?.cultureWeight ?? 80,
          food: pref?.foodWeight ?? 90,
          adventure: pref?.adventureWeight ?? 60,
          nature: pref?.natureWeight ?? 50,
          relaxation: pref?.relaxationWeight ?? 40,
          travelPace: pref?.travelPace || "moderate",
          budgetLevel: pref?.budgetLevel || "moderate",
        },
      };
  },

  updateProfile: async (input: Partial<UserProfile>): Promise<UserProfile> => {
    const promises: Promise<any>[] = [];

    if (input.name || input.locale) {
      promises.push(
        apiClient("/users/me/profile", {
          method: "PATCH",
          body: JSON.stringify({ ...(input.name && { displayName: input.name }), ...(input.locale && { preferredLocale: input.locale }) }),
        })
      );
    }

    if (input.preferences || input.currency) {
      promises.push(
        apiClient("/users/me/preferences", {
          method: "PUT",
          body: JSON.stringify({
            ...(input.currency && { preferredCurrency: input.currency }),
            ...(input.preferences && {
              cultureWeight: input.preferences.culture, foodWeight: input.preferences.food,
              adventureWeight: input.preferences.adventure, natureWeight: input.preferences.nature,
              relaxationWeight: input.preferences.relaxation, travelPace: input.preferences.travelPace,
              budgetLevel: input.preferences.budgetLevel,
            }),
          }),
        })
      );
    }

    await Promise.all(promises);
    return profileService.getProfile();
  },
};

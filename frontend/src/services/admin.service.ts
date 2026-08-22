import { apiClient } from "@/lib/api-client";
import type {
  AdminAnalyticsSummary,
  AdminTopLocation,
  AdminTopActivity,
  AdminRecommendationsAnalytics,
  AdminBudgetTrends,
  AdminUser,
  AdminCatalogItem,
} from "@/types";

export const adminService = {
  /* ── Analytics ── */

  getAnalyticsSummary: async (): Promise<AdminAnalyticsSummary> => {
    return apiClient<AdminAnalyticsSummary>("/admin/analytics/summary");
  },

  getTopLocations: async (): Promise<AdminTopLocation[]> => {
    return apiClient<AdminTopLocation[]>("/admin/analytics/top-locations");
  },

  getTopActivities: async (): Promise<AdminTopActivity[]> => {
    return apiClient<AdminTopActivity[]>("/admin/analytics/top-activities");
  },

  getRecommendationsAnalytics: async (): Promise<AdminRecommendationsAnalytics> => {
    return apiClient<AdminRecommendationsAnalytics>("/admin/analytics/recommendations");
  },

  getBudgetTrends: async (): Promise<AdminBudgetTrends> => {
    return apiClient<AdminBudgetTrends>("/admin/analytics/budget-trends");
  },

  /* ── Users ── */

  getUsers: async (page = 1, limit = 20): Promise<{ users: AdminUser[]; total: number }> => {
    const data = await apiClient<any>(`/admin/users?page=${page}&limit=${limit}`);
    const userList = Array.isArray(data) ? data : data?.users || [];
    return {
      users: userList.map((u: any) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName || u.display_name || "User",
        profileImageUri: u.profileImageUri || null,
        role: u.role || "TRAVELER",
        isActive: u.isActive ?? true,
        isVerified: u.isVerified ?? false,
        tripsCount: u.tripsCount ?? 0,
        savedLocationsCount: u.savedLocationsCount ?? 0,
        createdAt: u.createdAt || new Date().toISOString(),
      })),
      total: typeof data?.total === "number" ? data.total : userList.length,
    };
  },

  updateUserRole: async (userId: string, role: string): Promise<void> => {
    await apiClient(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  /* ── Catalog Management ── */

  getCatalogItems: async (page = 1, limit = 20): Promise<{ items: AdminCatalogItem[]; total: number }> => {
    const data = await apiClient<any>(`/admin/catalog/items?page=${page}&limit=${limit}`);
    const itemList = Array.isArray(data) ? data : data?.items || [];
    return {
      items: itemList.map((i: any) => ({
        id: i.id,
        name: i.name,
        cityName: i.cityName || i.location?.name || "",
        locationId: i.locationId || null,
        itemType: i.itemType || "ACTIVITY",
        categories: i.categories || [],
        estimatedCost: i.estimatedCost ? parseFloat(i.estimatedCost) : null,
        currency: i.currency || "INR",
        rating: i.rating ? parseFloat(i.rating) : null,
        durationMinutes: i.durationMinutes || null,
        createdAt: i.createdAt || new Date().toISOString(),
      })),
      total: typeof data?.total === "number" ? data.total : itemList.length,
    };
  },

  createCatalogItem: async (input: Record<string, any>): Promise<AdminCatalogItem> => {
    return apiClient<AdminCatalogItem>("/admin/catalog/items", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateCatalogItem: async (itemId: string, input: Record<string, any>): Promise<void> => {
    await apiClient(`/admin/catalog/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteCatalogItem: async (itemId: string): Promise<void> => {
    await apiClient(`/admin/catalog/items/${itemId}`, { method: "DELETE" });
  },
};

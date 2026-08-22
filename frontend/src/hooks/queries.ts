"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { dashboardService } from "@/services/dashboard.service";
import { tripsService } from "@/services/trips.service";
import { itineraryService } from "@/services/itinerary.service";
import { locationsService } from "@/services/locations.service";
import { activitiesService } from "@/services/activities.service";
import { recommendationsService } from "@/services/recommendations.service";
import { budgetService } from "@/services/budget.service";
import { sharingService } from "@/services/sharing.service";
import { profileService } from "@/services/profile.service";
import type { CreateTripInput, UpdateTripInput, AddStopInput, AddActivityInput, AddExpenseInput, LocationFilters, ActivityFilters, UserProfile } from "@/types";
import { referenceService } from "@/services/reference.service";
import { notificationsService } from "@/services/notifications.service";
import { savedLocationsService } from "@/services/saved-locations.service";
import { adminService } from "@/services/admin.service";
import type { CurrencyReference, CategoryReference, NotificationItem, SavedLocation, AdminUser, AdminCatalogItem, AdminAnalyticsSummary, AdminTopLocation, AdminTopActivity, AdminRecommendationsAnalytics, AdminBudgetTrends } from "@/types";
import type { ExpenseCategory } from "@/services/reference.service";

/* ── Query Keys ── */
export const queryKeys = {
  auth: { me: ["auth", "me"] as const },
  dashboard: { summary: ["dashboard", "summary"] as const },
  trips: {
    all: (status?: string) => ["trips", status ?? "all"] as const,
    detail: (tripId: string) => ["trip", tripId] as const,
    days: (tripId: string) => ["trip", tripId, "days"] as const,
    stops: (tripId: string) => ["trip", tripId, "stops"] as const,
    budget: (tripId: string) => ["trip", tripId, "budget"] as const,
    expenses: (tripId: string) => ["trip", tripId, "expenses"] as const,
  },
  locations: {
    search: (filters?: LocationFilters) => ["locations", "search", filters] as const,
  },
  activities: {
    search: (filters?: ActivityFilters) => ["activities", "search", filters] as const,
  },
  recommendations: {
    forTrip: (tripId: string) => ["recommendations", tripId] as const,
  },
  publicTrip: (token: string) => ["publicTrip", token] as const,
  profile: ["profile"] as const,
  reference: {
    currencies: ["reference", "currencies"] as const,
    categories: ["reference", "categories"] as const,
    expenseCategories: ["reference", "expenseCategories"] as const,
  },
  notifications: ["notifications"] as const,
  savedLocations: ["savedLocations"] as const,
  admin: {
    summary: ["admin", "summary"] as const,
    topLocations: ["admin", "topLocations"] as const,
    topActivities: ["admin", "topActivities"] as const,
    recommendations: ["admin", "recommendations"] as const,
    budgetTrends: ["admin", "budgetTrends"] as const,
    users: (page?: number) => ["admin", "users", page ?? 1] as const,
    catalog: (page?: number) => ["admin", "catalog", page ?? 1] as const,
  },
  shareLinks: (tripId: string) => ["shareLinks", tripId] as const,
};

/* ── Auth ── */
export { useCurrentUser, useLogin, useSignup, useRegister, useLogout } from "@/features/auth/hooks/use-auth";

/* ── Dashboard ── */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: () => dashboardService.getDashboard(),
  });
}

/* ── Trips ── */
export function useTrips(status?: string) {
  return useQuery({
    queryKey: queryKeys.trips.all(status),
    queryFn: () => tripsService.getTrips(status),
  });
}

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: queryKeys.trips.detail(tripId),
    queryFn: () => tripsService.getTrip(tripId),
    enabled: !!tripId,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTripInput) => tripsService.createTrip(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      toast.success("Trip created!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateTrip(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTripInput) => tripsService.updateTrip(tripId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.detail(tripId) });
      qc.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => tripsService.deleteTrip(tripId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      toast.success("Trip deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Itinerary ── */
export function useTripDays(tripId: string) {
  return useQuery({
    queryKey: queryKeys.trips.days(tripId),
    queryFn: () => itineraryService.getTripDays(tripId),
    enabled: !!tripId,
  });
}

export function useTripStops(tripId: string) {
  return useQuery({
    queryKey: queryKeys.trips.stops(tripId),
    queryFn: () => itineraryService.getStops(tripId),
    enabled: !!tripId,
  });
}

export function useAddStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddStopInput) => itineraryService.addStop(tripId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.stops(tripId) });
      qc.invalidateQueries({ queryKey: queryKeys.trips.days(tripId) });
      toast.success("Stop added");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stopId: string) => itineraryService.deleteStop(tripId, stopId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.stops(tripId) });
      qc.invalidateQueries({ queryKey: queryKeys.trips.days(tripId) });
      toast.success("Stop removed");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, input }: { stopId: string; input: Partial<{ arrivalDate: string; departureDate: string; locationId: string; notes: string }> }) =>
      itineraryService.updateStop(tripId, stopId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.stops(tripId) });
      qc.invalidateQueries({ queryKey: queryKeys.trips.days(tripId) });
      toast.success("Stop updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useReorderStops(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stops: { stopId: string; sequenceNo: number }[]) =>
      itineraryService.reorderStops(tripId, stops),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.stops(tripId) });
      qc.invalidateQueries({ queryKey: queryKeys.trips.days(tripId) });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAddActivity(dayId: string, tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddActivityInput) => itineraryService.addActivity(tripId, dayId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.days(tripId) });
      qc.invalidateQueries({ queryKey: queryKeys.trips.detail(tripId) });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      toast.success("Activity added");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteActivity(dayId: string, tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => itineraryService.deleteActivity(tripId, dayId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.days(tripId) });
      toast.success("Activity removed");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateActivity(dayId: string, tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: Partial<{ startTime: string; endTime: string; estimatedCost: number; order: number }> }) =>
      itineraryService.updateActivity(tripId, dayId, itemId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.days(tripId) });
      toast.success("Activity updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useReorderActivities(dayId: string, tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { itemId: string; sequenceNo: number }[]) =>
      itineraryService.reorderActivities(tripId, dayId, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.days(tripId) });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Locations ── */
export function useLocations(filters?: LocationFilters) {
  return useQuery({
    queryKey: queryKeys.locations.search(filters),
    queryFn: () => locationsService.search(filters),
  });
}

/* ── Activities ── */
export function useActivities(filters?: ActivityFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.activities.search(filters),
    queryFn: () => activitiesService.search(filters),
    enabled,
  });
}

/* ── Recommendations ── */
export function useRecommendations(tripId: string) {
  return useQuery({
    queryKey: queryKeys.recommendations.forTrip(tripId),
    queryFn: () => recommendationsService.generate(tripId),
    enabled: !!tripId,
  });
}

/* ── Budget ── */
export function useTripBudget(tripId: string) {
  return useQuery({
    queryKey: queryKeys.trips.budget(tripId),
    queryFn: () => budgetService.getTripBudget(tripId),
    enabled: !!tripId,
  });
}

export function useTripExpenses(tripId: string) {
  return useQuery({
    queryKey: queryKeys.trips.expenses(tripId),
    queryFn: () => budgetService.getExpenses(tripId),
    enabled: !!tripId,
  });
}

export function useAddExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddExpenseInput) => budgetService.addExpense(tripId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.budget(tripId) });
      qc.invalidateQueries({ queryKey: queryKeys.trips.expenses(tripId) });
      toast.success("Expense added");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => budgetService.deleteExpense(tripId, expenseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.budget(tripId) });
      qc.invalidateQueries({ queryKey: queryKeys.trips.expenses(tripId) });
      toast.success("Expense deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Sharing ── */
export function usePublicTrip(token: string) {
  return useQuery({
    queryKey: queryKeys.publicTrip(token),
    queryFn: () => sharingService.getPublicTrip(token),
    enabled: !!token,
  });
}

export function useCreateShareLink(tripId: string) {
  return useMutation({
    mutationFn: () => sharingService.createShareLink(tripId),
    onSuccess: (data) => {
      navigator.clipboard?.writeText(`${window.location.origin}/shared/${data.token}`);
      toast.success("Share link copied!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCopyTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => sharingService.copyTrip(token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip copied to your account!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Profile ── */
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => profileService.getProfile(),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<UserProfile>) => profileService.updateProfile(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Profile updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}


/* ── Profile Image ── */
export function useUploadProfileImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => profileService.uploadProfileImage(file),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.profile, updated);
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Profile photo updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRemoveProfileImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => profileService.removeProfileImage(),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.profile, updated);
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Profile photo removed");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}


/* ── Recommendation Feedback ── */
export function useRecommendationFeedback(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recId, action }: { recId: string; action: "accepted" | "rejected" }) =>
      recommendationsService.submitFeedback(recId, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.recommendations.forTrip(tripId) });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Delete Account ── */
export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { apiClient } = await import("@/lib/api-client");
      return apiClient<void>("/users/me", { method: "DELETE" });
    },
    onSuccess: () => {
      qc.clear();
      toast.success("Account deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Reference Data ── */
export function useCurrencies() {
  return useQuery<CurrencyReference[]>({
    queryKey: queryKeys.reference.currencies,
    queryFn: () => referenceService.getCurrencies(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useCategories() {
  return useQuery<CategoryReference[]>({
    queryKey: queryKeys.reference.categories,
    queryFn: () => referenceService.getCategories(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useExpenseCategories() {
  return useQuery<ExpenseCategory[]>({
    queryKey: queryKeys.reference.expenseCategories,
    queryFn: () => referenceService.getExpenseCategories(),
    staleTime: 60 * 60 * 1000,
  });
}

/* ── Notifications ── */
export function useNotifications() {
  return useQuery<NotificationItem[]>({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationsService.getNotifications(),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
      toast.success("All notifications marked as read");
    },
  });
}

/* ── Saved Locations ── */
export function useSavedLocations() {
  return useQuery<SavedLocation[]>({
    queryKey: queryKeys.savedLocations,
    queryFn: () => savedLocationsService.getSavedLocations(),
  });
}

export function useSaveLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (locationId: string) => savedLocationsService.saveLocation(locationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.savedLocations });
      toast.success("Location saved");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUnsaveLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (locationId: string) => savedLocationsService.unsaveLocation(locationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.savedLocations });
      toast.success("Location removed from saved");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Share Links Management ── */
export function useShareLinks(tripId: string) {
  return useQuery({
    queryKey: queryKeys.shareLinks(tripId),
    queryFn: async () => {
      const { apiClient } = await import("@/lib/api-client");
      return apiClient<any[]>(`/trips/${tripId}/share-links`);
    },
    enabled: !!tripId,
  });
}

export function useRevokeShareLink(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (linkId: string) => {
      const { apiClient } = await import("@/lib/api-client");
      return apiClient<void>(`/trips/${tripId}/share-links/${linkId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.shareLinks(tripId) });
      toast.success("Share link revoked");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Admin ── */
export function useAdminSummary() {
  return useQuery<AdminAnalyticsSummary>({
    queryKey: queryKeys.admin.summary,
    queryFn: () => adminService.getAnalyticsSummary(),
  });
}

export function useAdminTopLocations() {
  return useQuery({
    queryKey: queryKeys.admin.topLocations,
    queryFn: () => adminService.getTopLocations(),
  });
}

export function useAdminTopActivities() {
  return useQuery({
    queryKey: queryKeys.admin.topActivities,
    queryFn: () => adminService.getTopActivities(),
  });
}

export function useAdminRecommendationsAnalytics() {
  return useQuery({
    queryKey: queryKeys.admin.recommendations,
    queryFn: () => adminService.getRecommendationsAnalytics(),
  });
}

export function useAdminBudgetTrends() {
  return useQuery({
    queryKey: queryKeys.admin.budgetTrends,
    queryFn: () => adminService.getBudgetTrends(),
  });
}

export function useAdminUsers(page = 1) {
  return useQuery<{ users: AdminUser[]; total: number }>({
    queryKey: queryKeys.admin.users(page),
    queryFn: () => adminService.getUsers(page),
  });
}

export function useAdminCatalogItems(page = 1) {
  return useQuery<{ items: AdminCatalogItem[]; total: number }>({
    queryKey: queryKeys.admin.catalog(page),
    queryFn: () => adminService.getCatalogItems(page),
  });
}

export function useAdminUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User role updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAdminDeleteCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => adminService.deleteCatalogItem(itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "catalog"] });
      toast.success("Catalog item deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

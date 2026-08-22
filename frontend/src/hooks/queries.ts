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

export function useAddActivity(dayId: string, tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddActivityInput) => itineraryService.addActivity(tripId, dayId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.days(tripId) });
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

/* ── Locations ── */
export function useLocations(filters?: LocationFilters) {
  return useQuery({
    queryKey: queryKeys.locations.search(filters),
    queryFn: () => locationsService.search(filters),
  });
}

/* ── Activities ── */
export function useActivities(filters?: ActivityFilters) {
  return useQuery({
    queryKey: queryKeys.activities.search(filters),
    queryFn: () => activitiesService.search(filters),
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

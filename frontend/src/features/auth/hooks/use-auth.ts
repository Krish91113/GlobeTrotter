"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "../api/auth.service";
import type { LoginInput, RegisterInput, AuthUser } from "../types/auth.types";
import { ApiError } from "@/lib/api-client";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

/**
 * Hook to get the currently authenticated user from backend session
 */
export function useCurrentUser() {
  return useQuery<AuthUser | null, ApiError>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        return await authService.me();
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 401) {
          return null;
        }
        throw err;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 Unauthorized
      if (error instanceof ApiError && error.statusCode === 401) {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to log in a user
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<AuthUser, ApiError, LoginInput>({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      toast.success(`Welcome back, ${user.displayName}!`);
      router.push("/dashboard");
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to sign in. Please try again.");
    },
  });
}

/**
 * Hook to register a new user
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<AuthUser, ApiError, RegisterInput>({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      toast.success(`Welcome to GlobeTrotter, ${user.displayName}!`);
      router.push("/dashboard");
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Registration failed. Please check your details.");
    },
  });
}

/**
 * Alias for useRegister
 */
export const useSignup = useRegister;

/**
 * Hook to log out current user
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, ApiError, void>({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
      queryClient.clear();
      toast.success("Signed out successfully");
      router.push("/login");
    },
    onError: () => {
      // Even if server call failed, clear client state and redirect
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
      router.push("/login");
    },
  });
}

/**
 * Hook to request forgot password email / reset token
 */
export function useForgotPassword() {
  return useMutation<{ message: string; resetToken?: string }, ApiError, string>({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success("Password reset request submitted");
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to request password reset.");
    },
  });
}

/**
 * Hook to reset password with token
 */
export function useResetPassword() {
  const router = useRouter();

  return useMutation<{ message: string }, ApiError, { token: string; password: string }>({
    mutationFn: ({ token, password }) => authService.resetPassword(token, password),
    onSuccess: () => {
      toast.success("Password reset successfully! Please sign in.");
      router.push("/login");
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to reset password.");
    },
  });
}


import { apiClient } from "@/lib/api-client";
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
  AuthResponseData,
} from "../types/auth.types";

function normalizeUser(user: AuthUser): AuthUser {
  if (!user) return user;
  return {
    ...user,
    avatarUrl: user.profileImageUri || user.avatarUrl || undefined,
  };
}

export const authService = {
  /**
   * Register a new user and set auth cookies
   */
  async register(input: RegisterInput): Promise<AuthUser> {
    const data = await apiClient<AuthResponseData>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return normalizeUser(data.user);
  },

  /**
   * Log in an existing user and set auth cookies
   */
  async login(input: LoginInput): Promise<AuthUser> {
    const data = await apiClient<AuthResponseData>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return normalizeUser(data.user);
  },

  /**
   * Fetch current authenticated user profile
   */
  async me(): Promise<AuthUser> {
    const data = await apiClient<AuthResponseData>("/auth/me", {
      method: "GET",
    });
    return normalizeUser(data.user);
  },

  /**
   * Log out current user and clear server cookies
   */
  async logout(): Promise<void> {
    await apiClient<Record<string, never>>("/auth/logout", {
      method: "POST",
    });
  },

  /**
   * Refresh session credentials
   */
  async refresh(): Promise<AuthUser> {
    const data = await apiClient<AuthResponseData>("/auth/refresh", {
      method: "POST",
    });
    return normalizeUser(data.user);
  },

  /**
   * Request password reset token / email
   */
  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    return apiClient<{ message: string; resetToken?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password with valid reset token
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },
};



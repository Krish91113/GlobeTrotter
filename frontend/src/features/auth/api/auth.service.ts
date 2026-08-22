import { apiClient } from "@/lib/api-client";
import type {
  AuthResponseData,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "../types/auth.types";

export const authService = {
  /**
   * Register a new user and set auth cookies
   */
  async register(input: RegisterInput): Promise<AuthUser> {
    const data = await apiClient<AuthResponseData>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return data.user;
  },

  /**
   * Log in an existing user and set auth cookies
   */
  async login(input: LoginInput): Promise<AuthUser> {
    const data = await apiClient<AuthResponseData>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return data.user;
  },

  /**
   * Fetch current authenticated user profile
   */
  async me(): Promise<AuthUser> {
    const data = await apiClient<AuthResponseData>("/auth/me", {
      method: "GET",
    });
    return data.user;
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
    return data.user;
  },
};

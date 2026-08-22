/* ──────────────────────────────────────────────────────────
 * GlobeTrotter — Auth Types
 * Matches the backend Auth module contract exactly.
 * ────────────────────────────────────────────────────────── */

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  profileImageUri: string | null;
  role?: string;
  avatarUrl?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: AuthUser;
}

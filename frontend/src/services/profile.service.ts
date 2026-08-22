import { mockGetProfile, mockUpdateProfile } from "@/mocks/db";
import type { UserProfile } from "@/types";

export const profileService = {
  getProfile: (): Promise<UserProfile> => mockGetProfile(),
  updateProfile: (input: Partial<UserProfile>): Promise<UserProfile> => mockUpdateProfile(input),
};

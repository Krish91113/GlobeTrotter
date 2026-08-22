import { mockCreateShareLink, mockGetPublicTrip, mockCopyTrip } from "@/mocks/db";
import type { PublicTrip, Trip } from "@/types";

export const sharingService = {
  createShareLink: (tripId: string): Promise<{ token: string }> => mockCreateShareLink(tripId),
  getPublicTrip: (token: string): Promise<PublicTrip> => mockGetPublicTrip(token),
  copyTrip: (token: string): Promise<Trip> => mockCopyTrip(token),
};

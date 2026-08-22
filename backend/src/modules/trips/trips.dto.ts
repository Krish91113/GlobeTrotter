export type { StopDto } from "../stops/stops.dto";
export { toStopDto } from "../stops/stops.dto";

export interface TripDto {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  daysCount: number;
  cities: string[];
  currency: string;
  coverImage: string | null;
  totalBudget: number;
  estimatedSpend: number;
  remaining: number;
  activitiesCount: number;
  status: "upcoming" | "ongoing" | "completed";
  createdAt: string;
  visibilityId?: string;
  statusId?: string;
  defaultCurrencyId?: string | null;
  ownerUserId?: string;
  updatedAt?: string;
}

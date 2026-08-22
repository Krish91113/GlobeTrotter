export type { StopDto } from "../stops/stops.dto";
export { toStopDto } from "../stops/stops.dto";

export interface TripDto {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  visibilityId: string;
  statusId: string;
  defaultCurrencyId: string | null;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

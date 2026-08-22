import { mockGetDashboard } from "@/mocks/db";
import type { DashboardData } from "@/types";

export const dashboardService = {
  getDashboard: (): Promise<DashboardData> => mockGetDashboard(),
};

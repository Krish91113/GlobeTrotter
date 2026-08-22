import { apiClient } from "@/lib/api-client";
import type { NotificationItem } from "@/types";

export const notificationsService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const data = await apiClient<any[]>("/notifications");
    return data.map((n: any) => ({
      id: n.id,
      type: n.type || "info",
      title: n.title || "Notification",
      body: n.body || "",
      isRead: !!n.readAt,
      readAt: n.readAt || null,
      createdAt: n.createdAt || new Date().toISOString(),
    }));
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient(`/notifications/${id}/read`, { method: "PATCH" });
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient("/notifications/read-all", { method: "POST" });
  },
};

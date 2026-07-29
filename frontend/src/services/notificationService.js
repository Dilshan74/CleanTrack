import { request } from "./api";

export const notificationService = {
  list: (params) => request({ url: "/notifications", params }),
  markRead: (id) => request({ url: `/notifications/${id}/read`, method: "patch" }),
  markAllRead: () => request({ url: "/notifications/read-all", method: "patch" }),
  unreadCount: () => request({ url: "/notifications/unread-count" }),
};

export default notificationService;

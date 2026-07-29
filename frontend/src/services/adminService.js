import { request } from "./api";

export const adminService = {
  dashboard: () => request({ url: "/admin/dashboard" }),
  users: (params) => request({ url: "/admin/users", params }),
  createUser: (payload) =>
    request({ url: "/admin/users", method: "post", data: payload }),
  updateUser: (id, payload) =>
    request({ url: `/admin/users/${id}`, method: "put", data: payload }),
  toggleUserStatus: (id) =>
    request({ url: `/admin/users/${id}/status`, method: "patch" }),
  deleteUser: (id) => request({ url: `/admin/users/${id}`, method: "delete" }),
  phis: () => request({ url: "/admin/phis" }),
  createPhi: (payload) =>
    request({ url: "/admin/phis", method: "post", data: payload }),
  assignArea: (phiId, areaId) =>
    request({ url: `/admin/phis/${phiId}/area`, method: "put", data: { areaId } }),
  areas: () => request({ url: "/admin/areas" }),
  createArea: (payload) =>
    request({ url: "/admin/areas", method: "post", data: payload }),
  updateArea: (id, payload) =>
    request({ url: `/admin/areas/${id}`, method: "put", data: payload }),
  deleteArea: (id) => request({ url: `/admin/areas/${id}`, method: "delete" }),
  statistics: (params) => request({ url: "/admin/statistics", params }),
  settings: () => request({ url: "/admin/settings" }),
  updateSettings: (payload) =>
    request({ url: "/admin/settings", method: "put", data: payload }),
};

export default adminService;

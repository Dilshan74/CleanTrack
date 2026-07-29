import { request } from "./api";

export const phiService = {
  dashboard: () => request({ url: "/phi/dashboard" }),
  reports: (params) => request({ url: "/phi/reports", params }),
  report: (id) => request({ url: `/phi/reports/${id}` }),
  acceptReport: (id, payload) =>
    request({ url: `/phi/reports/${id}/accept`, method: "post", data: payload }),
  rejectReport: (id, payload) =>
    request({ url: `/phi/reports/${id}/reject`, method: "post", data: payload }),
  visits: () => request({ url: "/phi/visits" }),
  updateVisit: (id, payload) =>
    request({ url: `/phi/visits/${id}`, method: "put", data: payload }),
  uploadInspectionPhotos: (id, formData) =>
    request({
      url: `/phi/visits/${id}/photos`,
      method: "post",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    }),
  profile: () => request({ url: "/phi/profile" }),
  updateProfile: (payload) =>
    request({ url: "/phi/profile", method: "put", data: payload }),
};

export default phiService;

import { request } from "./api";

export const citizenService = {
  dashboard: () => request({ url: "/citizen/dashboard" }),
  complaints: (params) => request({ url: "/citizen/complaints", params }),
  complaint: (id) => request({ url: `/citizen/complaints/${id}` }),
  createComplaint: (formData) =>
    request({
      url: "/citizen/complaints",
      method: "post",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    }),
  profile: () => request({ url: "/citizen/profile" }),
  updateProfile: (payload) =>
    request({ url: "/citizen/profile", method: "put", data: payload }),
  updateSettings: (payload) =>
    request({ url: "/citizen/settings", method: "put", data: payload }),
};

export default citizenService;

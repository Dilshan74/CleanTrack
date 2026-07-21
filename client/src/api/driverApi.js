import api from "./axios";

export const getDriverProfile = () => api.get("/driver/profile");

export const getTodaySchedule = () => api.get("/driver/schedule");

export const updateCollectionStatus = (id, data) => api.put(`/driver/collection/${id}`, data);


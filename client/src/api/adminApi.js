import api from "./axios";

export const getUsers = () => api.get("/admin/users");

export const getDrivers = () =>  api.get("/admin/drivers");

export const addDriver = (data) => api.post("/admin/drivers", data);

export const deleteDriver = (id) => api.delete(`/admin/drivers/${id}`);


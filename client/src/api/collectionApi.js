import api from "./axios";

// Get all collection schedules
export const getCollections = () => {
  return api.get("/collections");
};

// Get a single collection by ID
export const getCollectionById = (id) => {
  return api.get(`/collections/${id}`);
};

// Create a new collection schedule
export const createCollection = (data) => {
  return api.post("/collections", data);
};

// Update a collection schedule
export const updateCollection = (id, data) => {
  return api.put(`/collections/${id}`, data);
};

// Delete a collection schedule
export const deleteCollection = (id) => {
  return api.delete(`/collections/${id}`);
};
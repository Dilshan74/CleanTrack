import { request } from "./api";

export const mapService = {
  riskAreas: (params) => request({ url: "/map/risk-areas", params }),
  heatmap: (params) => request({ url: "/map/heatmap", params }),
  reverseGeocode: (lat, lng) =>
    request({ url: "/map/reverse-geocode", params: { lat, lng } }),

  /** Browser geolocation, wrapped as a promise. */
  currentPosition: () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
        reject,
      );
    }),
};

export default mapService;

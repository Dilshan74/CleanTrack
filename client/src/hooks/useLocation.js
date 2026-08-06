import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL, STORAGE_KEYS } from "../utils/constants";

/**
 * Track the device's live geolocation (used by the driver LiveLocation page).
 *
 * Falls back to a simulated moving position when the browser Geolocation API is
 * unavailable or permission is denied, so the UI still demonstrates tracking.
 *
 * Returns: { position, error, tracking, simulated, start, stop }
 * where position = { lat, lng, speed, heading, accuracy, updatedAt }.
 */
const START = { lat: 6.9271, lng: 79.8612 }; // Colombo default coordinates

export function useLocation({ auto = true } = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const watchId = useRef(null);
  const timer = useRef(null);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const socketHost = API_BASE_URL.replace("/api", "");
    const socket = io(socketHost);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected to server:", socket.id);
      const userStr = localStorage.getItem(STORAGE_KEYS.user);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          socket.emit("join", `driver:${user.id || user._id}`);
        } catch (e) {
          console.error(e);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const stop = useCallback(() => {
    if (watchId.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setTracking(false);
  }, []);

  const emitLocation = useCallback((pos) => {
    if (socketRef.current && socketRef.current.connected) {
      const userStr = localStorage.getItem(STORAGE_KEYS.user);
      let driverId = "unknown";
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          driverId = user.id || user._id;
        } catch (e) {}
      }
      socketRef.current.emit("driver_location", {
        driverId,
        ...pos,
      });
    }
  }, []);

  const startSimulated = useCallback(() => {
    setSimulated(true);
    setTracking(true);
    let step = 0;
    timer.current = setInterval(() => {
      step += 1;
      const nextPos = {
        lat: START.lat + step * 0.0004,
        lng: START.lng + step * 0.0003,
        speed: 6 + Math.round(Math.sin(step / 3) * 3),
        heading: (step * 12) % 360,
        accuracy: 12,
        updatedAt: new Date().toISOString(),
      };
      setPosition(nextPos);
      emitLocation(nextPos);
    }, 2000);
  }, [emitLocation]);

  const start = useCallback(() => {
    setError(null);
    if (!("geolocation" in navigator)) {
      startSimulated();
      return;
    }
    setTracking(true);
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setSimulated(false);
        const nextPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed ?? 0,
          heading: pos.coords.heading ?? 0,
          accuracy: pos.coords.accuracy,
          updatedAt: new Date().toISOString(),
        };
        setPosition(nextPos);
        emitLocation(nextPos);
      },
      (err) => {
        setError(err.message);
        startSimulated();
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 8000 },
    );
  }, [startSimulated, emitLocation]);

  useEffect(() => {
    if (auto) start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { position, error, tracking, simulated, start, stop };
}

export default useLocation;

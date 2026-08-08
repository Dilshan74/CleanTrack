import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL, STORAGE_KEYS } from "../utils/constants";

/**
 * Track the device's live geolocation (used by the driver LiveLocation page).
 *
 * Uses the browser Geolocation API with high accuracy.
 * Does NOT fall back to a simulated position - real GPS only.
 *
 * Returns:
 *   { position, error, tracking, permissionState, start, stop, driverInfo, simulated }
 *
 * permissionState: "prompt" | "granted" | "denied" | "unavailable" | "acquiring"
 * position: { lat, lng, speed, heading, accuracy, updatedAt }
 */

/** Read the logged-in driver info from localStorage. */
function getDriverInfo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

export function useLocation({ auto = true } = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState(false);
  // "prompt" | "granted" | "denied" | "unavailable" | "acquiring"
  const [permissionState, setPermissionState] = useState("prompt");

  const watchId = useRef(null);
  const socketRef = useRef(null);
  const driverInfo = useRef(getDriverInfo());

  /* Socket */
  useEffect(() => {
    const socketHost = API_BASE_URL.replace("/api", "");
    const socket = io(socketHost);
    socketRef.current = socket;

    socket.on("connect", () => {
      const info = driverInfo.current;
      if (info) {
        socket.emit("join", `driver:${info.id || info._id}`);
      }
    });

    return () => socket.disconnect();
  }, []);

  /* Emit helper */
  const emitLocation = useCallback((pos) => {
    if (socketRef.current?.connected) {
      const info = driverInfo.current;
      socketRef.current.emit("driver_location", {
        driverId: info ? (info.id || info._id) : "unknown",
        driverName: info?.fullName || "Driver",
        ...pos,
      });
    }
  }, []);

  /* Stop */
  const stop = useCallback(() => {
    if (watchId.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setTracking(false);
  }, []);

  /* Start - real GPS only, no simulation fallback */
  const start = useCallback(() => {
    setError(null);

    if (!("geolocation" in navigator)) {
      setPermissionState("unavailable");
      setError("Geolocation is not supported by this browser.");
      return;
    }

    // Clear any previous watcher
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    setPermissionState("acquiring");
    setTracking(true);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPermissionState("granted");
        setError(null);
        const nextPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          // watchPosition returns speed in m/s; convert to km/h
          speed: pos.coords.speed != null ? Math.round(pos.coords.speed * 3.6) : 0,
          heading: pos.coords.heading ?? 0,
          accuracy: pos.coords.accuracy,
          updatedAt: new Date().toISOString(),
        };
        setPosition(nextPos);
        emitLocation(nextPos);
      },
      (err) => {
        setTracking(false);
        watchId.current = null;
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState("denied");
          setError(
            "Location permission denied. Click the lock icon in your browser address bar, allow location, then click Start Tracking."
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setPermissionState("unavailable");
          setError("Location information is unavailable. Check your device GPS or network.");
        } else if (err.code === err.TIMEOUT) {
          setPermissionState("prompt");
          setError("Location request timed out. Please try again.");
        } else {
          setPermissionState("prompt");
          setError(`Location error: ${err.message}`);
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,     // always get a fresh position
        timeout: 15000,    // wait up to 15 s for a GPS fix
      }
    );
  }, [emitLocation]);

  /* Check existing browser permission on mount */
  useEffect(() => {
    const tryAutoStart = () => {
      if (auto) start();
    };

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "granted") {
            setPermissionState("granted");
            tryAutoStart();
          } else if (result.state === "denied") {
            setPermissionState("denied");
            setError(
              "Location permission denied. Click the lock icon in your browser address bar, allow location, then click Start Tracking."
            );
          } else {
            // "prompt" - browser will show the native permission popup when watchPosition is called
            setPermissionState("prompt");
            tryAutoStart();
          }

          // React to user changing permission in browser settings
          result.onchange = () => {
            if (result.state === "granted") {
              setPermissionState("granted");
              start();
            } else if (result.state === "denied") {
              stop();
              setPermissionState("denied");
              setError(
                "Location permission denied. Click the lock icon in your browser address bar and allow location."
              );
            }
          };
        })
        .catch(() => {
          tryAutoStart();
        });
    } else {
      tryAutoStart();
    }

    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    position,
    error,
    tracking,
    permissionState,
    start,
    stop,
    driverInfo: driverInfo.current,
    simulated: false, // backward-compat: never simulate
  };
}

export default useLocation;

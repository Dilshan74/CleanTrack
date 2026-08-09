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

export function useLocation({ auto = true, routeInfo = null } = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState(false);
  // "prompt" | "granted" | "denied" | "unavailable" | "acquiring"
  const [permissionState, setPermissionState] = useState("prompt");

  const watchId = useRef(null);
  const socketRef = useRef(null);
  const driverInfo = useRef(getDriverInfo());

  // Keep refs to latest values to avoid stale closures
  const routeInfoRef = useRef(routeInfo);
  const positionRef = useRef(null);
  const trackingRef = useRef(false);

  // Keep refs in sync with state/props
  useEffect(() => {
    routeInfoRef.current = routeInfo;
  }, [routeInfo]);

  useEffect(() => {
    trackingRef.current = tracking;
  }, [tracking]);

  /* Emit helper - reads from refs so always has latest values */
  const emitLocation = useCallback((pos) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;

    const info = driverInfo.current;
    const currentRoute = routeInfoRef.current;

    // Use the route's assignedDriver (Driver _id string) if available,
    // otherwise fall back to the logged-in User _id
    const correctDriverId =
      (typeof currentRoute?.assignedDriver === "string"
        ? currentRoute.assignedDriver
        : currentRoute?.assignedDriver?._id) ||
      (info ? info.id || info._id : "unknown");

    const payload = {
      driverId:   correctDriverId,
      driverName: info?.fullName || info?.name || "Driver",
      routeId:    currentRoute?._id || "",
      postalCode: currentRoute?.postalCode || "",
      ...pos,
    };

    console.log("[DRIVER LOCATION] emitting driver_location:", payload);
    socket.emit("driver_location", payload);
  }, []);

  /* Socket setup - only once */
  useEffect(() => {
    const socketHost = API_BASE_URL.replace("/api", "");
    const socket = io(socketHost);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[useLocation] socket connected:", socket.id);
      const info = driverInfo.current;
      if (info) {
        socket.emit("join", `driver:${info.id || info._id}`);
      }
      // If already tracking and have a position, re-emit so the server
      // picks it up right away (handles page reload while tracking)
      if (positionRef.current && trackingRef.current) {
        setTimeout(() => emitLocation(positionRef.current), 200);
      }
    });

    socket.on("disconnect", () => {
      console.log("[useLocation] socket disconnected");
    });

    return () => socket.disconnect();
  // emitLocation is stable (useCallback with [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* When routeInfo arrives (async fetch), re-emit last position so the
     postalCode + correct driverId are broadcast even if the truck is stationary */
  useEffect(() => {
    if (!routeInfo) return;
    routeInfoRef.current = routeInfo;
    if (positionRef.current && trackingRef.current) {
      emitLocation(positionRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfo]);

  /* Stop */
  const stop = useCallback(() => {
    if (watchId.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    trackingRef.current = false;
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
    trackingRef.current = true;
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
        positionRef.current = nextPos;
        setPosition(nextPos);
        emitLocation(nextPos);
      },
      (err) => {
        trackingRef.current = false;
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

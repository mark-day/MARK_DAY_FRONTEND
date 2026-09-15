// src/component/useLocationTracker.js
import { useEffect } from "react";
import axios from "axios";

const BASE_URL = "https://attendance-backend-final-4.onrender.com";

export default function useLocationTracker(empId, isLoggedIn) {
  useEffect(() => {
    if (!empId || !isLoggedIn) return;

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            await axios.post(`${BASE_URL}/api/track-location/update-location`, {
              empId,
              latitude: latitude.toFixed(6),
              longitude: longitude.toFixed(6),
            });
            console.log("✅ Location updated", latitude, longitude);
          } catch (err) {
            console.error("❌ Location update failed:", err.response?.data || err.message);
          }
        },
        (err) => {
          console.error("❌ Geolocation error:", err);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [empId, isLoggedIn]);
}

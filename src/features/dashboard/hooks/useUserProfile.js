import { useCallback, useEffect, useState } from "react";

import {
  getUserByEmployeeId,
  updateUserPhoto,
} from "../api/dashboardApi";

const normalizeUser = (user) => ({
  empId: user?.empId || "",

  name:
    user?.name ||
    user?.fullName ||
    user?.employeeName ||
    user?.username ||
    "User",

  role:
    user?.role ||
    user?.userRole ||
    user?.designation ||
    "Employee",

  photo: user?.photo || null,
});

export const useUserProfile = (empId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(empId));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!empId) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getUserByEmployeeId(empId);

      setUser(normalizeUser(data));
    } catch (error) {
      console.error("Profile fetch failed:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }, [empId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const uploadPhoto = async (file) => {
    if (!file || !empId) return;

    if (!file.type.startsWith("image/")) {
      throw new Error("Please select a valid image.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(
        "Profile photo must be smaller than 5 MB."
      );
    }

    setUploading(true);

    try {
      const base64 = await new Promise(
        (resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () =>
            resolve(reader.result);

          reader.onerror = () =>
            reject(
              new Error(
                "Unable to read the selected image."
              )
            );

          reader.readAsDataURL(file);
        }
      );

      await updateUserPhoto(empId, base64);

      setUser((current) =>
        current
          ? {
              ...current,
              photo: base64,
            }
          : current
      );
    } finally {
      setUploading(false);
    }
  };

  return {
    user,
    loading,
    uploading,
    error,
    refreshProfile: fetchProfile,
    uploadPhoto,
  };
};
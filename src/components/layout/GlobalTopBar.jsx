import React, { useEffect, useRef, useState } from "react";
import { Camera, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL =
  "https://attendance-backend-final-4.onrender.com";

function GlobalTopBar({
  user: externalUser = null,
  loading: externalLoading = false,
  uploading = false,
  onPhotoChange,
}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // =========================================================
  // STATE
  // =========================================================

  const [user, setUser] = useState(externalUser);
  const [loading, setLoading] = useState(!externalUser);
  const [error, setError] = useState("");

  // =========================================================
  // GET ACTUAL LOGGED-IN EMPLOYEE ID
  // =========================================================

  const getEmployeeId = () => {
    return (
      localStorage.getItem("empId") ||
      localStorage.getItem("employeeId") ||
      localStorage.getItem("empID") ||
      ""
    );
  };

  // =========================================================
  // FETCH ACTUAL PROFILE DATA
  // =========================================================

  const fetchProfile = async () => {
    const empId = getEmployeeId();

    if (!empId) {
      setLoading(false);
      setError("Employee ID not found");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${BASE_URL}/profile/emp/${encodeURIComponent(empId)}`,
        {
          timeout: 15000,
        }
      );

      const profile = response?.data;

      if (!profile) {
        throw new Error("Profile data was not returned.");
      }

      setUser(profile);

      // Keep useful profile data available locally.
      if (profile.name) {
        localStorage.setItem("userName", profile.name);
      }

      if (profile.role) {
        localStorage.setItem("userRole", profile.role);
      }

      if (profile.photo) {
        localStorage.setItem("userPhoto", profile.photo);
      }
    } catch (err) {
      console.error("GlobalTopBar profile fetch failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load profile"
      );

      // =====================================================
      // FALLBACK TO LOCAL STORAGE
      // =====================================================

      const fallbackName =
        localStorage.getItem("userName") ||
        localStorage.getItem("name") ||
        "";

      const fallbackRole =
        localStorage.getItem("userRole") ||
        localStorage.getItem("role") ||
        "Employee";

      const fallbackPhoto =
        localStorage.getItem("userPhoto") ||
        localStorage.getItem("photo") ||
        "";

      setUser({
        name: fallbackName,
        role: fallbackRole,
        photo: fallbackPhoto,
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH PROFILE ON MOUNT
  // =========================================================

  useEffect(() => {
    // If parent already supplied complete user data,
    // still use it immediately and then refresh from backend.
    if (externalUser) {
      setUser(externalUser);
      setLoading(false);
    }

    fetchProfile();
  }, []);

  // =========================================================
  // KEEP EXTERNAL USER DATA IN SYNC
  // =========================================================

  useEffect(() => {
    if (externalUser) {
      setUser(externalUser);
    }
  }, [externalUser]);

  // =========================================================
  // ACTUAL DISPLAY VALUES
  // =========================================================

  const employeeId = getEmployeeId();

  const displayName =
    user?.name ||
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    "User";

  const displayRole =
    user?.role ||
    localStorage.getItem("userRole") ||
    localStorage.getItem("role") ||
    "Employee";

  const displayPhoto =
    user?.photo ||
    localStorage.getItem("userPhoto") ||
    localStorage.getItem("photo") ||
    "";

  // =========================================================
  // PROFILE CLICK
  // =========================================================

  const handleProfileClick = () => {
    if (uploading || loading || externalLoading) {
      return;
    }

    navigate("/dashboard/profile");
  };

  // =========================================================
  // CAMERA CLICK
  // =========================================================

  const handlePhotoClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (uploading || loading || externalLoading) {
      return;
    }

    fileInputRef.current?.click();
  };

  // =========================================================
  // FILE SELECTED
  // =========================================================

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Reset immediately so the same file can be selected again.
    event.target.value = "";

    // Basic frontend validation.
    if (!file.type.startsWith("image/")) {
      window.alert("Please select a valid image.");
      return;
    }

    // Prevent extremely large files.
    if (file.size > 5 * 1024 * 1024) {
      window.alert("Please select an image smaller than 5 MB.");
      return;
    }

    try {
      // Let parent handle the actual photo operation.
      await onPhotoChange?.(file);

      // Refresh actual backend profile after successful update.
      await fetchProfile();
    } catch (error) {
      console.error(
        "Profile photo update failed:",
        error
      );

      window.alert(
        error?.message ||
          "Unable to update profile photo."
      );
    }
  };

  // =========================================================
  // RETRY
  // =========================================================

  const handleRetry = async (event) => {
    event?.stopPropagation();
    await fetchProfile();
  };

  // =========================================================
  // LOADING STATE
  // =========================================================

  const isLoading =
    loading || externalLoading;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <header className="w-full">
      <div
        className="
          flex
          min-h-[70px]
          w-full
          items-center
          justify-between
          gap-3
          rounded-[36px]
          border
          border-black/[0.025]
          bg-white
          px-4
          py-2.5
          shadow-[0_2px_10px_rgba(15,23,42,0.035)]
          sm:gap-4
          sm:px-7
          lg:px-9
        "
      >
        {/* ===================================================
            COMPANY
        ==================================================== */}

        <div className="min-w-0 flex-1">
          <p
            className="
              truncate
              text-[16px]
              font-semibold
              tracking-[-0.01em]
              text-[#07569A]
              sm:text-[18px]
              lg:text-[19px]
            "
          >
            Athratech Pvt Limited
          </p>
        </div>

        {/* ===================================================
            PROFILE AREA
        ==================================================== */}

        <button
          type="button"
          onClick={handleProfileClick}
          disabled={
            isLoading ||
            uploading
          }
          aria-label={`Open profile for ${displayName}`}
          className="
            group
            flex
            min-w-0
            shrink-0
            items-center
            gap-2
            rounded-full
            px-1.5
            py-1.5
            text-left
            outline-none
            transition
            hover:bg-[#F8FAFC]
            focus-visible:ring-2
            focus-visible:ring-[#0A58A6]/20
            disabled:cursor-not-allowed
            disabled:opacity-70
            sm:gap-3
            sm:px-3
          "
        >
          {/* =================================================
              AVATAR
          ================================================== */}

          <span
            className="
              relative
              block
              h-10
              w-10
              shrink-0
              overflow-hidden
              rounded-full
              bg-[#EEF2F6]
              ring-1
              ring-black/[0.04]
              transition
              group-hover:ring-black/[0.10]
            "
          >
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt=""
                className="
                  h-full
                  w-full
                  object-cover
                "
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <span
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                "
              >
                <UserRound
                  size={20}
                  strokeWidth={1.8}
                  className="text-[#49647A]"
                />
              </span>
            )}

            {/* =================================================
                CAMERA OVERLAY
            ================================================== */}

            {!uploading &&
              !isLoading && (
                <span
                  role="presentation"
                  onClick={handlePhotoClick}
                  className="
                    absolute
                    inset-0
                    flex
                    cursor-pointer
                    items-center
                    justify-center
                    bg-black/35
                    opacity-0
                    transition
                    group-hover:opacity-100
                  "
                >
                  <Camera
                    size={15}
                    strokeWidth={2}
                    className="text-white"
                  />
                </span>
              )}

            {/* =================================================
                UPLOAD LOADER
            ================================================== */}

            {uploading && (
              <span
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  bg-black/45
                "
              >
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/40
                    border-t-white
                  "
                />
              </span>
            )}

            {/* =================================================
                LOADING OVERLAY
            ================================================== */}

            {isLoading && !uploading && (
              <span
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  bg-[#EEF2F6]
                "
              >
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-[#07569A]/20
                    border-t-[#07569A]
                  "
                />
              </span>
            )}
          </span>

          {/* =================================================
              USER INFORMATION
          ================================================== */}

          <span className="min-w-0">
            <span
              className="
                block
                max-w-[120px]
                truncate
                text-[14px]
                font-semibold
                leading-5
                text-[#202124]
                sm:max-w-[220px]
                sm:text-[15px]
              "
            >
              {isLoading
                ? "Loading..."
                : displayName}
            </span>

            <span
              className="
                mt-0.5
                inline-flex
                max-w-[120px]
                truncate
                rounded-full
                bg-[#F1F3F5]
                px-2
                py-[2px]
                text-[9px]
                font-medium
                leading-[15px]
                text-[#30343B]
                sm:max-w-[220px]
                sm:text-[10px]
              "
            >
              {isLoading
                ? "Loading"
                : displayRole}
            </span>
          </span>
        </button>

        {/* ===================================================
            HIDDEN FILE INPUT
        ==================================================== */}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* =====================================================
          OPTIONAL ERROR / RETRY
          
          Only shown when backend profile cannot be loaded
          and no usable fallback data exists.
      ====================================================== */}

      {error &&
        !user?.name &&
        !localStorage.getItem("userName") && (
          <div className="mt-2 flex items-center justify-end gap-2 px-3 text-[11px] text-[#64748B]">
            <span>Unable to load profile</span>

            <button
              type="button"
              onClick={handleRetry}
              className="
                font-semibold
                text-[#07569A]
                hover:underline
              "
            >
              Retry
            </button>
          </div>
        )}

      {/* =====================================================
          EMPLOYEE ID
          
          Not displayed in the UI, but the component uses the
          actual logged-in empId to fetch the profile.
      ====================================================== */}

      {employeeId && null}
    </header>
  );
}

export default GlobalTopBar;
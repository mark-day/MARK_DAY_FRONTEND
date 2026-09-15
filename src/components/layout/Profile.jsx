import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const BASE_URL =
  "https://attendance-backend-final-4.onrender.com";

// =========================================================
// STORAGE HELPERS
// =========================================================

const getStoredUser = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const keys = [
    "user",
    "authUser",
    "employee",
    "profile",
  ];

  for (const key of keys) {
    try {
      const raw =
        localStorage.getItem(key) ||
        sessionStorage.getItem(key);

      if (!raw) continue;

      const parsed = JSON.parse(raw);

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        return parsed;
      }
    } catch {
      // Ignore invalid stored data.
    }
  }

  return {};
};

// =========================================================
// EMPLOYEE ID
// =========================================================

const getStoredEmpId = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const storedUser = getStoredUser();

  return (
    storedUser.empId ||
    storedUser.employeeId ||
    localStorage.getItem("empId") ||
    sessionStorage.getItem("empId") ||
    ""
  );
};

// =========================================================
// AUTH HEADERS
// =========================================================

const getAuthHeaders = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    sessionStorage.getItem("accessToken") ||
    "";

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

// =========================================================
// DISPLAY HELPERS
// =========================================================

const getDisplayName = (user) =>
  user?.name ||
  user?.username ||
  user?.employeeName ||
  user?.empName ||
  "User";

const getInitial = (name) => {
  const value = String(name || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return value || "U";
};

const formatRole = (role) => {
  if (!role) {
    return "Not available";
  }

  return String(role)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getErrorMessage = (
  error,
  fallback
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

// =========================================================
// PROFILE FIELD
// =========================================================

function ProfileField({
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <label
        className="
          mb-3
          block
          text-[13px]
          font-medium
          text-[#6B7280]
          sm:text-[14px]
        "
      >
        {label}
      </label>

      <div
        className="
          flex
          min-h-[52px]
          w-full
          items-center
          overflow-hidden
          rounded-[16px]
          border
          border-[#E5E7EB]
          bg-[#F9FAFB]
          px-4
          text-[14px]
          text-[#111827]
          sm:px-5
          sm:text-[15px]
        "
      >
        <span className="truncate">
          {value || "Not available"}
        </span>
      </div>
    </div>
  );
}

// =========================================================
// EDIT INPUT
// =========================================================

function EditInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={`profile-${name}`}
        className="
          mb-3
          block
          text-[13px]
          font-medium
          text-[#6B7280]
          sm:text-[14px]
        "
      >
        {label}
      </label>

      <input
        id={`profile-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="
          h-[52px]
          w-full
          rounded-[16px]
          border
          border-[#E5E7EB]
          bg-white
          px-4
          text-[14px]
          text-[#111827]
          outline-none
          transition
          placeholder:text-[#9CA3AF]
          focus:border-[#0A58A6]
          focus:ring-2
          focus:ring-[#0A58A6]/10
          sm:px-5
          sm:text-[15px]
        "
      />
    </div>
  );
}

// =========================================================
// SKELETON
// =========================================================

function SkeletonField() {
  return (
    <div>
      <div
        className="
          mb-3
          h-4
          w-24
          animate-pulse
          rounded
          bg-[#E5E7EB]
        "
      />

      <div
        className="
          h-[52px]
          w-full
          animate-pulse
          rounded-[16px]
          bg-[#F1F3F5]
        "
      />
    </div>
  );
}

// =========================================================
// PROFILE PAGE
// =========================================================

export default function Profile() {
  const navigate = useNavigate();

  // =======================================================
  // STATE
  // =======================================================

  const [profile, setProfile] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const empId = useMemo(
    () => getStoredEmpId(),
    []
  );

  // =======================================================
  // LOAD PROFILE FROM BACKEND
  // =======================================================

  const loadProfile = async (
    showRefreshState = false
  ) => {
    if (!empId) {
      setLoading(false);
      setError(
        "Employee ID is missing. Please login again."
      );
      return;
    }

    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await axios.get(
          `${BASE_URL}/profile/emp/${encodeURIComponent(
            empId
          )}`,
          {
            headers: getAuthHeaders(),
            timeout: 15000,
          }
        );

      const user =
        response?.data || {};

      setProfile(user);

      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      // ===================================================
      // KEEP HEADER STORAGE IN SYNC
      // ===================================================

      try {
        const storedUser =
          getStoredUser();

        const updatedStoredUser = {
          ...storedUser,
          ...user,
          empId:
            user.empId || empId,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(
            updatedStoredUser
          )
        );

        if (user.name) {
          localStorage.setItem(
            "userName",
            user.name
          );

          localStorage.setItem(
            "empName",
            user.name
          );
        }

        if (user.role) {
          localStorage.setItem(
            "userRole",
            user.role
          );
        }

        if (user.photo) {
          localStorage.setItem(
            "userPhoto",
            user.photo
          );
        }
      } catch {
        // Storage synchronization is optional.
      }
    } catch (err) {
      console.error(
        "Profile fetch error:",
        err
      );

      if (
        err?.response?.status === 404
      ) {
        setError(
          "Employee profile was not found."
        );
      } else if (
        err?.response?.status === 401 ||
        err?.response?.status === 403
      ) {
        setError(
          "You are not authorized to view this profile."
        );
      } else if (
        err?.code === "ECONNABORTED"
      ) {
        setError(
          "The server took too long to respond. Please try again."
        );
      } else {
        setError(
          getErrorMessage(
            err,
            "Unable to load your profile. Please try again."
          )
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadProfile();

    // Employee ID is intentionally captured once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empId]);

  // =======================================================
  // PROFILE VALUES
  // =======================================================

  const displayName =
    getDisplayName(profile);

  const role =
    formatRole(profile?.role);

  const profileImage =
    profile?.photo || "";

  // =======================================================
  // INPUT CHANGE
  // =======================================================

  const handleInputChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =======================================================
  // START EDITING
  // =======================================================

  const handleEdit = () => {
    if (!profile || saving) {
      return;
    }

    setForm({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
    });

    setError("");
    setSuccess("");
    setEditing(true);
  };

  // =======================================================
  // CANCEL EDIT
  // =======================================================

  const handleCancel = () => {
    if (saving) {
      return;
    }

    setForm({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
    });

    setError("");
    setSuccess("");
    setEditing(false);
  };

  // =======================================================
  // SAVE PROFILE
  // =======================================================

  const handleSave = async (
    event
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const name =
      form.name.trim();

    const email =
      form.email.trim();

    const phone =
      form.phone.trim();

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!name) {
      setError(
        "Full name is required."
      );
      return;
    }

    if (!email) {
      setError(
        "Email address is required."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!phone) {
      setError(
        "Phone number is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // ===================================================
      // IMPORTANT:
      // This matches the actual backend:
      //
      // PUT /profile/emp/:empId
      //
      // JSON body:
      // {
      //   name,
      //   email,
      //   phone
      // }
      // ===================================================

      const payload = {
        name,
        email,
        phone,
      };

      const response =
        await axios.put(
          `${BASE_URL}/profile/emp/${encodeURIComponent(
            empId
          )}`,
          payload,
          {
            headers: {
              "Content-Type":
                "application/json",
              ...getAuthHeaders(),
            },
            timeout: 15000,
          }
        );

      // ===================================================
      // USE ACTUAL BACKEND RESPONSE
      // ===================================================

      const updatedUser =
        response?.data || {
          ...profile,
          ...payload,
        };

      setProfile(updatedUser);

      setForm({
        name:
          updatedUser.name ||
          name,

        email:
          updatedUser.email ||
          email,

        phone:
          updatedUser.phone ||
          phone,
      });

      // ===================================================
      // UPDATE LOCAL STORAGE
      // ===================================================

      try {
        const storedUser =
          getStoredUser();

        const nextStoredUser = {
          ...storedUser,
          ...updatedUser,
          empId:
            updatedUser.empId ||
            empId,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(
            nextStoredUser
          )
        );

        localStorage.setItem(
          "empId",
          updatedUser.empId ||
            empId
        );

        localStorage.setItem(
          "userName",
          updatedUser.name ||
            name
        );

        localStorage.setItem(
          "empName",
          updatedUser.name ||
            name
        );

        if (updatedUser.role) {
          localStorage.setItem(
            "userRole",
            updatedUser.role
          );
        }

        if (updatedUser.photo) {
          localStorage.setItem(
            "userPhoto",
            updatedUser.photo
          );
        }
      } catch {
        // Storage update is best effort.
      }

      setEditing(false);

      setSuccess(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      if (
        err?.response?.status === 404
      ) {
        setError(
          "Employee profile was not found."
        );
      } else if (
        err?.response?.status === 409
      ) {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "This information is already used by another employee."
        );
      } else if (
        err?.response?.status === 400
      ) {
        setError(
          getErrorMessage(
            err,
            "Invalid profile information."
          )
        );
      } else if (
        err?.response?.status === 401 ||
        err?.response?.status === 403
      ) {
        setError(
          "You are not authorized to update this profile."
        );
      } else if (
        err?.code === "ECONNABORTED"
      ) {
        setError(
          "The server took too long to respond. Please try again."
        );
      } else if (
        err?.code === "ERR_NETWORK"
      ) {
        setError(
          "Unable to connect to the server. Please check your internet connection."
        );
      } else {
        setError(
          getErrorMessage(
            err,
            "Unable to update your profile. Please try again."
          )
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // LOGOUT
  // =======================================================

  const handleLogout = () => {
    const keys = [
      "isLoggedIn",
      "empId",
      "empName",
      "userName",
      "user",
      "authUser",
      "employee",
      "profile",
      "userPhoto",
      "token",
      "authToken",
      "accessToken",
    ];

    keys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    navigate("/login", {
      replace: true,
    });
  };

  // =======================================================
  // LOADING UI
  // =======================================================

  if (loading) {
    return (
      <main
        className="
          min-h-screen
          w-full
          bg-[#F6F8FA]
          px-4
          py-5
          sm:px-6
          md:px-8
          lg:px-10
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-full
          "
        >
          {/* Header skeleton */}

          <div
            className="
              mb-8
              flex
              h-[64px]
              items-center
              justify-between
              rounded-full
              bg-white
              px-5
              shadow-sm
              sm:px-6
            "
          >
            <div
              className="
                h-4
                w-40
                animate-pulse
                rounded
                bg-[#E5E7EB]
              "
            />

            <div
              className="
                h-8
                w-28
                animate-pulse
                rounded-full
                bg-[#F1F3F5]
              "
            />
          </div>

          {/* Title skeleton */}

          <div
            className="
              mb-8
              h-12
              w-40
              animate-pulse
              rounded-xl
              bg-[#E5E7EB]
            "
          />

          {/* Profile skeleton */}

          <section
            className="
              rounded-[28px]
              bg-white
              px-5
              py-7
              shadow-sm
              sm:px-8
              md:px-10
            "
          >
            <div
              className="
                mb-8
                h-6
                w-48
                animate-pulse
                rounded
                bg-[#E5E7EB]
              "
            />

            <div
              className="
                mb-10
                h-[120px]
                w-[120px]
                animate-pulse
                rounded-full
                bg-[#F1F3F5]
              "
            />

            <div
              className="
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
                md:gap-8
              "
            >
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <SkeletonField
                  key={index}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  // =======================================================
  // ERROR WITHOUT PROFILE
  // =======================================================

  if (error && !profile) {
    return (
      <main
        className="
          min-h-screen
          w-full
          bg-[#F6F8FA]
          px-4
          py-5
          sm:px-6
          md:px-8
          lg:px-10
        "
      >
        <div
          className="
            mx-auto
            flex
            min-h-[70vh]
            w-full
            max-w-full
            items-center
            justify-center
          "
        >
          <div
            className="
              w-full
              max-w-[460px]
              rounded-[28px]
              bg-white
              p-7
              text-center
              shadow-sm
              sm:p-9
            "
          >
            <div
              className="
                mx-auto
                mb-5
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-red-50
                text-red-600
              "
            >
              !
            </div>

            <h1
              className="
                text-[20px]
                font-semibold
                text-[#111827]
              "
            >
              Unable to load profile
            </h1>

            <p
              className="
                mt-2
                text-[14px]
                leading-6
                text-[#6B7280]
              "
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadProfile(true)
              }
              disabled={refreshing}
              className="
                mt-6
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-[#0A58A6]
                px-5
                text-[14px]
                font-medium
                text-white
                transition
                hover:bg-[#084A8B]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =======================================================
  // MAIN PAGE
  // =======================================================

  return (
    <main
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-[#F6F8FA]
        px-4
        py-5
        max-[768px]:px-0
        md:px-8
        lg:px-10
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-full
        "
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <header
          className="
            mb-8
            flex
            h-[64px]
            items-center
            justify-between
            rounded-full
            bg-white
            px-5
            shadow-sm
            sm:px-6
          "
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              text-left
              text-[15px]
              font-medium
              text-[#0A58A6]
              outline-none
              transition
              hover:text-[#084A8B]
              sm:text-[16px]
            "
          >
            Athratech Pvt Limited
          </button>

          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
              sm:gap-3
            "
          >
            {/* Header Avatar */}

            <div
              className="
                h-8
                w-8
                shrink-0
                overflow-hidden
                rounded-full
                bg-[#E5E7EB]
              "
            >
              {profileImage ? (
                <img
                  src={profileImage}
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
                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    text-[13px]
                    font-semibold
                    text-[#374151]
                  "
                >
                  {getInitial(
                    displayName
                  )}
                </div>
              )}
            </div>

            <div
              className="
                hidden
                min-w-0
                sm:block
              "
            >
              <p
                className="
                  max-w-[180px]
                  truncate
                  text-[14px]
                  font-medium
                  text-[#111827]
                "
              >
                {displayName}
              </p>

              <p
                className="
                  text-[10px]
                  text-[#6B7280]
                "
              >
                {role}
              </p>
            </div>
          </div>
        </header>

        {/* =================================================
            PAGE HEADER
        ================================================== */}

        <div
          className="
            mb-8
            flex
            items-center
            gap-4
          "
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="
              flex
              h-[48px]
              w-[48px]
              shrink-0
              items-center
              justify-center
              rounded-[16px]
              bg-white
              shadow-sm
              outline-none
              transition
              hover:bg-[#F3F4F6]
              focus-visible:ring-2
              focus-visible:ring-[#0A58A6]/20
            "
          >
            <ArrowLeft
              className="
                h-5
                w-5
                text-[#111827]
              "
            />
          </button>

          <h1
            className="
              text-[25px]
              font-semibold
              tracking-[-0.02em]
              text-[#111827]
              sm:text-[28px]
            "
          >
            Profile
          </h1>
        </div>

        {/* =================================================
            STATUS MESSAGE
        ================================================== */}

        {(error || success) && (
          <div
            className={`
              mb-6
              rounded-[18px]
              border
              px-4
              py-3
              text-[13px]
              leading-5
              sm:px-5
              ${
                error
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }
            `}
            role="status"
            aria-live="polite"
          >
            {error || success}
          </div>
        )}

        {/* =================================================
            PERSONAL INFORMATION
        ================================================== */}

        <section
          className="
            mb-8
            rounded-[28px]
            bg-white
            px-5
            py-7
            shadow-sm
            sm:px-8
            md:px-10
            md:py-8
          "
        >
          <div
            className="
              mb-7
              flex
              items-center
              justify-between
              gap-4
              sm:mb-8
            "
          >
            <h2
              className="
                text-[19px]
                font-semibold
                text-[#111827]
                sm:text-[20px]
              "
            >
              Personal Information
            </h2>

            {!editing && (
              <button
                type="button"
                onClick={handleEdit}
                disabled={saving}
                className="
                  inline-flex
                  h-10
                  items-center
                  gap-2
                  rounded-[12px]
                  border
                  border-[#E5E7EB]
                  bg-white
                  px-3
                  text-[13px]
                  font-medium
                  text-[#374151]
                  transition
                  hover:bg-[#F9FAFB]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:px-4
                "
              >
                <Pencil
                  className="h-4 w-4"
                />

                <span className="hidden sm:inline">
                  Edit
                </span>
              </button>
            )}
          </div>

          {/* =================================================
              PROFILE PHOTO
              
              Read-only because backend has no multipart
              profile photo upload endpoint.
          ================================================== */}

          <div
            className="
              mb-9
              flex
              justify-center
              sm:justify-start
            "
          >
            <div
              className="
                relative
                h-[120px]
                w-[120px]
                shrink-0
              "
            >
              <div
                className="
                  h-full
                  w-full
                  overflow-hidden
                  rounded-full
                  bg-[#E5E7EB]
                "
              >
                {profileImage ? (
                  <img
                    src={profileImage}
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
                  <div
                    className="
                      flex
                      h-full
                      w-full
                      items-center
                      justify-center
                      text-[34px]
                      font-semibold
                      text-[#374151]
                    "
                  >
                    {getInitial(
                      displayName
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              EDIT MODE
          ================================================== */}

          {editing ? (
            <form
              onSubmit={handleSave}
              className="
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
                md:gap-8
              "
            >
              {/* Full Name */}

              <EditInput
                label="Full Name"
                name="name"
                value={form.name}
                onChange={
                  handleInputChange
                }
                autoComplete="name"
              />

              {/* Employee ID */}

              <ProfileField
                label="Employee ID"
                value={
                  profile?.empId ||
                  empId
                }
              />

              {/* Email */}

              <EditInput
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={
                  handleInputChange
                }
                autoComplete="email"
              />

              {/* Phone */}

              <EditInput
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={
                  handleInputChange
                }
                autoComplete="tel"
              />

              {/* Buttons */}

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-3
                  pt-1
                  sm:flex-row
                  sm:justify-end
                  md:col-span-2
                "
              >
                <button
                  type="button"
                  onClick={
                    handleCancel
                  }
                  disabled={saving}
                  className="
                    h-11
                    rounded-[14px]
                    border
                    border-[#E5E7EB]
                    px-5
                    text-[14px]
                    font-medium
                    text-[#374151]
                    transition
                    hover:bg-[#F9FAFB]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-[14px]
                    bg-[#0A58A6]
                    px-6
                    text-[14px]
                    font-medium
                    text-white
                    transition
                    hover:bg-[#084A8B]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {saving && (
                    <Loader2
                      className="
                        h-4
                        w-4
                        animate-spin
                      "
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            /* =================================================
               VIEW MODE
            ================================================== */

            <div
              className="
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
                md:gap-8
              "
            >
              <ProfileField
                label="Full Name"
                value={
                  profile?.name
                }
              />

              <ProfileField
                label="Employee ID"
                value={
                  profile?.empId ||
                  empId
                }
              />

              <ProfileField
                label="Email Address"
                value={
                  profile?.email
                }
              />

              <ProfileField
                label="Phone Number"
                value={
                  profile?.phone
                }
              />
            </div>
          )}
        </section>

        {/* =================================================
            WORK INFORMATION
        ================================================== */}

        <section
          className="
            mb-8
            rounded-[28px]
            bg-white
            px-5
            py-7
            shadow-sm
            sm:px-8
            md:px-10
            md:py-8
          "
        >
          <h2
            className="
              mb-7
              text-[19px]
              font-semibold
              text-[#111827]
              sm:mb-8
              sm:text-[20px]
            "
          >
            Work Information
          </h2>

          <div
            className="
              grid
              grid-cols-1
              gap-6
              md:grid-cols-2
              md:gap-8
            "
          >
            <ProfileField
              label="Role"
              value={role}
            />

            <ProfileField
              label="Shift"
              value={
                profile?.shift
              }
            />

            <ProfileField
              label="Gender"
              value={
                profile?.gender
              }
            />

            <ProfileField
              label="Joining Date"
              value={formatDate(
                profile?.hireDate
              )}
            />
          </div>
        </section>

        {/* =================================================
            ADDITIONAL DETAILS
        ================================================== */}

        <section
          className="
            mb-10
            rounded-[28px]
            bg-white
            px-5
            py-7
            shadow-sm
            sm:px-8
            md:px-10
            md:py-8
          "
        >
          <h2
            className="
              mb-7
              text-[19px]
              font-semibold
              text-[#111827]
              sm:mb-8
              sm:text-[20px]
            "
          >
            Additional Details
          </h2>

          <div
            className="
              grid
              grid-cols-1
              gap-6
              md:grid-cols-2
              md:gap-8
            "
          >
            <ProfileField
              label="Date of Birth"
              value={formatDate(
                profile?.dob
              )}
            />

            <ProfileField
              label="Paid Leave"
              value={
                profile?.paidLeave
                  ? `${
                      profile.paidLeave
                        .used ?? 0
                    } used / ${
                      profile.paidLeave
                        .total ?? 0
                    } total`
                  : "Not available"
              }
            />
          </div>
        </section>

        {/* =================================================
            LOGOUT
        ================================================== */}

        <div
          className="
            flex
            justify-end
            pb-4
          "
        >
          <button
            type="button"
            onClick={
              handleLogout
            }
            className="
              h-11
              rounded-[14px]
              bg-[#DC2626]
              px-7
              text-[14px]
              font-medium
              text-white
              shadow-sm
              transition
              hover:bg-[#B91C1C]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-red-600/30
              focus-visible:ring-offset-2
            "
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
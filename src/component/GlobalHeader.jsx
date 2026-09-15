import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UseContext";

const DEFAULT_COMPANY = "Athratech Pvt Limited";
const DEFAULT_NAME = "Gustavo Xavier";
const DEFAULT_ROLE = "Super Admin";

const getInitials = (name = "User") => {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "U";

  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() || "U";
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return {};
    }

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser && typeof parsedUser === "object") {
      return parsedUser;
    }

    return {};
  } catch (error) {
    console.error("GlobalHeader: failed to read stored user:", error);
    return {};
  }
};

const GlobalHeader = ({
  className = "",
  companyName: companyNameProp,
  showUserMetaOnMobile = false,

  // Optional explicit overrides
  overrideUser = null,
  overrideProfilePic = "",
}) => {
  const navigate = useNavigate();

  /*
   * IMPORTANT:
   * useUser() is currently returning undefined in your application.
   *
   * Do not destructure it directly:
   *
   * const { user, profilePic } = useUser();
   *
   * Instead, safely read the returned context value.
   */
  const userContext = useUser();

  /*
   * Context user has priority.
   * localStorage is used as a fallback.
   */
  const contextUser = userContext?.user || null;
  const contextProfilePic = userContext?.profilePic || "";

  const storedUser = useMemo(() => {
    /*
     * If context already has a user, there is no need to read
     * localStorage as the primary source.
     */
    if (contextUser) {
      return {};
    }

    return getStoredUser();
  }, [contextUser]);

  /*
   * Explicit override > Context > localStorage > empty object
   */
  const finalUser =
    overrideUser ||
    contextUser ||
    storedUser ||
    {};

  /*
   * Explicit profile picture > Context > localStorage
   */
  const finalProfilePic =
    overrideProfilePic ||
    contextProfilePic ||
    storedUser?.photo ||
    storedUser?.profilePic ||
    storedUser?.profileImage ||
    "";

  /* ================= COMPANY ================= */

  const companyName =
    companyNameProp ||
    finalUser?.companyName ||
    finalUser?.company_name ||
    finalUser?.organizationName ||
    finalUser?.organization_name ||
    finalUser?.company ||
    DEFAULT_COMPANY;

  /* ================= NAME ================= */

  const name =
    finalUser?.name ||
    finalUser?.empName ||
    finalUser?.employeeName ||
    finalUser?.employee_name ||
    finalUser?.fullName ||
    finalUser?.full_name ||
    finalUser?.username ||
    finalUser?.userName ||
    finalUser?.adminName ||
    DEFAULT_NAME;

  /* ================= ROLE ================= */

  const role =
    finalUser?.role ||
    finalUser?.userRole ||
    finalUser?.designation ||
    finalUser?.position ||
    finalUser?.jobTitle ||
    DEFAULT_ROLE;

  /* ================= AVATAR ================= */

  const avatar =
    finalProfilePic ||
    finalUser?.photo ||
    finalUser?.profileImage ||
    finalUser?.profile_image ||
    finalUser?.avatar ||
    finalUser?.image ||
    finalUser?.photoURL ||
    finalUser?.profilePic ||
    "";

  const initials = useMemo(
    () => getInitials(name),
    [name]
  );

  /* ================= NAVIGATION ================= */

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
  };

  return (
    <header
      className={`
        w-full
        rounded-full
        bg-white
        min-h-[56px]
        sm:min-h-[62px]
        lg:min-h-[64px]
        px-[14px]
        sm:px-[18px]
        lg:px-[28px]
        py-[8px]
        flex
        items-center
        justify-between
        shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.04)]
        border
        border-[rgba(17,24,39,0.04)]
        ${className}
      `}
    >

      {/* ================= COMPANY ================= */}

      <div className="min-w-0 pr-3">
        <p
          className="
            truncate
            text-[#1561B2]
            text-[15px]
            sm:text-[17px]
            lg:text-[18px]
            font-[600]
            leading-none
            tracking-[-0.01em]
          "
        >
          {companyName}
        </p>
      </div>

      {/* ================= USER ================= */}

      <button
        type="button"
        onClick={handleProfileClick}
        aria-label="Open profile"
        className="
          flex
          items-center
          gap-[10px]
          sm:gap-3
          shrink-0
          cursor-pointer
          hover:opacity-90
          transition-all
          duration-200
          bg-transparent
          border-0
          p-0
        "
      >

        {/* ================= USER META ================= */}

        <div
          className={`
            ${
              showUserMetaOnMobile
                ? "flex"
                : "hidden sm:flex"
            }
            flex-col
            items-end
            leading-none
          `}
        >
          <span
            className="
              max-w-[120px]
              sm:max-w-[150px]
              lg:max-w-[170px]
              truncate
              text-[#20232A]
              text-[12px]
              sm:text-[13px]
              font-[500]
            "
          >
            {name}
          </span>

          <span
            className="
              mt-[5px]
              text-[#697586]
              text-[10px]
              sm:text-[11px]
              lg:text-[12px]
              font-[500]
            "
          >
            {role}
          </span>
        </div>

        {/* ================= AVATAR ================= */}

        <div
          className="
            h-[42px]
            w-[42px]
            sm:h-[44px]
            sm:w-[44px]
            lg:h-[46px]
            lg:w-[46px]
            rounded-full
            bg-white
            flex
            items-center
            justify-center
            shadow-[0_1px_2px_rgba(16,24,40,0.06)]
            ring-1
            ring-[rgba(17,24,39,0.04)]
            overflow-hidden
            hover:scale-105
            hover:ring-2
            hover:ring-[#1561B2]
            transition-all
            duration-200
          "
        >
          {avatar ? (
            <img
              src={avatar}
              alt={name || "User"}
              className="
                h-[36px]
                w-[36px]
                sm:h-[38px]
                sm:w-[38px]
                lg:h-[40px]
                lg:w-[40px]
                rounded-full
                object-cover
              "
              onError={(event) => {
                /*
                 * Hide broken image instead of displaying
                 * a broken-image icon.
                 */
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div
              className="
                h-[36px]
                w-[36px]
                sm:h-[38px]
                sm:w-[38px]
                lg:h-[40px]
                lg:w-[40px]
                rounded-full
                bg-gradient-to-br
                from-[#DCE6F1]
                to-[#C9D5E5]
                flex
                items-center
                justify-center
                text-[#344054]
                text-[11px]
                sm:text-[12px]
                font-[700]
              "
            >
              {initials}
            </div>
          )}
        </div>

      </button>
    </header>
  );
};

export default GlobalHeader;
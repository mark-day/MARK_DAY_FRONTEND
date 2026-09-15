import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Pencil } from "lucide-react";
import { useUser } from "../../context/UseContext";

const BASE_URL = "https://attendance-backend-final-4.onrender.com";

interface User {
  empId?: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  photo?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
}

interface UserContextType {
  user?: User | null;
  setUser?: (user: User | null) => void;
  profilePic?: string | null;
  setProfilePic?: (pic: string | null) => void;
}

export default function Profile() {
  const navigate = useNavigate();

  /*
   * useUser() is currently returning undefined in your application.
   * Keep the context access safe so the Profile page does not crash.
   */
  const userContext = useUser() as UserContextType | undefined;

  const contextUser = userContext?.user ?? null;
  const contextSetUser = userContext?.setUser;
  const contextProfilePic = userContext?.profilePic ?? null;
  const contextSetProfilePic = userContext?.setProfilePic;

  const [localUser, setLocalUser] = useState<User | null>(null);
  const [localProfilePic, setLocalProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * Context user has priority.
   * localStorage is used as a fallback.
   */
  const user = contextUser ?? localUser;

  const profilePic = contextProfilePic ?? localProfilePic;

  /*
   * ================= LOAD USER FROM LOCAL STORAGE =================
   */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser && typeof parsedUser === "object") {
          setLocalUser(parsedUser);

          if (parsedUser.photo) {
            setLocalProfilePic(parsedUser.photo);
          }
        }
      }
    } catch (error) {
      console.error("Failed to read user from localStorage:", error);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * ================= FETCH REAL PROFILE =================
   */
  useEffect(() => {
    const empId = user?.empId;

    if (!empId) return;

    let cancelled = false;

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/admin/user`, {
          timeout: 20000,
        });

        if (cancelled) return;

        /*
         * Support both:
         *
         * response.data = [...]
         *
         * and
         *
         * response.data.users = [...]
         */
        const users = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.users)
            ? response.data.users
            : [];

        const foundUser = users.find(
          (item: User) => String(item?.empId) === String(empId)
        );

        if (!foundUser) {
          console.warn(`No profile found for Employee ID: ${empId}`);
          return;
        }

        /*
         * Update local state.
         */
        setLocalUser(foundUser);

        /*
         * Keep context in sync if the provider is available.
         */
        if (contextSetUser) {
          contextSetUser(foundUser);
        }

        /*
         * Update profile picture.
         */
        if (foundUser.photo) {
          setLocalProfilePic(foundUser.photo);

          if (contextSetProfilePic) {
            contextSetProfilePic(foundUser.photo);
          }
        }

        /*
         * Keep localStorage synchronized with the latest profile.
         */
        localStorage.setItem("user", JSON.stringify(foundUser));
      } catch (error) {
        if (!cancelled) {
          console.error("Profile fetch error:", error);
        }
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [user?.empId, contextSetUser, contextSetProfilePic]);

  /*
   * ================= AUTH REDIRECT =================
   *
   * Wait until localStorage has been checked before redirecting.
   * Otherwise the page could redirect before the user is loaded.
   */
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  /*
   * ================= LOGOUT =================
   */
  const handleLogout = () => {
    localStorage.removeItem("user");

    setLocalUser(null);
    setLocalProfilePic(null);

    if (contextSetUser) {
      contextSetUser(null);
    }

    if (contextSetProfilePic) {
      contextSetProfilePic(null);
    }

    navigate("/login", { replace: true });
  };

  /*
   * Prevent blank/crashed page while checking authentication.
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading profile...
        </div>
      </div>
    );
  }

  /*
   * User doesn't exist.
   * Redirect effect above will handle navigation.
   */
  if (!user) {
    return null;
  }

  const displayName = user.name?.trim() || "Employee";

  const initial = displayName.charAt(0).toUpperCase();

  const email = user.email || "hr@athratech.com";
  const phone = user.phone || "+91 9876543210";
  const department = user.department || "Web Development";
  const designation = user.designation || "Developer";
  const joiningDate = user.joiningDate || "4 April 2025";

  return (
    <div className="min-h-screen bg-[#F6F8FA] px-4 md:px-8 lg:px-10 py-5">

      {/* ================= NAVBAR ================= */}
      <div className="h-[64px] bg-white rounded-full px-4 sm:px-6 flex items-center justify-between shadow-sm mb-8">

        <h1 className="text-[16px] font-[500] text-[#0A58A6]">
          Athratech Pvt Limited
        </h1>

        <div
          onClick={() => navigate("/dashboard/profile")}
          className="flex gap-3 items-center cursor-pointer hover:bg-gray-50 px-3 py-1 rounded-full transition"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
            {profilePic ? (
              <img
                src={profilePic}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
                {initial}
              </div>
            )}
          </div>

          <p className="text-[14px] font-medium max-[768px]:hidden">
            {displayName}
          </p>
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="bg-white w-[48px] h-[48px] rounded-[16px] shadow-sm flex items-center justify-center hover:bg-gray-100 transition"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-[28px] font-semibold text-[#111827]">
          Profile
        </h1>
      </div>

      {/* ================= PERSONAL INFO ================= */}
      <div className="bg-white rounded-[28px] shadow-sm px-6 md:px-10 py-8 mb-10">

        <h2 className="text-[20px] font-semibold text-[#111827] mb-8">
          Personal Information
        </h2>

        {/* Profile picture */}
        <div className="relative w-[120px] mb-10">
          {profilePic ? (
            <img
              src={profilePic}
              alt={`${displayName} avatar`}
              className="w-[120px] h-[120px] rounded-full object-cover"
            />
          ) : (
            <div className="w-[120px] h-[120px] rounded-full bg-gray-200 flex items-center justify-center text-3xl font-semibold text-gray-700">
              {initial}
            </div>
          )}

          <div className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md">
            <Pencil size={14} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <Field
            label="Full Name"
            value={displayName}
          />

          <Field
            label="Employee ID"
            value={user.empId || "—"}
          />

          <Field
            label="Email Address"
            value={email}
          />

          <Field
            label="Phone Number"
            value={phone}
          />

        </div>
      </div>

      {/* ================= WORK INFO ================= */}
      <div className="bg-white rounded-[28px] shadow-sm px-6 md:px-10 py-8 mb-10">

        <h2 className="text-[20px] font-semibold text-[#111827] mb-8">
          Work Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <Field
            label="Role"
            value={user.role || "—"}
          />

          <Field
            label="Department"
            value={department}
          />

          <Field
            label="Designation"
            value={designation}
          />

          <Field
            label="Joining Date"
            value={joiningDate}
          />

        </div>
      </div>

      {/* ================= LOGOUT ================= */}
      <div className="flex justify-end pb-8">
        <button
          type="button"
          onClick={handleLogout}
          className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-3 rounded-[16px] text-[15px] font-medium shadow-sm transition"
        >
          Logout
        </button>
      </div>

    </div>
  );
}

/* ================= FIELD COMPONENT ================= */

interface FieldProps {
  label: string;
  value?: string | null;
}

function Field({ label, value }: FieldProps) {
  return (
    <div>
      <label className="block text-[14px] text-gray-600 mb-3 font-medium">
        {label}
      </label>

      <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px] min-h-[52px] flex items-center px-5 py-3 text-[15px] text-gray-900 break-words">
        {value || "—"}
      </div>
    </div>
  );
}
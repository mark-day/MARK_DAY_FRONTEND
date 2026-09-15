import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import CheckLeaves from "../../Page/CheckLeaves/CheckLeaves";
import "react-calendar/dist/Calendar.css";
import EmployeeList from "../../component/HrAdminComponent/EmployeeList";
import AttendanceList from "../../component/HrAdminComponent/AttendanceList";
import AttendanceCalendar from "../../component/HrAdminComponent/AttendanceCalendar";
import Register from "../../component/register";
import Payslip from "../../component/HrAdminComponent/Payslip";
import TrackEmployees from "../../component/TrackEmployees";
import GlobalHeader from "../../components/layout/GlobalTopBar";

import {
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiCamera,
  FiCheckCircle,
  FiFileText,
  FiMapPin,
} from "react-icons/fi";

const BASE_URL = "https://attendance-backend-final-4.onrender.com";

const DASHBOARD_ITEMS = [
  {
    key: "employee",
    title: "Edit Employee Details",
    description: "View and update employee profile information",
    buttonText: "Mark Now",
    icon: FiCamera,
  },
  {
    key: "attendance",
    title: "Attendance Record",
    description: "Monitor daily attendance and view presence status",
    buttonText: "View Now",
    icon: FiCalendar,
  },
  {
    key: "LeaveRequest",
    title: "View Leave Record",
    description: "Review leave requests & add HR remarks.",
    buttonText: "Request Now",
    icon: FiFileText,
  },
  {
    key: "RegisterUser",
    title: "Register Employee",
    description: "Add new employee with complete profile details",
    buttonText: "View Now",
    icon: FiBookOpen,
  },
  {
    key: "trackLocations",
    title: "Track Employee Location",
    description: "Real time tracking for field & remote work",
    buttonText: "Mark Now",
    icon: FiMapPin,
  },
  {
    key: "Payroll",
    title: "Payroll",
    description: "Generate payroll and calculate salary deductions",
    buttonText: "View Now",
    icon: FiCalendar,
  },
];

const getStoredToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
};

const getStoredUser = () => {
  try {
    const possibleKeys = ["user", "authUser", "employee", "admin", "profile"];

    for (const key of possibleKeys) {
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      }
    }
  } catch (error) {
    console.error("Error reading stored user:", error);
  }

  return null;
};

const getAuthHeaders = () => {
  const token = getStoredToken();
  return token
    ? {
      Authorization: `Bearer ${token}`,
    }
    : {};
};

const getDisplayName = (profile) => {
  if (!profile) return "Admin";

  return (
    profile.name ||
    profile.fullName ||
    profile.employeeName ||
    profile.username ||
    profile.firstName ||
    profile.adminName ||
    "Admin"
  );
};

export default function HrAdmin() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [view, setView] = useState(null);
  const [adminName, setAdminName] = useState("Admin");
  const [adminProfile, setAdminProfile] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setAdminProfile(storedUser);
      setAdminName(getDisplayName(storedUser));
    }

    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();

        // fetch employees
        const empRes = await axios.get(`${BASE_URL}/api/admin/user`, {
          headers,
        });

        const employeeData = Array.isArray(empRes?.data)
          ? empRes.data
          : Array.isArray(empRes?.data?.users)
            ? empRes.data.users
            : Array.isArray(empRes?.data?.data)
              ? empRes.data.data
              : [];

        setEmployees(employeeData);

        // find current logged in admin/employee from employee list
        const storedUserNow = getStoredUser();
        const storedId =
          storedUserNow?._id ||
          storedUserNow?.id ||
          storedUserNow?.userId ||
          storedUserNow?.employeeId ||
          localStorage.getItem("userId") ||
          localStorage.getItem("_id");

        const storedEmail =
          storedUserNow?.email ||
          storedUserNow?.workEmail ||
          localStorage.getItem("email");

        const matchedProfile =
          employeeData.find(
            (emp) =>
              String(emp?._id || emp?.id || "") === String(storedId || "")
          ) ||
          employeeData.find(
            (emp) =>
              emp?.email &&
              storedEmail &&
              emp.email.toLowerCase() === storedEmail.toLowerCase()
          ) ||
          employeeData.find(
            (emp) =>
              emp?.name &&
              storedUserNow?.name &&
              emp.name.toLowerCase() === storedUserNow.name.toLowerCase()
          );

        if (matchedProfile) {
          setAdminProfile(matchedProfile);
          setAdminName(getDisplayName(matchedProfile));
        }

        // fetch attendance
        try {
          const attRes = await axios.get(`${BASE_URL}/api/admin/attendance`, {
            headers,
          });

          const attendanceData = Array.isArray(attRes?.data)
            ? attRes.data
            : Array.isArray(attRes?.data?.attendance)
              ? attRes.data.attendance
              : Array.isArray(attRes?.data?.data)
                ? attRes.data.data
                : [];

          setAttendance(attendanceData);
        } catch (attendanceError) {
          console.error("Attendance fetch error:", attendanceError);
          setAttendance([]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setEmployees([]);
        setAttendance([]);
      }
    };

    fetchData();
  }, []);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const totalEmployees = employees.length;
  const presentToday =
    attendance?.filter((item) => item?.status === "Present").length || 0;
  const absentToday =
    attendance?.filter((item) => item?.status === "Absent").length || 0;

  const overviewItems = [
    { title: "Total Employees", value: totalEmployees || 0 },
    { title: "Present Today", value: presentToday || 0 },
    { title: "Absent Today", value: absentToday || 0 },
    { title: "Payroll This Month", value: "0" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F6F8FA] px-[12px] py-[12px] sm:px-[20px] sm:py-[20px] lg:px-[32px] lg:py-[32px]">
      <div className="mx-auto w-full max-w-[1440px]">
        <GlobalHeader
          overrideUser={adminProfile}
          overrideProfilePic={
            adminProfile?.profileImage ||
            adminProfile?.avatar ||
            adminProfile?.image ||
            adminProfile?.photo
          }
        />

        <div className="mt-[10px] sm:mt-[24px] lg:mt-[32px]">
          {!view && (
            <>
              <WelcomeCard
                adminName={adminName}
                formattedDate={formattedDate}
              />

              <div className="mt-[28px] grid grid-cols-2 gap-x-[12px] gap-y-[12px] sm:mt-[32px] sm:gap-x-[16px] sm:gap-y-[16px] lg:mt-[40px] lg:grid-cols-4 lg:gap-x-[24px] lg:gap-y-[24px]">
                {DASHBOARD_ITEMS.map((item) => (
                  <DashboardCard
                    key={item.key}
                    title={item.title}
                    description={item.description}
                    buttonText={item.buttonText}
                    Icon={item.icon}
                    onClick={() => setView(item.key)}
                  />
                ))}
              </div>

              <section className="mt-[36px] sm:mt-[40px] lg:mt-[48px]">
                <h2 className="text-[22px] font-[600] leading-[28px] tracking-[-0.02em] text-[#1F1F1F] sm:text-[24px] sm:leading-[30px] lg:text-[28px] lg:leading-[34px]">
                  Employee Overview
                </h2>

                <div className="mt-[16px] grid grid-cols-2 gap-x-[12px] gap-y-[12px] sm:mt-[20px] sm:gap-x-[16px] sm:gap-y-[16px] lg:mt-[24px] lg:grid-cols-4 lg:gap-x-[24px] lg:gap-y-[24px]">
                  {overviewItems.map((item) => (
                    <OverviewCard
                      key={item.title}
                      title={item.title}
                      value={item.value}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {view === "employee" && (
            <EmployeeList employees={employees} onBack={() => setView(null)} />
          )}

          {view === "attendance" && (
            <AttendanceList
              employees={employees}
              onEmployeeClick={(id) => {
                setSelectedEmployee(id);
                setView("calendar");
              }}
              onBack={() => setView(null)}
            />
          )}

          {view === "LeaveRequest" && (
            <CheckLeaves name={adminName} onBack={() => setView(null)} />
          )}

          {view === "RegisterUser" && (
            <Register onBack={() => setView(null)} />
          )}

          {view === "trackLocations" && (
            <TrackEmployees onBack={() => setView(null)} />
          )}

          {view === "Payroll" && <Payslip onBack={() => setView(null)} />}

          {view === "calendar" && (
            <AttendanceCalendar
              attendance={attendance}
              selectedEmployee={selectedEmployee}
              onBack={() => setView("attendance")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeCard({ adminName, formattedDate }) {
  return (
    <section className="w-full rounded-[24px] border border-[#E7EBF0] bg-white px-[20px] py-[20px] shadow-[0px_1px_3px_rgba(16,24,40,0.06)] sm:max-w-[428px] sm:px-[28px] sm:py-[24px] lg:rounded-[28px] lg:px-[40px] lg:py-[28px]">
      <h2 className="text-[20px] font-[600] leading-[24px] tracking-[-0.03em] text-[#1F1F1F] sm:text-[26px] sm:leading-[30px] lg:text-[32px] lg:leading-[35px]">
        Welcome Back, {adminName}! 👋
      </h2>
      <p className="mt-[8px] text-[13px] font-[400] leading-[18px] tracking-[-0.01em] text-[#666666] sm:text-[15px] sm:leading-[22px] lg:mt-[10px] lg:text-[16px] lg:leading-[24px]">
        {formattedDate}
      </p>
    </section>
  );
}

function DashboardCard({ title, description, buttonText, Icon, onClick }) {
  return (
    <article
      onClick={onClick}
      className="flex h-[212px] w-full min-w-0 max-w-[326px] cursor-pointer flex-col rounded-[22px] border border-[#E7EBF0] bg-white px-[12px] py-[12px] shadow-[1px_1px_4px_0_#0000001A] transition duration-200 hover:shadow-[0px_6px_16px_rgba(16,24,40,0.08)] sm:h-[228px] sm:rounded-[26px] sm:px-[16px] sm:py-[16px] lg:h-[251px] lg:rounded-[32px] lg:px-[24px] lg:py-[24px]"
    >
      <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-[#EEF5FF] text-[#0A447B] sm:rounded-[14px] lg:h-[56px] lg:w-[56px] lg:rounded-[16px]">
        <Icon className="text-[21px] sm:text-[24px] lg:text-[25px]" />
      </div>

      <h3 className="mt-[14px] text-[14px] font-[600] leading-[17px] tracking-[-0.02em] text-[#262626] sm:mt-[18px] sm:text-[16px] sm:leading-[19px] lg:mt-[24px] lg:text-[22px] lg:leading-[26px]">
        {title}
      </h3>

      <p className="mt-[6px] text-[10px] font-[400] leading-[13px] tracking-[-0.01em] text-[#666666] sm:mt-[8px] sm:text-[11px] sm:leading-[14px] lg:mt-[10px] lg:max-w-[252px] lg:text-[14px] lg:leading-[18px]">
        {description}
      </p>

      <button
        type="button"
        className="mt-auto inline-flex h-[34px] w-full items-center justify-center gap-[6px] rounded-[11px] bg-[#013C74] px-[10px] text-[11px] font-[500] leading-[16px] tracking-[-0.01em] text-white sm:h-[36px] sm:max-w-[135px] sm:gap-[8px] sm:rounded-[12px] sm:px-[14px] sm:text-[12px] sm:leading-[18px] lg:mt-[18px] lg:h-[40px] lg:max-w-[159px] lg:gap-[10px] lg:rounded-[13px] lg:px-[20px] lg:text-[15px] lg:leading-[20px]"
      >
        <span className="truncate">{buttonText}</span>
        <FiArrowRight className="shrink-0 text-[14px] sm:text-[15px] lg:text-[18px]" />
      </button>
    </article>
  );
}

function OverviewCard({ title, value }) {
  return (
    <article className="flex h-[92px] w-full min-w-0 items-center rounded-[22px] border border-[#E7EBF0] bg-white px-[12px] py-[12px] shadow-[0px_1px_3px_rgba(16,24,40,0.05)] sm:h-[98px] sm:rounded-[24px] sm:px-[16px] sm:py-[16px] lg:h-[104px] lg:rounded-[28px] lg:px-[24px] lg:py-[20px]">
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] bg-[#CFF0D5] sm:h-[48px] sm:w-[48px] sm:rounded-[14px] lg:h-[58px] lg:w-[58px] lg:rounded-[16px]">
        <FiCheckCircle className="text-[21px] text-[#1A9B16] sm:text-[24px] lg:text-[28px]" />
      </div>

      <div className="ml-[10px] min-w-0 flex-1 sm:ml-[12px] lg:ml-[16px]">
        <p className="truncate text-[10px] font-[400] leading-[13px] tracking-[-0.01em] text-[#383838] sm:text-[11px] sm:leading-[15px] lg:text-[14px] lg:leading-[20px]">
          {title}
        </p>
        <h3 className="mt-[2px] truncate text-[18px] font-[600] leading-[20px] tracking-[-0.03em] text-[#1F1F1F] sm:text-[22px] sm:leading-[24px] lg:text-[30px] lg:leading-[33px]">
          {value}
        </h3>
      </div>
    </article>
  );
}
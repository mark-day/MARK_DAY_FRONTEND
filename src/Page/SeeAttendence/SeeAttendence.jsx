import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./SeeAttendence.css";

import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useVisitedPages } from "../../component/PreviousPage";
import GlobalHeader from "../../component/GlobalHeader";

const BASE_URL = "https://attendance-backend-final-4.onrender.com";

const SeeAttendence = () => {
  const navigate = useNavigate();
  const { visitPage } = useVisitedPages();

  const [attendance, setAttendance] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [leaveSummary, setLeaveSummary] = useState({ remaining: 0 });
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    companyName: "Athratech Pvt Limited",
    name: "User",
    role: "Employee",
    avatar: "",
  });

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("accessToken") ||
    "";

  const empId =
    localStorage.getItem("empId") ||
    localStorage.getItem("employeeId") ||
    "";

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const dateKey = (d) => {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const parseTime = (t) => {
    if (!t || typeof t !== "string") return null;

    const parts = t.trim().split(" ");
    if (parts.length < 2) return null;

    const [time, apRaw] = parts;
    const ap = apRaw.toUpperCase();
    let [h, m] = time.split(":").map(Number);

    if (Number.isNaN(h) || Number.isNaN(m)) return null;

    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;

    return new Date(1970, 0, 1, h, m, 0, 0);
};

  const calcDuration = (inT, outT) => {
    const start = parseTime(inT);
    const end = parseTime(outT);

    if (!start || !end) return "N/A";

  const diff = end - start;
    if (diff <= 0) return "N/A";

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);

    return `${h} hours ${m} mins`;
};

  const readStoredUserProfile = useCallback(() => {
    const parseStored = (key) => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };

    const possibleSources = [
      parseStored("user"),
      parseStored("authUser"),
      parseStored("admin"),
      parseStored("employee"),
      parseStored("profile"),
      parseStored("auth"),
    ].filter(Boolean);

    const source = possibleSources[0] || {};

    const companyName =
      source.companyName ||
      source.company_name ||
      source.organizationName ||
      source.organization_name ||
      localStorage.getItem("companyName") ||
      "Athratech Pvt Limited";

    const name =
      source.name ||
      source.fullName ||
      source.full_name ||
      source.username ||
      source.userName ||
      source.employeeName ||
      source.employee_name ||
      source.adminName ||
      "User";

    const role =
      source.role ||
      source.userRole ||
      source.designation ||
      source.position ||
      "Employee";

    const avatar =
      source.profileImage ||
      source.profile_image ||
      source.avatar ||
      source.image ||
      source.photo ||
      source.photoURL ||
      localStorage.getItem("profileImage") ||
      localStorage.getItem("avatar") ||
      "";

    setProfile({
      companyName,
      name,
      role,
      avatar,
    });
  }, []);

  useEffect(() => {
    visitPage("/attendance", "Attendance View");
    readStoredUserProfile();
  }, [visitPage, readStoredUserProfile]);

  useEffect(() => {
    if (!empId) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        setLoading(true);

        const attendanceRes = await axios.get(
          `${BASE_URL}/api/admin/attendances`,
          {
            params: { empId, limit: 1000 },
            ...(token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : {}),
          }
        );

        const arr = Array.isArray(attendanceRes.data)
          ? attendanceRes.data
          : Array.isArray(attendanceRes.data?.data)
          ? attendanceRes.data.data
          : [];

        setAttendance(arr);

        const holRes = await axios.get(`${BASE_URL}/api/holidays/get`);
        setHolidays(Array.isArray(holRes.data) ? holRes.data : []);

        const leaveRes = await axios.get(`${BASE_URL}/api/leave/my/${empId}`, {
          ...(token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {}),
        });

        setLeaveSummary(leaveRes.data?.paidLeave || { remaining: 0 });
      } catch (err) {
        console.error("Attendance fetch error:", err.response?.data || err.message);
        setAttendance([]);
      setHolidays([]);
        setLeaveSummary({ remaining: 0 });
    } finally {
        setLoading(false);
    }
  };

    fetchAll();
  }, [empId, token]);

  const attendanceByDate = useMemo(() => {
    const map = new Map();
    for (const a of attendance) {
      if (!a?.date) continue;
      map.set(dateKey(a.date), a);
      }
    return map;
  }, [attendance]);

  const holidaySet = useMemo(() => {
    const s = new Set();
    for (const h of holidays) {
      if (!h?.date) continue;
      s.add(dateKey(h.date));
    }
    return s;
  }, [holidays]);

  const isHoliday = useCallback(
    (d) => holidaySet.has(dateKey(d)),
    [holidaySet]
  );

  const selectedRecord = useMemo(() => {
    return attendanceByDate.get(dateKey(selectedDate)) || null;
  }, [attendanceByDate, selectedDate]);

  const stats = useMemo(() => {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    let present = 0;
    let late = 0;

    const lateCutoff = new Date(1970, 0, 1, 10, 15);

    attendance.forEach((a) => {
      if (!a?.date) return;

      const d = new Date(a.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        present += 1;
        const inT = parseTime(a.inTime);
        if (inT && inT > lateCutoff) late += 1;
      }
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workingDays = 0;

    for (let i = 1; i <= daysInMonth; i += 1) {
      const dt = new Date(year, month, i);
      const day = dt.getDay();

      if (day === 0) continue;
      if (holidaySet.has(dateKey(dt))) continue;
      if (dt > today) continue;

      workingDays += 1;
    }

    return {
      present,
      late,
      absent: Math.max(0, workingDays - present),
      remaining: leaveSummary?.remaining || 0,
    };
  }, [attendance, selectedDate, leaveSummary, holidaySet, today]);

  const getTileClassName = useCallback(
    ({ date, view }) => {
      if (view !== "month") return "";

      if (date > today) return "cal-tile cal-future";

      const key = dateKey(date);

      if (holidaySet.has(key)) return "cal-tile cal-holiday";

      const rec = attendanceByDate.get(key);
      if (!rec) return "cal-tile cal-absent";

      return "cal-tile cal-present";
    },
    [attendanceByDate, holidaySet, today]
  );

  const onDayClick = (d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    setSelectedDate(dt);
  };

  const desktopCards = [
    {
      key: "late",
      label: "Late Coming",
      value: stats.late,
      icon: <Clock3 size={24} strokeWidth={2.1} />,
      tone: "late",
      className: "",
    },
    {
      key: "present",
      label: "Present Days",
      value: stats.present,
      icon: <CalendarIconExact />,
      tone: "presentDesktop",
      className: "",
    },
    {
      key: "absent",
      label: "Absent Days",
      value: stats.absent,
      icon: <ClockAlertIcon />,
      tone: "absent",
      className: "",
    },
    {
      key: "remaining",
      label: "Remaining Leaves",
      value: stats.remaining,
      icon: <FileText size={23} strokeWidth={2} />,
      tone: "leave",
      className: "",
    },
  ];

  const mobileCards = [
    {
      key: "present",
      label: "Present Days",
      value: stats.present,
      icon: <CheckCircle2 size={28} strokeWidth={2.1} />,
      tone: "presentMobile",
      className: "order-1",
    },
    {
      key: "absent",
      label: "Absent Days",
      value: stats.absent,
      icon: <CircleAlert size={28} strokeWidth={2.1} />,
      tone: "absent",
      className: "order-2",
    },
    {
      key: "late",
      label: "Late Coming",
      value: stats.late,
      icon: <Clock3 size={28} strokeWidth={2.1} />,
      tone: "late",
      className: "order-3",
              },
              {
      key: "remaining",
                label: "Remaining Leaves",
      value: stats.remaining,
      icon: <FileText size={24} strokeWidth={2} />,
      tone: "leave",
      className: "order-4",
              },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F7] flex items-center justify-center">
        <div className="text-[15px] font-semibold text-[#717680]">
          Loading attendance...
                  </div>
                </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F7] font-[Inter,system-ui,sans-serif]">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pt-9">
        {/* top bar */}
        <GlobalHeader />

        {/* title row */}
        <div className="mt-10 lg:mt-[42px] flex items-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-[50px] h-[50px] sm:w-[50px]  lg:w-[50px] lg:h-[50px] shrink-0 rounded-[16px] lg:rounded-[16px] border border-[#E5E7EB] bg-white text-[#111111] flex items-center justify-center shadow-[1px_0.5px_1px_0_#0000001A] active:scale-[0.98] transition"
          >
            <ChevronLeft size={32} strokeWidth={2.5} />
          </button>

          <h1 className="m-0 text-[#161616] text-[24px] sm:text-[24px] lg:text-[32px] font-[590] leading-none tracking-[-0.04em]">
            View Attendence
          </h1>
        </div>

        {/* overview */}
        <section className="mt-10 lg:mt-[52px]">
          <h2 className="m-0 text-[#202124] text-[24px] sm:text-[26px] lg:text-[28px] font-[700] leading-[1.15] tracking-[-0.03em]">
            Attendance Overview
          </h2>

          <div className="mt-7 hidden lg:grid lg:grid-cols-4 lg:gap-6">
            {desktopCards.map((card) => (
              <StatCard
                key={card.key}
                icon={card.icon}
                label={card.label}
                value={card.value}
                tone={card.tone}
              />
            ))}
              </div>

          <div className="mt-7 grid grid-cols-2 gap-4 lg:hidden">
            {mobileCards.map((card) => (
              <StatCard
                key={card.key}
                icon={card.icon}
                label={card.label}
                value={card.value}
                tone={card.tone}
                className={card.className}
              />
            ))}
          </div>
          </section>

        {/* attendance section */}
        <section className="mt-12 lg:mt-[54px]">
          <h2 className="m-0 text-[#202124] text-[24px] sm:text-[26px] lg:text-[28px] font-[700] leading-[1.15] tracking-[-0.03em]">
            View my Attendance
                  </h2>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.42fr_0.98fr] lg:gap-8">
            <div className="rounded-[30px] lg:rounded-[34px] bg-white border border-[rgba(17,24,39,0.04)] !shadow-[1px_0.5px_1px_0_#0000001A] overflow-hidden">
              <Calendar
                value={selectedDate}
                onClickDay={onDayClick}
                tileDisabled={({ date }) => date > today}
                tileClassName={getTileClassName}
                calendarType="gregory"
                formatShortWeekday={(locale, date) =>
                  date.toLocaleDateString(locale, { weekday: "short" })
                }
                prevLabel={
                  <span className="attendance-nav-icon">
                    <ChevronLeft size={21} strokeWidth={2.7} />
                  </span>
                }
                nextLabel={
                  <span className="attendance-nav-icon">
                    <ChevronRight size={21} strokeWidth={2.7} />
                  </span>
                }
                  prev2Label={null}
                  next2Label={null}
              />
            </div>

            <div className="rounded-[30px] lg:rounded-[34px] bg-white border border-[rgba(17,24,39,0.04)] shadow-[0_2px_4px_rgba(16,24,40,0.04),0_10px_28px_rgba(16,24,40,0.06)] px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-[34px]">
              <h3 className="m-0 text-[#202124] text-[28px] sm:text-[30px] font-[700] leading-[1.05] tracking-[-0.03em]">
                Attendance
              </h3>

              {selectedDate > today ? (
                <EmptyState
                  icon={<FileText size={18} strokeWidth={2} />}
                  text="Future Date"
                />
              ) : isHoliday(selectedDate) ? (
                <EmptyState
                  icon={<FileText size={18} strokeWidth={2} />}
                  text="Holiday"
                />
              ) : !selectedRecord ? (
                <EmptyState
                  icon={<CircleAlert size={18} strokeWidth={2} />}
                  text="Absent"
                />
              ) : (
                <div className="mt-8 space-y-6">
                  <Field label="Mark-in Time" value={selectedRecord.inTime || "N/A"} />
                  <Field label="Mark-out Time" value={selectedRecord.outTime || "N/A"} />
                  <Field
                    label="Work Duration"
                    value={calcDuration(selectedRecord.inTime, selectedRecord.outTime)}
                  />
                  <Field label="Leave Type" value={selectedRecord.leaveType || "None"} />
                </div>
              )}
              </div>
          </div>
          </section>
      </div>
    </div>
  );
};

function StatCard({ icon, label, value, tone = "presentMobile", className = "" }) {
  const toneStyles = {
    presentMobile: {
      wrap: "bg-[#DDF5E2]",
      icon: "text-[#2F9E44]",
    },
    presentDesktop: {
      wrap: "bg-[#E9EEF5]",
      icon: "text-[#163D6A]",
    },
    absent: {
      wrap: "bg-[#F8DDD4]",
      icon: "text-[#F04438]",
    },
    late: {
      wrap: "bg-[#F8DDD4]",
      icon: "text-[#F04438]",
    },
    leave: {
      wrap: "bg-[#F5E6A6]",
      icon: "text-[#CC7A11]",
    },
  };

  return (
    <div
      className={`min-h-[108px] sm:min-h-[114px] lg:min-h-[120px] rounded-[24px] lg:rounded-[28px] bg-white border border-[rgba(17,24,39,0.04)] !shadow-[1px_0.5px_1px_0_#0000001A] flex items-center gap-[14px] lg:gap-4 px-4 py-4 max-[768px]:px-3 max-[768px]:!py-1 lg:px-6 lg:py-[22px] ${className}`}
        >
          <div
        className={`lg:w-[54px] lg:h-[54px] w-[40px] h-[40px]   rounded-[22px] flex items-center justify-center ${toneStyles[tone].wrap} ${toneStyles[tone].icon}`}
      >
        {icon}
                    </div>

      <div className="min-w-0">
        <p className="m-0 text-[#3B3B3B] lg:text-[14px] text-[12px]  max-[768px]:pr-[10px] sm:text-[15px] lg:text-[16px] font-[400] leading-[1.2]">
          {label}
                      </p>
        <p className="m-0 mt-[6px] text-[#202124] lg:text-[26px] text-[20px] lg:text-[30px] font-[700] leading-none tracking-[-0.03em]">
          {value}
                      </p>
                    </div>
                  </div>
  );
}

function Field({ label, value }) {
  return (
                        <div>
      <p className="m-0 mb-3 text-[#4E4E4E] text-[15px] sm:text-[16px] font-[500] leading-[1.2]">
        {label}
                          </p>
      <div className="min-h-[56px] sm:min-h-[58px] rounded-[18px] border border-[#ECECEC] bg-[#F8F8F8] flex items-center px-5 text-[#9B9B9B] text-[15px] sm:text-[16px] font-[600] leading-none">
        {value}
                      </div>
                    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="min-h-[240px] mt-7 rounded-[22px] border border-dashed border-[#E5E7EB] bg-[#FAFAFA] text-[#667085] text-[16px] font-[600] flex items-center justify-center gap-3">
      <span className="w-10 h-10 rounded-[14px] bg-white border border-[#ECECEC] inline-flex items-center justify-center">
        {icon}
      </span>
      <span>{text}</span>
                    </div>
  );
}

function CalendarIconExact() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 2V5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 2V5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
                          />
      <path
        d="M3 9H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function ClockAlertIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 7V12L15 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 5V9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 2V2.01"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 14.3114 2.78462 16.4395 4.10222 18.1324"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default SeeAttendence;

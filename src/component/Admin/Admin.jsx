import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Camera,
  CalendarDays,
  FileText,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock3,
  File,
  Lightbulb,
} from "lucide-react";

const BASE_URL = "https://attendance-backend-final-4.onrender.com";

/* ================= SAFE USER ================= */
function safeUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export default function UserHome() {
  const navigate = useNavigate();
  const user = useMemo(() => safeUser(), []);
  const empId = user?.empId;

  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    remainingLeaves: 0,
  });

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  /* ================= FETCH STATS ================= */
  useEffect(() => {
    if (!empId) return;

    const fetchStats = async () => {
      try {
        const [attRes, leaveRes] = await Promise.allSettled([
          axios.get(`${BASE_URL}/api/admin/attendances`, {
            params: { empId, limit: 1000 },
          }),
          axios.get(`${BASE_URL}/api/leave/my/${empId}`),
        ]);

        let present = 0;
        let late = 0;

        if (attRes.status === "fulfilled") {
          const attendance = attRes.value.data || [];
          const now = new Date();
          const month = now.getMonth();
          const year = now.getFullYear();

          attendance.forEach((a) => {
            const d = new Date(a.date);

            if (
              d.getMonth() === month &&
              d.getFullYear() === year &&
              a.inTime
            ) {
              present++;

              const [time, ap] = a.inTime.split(" ");
              let [h, m] = time.split(":").map(Number);

              if (ap === "PM" && h !== 12) h += 12;
              if (ap === "AM" && h === 12) h = 0;

              if (h > 10 || (h === 10 && m > 0)) late++;
            }
          });

          const daysInMonth = new Date(year, month + 1, 0).getDate();
          let workingDays = 0;

          for (let i = 1; i <= daysInMonth; i++) {
            const day = new Date(year, month, i).getDay();
            if (day !== 0) workingDays++;
          }

          const absent = Math.max(0, workingDays - present);

          setStats((prev) => ({
            ...prev,
            present,
            absent,
            late,
          }));
        }

        if (leaveRes.status === "fulfilled") {
          setStats((prev) => ({
            ...prev,
            remainingLeaves:
              leaveRes.value.data?.paidLeave?.remaining || 0,
          }));
        }
      } catch (err) {
        console.error("Dashboard Error:", err);
      }
    };

    fetchStats();
  }, [empId]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F6F8FC] px-3 sm:px-6 lg:px-10 py-6">

      {/* HEADER */}
      <div className="bg-white rounded-full px-6 py-4 flex justify-between items-center shadow-[0_8px_24px_rgba(16,24,40,0.06)] border border-[#EDF2F7]">
        <h1 className="text-[#0D4CBA] font-semibold text-[16px] sm:text-[18px]">
          Athratech Pvt Limited
        </h1>

        <div
          onClick={() => navigate("/dashboard/profile")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src={
              user.photo ||
              `https://ui-avatars.com/api/?name=${user.name}`
            }
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
        </div>
      </div>

      {/* GREETING */}
      <div className="bg-white rounded-[28px] p-6 mt-6 shadow-[0_10px_30px_rgba(16,24,40,0.06)] border border-[#EDF2F7]">
        <h2 className="text-[26px] sm:text-[34px] font-semibold text-[#111827]">
          {greeting}, {user.name}! 👋
        </h2>
        <p className="text-[14px] text-[#667085] mt-2">
          {todayFormatted}
        </p>
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-2 gap-4 mt-6 lg:grid-cols-4">

        <ActionCard
          icon={<Camera size={20} />}
          title="Mark Attendance"
          desc="Record your Check In and Check Out time"
          button="Mark Now"
          onClick={() => navigate("/dashboard/mark-attendance")}
        />

        <ActionCard
          icon={<CalendarDays size={20} />}
          title="View Attendance"
          desc="Check your monthly attendance record"
          button="View Now"
          onClick={() => navigate("/dashboard/seeattendence")}
        />

        <ActionCard
          icon={<FileText size={20} />}
          title="Request Leave"
          desc="Apply for paid or unpaid leave"
          button="Request Now"
          onClick={() => navigate("/dashboard/request-leave")}
        />

        <ActionCard
          icon={<CalendarDays size={20} />}
          title="View Leave Record"
          desc="Review leave requests & add HR remarks."
          button="View Now"
          onClick={() => navigate("/dashboard/LeaveRequest")}
        />

        <ActionCard
          icon={<BookOpen size={20} />}
          title="HR Policies"
          desc="View company guidelines and policies"
          button="View Now"
          onClick={() => navigate("/dashboard/hrpolicy")}
        />

      </div>

      {/* ATTENDANCE */}
      <h3 className="text-[22px] font-semibold mt-10 mb-5">
        Attendance Overview
      </h3>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <StatCard
          icon={<CheckCircle2 size={18} />}
          bg="bg-[#D1FADF]"
          label="Present Days"
          value={stats.present}
        />

        <StatCard
          icon={<AlertCircle size={18} />}
          bg="bg-[#FEE4E2]"
          label="Absent Days"
          value={stats.absent}
        />

        <StatCard
          icon={<Clock3 size={18} />}
          bg="bg-[#FEE4E2]"
          label="Late Coming"
          value={stats.late}
        />

        <StatCard
          icon={<File size={18} />}
          bg="bg-[#FEF0C7]"
          label="Remaining Leaves"
          value={stats.remainingLeaves}
        />

      </div>

      {/* QUICK TIP */}
      <div className="mt-8 bg-[#F1F5FF] border border-[#C7D7FF] rounded-[28px] p-6 shadow-[0_8px_24px_rgba(16,24,40,0.05)]">
        <div className="flex gap-3">
          <Lightbulb size={18} className="text-yellow-500 mt-1" />
          <div>
            <h4 className="font-semibold text-[16px] mb-1">
              Quick Tip
            </h4>
            <p className="text-[14px] text-gray-600">
              Mark your attendance before 10:00 AM to avoid being marked as late.
              Don’t forget to mark out when leaving for the day!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ACTION CARD */
function ActionCard({ icon, title, desc, button, onClick }) {
  return (
    <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(16,24,40,0.05)] border border-[#EDF2F7] flex flex-col">
      <div className="w-12 h-12 rounded-[16px] bg-[#EEF4FB] flex items-center justify-center mb-4">
        {icon}
      </div>

      <h4 className="text-[16px] font-semibold">{title}</h4>
      <p className="text-[13px] text-[#667085] mt-1 flex-1">
        {desc}
      </p>

      <button
        onClick={onClick}
        className="mt-4 bg-[#0A3F6A] text-white rounded-full py-2 text-[13px] font-medium shadow-[0_6px_16px_rgba(10,63,106,0.25)]"
      >
        {button} →
      </button>
    </div>
  );
}

/* STAT CARD */
function StatCard({ icon, bg, label, value }) {
  return (
    <div className="bg-white rounded-[20px] p-4 shadow-[0_6px_18px_rgba(16,24,40,0.05)] border border-[#EDF2F7] flex items-center gap-3">
      <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${bg}`}>
        {icon}
      </div>
      <div>
        <p className="text-[13px] text-gray-600">{label}</p>
        <h2 className="text-[18px] font-semibold mt-1">{value}</h2>
      </div>
    </div>
  );
}
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useLocationTracker from "../../component/useLocationTracker";
import {
  Camera,
  CalendarDays,
  FileText,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock3,
  File,
} from "lucide-react";
import GlobalHeader from "../../component/GlobalHeader";

function UserHome() {
  const [profilePic, setProfilePic] = useState(null);
  const [userName, setUserName] = useState("John");

  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    remainingLeaves: 0,
  });

  const fileInputRef = useRef();
  const navigate = useNavigate();

  const empId = localStorage.getItem("empId");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const BASE_URL = "https://attendance-backend-final-4.onrender.com";

  useLocationTracker(empId, isLoggedIn);

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const fetchUser = async () => {
      if (!empId) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/user`);
        const user = res.data.find((u) => u.empId === empId);

        if (user?.photo) setProfilePic(user.photo);
        if (user?.name) setUserName(user.name);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [empId]);

  /* ================= FETCH REAL STATS ================= */
  useEffect(() => {
    if (!empId) return;

    const fetchStats = async () => {
      try {
        /* ATTENDANCE */
        const attRes = await axios.get(
          `${BASE_URL}/api/admin/attendances`,
          {
            params: { empId, limit: 1000 },
          }
        );

        const attendance = attRes.data || [];

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        let present = 0;
        let late = 0;

        attendance.forEach((a) => {
          const d = new Date(a.date);

          if (d.getMonth() === month && d.getFullYear() === year) {
            present++;

            // late check
            if (a.inTime) {
              const [time, ap] = a.inTime.split(" ");
              let [h, m] = time.split(":").map(Number);

              if (ap === "PM" && h !== 12) h += 12;
              if (ap === "AM" && h === 12) h = 0;

              if (h > 10 || (h === 10 && m > 15)) late++;
            }
          }
        });

        // working days calculation
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let workingDays = 0;

        for (let d = 1; d <= daysInMonth; d++) {
          const day = new Date(year, month, d).getDay();
          if (day !== 0) workingDays++; // exclude Sundays
        }

        const absent = Math.max(0, workingDays - present);

        /* LEAVE SUMMARY */
        const leaveRes = await axios.get(
          `${BASE_URL}/api/leave/my/${empId}`
        );

        const remainingLeaves =
          leaveRes.data?.paidLeave?.remaining || 0;

        setStats({
          present,
          absent,
          late,
          remainingLeaves,
        });
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };

    fetchStats();
  }, [empId]);

  /* ================= PHOTO UPDATE ================= */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !empId) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setProfilePic(base64String);

      try {
        await axios.put(`${BASE_URL}/api/admin/user/${empId}`, {
          photo: base64String,
        });
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#EEF1F5] px-4 md:px-8 lg:px-10 py-5">

      {/* HEADER */}
    <GlobalHeader />
      <div className="bg-white mt-[32px] rounded-[30px] px-6 md:px-10 py-5 md:py-7 shadow-sm w-full md:max-w-[590px] mb-7">
        <h2 className="text-[28px] leading-[100%] md:text-[28px] font-[590] text-[#101828] leading-tight max-[768px]:text-[22px]">
          Good Morning, {userName}! 👋
        </h2>
        <p className="text-[16px] md:text-[16px] font-[500] text-[#5F6368] mt-2 leading-tight max-[768px]:text-[12px]">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 max-[768px]:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <DashboardCard icon={<Camera />} title="Mark Attendance"
          desc="Record your check in/out" button="Mark Now"
          onClick={() => navigate("/dashboard/mark-attendance")} />

        <DashboardCard icon={<CalendarDays />} title="View Attendance"
          desc="Check monthly attendance" button="View Now"
          onClick={() => navigate("/dashboard/SeeAttendence")} />

        <DashboardCard icon={<FileText />} title="Request Leave"
          desc="Apply for leave" button="Request Now"
          onClick={() => navigate("/dashboard/request-leave")} />

        <DashboardCard icon={<BookOpen />} title="HR Policies"
          desc="Company policies" button="View Now"
          onClick={() => navigate("/dashboard/HrPolicy")} />
      </div>

      {/* REAL STATS */}
      <h3 className="text-[28px] font-semibold mb-5">Attendance Overview</h3>

      <div className="grid grid-cols-1 max-[768px]:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={<CheckCircle2 />} bg="bg-green-100"
          label="Present Days" value={stats.present} />

        <StatCard icon={<AlertCircle />} bg="bg-red-100"
          label="Absent Days" value={stats.absent} />

        <StatCard icon={<Clock3 />} bg="bg-red-100"
          label="Late Coming" value={stats.late} />

        <StatCard icon={<File />} bg="bg-yellow-100"
          label="Remaining Leaves" value={stats.remainingLeaves} />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="Quick Qoute py-[15px] px-[10px] border-1 border-[#D1E4FF] bg-[#F2F7FF] rounded-[30px] !p-[32px]  mt-[32px] max-[768px]:py-[15px] max-[768px]:py-[20px] ">
        <h2 className="text-[20px] font-[400] text-[#222222] leading-[100%] max-[768px]:text-[16px] ">💡 Quick Tip</h2>
        <p className="text-[14px] font-[400] text-[#555555] leading-[100%] mt-[16px] max-[768px]:text-[12px] max-[768px]:font-[400]">Mark your attendance before 10:00 AM to avoid being marked as late. Don't forget to mark out when leaving for the day!</p>
      </div>
    </div>
  );
}

/* COMPONENTS */
function DashboardCard({ icon, title, desc, button, onClick }) {
  return (
    <div className="bg-white rounded-[30px] p-6 shadow-sm max-[768px]:p-3">
      <div className="w-14 h-14 max-[768px]:w-10 max-[768px]:h-10 bg-[#EFF6FC] rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="text-xl font-semibold max-[768px]:text-[14px] max-[768px]:font-[500]">{title}</h4>
      <p className="text-sm text-gray-600 mb-4 max-[768px]:text-[10px] max-[768px]:font-[400]">{desc}</p>
      <button onClick={onClick}
        className="bg-[#023A6A] text-white px-5 py-2 rounded-full max-[768px]:text-[10px] max-[768px]:font-[500] max-[768px]:px-3">
        {button} →
      </button>
    </div>
  );
}

function StatCard({ icon, bg, label, value }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 items-center max-[768px]:p-3 max-[768px]:gap-2">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${bg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600 max-[768px]:text-[10px]">{label}</p>
        <h2 className="text-2xl font-semibold max-[768px]:text-[20px]">{value}</h2>
      </div>
    </div>
  );
}

export default UserHome;

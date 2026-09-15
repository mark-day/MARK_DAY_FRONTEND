import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../Admin.css";

const BASE_URL = "https://attendance-backend-final-4.onrender.com";

const AttendanceRecords = ({ setView, showNotification }) => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch employees once
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const empRes = await axios.get(`${BASE_URL}/api/admin/user`);
        setEmployees(empRes.data || []);
      } catch (error) {
        console.error("Fetch employees failed:", error);
        showNotification("Failed to fetch employees");
      }
    }
    fetchEmployees();
  }, [showNotification]);

  // Fetch holidays once on mount
  useEffect(() => {
    async function fetchHolidays() {
      try {
        const res = await axios.get(`${BASE_URL}/api/holidays/get`);
        setHolidays(res.data || []);
      } catch (error) {
        console.error("Fetch holidays failed:", error);
        showNotification("Failed to fetch holidays");
      }
    }
    fetchHolidays();
  }, [showNotification]);


  useEffect(() => {
    if (!selectedEmployee) {
      setAttendance([]);
      setLoading(false);
      return;
    }

    async function fetchAllAttendance(empId) {
      setLoading(true);
      let page = 1;
      const limit = 50;
      const MAX_PAGES = 20;
      let allRecords = [];

      try {
        while (page <= MAX_PAGES) {
          const res = await axios.get(`${BASE_URL}/api/admin/attendances`, {
            params: { empId, page, limit },
            timeout: 10000,
          });
          const records = res.data || [];
          allRecords = allRecords.concat(records);

          if (records.length < limit) break;
          page++;
        }
        setAttendance(allRecords);
      } catch (error) {
        console.error("Fetch attendance failed:", error);
        showNotification("Failed to fetch attendance data");
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAllAttendance(selectedEmployee);
  }, [selectedEmployee, showNotification]);


  const formatDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  };

  const isHoliday = (date) => {
    const dateStr = formatDate(date);
    return holidays.some((h) => formatDate(h.date) === dateStr);
  };


  const isLate = (inTime) => {
    if (!inTime) return false;
    const [timePart, modifier] = inTime.trim().split(" ");
    const [h, m, s = "0"] = timePart.split(":").map(Number);
    let hours = h;
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    const inDate = new Date(1970, 0, 1, hours, m, s);
    const cutoff = new Date(1970, 0, 1, 10, 15, 0);
    return inDate > cutoff;
  };

  const calculateDuration = (inTime, outTime) => {
    if (!inTime || !outTime) return "N/A";
    const start = new Date(inTime);
    const end = new Date(outTime);
    const diff = end - start;
    if (isNaN(diff) || diff < 0) return "N/A";
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  const handleEmployeeSelect = (empId) => {
    setSelectedEmployee(empId);
    setModalData(null);
    setSelectedDate(new Date());
  };

  const handleDateClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) return;

    const formatted = formatDate(date);
    const rec = attendance.find(
      (r) => r.empId === selectedEmployee && formatDate(r.date) === formatted
    );

    if (rec) rec.workDuration = rec.workDuration || calculateDuration(rec.inTime, rec.outTime);
    setModalData(rec || { date: formatted });
    setSelectedDate(date);
  };

 
  const getSummary = () => {
    const emp = employees.find((e) => e.empId === selectedEmployee);
    const joiningDate = emp?.hireDate ? new Date(emp.hireDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthsComp = joiningDate
      ? (today.getFullYear() - joiningDate.getFullYear()) * 12 +
        (today.getMonth() - joiningDate.getMonth())
      : 0;
    const ENTITLED_PAID_LEAVES = monthsComp >= 6 ? 14 : 0;

    let present = 0,
      paidLeaves = 0,
      sunday = 0,
      holidayCount = 0,
      absent = 0;

    const m = selectedDate.getMonth(),
      y = selectedDate.getFullYear();
    const dim = new Date(y, m + 1, 0).getDate();

    for (let day = 1; day <= dim; day++) {
      const currentDate = new Date(y, m, day);
      currentDate.setHours(0, 0, 0, 0);
      const formatted = formatDate(currentDate);

      if (currentDate.getDay() === 0) {
        sunday++;
        continue;
      }
      if (isHoliday(currentDate)) {
        holidayCount++;
        continue;
      }

      const record = attendance.find(
        (a) => a.empId === selectedEmployee && formatDate(a.date) === formatted
      );

      if (record) {
        if (record.leaveType === "paid") {
          paidLeaves++;
        } else {
          present++;
        }
      } else {
        if (currentDate < today) {
          absent++;
        }
      }
    }

    const remaining = Math.max(0, ENTITLED_PAID_LEAVES - paidLeaves);
    return { present, paidLeaves, absent, remaining, sunday, holidayCount };
  };

  if (loading) return <div>Loading attendance...</div>;

  if (!selectedEmployee) {
    return (
      <div className="section-box">
        <button className="btn-secondary back-btn" onClick={() => setView(null)}>
          Back
        </button>
        <h3 className="mainheading">Select Employee</h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.empId}>
                <td>{emp.empId}</td>
                <td>{emp.name}</td>
                <td>
                  <button className="btn-primary" onClick={() => handleEmployeeSelect(emp.empId)}>
                    View Calendar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const summary = getSummary();

  return (
    <div className="section-box">
      <button className="btn-secondary back-btn" onClick={() => setSelectedEmployee(null)}>
        Back
      </button>
      <h3 className="mainheading">
        Attendance — {employees.find((e) => e.empId === selectedEmployee)?.name || "N/A"}
      </h3>
      <Calendar
        onClickDay={handleDateClick}
        value={selectedDate}
        tileDisabled={({ date, view }) => {
          if (view !== "month") return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date > today;
        }}
        tileClassName={({ date, view }) => {
          if (view !== "month") return "";
          const classes = [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (date.getMonth() !== selectedDate.getMonth()) classes.push("calendar-disabled");

          if (date.getDay() === 0) classes.push("calendar-sunday");

          if (isHoliday(date)) classes.push("calendar-holiday");

          const formatted = formatDate(date);
          const rec = attendance.find(
            (a) => a.empId === selectedEmployee && formatDate(a.date) === formatted
          );

          if (!rec && date < today && !isHoliday(date) && date.getDay() !== 0) {
            classes.push("calendar-absent");
          } else if (rec) {
            if (isLate(rec.inTime)) classes.push("calendar-late", "calendar-present");
            else classes.push("calendar-present");
          }
          return classes.join(" ");
        }}
        tileContent={({ date }) => {
          const rec = attendance.find(
            (a) => a.empId === selectedEmployee && formatDate(a.date) === formatDate(date)
          );
          return rec && isLate(rec.inTime) ? (
            <div style={{ fontSize: "10px", color: "red", marginTop: "2px" }}>Late</div>
          ) : null;
        }}
      />
      {modalData && (
        <div className="modal">
          <h3>Attendance on {modalData.date}</h3>
          <img
            src={modalData.photo || modalData.outPhoto || "/default-avatar.png"}
            alt="avatar"
            className="avatar"
            style={{ width: 80, height: 80, borderRadius: "50%" }}
          />
          <p>In‑Time: {modalData.inTime || "N/A"}</p>
          <p>In‑Location: {modalData.inLocation || "N/A"}</p>
          <p>Out‑Time: {modalData.outTime || "N/A"}</p>
          <p>Out‑Location: {modalData.outLocation || "N/A"}</p>
          <p>Work Duration: {modalData.workDuration || "N/A"}</p>
          <p>Leave Type: {modalData.leaveType || "None"}</p>
          <button className="btn-secondary" onClick={() => setModalData(null)}>
            Close
          </button>
        </div>
      )}
      <div className="summary-box">
        <h3>
          Summary: {selectedDate.toLocaleString("default", { month: "long" })} {selectedDate.getFullYear()}
        </h3>
        <ul className="attendance-summary">
          <li>Present: {summary.present}</li>
          <li>Absent: {summary.absent}</li>
          <li>Paid Leaves: {summary.paidLeaves}</li>
          <li>Remaining Paid Leaves: {summary.remaining}</li>
          <li>Sundays (off): {summary.sunday}</li>
          <li>Holidays (off): {summary.holidayCount}</li>
        </ul>
      </div>
    </div>
  );
};

export default AttendanceRecords;

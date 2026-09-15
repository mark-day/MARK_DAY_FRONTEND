import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import 'react-calendar/dist/Calendar.css';
import '../Admin.css'

const BASE_URL = "https://attendance-backend-final-4.onrender.com";

const CalendarView = ({ setView }) => {
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [value, setValue] = useState(new Date());

  useEffect(() => {
    axios.get(`${BASE_URL}/api/admin/attendance`).then(res => {
      // Extract unique dates from attendance records
      const uniqueDates = [...new Set(res.data.map(r => r.date))];
      setAttendanceDates(uniqueDates);
    });
  }, []);

  // Mark dates with attendance with a special class
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().slice(0, 10);
      if (attendanceDates.includes(dateStr)) {
        return 'highlight-attendance-date';
      }
    }
    return null;
  };

  return (
    <div className="section-box">
      <button className="btn-secondary back-btn" onClick={() => setView(null)}>Back</button>
      <h3 className="mainheading">Attendance Calendar</h3>
      <Calendar
        onChange={setValue}
        value={value}
        tileClassName={tileClassName}
      />
      <p style={{ marginTop: 20 }}>
        Dates highlighted indicate attendance records.
      </p>
      <style>{`
        .highlight-attendance-date {
          background: #4caf50 !important;
          color: white !important;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default CalendarView;

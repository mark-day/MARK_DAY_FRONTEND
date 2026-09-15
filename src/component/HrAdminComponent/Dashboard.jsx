// src/components/Dashboard.jsx
import React from "react";

const Dashboard = ({ setView }) => (
  <div className="dashboard-container">
    <h1 className="dashboard-title">Admin Dashboard</h1>
    <div className="dashboard-cards">
      <div className="dashboard-card" onClick={() => setView("employee")}>
        Edit Employee Details
      </div>
      <div className="dashboard-card" onClick={() => setView("attendance")}>
        View Attendance Records
      </div>
      <div className="dashboard-card" onClick={() => setView("LeaveRequest")}>
        View Leave Requests
      </div>
      <div className="dashboard-card" onClick={() => setView("RegisterUser")}>
        Register New User
      </div>
    </div>
  </div>
);

export default Dashboard;

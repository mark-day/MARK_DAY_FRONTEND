import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* ================= PAGES ================= */
import AdminDashboardPage from "./component/Admin/Admin.jsx";
import Attendance from "./component/Attendance.jsx";
import Login from "./component/login.jsx";
import Register from "./component/register.jsx";
import UserHome from "./Page/UserHome/UserHome.jsx";
import SeeAttendence from "./Page/SeeAttendence/SeeAttendence.jsx";
import HrPolicy from "./Page/HrPolicy/HrPolicy.jsx";
import MyLeave from "./Page/leave/MyLeave.jsx";
import HrAdmin from "./Page/HrAdmin/HrAdmin.jsx";
import { PreviousPageProvider } from "./component/PreviousPage.jsx";
import TrackEmployees from "./component/TrackEmployees.jsx";
import Profile from "./component/HrAdminComponent/Profile.tsx";
import CheckLeaves from "./Page/CheckLeaves/CheckLeaves.jsx";
import InstallPWA from "./component/InstallPWA.jsx";

/* ================= AUTH WRAPPER ================= */

const RequireAuth = ({ role, children }) => {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* ================= DASHBOARD LAYOUT ================= */

const DashboardLayout = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
    });
  }

  return (
    <div className="wrapper">
      <Routes>
        <Route index element={<Navigate to="userhome" replace />} />

        <Route path="userhome" element={<UserHome />} />

        <Route
          path="seeattendence"
          element={<SeeAttendence />}
        />

        <Route
          path="mark-attendance"
          element={<Attendance />}
        />

        <Route
          path="request-leave"
          element={<MyLeave />}
        />

        <Route
          path="hrpolicy"
          element={<HrPolicy />}
        />

        <Route
          path="profile"
          element={<Profile />}
        />

        <Route
          path="LeaveRequest"
          element={<CheckLeaves />}
        />

        <Route
          path="track-employees"
          element={
            <RequireAuth role="admin">
              <TrackEmployees />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
};

/* ================= APP ================= */

const App = () => {
  return (
    <PreviousPageProvider>
      <Router>
        <InstallPWA />

        <Routes>
          {/* ================= ROOT ================= */}

          <Route
            path="/"
            element={
              (() => {
                let user = null;

                try {
                  user = JSON.parse(
                    localStorage.getItem("user")
                  );
                } catch {
                  user = null;
                }

                if (!user) {
                  return <Navigate to="/login" replace />;
                }

                if (user.role === "hr_admin") {
                  return <Navigate to="/hradmin" replace />;
                }

                if (user.role === "admin") {
                  return <Navigate to="/admin" replace />;
                }

                return (
                  <Navigate
                    to="/dashboard/userhome"
                    replace
                  />
                );
              })()
            }
          />

          {/* ================= AUTH ================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* ================= HR ADMIN ================= */}

          <Route
            path="/hradmin"
            element={
              <RequireAuth role="hr_admin">
                <HrAdmin />
              </RequireAuth>
            }
          />

          {/* ================= ADMIN ================= */}

          <Route
            path="/admin"
            element={
              <RequireAuth role="admin">
                <AdminDashboardPage />
              </RequireAuth>
            }
          />

          {/* ================= USER DASHBOARD ================= */}

          <Route
            path="/dashboard/*"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          />

          {/* ================= 404 ================= */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Router>
    </PreviousPageProvider>
  );
};

export default App;
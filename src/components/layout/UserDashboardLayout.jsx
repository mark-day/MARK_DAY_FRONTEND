import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import GlobalTopBar from "./GlobalTopBar.jsx";

import InstallButton from "../../component/InstallButton.jsx";
import Attendance from "../../component/Attendance.jsx";
import SeeAttendence from "../../Page/SeeAttendence/SeeAttendence.jsx";
import HrPolicy from "../../Page/HrPolicy/HrPolicy.jsx";
import MyLeave from "../../Page/leave/MyLeave.jsx";
import CheckIn from "../../component/CheckIn.jsx";
import TrackEmployees from "../../component/TrackEmployees.jsx";

import UserHome from "../../features/dashboard/pages/UserHome.jsx";

import { useUserProfile } from "../../features/dashboard/hooks/useUserProfile.js";
import GlobalHeader from "../../component/GlobalHeader.jsx";

const Settings = () => (
  <div className="p-6">
    ⚙️ Settings Page Coming Soon
  </div>
);

const Reports = () => (
  <div className="p-6">
    📊 Reports Page Coming Soon
  </div>
);

const Support = () => (
  <div className="p-6">
    🆘 Support Page Coming Soon
  </div>
);

const ProtectedAdmin = ({ children }) => {
  const isAdminLoggedIn =
    localStorage.getItem("isAdminLoggedIn") === "true";

  return isAdminLoggedIn
    ? children
    : <Navigate to="/admin-login" replace />;
};

function UserDashboardLayout() {
  const empId = localStorage.getItem("empId");

  const {
    user,
    loading,
    uploading,
    uploadPhoto,
  } = useUserProfile(empId);

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <div
        className="
          mx-auto
          w-full
          px-4
          py-5
          sm:px-6
          sm:py-6
          lg:px-[44px]
          lg:py-[36px]
        "
      >
        {/* GLOBAL DASHBOARD TOP BAR */}
        <GlobalHeader />

        {/* Existing install button */}
        <InstallButton />

        {/* Existing dashboard routing structure */}
        <div className="mt-9 sm:mt-10 lg:mt-[48px]">
          <Routes>
            <Route
              path="hrpolicy"
              element={<HrPolicy />}
            />

            <Route
              index
              element={
                <Navigate
                  to="userhome"
                  replace
                />
              }
            />

            <Route
              path="userhome"
              element={
                <UserHome
                  user={user}
                />
              }
            />

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
              path="settings"
              element={<Settings />}
            />

            <Route
              path="reports"
              element={<Reports />}
            />

            <Route
              path="support"
              element={<Support />}
            />

            <Route
              path="check-in"
              element={<CheckIn empId={empId} />}
            />

            <Route
              path="track-employees"
              element={
                <ProtectedAdmin>
                  <TrackEmployees />
                </ProtectedAdmin>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default UserDashboardLayout;
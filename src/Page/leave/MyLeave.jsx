import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  CalendarDays,
  Clock3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./leave.css";
import GlobalHeader from "../../components/layout/GlobalTopBar";

const BASE_URL = "https://attendance-backend-final-4.onrender.com";

const MyLeave = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [user, setUser] = useState({
    empId: "",
    empName: "",
    role: "Super Admin",
    avatar: "",
    companyName: "Athratech Pvt Limited",
  });

  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("");
  const [previousLeaves, setPreviousLeaves] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

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

    const empId =
      source.empId ||
      source.employeeId ||
      source.employee_id ||
      localStorage.getItem("empId") ||
      localStorage.getItem("employeeId") ||
      "";

    const empName =
      source.empName ||
      source.employeeName ||
      source.employee_name ||
      source.name ||
      source.fullName ||
      source.full_name ||
      source.username ||
      "User";

    const role =
      source.role ||
      source.userRole ||
      source.designation ||
      source.position ||
      "Super Admin";

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

    const companyName =
      source.companyName ||
      source.company_name ||
      source.organizationName ||
      source.organization_name ||
      localStorage.getItem("companyName") ||
      "Athratech Pvt Limited";

    setUser({
      empId,
      empName,
      role,
      avatar,
      companyName,
    });

    if (empId) {
      fetchPreviousLeaves(empId);
    }
  }, []);

  useEffect(() => {
    readStoredUserProfile();
  }, [readStoredUserProfile]);

  const fetchPreviousLeaves = async (employeeId) => {
    if (!employeeId) return;

    setLoadingLeaves(true);
    try {
      const res = await fetch(`${BASE_URL}/api/leave/my/${employeeId}`);

      if (res.status === 404) {
        setPreviousLeaves([]);
        setLeaveSummary(null);
        return;
      }

      const data = await res.json();
      const leaves = Array.isArray(data) ? data : data?.leaves || [];
      const summary = Array.isArray(data) ? null : data?.paidLeave || null;

      setPreviousLeaves(leaves);
      setLeaveSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      setStatusMsg("All fields are required");
      setStatusType("error");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setStatusMsg("End date cannot be before start date");
      setStatusType("error");
      return;
    }

    const payload = {
      empId: user.empId,
      empName: user.empName,
      employeeId: user.empId,
      employeeName: user.empName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/leave/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setStatusMsg("Your Leave Request has been submitted");
        setStatusType("success");
        setFormData({
          startDate: "",
          endDate: "",
          reason: "",
        });
        fetchPreviousLeaves(user.empId);
      } else {
        setStatusMsg(result.error || "Request Failed");
        setStatusType("error");
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Network Error");
      setStatusType("error");
    }
  };

  const latestLeave = useMemo(() => {
    if (!previousLeaves?.length) return null;

    const sorted = [...previousLeaves].sort((a, b) => {
      const ta = new Date(a.appliedAt || a.createdAt || a.startDate || 0);
      const tb = new Date(b.appliedAt || b.createdAt || b.startDate || 0);
      return tb - ta;
    });

    return sorted[0];
  }, [previousLeaves]);

  const totalDays = useMemo(() => {
    if (!latestLeave?.startDate || !latestLeave?.endDate) return "—";

    const s = new Date(latestLeave.startDate);
    const e = new Date(latestLeave.endDate);
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));

    return diff >= 0 ? diff + 1 : "—";
  }, [latestLeave]);

  const formattedAppliedDate = useMemo(() => {
    if (!latestLeave) return "";
    const d = new Date(
      latestLeave.appliedAt || latestLeave.createdAt || latestLeave.startDate
    );

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [latestLeave]);

  const summaryCardsDesktop = [
    {
      title: "Total Paid Leaves",
      value: leaveSummary?.total ?? 0,
      tone: "green",
      icon: <CheckCircle2  strokeWidth={2.1} />,
    },
    {
      title: "Used Leaves",
      value: leaveSummary?.used ?? 0,
      tone: "blue",
      icon: <CalendarDays  strokeWidth={2.1} />,
    },
    {
      title: "Remaining Leaves",
      value: leaveSummary?.remaining ?? 0,
      tone: "green",
      icon: <CheckCircle2  strokeWidth={2.1} />,
    },
  ];

  const summaryCardsMobile = [
    {
      title: "Total Paid Leaves",
      value: leaveSummary?.total ?? 0,
      tone: "green",
      icon: <CheckCircle2  strokeWidth={2.1} />,
    },
    {
      title: "Used Leaves",
      value: leaveSummary?.used ?? 0,
      tone: "blue",
      icon: <CalendarDays  strokeWidth={2.1} />,
    },
    {
      title: "Remaining Leaves",
      value: leaveSummary?.remaining ?? 0,
      tone: "red",
      icon: <Clock3  strokeWidth={2.1} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F2F3F7] font-[Inter,system-ui,sans-serif]">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        {/* top nav */}
       <GlobalHeader />

        {/* title */}
        <div className="mt-6 flex items-start gap-4 sm:mt-8 lg:mt-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[16px] border border-[#E5E7EB] bg-white text-[#111111] shadow-[0_1px_3px_rgba(16,24,40,0.06),0_8px_24px_rgba(16,24,40,0.05)] transition active:scale-[0.98]  lg:h-[50px] lg:w-[50px] lg:rounded-[16px]"
            aria-label="Back"
          >
            <ChevronLeft size={24} strokeWidth={2.4} />
          </button>

          <div className="pt-[2px]">
            <h1 className="m-0 text-[30px] font-[700] leading-none tracking-[-0.04em] text-[#202124] sm:text-[40px] lg:text-[32px]">
              Request Leave
            </h1>
            <p className="mt-[6px] hidden text-[14px] font-[400] text-[#555555] sm:block lg:text-[15px] mt-[10px]">
              Apply for paid or unpaid leave with transparent balance tracking
            </p>
          </div>
        </div>

        {/* stats */}
        {!!leaveSummary && (
          <>
            <div className="mt-6 hidden grid-cols-3 gap-5 lg:grid">
              {summaryCardsDesktop.map((card, index) => (
                <StatCard
                  key={index}
                  title={card.title}
                  value={card.value}
                  tone={card.tone}
                  icon={card.icon}
                />
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 lg:hidden">
              {summaryCardsMobile.map((card, index) => (
                <StatCard
                  key={index}
                  title={card.title}
                  value={card.value}
                  tone={card.tone}
                  icon={card.icon}
                  mobile
                  className={index === 2 ? "col-span-1" : ""}
                />
              ))}
            </div>
          </>
        )}

        {/* success */}
        {statusType === "success" && (
          <div className="mt-6 flex items-center gap-4 rounded-[28px] border border-[#24B12A] bg-[#DFF0DD] px-5 py-5 shadow-[0_2px_4px_rgba(16,24,40,0.03)] sm:px-6 lg:min-h-[108px] lg:px-[22px]">
            <div className="flex h-[56px] w-[56px] min-w-[56px] items-center justify-center rounded-full border-[4px] border-[#1D931D] text-[#1D931D] sm:h-[62px] sm:w-[62px] sm:min-w-[62px]">
              <Check size={31} strokeWidth={3} />
        </div>

        <div>
              <p className="text-[17px] font-[700] leading-[1.12] text-[#1D931D] sm:text-[18px] lg:text-[20px]">
                Your Leave Request has been submitted
              </p>
              <p className="mt-[4px] text-[13px] font-[400] text-[#505050] sm:text-[14px]">
                Scroll down to view request summary
              </p>
        </div>
        </div>
        )}

        {statusType === "error" && (
          <div className="mt-6 rounded-[20px] border border-[#F04438] bg-[#FEF3F2] px-5 py-4 text-[14px] font-[600] text-[#B42318]">
            {statusMsg}
          </div>
        )}

        {/* form card */}
        <div className="mt-6 rounded-[28px] border border-[rgba(17,24,39,0.04)] bg-white px-4 py-5 shadow-[0_2px_4px_rgba(16,24,40,0.04),0_10px_28px_rgba(16,24,40,0.06)] sm:px-6 sm:py-6 lg:rounded-[34px] lg:px-8 lg:py-8">
          <h2 className="m-0 text-[28px] font-[560] leading-[1.08] tracking-[-0.03em] text-[#202124]  lg:text-[28px]">
            Leave Application Form
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid grid-cols-1 gap-x-7 gap-y-5 lg:mt-8 lg:grid-cols-2 lg:gap-y-6"
          >
            <Field label="Employee Name">
              <input
                value={user.empName || ""}
                readOnly
                className="leave-input"
              />
            </Field>

            <Field label="Employee ID">
              <input
                value={user.empId || ""}
                readOnly
                className="leave-input"
              />
            </Field>

            <Field label="Start Date">
              <DateInput
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min=""
              />
            </Field>

            <Field label="End Date">
              <DateInput
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || ""}
              />
            </Field>

            <div className="lg:col-span-2">
              <Field label="Reason for Leave">
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="leave-textarea"
                />
              </Field>
            </div>

            <div className="lg:col-span-2 pt-1 sm:pt-2">
              <button
                type="submit"
                className="h-[56px] w-full rounded-[16px] bg-[#083F74] text-[15px] font-[600] text-white shadow-[0_4px_14px_rgba(8,63,116,0.18)] transition hover:bg-[#073761] sm:w-[328px] sm:text-[16px] lg:h-[60px] lg:w-[420px] lg:rounded-[18px]"
              >
                Submit Leave Request
              </button>
            </div>
          </form>
        </div>

        {/* summary */}
        {latestLeave && (
          <div className="mt-8">
            <h2 className="m-0 mb-4 text-[22px] font-[700] leading-[1.15] tracking-[-0.03em] text-[#202124] sm:text-[24px] lg:text-[26px]">
              Leave Request Summary
            </h2>

            <div className="rounded-[28px] border border-[rgba(17,24,39,0.04)] bg-white px-4 py-5 shadow-[0_2px_4px_rgba(16,24,40,0.04),0_10px_28px_rgba(16,24,40,0.06)] sm:px-6 sm:py-6 lg:rounded-[30px] lg:px-6 lg:py-5">
              <div className="flex flex-col gap-4 border-b border-[#EAEAEA] pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
                  <p className="text-[18px] font-[600] text-[#555555] sm:text-[20px]">
                    Leave Request ID #
                    {String(
                      latestLeave.leaveRequestId ||
                        latestLeave.requestId ||
                        latestLeave._id ||
                        "46789"
                    ).slice(-5)}
                  </p>
                  <p className="mt-[6px] text-[14px] text-[#666666]">
                    Applied on {formattedAppliedDate || "Feb 13, 2026"}
                  </p>
        </div>

                <span className="inline-flex h-[40px] items-center justify-center rounded-full border border-[#E5A43A] bg-[#FFF4D9] px-6 text-[14px] font-[500] text-[#C97812]">
                  Pending
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                <MiniField
                  label="Start Date"
                  value={
                    latestLeave.startDate
                      ? new Date(latestLeave.startDate).toLocaleDateString()
                      : ""
                  }
                />
                <MiniField
                  label="End Date"
                  value={
                    latestLeave.endDate
                      ? new Date(latestLeave.endDate).toLocaleDateString()
                      : ""
                  }
                />
                <MiniField label="Total Days" value={totalDays} />
                <MiniField
                  label="Approved by"
                  value={latestLeave.approvedBy || "—"}
                />
              </div>
            </div>
          </div>
        )}

        {/* policy */}
        <div className="mt-8 rounded-[28px] border border-[#C9D9F7] bg-[#EAF1FB] px-4 py-5 shadow-[0_2px_4px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.05)] sm:px-6 sm:py-6 lg:rounded-[30px] lg:px-8 lg:py-7">
          <h3 className="m-0 text-[24px] font-[700] leading-[1.1] tracking-[-0.03em] text-[#202124] sm:text-[28px] lg:text-[24px]">
            Leave Policy Information
          </h3>

          <ul className="mt-4 list-disc space-y-4 pl-5 text-[15px] leading-[1.35] text-[#5A5A5A] lg:space-y-5">
            <li>All leave requests must be submitted at least 2 days in advance</li>
            <li>
              Emergency leaves can be applied on the same day with proper
              justification
            </li>
            <li>Unpaid leaves will be granted if paid leave balance is exhausted</li>
            <li>Leave approval typically takes 1-2 business days</li>
        </ul>
        </div>

        {loadingLeaves && (
          <p className="mt-4 text-[13px] text-[#6B7280]">
            Loading leave history...
          </p>
        )}
      </div>
    </div>
  );
};

/* reusable */

const Field = ({ label, children }) => (
  <div>
    <label className="mb-[10px] block text-[16px] font-[500] text-[#4E4E4E] sm:text-[18px] lg:text-[16px]">
      {label}
    </label>
    {children}
  </div>
);

const StatCard = ({
  title,
  value,
  tone = "green",
  icon,
  mobile = false,
  className = "",
}) => {
  const tones = {
    green: {
      box: "bg-[#DDF5E2]",
      icon: "text-[#2F9E44]",
    },
    blue: {
      box: "bg-[#E9EEF5]",
      icon: "text-[#163D6A]",
    },
    red: {
      box: "bg-[#F8DDD4]",
      icon: "text-[#F04438]",
    },
  };

  return (
    <div
      className={`flex min-h-[104px] items-center gap-[14px] rounded-[24px] border border-[rgba(17,24,39,0.04)] bg-white px-4 py-4 !shadow-[1px_0.5px_1px_0_#0000001A] sm:min-h-[110px] sm:px-5 sm:py-5 lg:min-h-[116px] lg:rounded-[28px] lg:px-[28px] lg:py-[22px] ${className}`}
    >
      <div
        className={`flex h-[54px] w-[54px]  max-[768px]:!h-[40px] max-[768px]:!w-[40px]  items-center justify-center rounded-[18px] ${tones[tone].box} ${tones[tone].icon} lg:h-[58px] lg:w-[58px] lg:min-w-[58px]`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="m-0 text-[14px] font-[400] leading-[1.2] text-[#3B3B3B] sm:text-[15px] lg:text-[16px]">
          {title}
        </p>
        <p className="m-0 mt-[4px] text-[24px] font-[700] leading-none tracking-[-0.03em] text-[#202124] sm:text-[28px] lg:text-[30px]">
          {value}
        </p>
      </div>
    </div>
  );
};

const MiniField = ({ label, value }) => (
  <div>
    <p className="mb-[8px] text-[14px] font-[400] text-[#5B5B5B]">{label}</p>
    <div className="flex min-h-[52px] items-center rounded-[16px] border border-[#E7E7E7] bg-[#F8F8F8] px-4 text-[15px] font-[500] text-[#8B8B8B]">
      {value || ""}
    </div>
  </div>
);

const DateInput = ({ name, value, onChange, min }) => (
  <input
    type="date"
    name={name}
    value={value}
    min={min}
    onChange={onChange}
    className="leave-input leave-date-input"
  />
);

export default MyLeave;
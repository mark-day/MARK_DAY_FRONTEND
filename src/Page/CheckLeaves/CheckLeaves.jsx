import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { useVisitedPages } from "../../component/PreviousPage";
import { FaChevronLeft } from "react-icons/fa";
import GlobalHeader from "../../component/GlobalHeader";

/* =========================================================
   API
========================================================= */

const API_ROOT =
  "https://attendance-backend-final-4.onrender.com";

const LEAVE_BASE = `${API_ROOT}/api/leave`;

/* =========================================================
   HELPERS
========================================================= */

const normalizeRole = (value) =>
  typeof value === "string"
    ? value.toLowerCase().trim()
    : "";

const normalizeStatus = (value) =>
  typeof value === "string"
    ? value.toLowerCase().trim()
    : "";

const normalizeDecisionBy = (value) =>
  typeof value === "string"
    ? value.toLowerCase().trim()
    : "";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getStoredRole = () => {
  const user = getStoredUser();

  return normalizeRole(
    user?.role ||
      localStorage.getItem("role") ||
      ""
  );
};

const getStoredName = () => {
  const user = getStoredUser();

  return (
    user?.name ||
    localStorage.getItem("name") ||
    ""
  );
};

/* =========================================================
   COMPONENT
========================================================= */

function CheckLeaves({
  ApproveLeaveButton,
  onBack,
}) {
  const { visitPage } = useVisitedPages();

  /* =======================================================
     STATE
  ======================================================= */

  const [leaves, setLeaves] = useState([]);

  const [selectedLeave, setSelectedLeave] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [actioning, setActioning] =
    useState(null);

  const [remark, setRemark] =
    useState("");

  const [remarkSaving, setRemarkSaving] =
    useState(false);

  const [uiError, setUiError] =
    useState("");

  const [uiSuccess, setUiSuccess] =
    useState("");

  const [mobileModalOpen, setMobileModalOpen] =
    useState(false);

  /* =======================================================
     PROFILE / ROLE
  ======================================================= */

  const [profile] = useState(() => ({
    name: getStoredName(),

    role: getStoredRole(),

    avatar:
      localStorage.getItem("avatar") || "",

    company:
      localStorage.getItem("companyName") ||
      "Athratech Pvt Limited",
  }));

  const userRole = normalizeRole(
    profile.role ||
      getStoredRole()
  );

  const isAdmin =
    userRole === "admin";

  const isHrAdmin =
    userRole === "hr_admin";

  const canAccessPage =
    isAdmin || isHrAdmin;

  /* =======================================================
     TOKEN
  ======================================================= */

  const token =
    localStorage.getItem("token");

  const authConfig = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};

  /* =======================================================
     STATUS
  ======================================================= */

  const getStatus = (leave) => {
    const status =
      normalizeStatus(
        leave?.status
      );

    if (
      status === "pending" ||
      status === "approved" ||
      status === "rejected"
    ) {
      return status;
    }

    return "pending";
  };

  const isPending = (leave) =>
    getStatus(leave) === "pending";

  const isApproved = (leave) =>
    getStatus(leave) === "approved";

  const isRejected = (leave) =>
    getStatus(leave) === "rejected";

  /* =======================================================
     HR REMARK
  ======================================================= */

  const getRemarkValue = (leave) => {
    const value =
      leave?.hrComment;

    if (
      !value ||
      String(value)
        .trim()
        .toLowerCase() === "no remark"
    ) {
      return "";
    }

    return String(value);
  };

  const hasHrRemark = (leave) =>
    Boolean(
      getRemarkValue(leave).trim()
    );

  /* =======================================================
     DECISION SOURCE
  ======================================================= */

  const getDecisionBy = (leave) =>
    String(
      leave?.approveBy || ""
    ).trim();

  const isAdminApproval = (leave) =>
    normalizeDecisionBy(
      leave?.approveBy
    ) === "admin";

  const isHrApproval = (leave) =>
    normalizeDecisionBy(
      leave?.approveBy
    ) === "hr admin";

  /*
   * Backend currently does not have rejectBy.
   *
   * Therefore:
   *
   * rejected + no HR remark
   *      = Admin rejection
   *
   * rejected + HR remark
   *      = HR final rejection
   */

  const isAdminRejection = (leave) =>
    isRejected(leave) &&
    !hasHrRemark(leave);

  const isHrRejection = (leave) =>
    isRejected(leave) &&
    hasHrRemark(leave);

  const isHrFinalDecision = (leave) =>
    isHrApproval(leave) ||
    isHrRejection(leave);

  const hasFirstLevelDecision = (leave) =>
    isAdminApproval(leave) ||
    isAdminRejection(leave);

  /* =======================================================
     AUTHORITY
  ======================================================= */

  /*
   * ADMIN
   *
   * Admin can only make the first-level decision
   * while the request is pending.
   */

  const canAdminTakeAction = (leave) => {
    if (!isAdmin) {
      return false;
    }

    return isPending(leave);
  };

  /*
   * HR ADMIN
   *
   * HR is the final authority.
   *
   * HR can review:
   *
   * 1. Pending requests
   * 2. Admin-approved requests
   * 3. Admin-rejected requests
   *
   * HR cannot modify a request after HR has
   * already made the final decision.
   */

  const canHrTakeAction = (leave) => {
    if (!isHrAdmin) {
      return false;
    }

    if (isHrFinalDecision(leave)) {
      return false;
    }

    if (isPending(leave)) {
      return true;
    }

    if (hasFirstLevelDecision(leave)) {
      return true;
    }

    return false;
  };

  const canActOnLeave = (leave) => {
    if (!canAccessPage) {
      return false;
    }

    if (isAdmin) {
      return canAdminTakeAction(
        leave
      );
    }

    if (isHrAdmin) {
      return canHrTakeAction(
        leave
      );
    }

    return false;
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    visitPage(
      "/leave",
      "Leave Requests"
    );

    if (canAccessPage) {
      fetchLeaves();
    } else {
      setLoading(false);

      setUiError(
        "You do not have permission to access leave requests."
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccessPage]);

  /* =======================================================
     MOBILE BODY SCROLL
  ======================================================= */

  useEffect(() => {
    if (
      mobileModalOpen &&
      window.innerWidth < 1024
    ) {
      const originalOverflow =
        document.body.style.overflow;

      document.body.style.overflow =
        "hidden";

      return () => {
        document.body.style.overflow =
          originalOverflow;
      };
    }

    return undefined;
  }, [mobileModalOpen]);

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    if (!mobileModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileModal();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [mobileModalOpen, actioning]);

  /* =======================================================
     FETCH LEAVES
  ======================================================= */

  const fetchLeaves = async () => {
    if (!canAccessPage) {
      setLeaves([]);
      setSelectedLeave(null);
      return;
    }

    try {
      setLoading(true);
      setUiError("");

      /*
       * We intentionally use /all.
       *
       * HR needs to see requests which have already
       * received a first-level Admin decision.
       */

      const response =
        await axios.get(
          `${LEAVE_BASE}/all`,
          authConfig
        );

      const list =
        Array.isArray(
          response?.data
        )
          ? response.data
          : Array.isArray(
              response?.data?.data
            )
            ? response.data.data
            : [];

      setLeaves(list);

      setSelectedLeave((previous) => {
        if (!list.length) {
          return null;
        }

        if (previous?._id) {
          const updated =
            list.find(
              (item) =>
                item._id ===
                previous._id
            );

          if (updated) {
            return updated;
          }
        }

        return list[0];
      });

    } catch (error) {
      console.error(
        "Fetch leaves error:",
        error
      );

      setUiError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to load leave requests."
      );

      setLeaves([]);
      setSelectedLeave(null);

    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     DATE
  ======================================================= */

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }
    );
  };

  /* =======================================================
     DURATION
  ======================================================= */

  const getDuration = (leave) => {
    const paid =
      Number(
        leave?.paidDays || 0
      );

    const unpaid =
      Number(
        leave?.unpaidDays || 0
      );

    const total =
      paid + unpaid;

    if (total > 0) {
      return total;
    }

    if (
      leave?.startDate &&
      leave?.endDate
    ) {
      const start =
        new Date(
          leave.startDate
        );

      const end =
        new Date(
          leave.endDate
        );

      if (
        !Number.isNaN(
          start.getTime()
        ) &&
        !Number.isNaN(
          end.getTime()
        ) &&
        end >= start
      ) {
        return (
          Math.ceil(
            (end - start) /
              (1000 *
                60 *
                60 *
                24)
          ) + 1
        );
      }
    }

    return "-";
  };

  /* =======================================================
     COUNTERS
  ======================================================= */

  const counters = useMemo(() => {
    const pending =
      leaves.filter(
        (leave) =>
          isPending(leave)
      ).length;

    const adminApproved =
      leaves.filter(
        (leave) =>
          isAdminApproval(
            leave
          )
      ).length;

    const adminRejected =
      leaves.filter(
        (leave) =>
          isAdminRejection(
            leave
          )
      ).length;

    const hrApproved =
      leaves.filter(
        (leave) =>
          isHrApproval(
            leave
          )
      ).length;

    const hrRejected =
      leaves.filter(
        (leave) =>
          isHrRejection(
            leave
          )
      ).length;

    const finalApproved =
      hrApproved;

    const finalRejected =
      hrRejected;

    /*
     * For HR:
     *
     * Pending HR review means:
     * - pending
     * - Admin approved
     * - Admin rejected
     *
     * The HR UI does not expose which first-level
     * decision was made.
     */

    const pendingHr =
      pending +
      adminApproved +
      adminRejected;

    /*
     * For Admin:
     *
     * Pending means only requests waiting for
     * Admin's first-level decision.
     */

    return {
      pending,
      pendingHr,
      adminApproved,
      adminRejected,
      finalApproved,
      finalRejected,
      total: leaves.length,
    };
  }, [leaves]);

  /* =======================================================
     SELECT
  ======================================================= */

  const handleSelectLeave = (leave) => {
    setSelectedLeave(leave);

    setRemark(
      getRemarkValue(leave)
    );

    setUiError("");
    setUiSuccess("");

    if (
      window.innerWidth < 1024
    ) {
      setMobileModalOpen(true);
    }
  };

  /* =======================================================
     CLOSE MOBILE
  ======================================================= */

  const closeMobileModal = () => {
    if (actioning) {
      return;
    }

    setMobileModalOpen(false);

    setUiError("");
    setUiSuccess("");
  };

  /* =======================================================
     APPROVE
  ======================================================= */

  const handleApprove = async (
    leaveId
  ) => {
    if (!canAccessPage) {
      setUiError(
        "You do not have permission to approve leave."
      );

      return;
    }

    if (!leaveId) {
      setUiError(
        "Invalid leave request."
      );

      return;
    }

    if (
      !selectedLeave ||
      selectedLeave._id !== leaveId
    ) {
      setUiError(
        "Please select a valid leave request."
      );

      return;
    }

    /*
     * Prevent HR from approving an already-final
     * HR decision.
     */

    if (
      isHrAdmin &&
      isHrFinalDecision(
        selectedLeave
      )
    ) {
      setUiError(
        "This request has already received the final HR decision."
      );

      return;
    }

    /*
     * Admin:
     * only pending requests.
     */

    if (
      isAdmin &&
      !isPending(selectedLeave)
    ) {
      setUiError(
        "Admin can only approve pending requests."
      );

      return;
    }

    /*
     * HR:
     *
     * HR is allowed to approve:
     *
     * - pending
     * - Admin rejected
     * - Admin approved
     *
     * This is the final HR decision.
     */

    if (
      isHrAdmin &&
      !canHrTakeAction(
        selectedLeave
      )
    ) {
      setUiError(
        "This request cannot be changed by HR Admin."
      );

      return;
    }

    try {
      setActioning(leaveId);

      setUiError("");
      setUiSuccess("");

      const approverRole =
        isHrAdmin
          ? "HR Admin"
          : "Admin";

      const payload = {
        approveBy:
          approverRole,

        /*
         * HR remark is saved together with
         * the final approval.
         *
         * Admin never writes HR remarks.
         */

        hrComment:
          isHrAdmin
            ? remark.trim()
            : "",
      };

      const response =
        await axios.patch(
          `${LEAVE_BASE}/${leaveId}/approve`,
          payload,
          authConfig
        );

      setUiSuccess(
        response?.data?.message ||
          `Leave approved by ${approverRole}.`
      );

      setRemark("");

      await fetchLeaves();

      setMobileModalOpen(false);

      if (
        typeof ApproveLeaveButton ===
        "function"
      ) {
        ApproveLeaveButton();
      }

    } catch (error) {
      console.error(
        "Approve leave error:",
        error
      );

      setUiError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to approve leave."
      );

    } finally {
      setActioning(null);
    }
  };

  /* =======================================================
     REJECT
  ======================================================= */

  const handleReject = async (
    leaveId
  ) => {
    if (!canAccessPage) {
      setUiError(
        "You do not have permission to reject leave."
      );

      return;
    }

    if (!leaveId) {
      setUiError(
        "Invalid leave request."
      );

      return;
    }

    if (
      !selectedLeave ||
      selectedLeave._id !== leaveId
    ) {
      setUiError(
        "Please select a valid leave request."
      );

      return;
    }

    /*
     * HR cannot reject another HR-final decision.
     */

    if (
      isHrAdmin &&
      isHrFinalDecision(
        selectedLeave
      )
    ) {
      setUiError(
        "This request has already received the final HR decision."
      );

      return;
    }

    /*
     * Admin can only reject pending requests.
     */

    if (
      isAdmin &&
      !isPending(selectedLeave)
    ) {
      setUiError(
        "Admin can only reject pending requests."
      );

      return;
    }

    /*
     * HR rejection ALWAYS requires a remark.
     */

    if (
      isHrAdmin &&
      !remark.trim()
    ) {
      setUiError(
        "HR Remark is mandatory for rejection."
      );

      return;
    }

    if (
      isHrAdmin &&
      !canHrTakeAction(
        selectedLeave
      )
    ) {
      setUiError(
        "This request cannot be changed by HR Admin."
      );

      return;
    }

    try {
      setActioning(leaveId);

      setUiError("");
      setUiSuccess("");

      const payload = {
        hrComment:
          isHrAdmin
            ? remark.trim()
            : "",
      };

      const response =
        await axios.patch(
          `${LEAVE_BASE}/${leaveId}/reject`,
          payload,
          authConfig
        );

      setUiSuccess(
        response?.data?.message ||
          `Leave rejected by ${
            isHrAdmin
              ? "HR Admin"
              : "Admin"
          }.`
      );

      setRemark("");

      await fetchLeaves();

      setMobileModalOpen(false);

    } catch (error) {
      console.error(
        "Reject leave error:",
        error
      );

      setUiError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to reject leave."
      );

    } finally {
      setActioning(null);
    }
  };

  /* =======================================================
     SAVE HR REMARK
  ======================================================= */

  const handleSaveRemark =
    async () => {
      if (!isHrAdmin) {
        setUiError(
          "Only HR Admin can update HR remarks."
        );

        return;
      }

      if (!selectedLeave?._id) {
        setUiError(
          "Please select a leave request."
        );

        return;
      }

      if (!remark.trim()) {
        setUiError(
          "Remark is required."
        );

        return;
      }

      if (
        isHrFinalDecision(
          selectedLeave
        )
      ) {
        setUiError(
          "The final HR decision cannot be modified."
        );

        return;
      }

      try {
        setRemarkSaving(true);

        setUiError("");
        setUiSuccess("");

        const response =
          await axios.patch(
            `${LEAVE_BASE}/${selectedLeave._id}/remark`,
            {
              hrComment:
                remark.trim(),
            },
            authConfig
          );

        setUiSuccess(
          response?.data?.message ||
            "HR Remark updated successfully."
        );

        await fetchLeaves();

      } catch (error) {
        console.error(
          "Save remark error:",
          error
        );

        setUiError(
          error?.response?.data?.error ||
            error?.response?.data?.message ||
            "Failed to update HR remark."
        );

      } finally {
        setRemarkSaving(false);
      }
    };

  /* =======================================================
     WORKFLOW COPY
  ======================================================= */

  const getHrWorkflowDescription = (
    leave
  ) => {
    /*
     * HR should NOT see Admin-level details.
     */

    if (isHrFinalDecision(leave)) {
      if (
        isHrApproval(leave)
      ) {
        return "HR Admin has made the final approval decision.";
      }

      return "HR Admin has made the final rejection decision.";
    }

    if (
      isPending(leave)
    ) {
      return "Review the request and make your final decision.";
    }

    if (
      hasFirstLevelDecision(
        leave
      )
    ) {
      return "The request is ready for your final decision.";
    }

    return "Review the request and make your final decision.";
  };

  const getAdminWorkflowDescription =
    (leave) => {
      if (isPending(leave)) {
        return "Review the request and submit the first-level decision.";
      }

      if (
        isAdminApproval(leave)
      ) {
        return "Admin has approved this request. HR Admin has final authority.";
      }

      if (
        isAdminRejection(leave)
      ) {
        return "Admin has rejected this request. HR Admin has final authority.";
      }

      if (
        isHrApproval(leave)
      ) {
        return "HR Admin has made the final approval decision.";
      }

      if (
        isHrRejection(leave)
      ) {
        return "HR Admin has made the final rejection decision.";
      }

      return "This request has already been decided.";
    };

  /* =======================================================
     DETAILS PANEL
  ======================================================= */

  const renderDetailsContent =
    () => {
      if (!selectedLeave) {
        return (
          <div className="p-6">
            <p className="text-sm text-gray-500">
              Select a leave request.
            </p>
          </div>
        );
      }

      const pending =
        isPending(
          selectedLeave
        );

      const approved =
        isApproved(
          selectedLeave
        );

      const rejected =
        isRejected(
          selectedLeave
        );

      const existingRemark =
        getRemarkValue(
          selectedLeave
        );

      const hrFinal =
        isHrFinalDecision(
          selectedLeave
        );

      const adminApproved =
        isAdminApproval(
          selectedLeave
        );

      const adminRejected =
        isAdminRejection(
          selectedLeave
        );

      const actionable =
        canActOnLeave(
          selectedLeave
        );

      /*
       * HR final-review state.
       *
       * This is intentionally separate from
       * Admin-level workflow information.
       */

      const hrNeedsFinalReview =
        isHrAdmin &&
        !hrFinal &&
        (
          pending ||
          adminApproved ||
          adminRejected
        );

      return (
        <>
          {/* =================================================
              REQUEST DETAILS
          ================================================= */}

          <h2 className="text-[20px] font-semibold text-[#111827] mb-6">
            Request Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
            <InfoItem
              label="Employee Name"
              value={
                selectedLeave.employeeName ||
                "-"
              }
            />

            <InfoItem
              label="Employee ID"
              value={
                selectedLeave.employeeId ||
                "-"
              }
            />

            <InfoItem
              label="Leave Type"
              value={
                selectedLeave.leaveType ||
                "-"
              }
            />

            <InfoItem
              label="Reason"
              value={
                selectedLeave.reason ||
                "-"
              }
            />

            <InfoItem
              label="From Date"
              value={formatDate(
                selectedLeave.startDate
              )}
            />

            <InfoItem
              label="End Date"
              value={formatDate(
                selectedLeave.endDate
              )}
            />

            <InfoItem
              label="Duration (Days)"
              value={getDuration(
                selectedLeave
              )}
            />
          </div>

          {/* =================================================
              HR REMARK
              
              ADMIN:
              Can see HR remark.
              
              HR:
              Can see existing HR remark.
          ================================================= */}

          {hasHrRemark(
            selectedLeave
          ) && (
            <div
              className="
                mt-7
                rounded-[16px]
                border
                border-[#E5E7EB]
                bg-[#F8FAFC]
                p-4
              "
            >
              <p className="text-[12px] text-gray-500 mb-1">
                HR Remark
              </p>

              <p className="text-[14px] leading-6 text-[#111827] break-words">
                {existingRemark}
              </p>
            </div>
          )}

          <div className="h-px bg-[#E5E7EB] my-7" />

          {/* =================================================
              APPROVAL WORKFLOW
          ================================================= */}

          <h3 className="text-[20px] font-semibold text-[#111827] mb-5">
            Approval Workflow
          </h3>

          {/* =================================================
              ADMIN VIEW
              
              Admin-level information is ONLY rendered
              for Admin.
          ================================================= */}

          {isAdmin && (
            <>
              {pending && (
                <WorkflowBox
                  tone="orange"
                  title="Pending Decision"
                  desc={getAdminWorkflowDescription(
                    selectedLeave
                  )}
                />
              )}

              

              {adminRejected && (
                <WorkflowBox
                  tone="red"
                  title="Admin Rejected"
                  desc="Admin has rejected the request. HR Admin has final authority."
                />
              )}

              {isHrApproval(
                selectedLeave
              ) && (
                <WorkflowBox
                  tone="green"
                  title="HR Admin Final Approval"
                  desc="HR Admin has made the final approval decision."
                />
              )}

              {isHrRejection(
                selectedLeave
              ) && (
                <WorkflowBox
                  tone="red"
                  title="HR Admin Final Rejection"
                  desc="HR Admin has made the final rejection decision."
                />
              )}

              {actionable && (
                <div className="mt-5">
                  <div className="rounded-[16px] border border-blue-100 bg-blue-50 px-4 py-3 mb-4">
                    <p className="text-[13px] text-blue-700 leading-5">
                      Admin is making the
                      first-level decision.
                      HR Admin has final
                      authority over this
                      request.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={
                        actioning ===
                        selectedLeave._id
                      }
                      onClick={() =>
                        handleReject(
                          selectedLeave._id
                        )
                      }
                      className="
                        h-[46px]
                        rounded-[14px]
                        border
                        border-red-500
                        bg-white
                        text-red-500
                        text-sm
                        font-semibold
                        hover:bg-red-50
                        transition
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    >
                      {actioning ===
                      selectedLeave._id
                        ? "Processing..."
                        : "Reject"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        actioning ===
                        selectedLeave._id
                      }
                      onClick={() =>
                        handleApprove(
                          selectedLeave._id
                        )
                      }
                      className="
                        h-[46px]
                        rounded-[14px]
                        bg-green-700
                        text-white
                        text-sm
                        font-semibold
                        hover:bg-green-800
                        transition
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    >
                      {actioning ===
                      selectedLeave._id
                        ? "Processing..."
                        : "Approve"}
                    </button>
                  </div>
                </div>
              )}

              {!pending &&
                !actionable &&
                !isHrFinalDecision(
                  selectedLeave
                ) && (
                  <div className="mt-5 rounded-[16px] border border-blue-100 bg-blue-50 p-4">
                    <p className="text-[13px] text-blue-700 leading-5">
                      Waiting for the final
                      HR Admin decision.
                    </p>
                  </div>
                )}
            </>
          )}

          {/* =================================================
              HR VIEW
              
              IMPORTANT:
              NO ADMIN-LEVEL DETAILS ARE SHOWN HERE.
              
              This section matches the supplied HR design:
              
              Team Lead Approved
              HR Remark
              Reject
              Approve
          ================================================= */}

          {isHrAdmin && (
            <>
              {/* ---------------------------------------------
                  HR FINAL DECISION ALREADY MADE
              --------------------------------------------- */}

              {isHrFinalDecision(
                selectedLeave
              ) && (
                <WorkflowBox
                  tone={
                    isHrApproval(
                      selectedLeave
                    )
                      ? "green"
                      : "red"
                  }
                  title={
                    isHrApproval(
                      selectedLeave
                    )
                      ? "HR Decision Approved"
                      : "HR Decision Rejected"
                  }
                  desc={
                    isHrApproval(
                      selectedLeave
                    )
                      ? "The leave request has been approved by HR."
                      : "The leave request has been rejected by HR."
                  }
                />
              )}

              {/* ---------------------------------------------
                  HR FINAL REVIEW
                  
                  This is the design shown in the second
                  uploaded screenshot.
              --------------------------------------------- */}

              {hrNeedsFinalReview && (
                <div className="mt-0">
                  <WorkflowBox
                    tone="green"
                    title="Team Lead Approved"
                    desc="The team lead has approved the request. Review and make your final decision."
                  />

                  {/* HR REMARK */}

                  <div className="mt-6">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <label
                        htmlFor="hr-remark"
                        className="text-[14px] font-semibold text-[#111827]"
                      >
                        HR Remark
                      </label>

                      <span className="text-[13px] text-gray-400">
                        (optional for acceptance)
                      </span>

                      <span className="text-[13px] font-medium text-red-500">
                        (Mandatory for rejection)
                      </span>
                    </div>

                    <textarea
                      id="hr-remark"
                      value={remark}
                      onChange={(event) => {
                        setRemark(
                          event.target.value
                        );

                        setUiError("");
                        setUiSuccess("");
                      }}
                      rows={4}
                      placeholder="Add your remark optional for acceptance but mandatory for rejection..."
                      disabled={
                        Boolean(
                          actioning
                        )
                      }
                      className="
                        w-full
                        mt-3
                        px-4
                        py-3
                        rounded-[16px]
                        border
                        border-[#E5E7EB]
                        bg-[#F3F4F6]
                        text-[14px]
                        text-[#111827]
                        placeholder:text-gray-400
                        resize-none
                        outline-none
                        focus:border-[#0F3E68]
                        focus:ring-2
                        focus:ring-[#0F3E68]/10
                        disabled:opacity-60
                        disabled:cursor-not-allowed
                      "
                    />

                    {/* -----------------------------------------
                        FINAL HR ACTIONS
                    ----------------------------------------- */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <button
                        type="button"
                        disabled={
                          actioning ===
                            selectedLeave._id ||
                          remarkSaving
                        }
                        onClick={() =>
                          handleReject(
                            selectedLeave._id
                          )
                        }
                        className="
                          h-[46px]
                          rounded-[14px]
                          border
                          border-red-500
                          bg-white
                          text-red-500
                          text-sm
                          font-semibold
                          hover:bg-red-50
                          transition
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >
                        {actioning ===
                        selectedLeave._id
                          ? "Processing..."
                          : "Reject"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          actioning ===
                            selectedLeave._id ||
                          remarkSaving
                        }
                        onClick={() =>
                          handleApprove(
                            selectedLeave._id
                          )
                        }
                        className="
                          h-[46px]
                          rounded-[14px]
                          bg-green-700
                          text-white
                          text-sm
                          font-semibold
                          hover:bg-green-800
                          transition
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >
                        {actioning ===
                        selectedLeave._id
                          ? "Processing..."
                          : "Approve"}
                      </button>
                    </div>

                    {/* -----------------------------------------
                        SAVE REMARK
                    ----------------------------------------- */}

                    {hasHrRemark(
                      selectedLeave
                    ) &&
                      !hrFinal && (
                        <button
                          type="button"
                          disabled={
                            remarkSaving ||
                            !remark.trim() ||
                            Boolean(
                              actioning
                            )
                          }
                          onClick={
                            handleSaveRemark
                          }
                          className="
                            w-full
                            h-[44px]
                            mt-3
                            rounded-[14px]
                            border
                            border-[#0F3E68]
                            bg-white
                            text-[#0F3E68]
                            text-sm
                            font-semibold
                            hover:bg-blue-50
                            transition
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                          "
                        >
                          {remarkSaving
                            ? "Saving..."
                            : "Update HR Remark"}
                        </button>
                      )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      );
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center p-6">
        <div className="text-sm text-gray-500">
          Loading leave requests...
        </div>
      </div>
    );
  }

  /* =======================================================
     UNAUTHORIZED
  ======================================================= */

  if (!canAccessPage) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center p-6">
        <div className="bg-white rounded-[24px] p-8 shadow-[1px_1px_4px_0px_#0000001A] text-center max-w-[420px] w-full">
          <p className="text-[16px] font-semibold text-[#111827]">
            Access Denied
          </p>

          <p className="text-sm text-gray-500 mt-2">
            You do not have permission to
            view leave requests.
          </p>

          <button
            type="button"
            onClick={onBack}
            className="
              mt-5
              h-[44px]
              px-5
              rounded-[14px]
              bg-[#0F3E68]
              text-white
              text-sm
              font-semibold
            "
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-[#F6F8FA]
        px-4
        py-5
        sm:px-6
        sm:py-6
        lg:px-8
        lg:py-8
      "
    >
      <div className="max-w-[1400px] mx-auto">

        {/* =================================================
            ADMIN HEADER ONLY
        ================================================= */}

        {isAdmin && (
          <GlobalHeader />
        )}

        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <div
          className="
            mt-7
            mb-7
            flex
            items-start
            gap-4
          "
        >
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="
              w-11
              h-11
              sm:w-12
              sm:h-12
              shrink-0
              rounded-[16px]
              bg-white
              shadow-[1px_1px_4px_0px_#0000001A]
              flex
              items-center
              justify-center
              hover:bg-gray-50
              transition
            "
          >
            <FaChevronLeft
              size={15}
            />
          </button>

          <div className="min-w-0">
            <h1
              className="
                text-[28px]
                sm:text-[32px]
                font-semibold
                leading-tight
                text-[#111827]
              "
            >
              Leave Requests
            </h1>

            <p className="text-gray-500 mt-1 text-sm">
              Review and annotate employee
              request
            </p>
          </div>
        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {(uiError ||
          uiSuccess) && (
          <div className="mb-6">
            {uiError && (
              <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {uiError}
              </div>
            )}

            {uiSuccess && (
              <div className="mt-3 rounded-[16px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {uiSuccess}
              </div>
            )}
          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div
          className="
            grid
            grid-cols-2
            lg:grid-cols-4
            gap-4
            mb-8
          "
        >
          <SummaryCard
            title={
              isHrAdmin
                ? "Pending HR Decision"
                : "Pending Decisions"
            }
            value={
              isHrAdmin
                ? counters.pendingHr
                : counters.pending
            }
          />

          <SummaryCard
            title="Total Requests"
            value={
              counters.total
            }
          />

          <SummaryCard
            title="Approved"
            value={
              isHrAdmin
                ? counters.finalApproved
                : leaves.filter(
                    (leave) =>
                      isApproved(
                        leave
                      )
                  ).length
            }
            tone="green"
          />

          <SummaryCard
            title="Rejected"
            value={
              isHrAdmin
                ? counters.finalRejected
                : leaves.filter(
                    (leave) =>
                      isRejected(
                        leave
                      )
                  ).length
            }
            tone="red"
          />
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]
            xl:grid-cols-[minmax(0,1fr)_minmax(520px,0.95fr)]
            gap-6
            lg:gap-8
            items-start
          "
        >

          {/* =================================================
              REQUEST LIST
          ================================================= */}

          <section className="min-w-0">
            <h2
              className="
                text-[19px]
                sm:text-[20px]
                font-semibold
                text-[#111827]
                mb-5
              "
            >
              All leave requests (
              {leaves.length}
              )
            </h2>

            <div className="space-y-4">
              {leaves.map(
                (leave) => {
                  const active =
                    selectedLeave?._id ===
                    leave._id;

                  const status =
                    getStatus(
                      leave
                    );

                  const showHrRemark =
                    hasHrRemark(
                      leave
                    );

                  /*
                   * Admin-level indicators are ONLY
                   * visible to Admin.
                   */

                  const adminDecision =
                    isAdminApproval(
                      leave
                    ) ||
                    isAdminRejection(
                      leave
                    );

                  const hrDecision =
                    isHrFinalDecision(
                      leave
                    );

                  return (
                    <article
                      key={
                        leave._id
                      }
                      onClick={() =>
                        handleSelectLeave(
                          leave
                        )
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                            "Enter" ||
                          event.key ===
                            " "
                        ) {
                          event.preventDefault();

                          handleSelectLeave(
                            leave
                          );
                        }
                      }}
                      className={`
                        bg-white
                        rounded-[24px]
                        p-5
                        sm:p-6
                        cursor-pointer
                        transition-all
                        shadow-[1px_1px_4px_0px_#0000001A]
                        ${
                          active
                            ? "lg:ring-2 lg:ring-[#3B82F6]"
                            : ""
                        }
                        hover:shadow-[1px_1px_4px_0px_#0000001A]
                      `}
                    >
                      {/* CARD HEADER */}

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-[17px] sm:text-[18px] text-[#111827] truncate">
                            {leave.employeeName ||
                              "Employee"}
                          </h3>

                          {/* ADMIN ONLY */}

                          {isAdmin &&
                            adminDecision && (
                              <p className="mt-1 text-[11px] text-blue-600 font-medium">
                                First-level
                                decision
                              </p>
                            )}

                          {/* HR FINAL */}
                          
                          {hrDecision && (
                            <p className="mt-1 text-[11px] text-green-700 font-medium">
                              HR final
                              decision
                            </p>
                          )}
                        </div>

                        <StatusPill
                          status={
                            status
                          }
                        />
                      </div>

                      {/* CARD DATA */}

                      <div
                        className="
                          grid
                          grid-cols-2
                          sm:grid-cols-3
                          gap-4
                          mt-5
                        "
                      >
                        <InfoItem
                          label="From Date"
                          value={formatDate(
                            leave.startDate
                          )}
                        />

                        <InfoItem
                          label="End Date"
                          value={formatDate(
                            leave.endDate
                          )}
                        />

                        <InfoItem
                          label="Leave Reason"
                          value={
                            leave.reason ||
                            "-"
                          }
                        />
                      </div>

                      {/* HR REMARK */}

                      {showHrRemark && (
                        <div
                          className="
                            mt-5
                            pt-4
                            border-t
                            border-[#E5E7EB]
                          "
                        >
                          <p className="text-[11px] text-gray-500 mb-1">
                            HR Remark
                          </p>

                          <p className="text-[13px] text-[#111827] leading-5 break-words line-clamp-2">
                            {
                              getRemarkValue(
                                leave
                              )
                            }
                          </p>
                        </div>
                      )}

                      {/* ADMIN ONLY */}

                      {isAdmin &&
                        adminDecision && (
                          <div className="mt-4 rounded-[12px] bg-blue-50 px-3 py-2">
                            <p className="text-[11px] text-blue-700">
                              HR final review
                              available
                            </p>
                          </div>
                        )}

                      {/* HR ONLY */}

                      {isHrAdmin &&
                        !hrDecision &&
                        (
                          isPending(
                            leave
                          ) ||
                          adminDecision
                        ) && (
                          <div className="mt-4 rounded-[12px] bg-green-50 px-3 py-2">
                            <p className="text-[11px] text-green-700">
                              Final HR review
                              available
                            </p>
                          </div>
                        )}
                    </article>
                  );
                }
              )}
            </div>

            {!leaves.length && (
              <div className="bg-white rounded-[24px] p-7 text-center shadow-[1px_1px_4px_0px_#0000001A]">
                <p className="text-sm text-gray-500">
                  No leave requests found.
                </p>
              </div>
            )}
          </section>

          {/* =================================================
              DESKTOP RIGHT SIDEBAR
              
              Responsive:
              - fixed width constraint
              - sticky
              - does not overflow viewport
              - internal scrolling when content is long
              - no forced height
          ================================================= */}

          <aside
            className="
              hidden
              lg:block
              min-w-0
              w-full
              lg:sticky
              lg:top-6
              self-start
            "
          >
            <div
              className="
                w-full
                max-h-[calc(100vh-48px)]
                overflow-y-auto
                overflow-x-hidden
                overscroll-contain
                bg-white
                rounded-[24px]
                p-6
                sm:p-7
                lg:p-8
                shadow-[1px_1px_4px_0px_#0000001A]
                scrollbar-thin
              "
            >
              {selectedLeave ? (
                renderDetailsContent()
              ) : (
                <p className="text-sm text-gray-500">
                  Select a leave request.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ===================================================
          MOBILE DETAILS MODAL
      =================================================== */}

      {mobileModalOpen &&
        selectedLeave && (
          <div
            className="
              fixed
              inset-0
              z-[9999]
              lg:hidden
              flex
              items-end
              sm:items-center
              justify-center
            "
            role="dialog"
            aria-modal="true"
            aria-label="Leave request details"
          >
            {/* BACKDROP */}

            <button
              type="button"
              aria-label="Close details"
              onClick={
                closeMobileModal
              }
              className="
                absolute
                inset-0
                bg-black/40
                backdrop-blur-[2px]
              "
            />

            {/* MODAL */}

            <div
              className="
                relative
                z-10
                w-full
                sm:max-w-[560px]
                max-h-[92vh]
                bg-white
                rounded-t-[28px]
                sm:rounded-[28px]
                shadow-[1px_1px_4px_0px_#0000001A]
                overflow-hidden
                flex
                flex-col
                animate-[ihModalIn_180ms_ease-out]
              "
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* MODAL HEADER */}

              <div
                className="
                  shrink-0
                  px-5
                  sm:px-6
                  py-4
                  border-b
                  border-[#E5E7EB]
                  flex
                  items-center
                  justify-between
                  bg-white
                "
              >
                <div className="min-w-0 pr-4">
                  <p className="text-[11px] text-gray-500">
                    Leave Request
                  </p>

                  <h2 className="text-[18px] font-semibold text-[#111827] truncate mt-0.5">
                    {selectedLeave.employeeName ||
                      "Employee"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    closeMobileModal
                  }
                  disabled={
                    Boolean(
                      actioning
                    )
                  }
                  aria-label="Close"
                  className="
                    w-10
                    h-10
                    shrink-0
                    rounded-full
                    bg-[#F3F4F6]
                    flex
                    items-center
                    justify-center
                    text-[#111827]
                    text-[24px]
                    leading-none
                    hover:bg-[#E5E7EB]
                    transition
                    disabled:opacity-50
                  "
                >
                  ×
                </button>
              </div>

              {/* MODAL BODY */}

              <div
                className="
                  flex-1
                  min-h-0
                  overflow-y-auto
                  overscroll-contain
                  px-5
                  sm:px-6
                  py-6
                "
              >
                {uiError && (
                  <div className="mb-5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                    {uiError}
                  </div>
                )}

                {uiSuccess && (
                  <div className="mb-5 rounded-[14px] border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-700">
                    {uiSuccess}
                  </div>
                )}

                {renderDetailsContent()}
              </div>
            </div>
          </div>
        )}

      {/* ===================================================
          MODAL ANIMATION
      =================================================== */}

      <style>
        {`
          @keyframes ihModalIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (min-width: 640px) {
            @keyframes ihModalIn {
              from {
                opacity: 0;
                transform: scale(0.97);
              }

              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          }

          /* Smooth desktop sidebar scrolling */
          @media (min-width: 1024px) {
            .scrollbar-thin {
              scrollbar-width: thin;
            }
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  title,
  value,
  tone,
}) {
  const valueClass =
    tone === "green"
      ? "text-green-700"
      : tone === "red"
        ? "text-red-600"
        : "text-[#111827]";

  return (
    <div
      className="
        bg-white
        rounded-[24px]
        px-5
        py-5
        sm:px-6
        shadow-[1px_1px_4px_0px_#0000001A]
        min-w-0
      "
    >
      <p
        className="
          text-gray-600
          text-[12px]
          sm:text-sm
          leading-5
          truncate
        "
      >
        {title}
      </p>

      <h3
        className={`
          text-[28px]
          sm:text-[34px]
          font-semibold
          mt-2
          ${valueClass}
        `}
      >
        {value}
      </h3>
    </div>
  );
}

/* =========================================================
   STATUS PILL
========================================================= */

function StatusPill({
  status,
}) {
  const normalized =
    normalizeStatus(status);

  if (
    normalized === "approved"
  ) {
    return (
      <span
        className="
          shrink-0
          px-3
          py-1
          text-[11px]
          sm:text-[12px]
          rounded-full
          bg-green-100
          text-green-700
          font-medium
        "
      >
        Approved
      </span>
    );
  }

  if (
    normalized === "rejected"
  ) {
    return (
      <span
        className="
          shrink-0
          px-3
          py-1
          text-[11px]
          sm:text-[12px]
          rounded-full
          bg-red-100
          text-red-600
          font-medium
        "
      >
        Rejected
      </span>
    );
  }

  return (
    <span
      className="
        shrink-0
        px-3
        py-1
        text-[11px]
        sm:text-[12px]
        rounded-full
        bg-amber-100
        text-amber-700
        font-medium
      "
    >
      Pending
    </span>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] sm:text-[12px] text-gray-500 mb-1">
        {label}
      </p>

      <p className="text-[13px] sm:text-[14px] font-medium text-[#111827] break-words">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   WORKFLOW BOX
========================================================= */

function WorkflowBox({
  tone,
  title,
  desc,
}) {
  const styles = {
    green: {
      wrapper:
        "bg-green-50 border-green-600",
      title:
        "text-green-700",
      icon:
        "bg-green-100 text-green-700",
      symbol: "✓",
    },

    red: {
      wrapper:
        "bg-red-50 border-red-500",
      title:
        "text-red-600",
      icon:
        "bg-red-100 text-red-600",
      symbol: "×",
    },

    orange: {
      wrapper:
        "bg-amber-50 border-amber-500",
      title:
        "text-amber-700",
      icon:
        "bg-amber-100 text-amber-700",
      symbol: "!",
    },

    blue: {
      wrapper:
        "bg-blue-50 border-blue-500",
      title:
        "text-blue-700",
      icon:
        "bg-blue-100 text-blue-700",
      symbol: "i",
    },
  };

  const style =
    styles[tone] ||
    styles.blue;

  return (
    <div
      className={`
        border
        rounded-[20px]
        p-4
        sm:p-5
        ${style.wrapper}
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            w-7
            h-7
            rounded-full
            flex
            items-center
            justify-center
            shrink-0
            text-sm
            font-bold
            ${style.icon}
          `}
        >
          {style.symbol}
        </div>

        <div className="min-w-0">
          <p
            className={`
              text-[14px]
              sm:text-[15px]
              font-semibold
              ${style.title}
            `}
          >
            {title}
          </p>

          <p className="text-[13px] sm:text-sm text-gray-600 mt-1 leading-5">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CheckLeaves;
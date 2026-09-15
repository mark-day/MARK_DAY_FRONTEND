import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  CalendarDays,
  CalendarRange,
  Pencil,
  Trash2,
  Eye,
  X,
  Loader2,
  Mail,
  Phone,
  BriefcaseBusiness,
  UserRound,
  ChevronLeft,
  Save,
  UserCog,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";

const BASE_URL =
  "https://attendance-backend-final-4.onrender.com";

/* =========================================================
   DATE HELPERS
========================================================= */

const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return String(dateString).slice(0, 10) || "—";
  }

  return date.toLocaleDateString("en-GB");
};

const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =========================================================
   ERROR HELPER
========================================================= */

const getApiErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {
  const serverData = error?.response?.data;

  if (typeof serverData === "string") {
    return serverData;
  }

  if (serverData?.error) {
    return serverData.error;
  }

  if (serverData?.message) {
    return serverData.message;
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
};

/* =========================================================
   EMPLOYEE LIST
========================================================= */

const EmployeeList = ({
  employees = [],
  setToggleAddp,
  setSelectedProfileId,
  setToggleProfile,
  handleEdit,
  handleDelete,
  onBack,
  onEmployeesRefresh,
}) => {
  /* =======================================================
     EMPLOYEE STATE
  ======================================================= */

  const [localEmployees, setLocalEmployees] =
    useState(
      Array.isArray(employees)
        ? employees
        : []
    );

  /* =======================================================
     DOWNLOAD STATE
  ======================================================= */

  const [downloadType, setDownloadType] =
    useState("");

  const [date, setDate] = useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [fileFormat, setFileFormat] =
    useState("excel");

  const [downloadOpen, setDownloadOpen] =
    useState(false);

  const [
    downloadingAttendance,
    setDownloadingAttendance,
  ] = useState(false);

  const [
    exportingEmployees,
    setExportingEmployees,
  ] = useState(false);

  /* =======================================================
     EDIT MODAL STATE
  ======================================================= */

  const [editOpen, setEditOpen] =
    useState(false);

  const [editingEmployee, setEditingEmployee] =
    useState(null);

  const [editForm, setEditForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      hireDate: "",
      gender: "",
      dob: "",
      shift: "",
      role: "employee",
    });

  const [savingEdit, setSavingEdit] =
    useState(false);

  /* =======================================================
     DELETE STATE
  ======================================================= */

  const [deletingEmployeeId, setDeletingEmployeeId] =
    useState("");

  /* =======================================================
     SYNC PROPS
  ======================================================= */

  useEffect(() => {
    setLocalEmployees(
      Array.isArray(employees)
        ? employees
        : []
    );
  }, [employees]);

  /* =======================================================
     SAFE EMPLOYEE DATA
  ======================================================= */

  const employeeRows = useMemo(() => {
    return Array.isArray(localEmployees)
      ? localEmployees
      : [];
  }, [localEmployees]);

  /* =======================================================
     EXPORT ALL EMPLOYEES
  ======================================================= */

  const exportToExcel = () => {
    if (!employeeRows.length) {
      alert(
        "No employees available to export."
      );
      return;
    }

    try {
      setExportingEmployees(true);

      const formattedData =
        employeeRows.map((employee) => {
          const profile =
            employee?.profile || {};

          const userAccount =
            profile?.userAccount || {};

          return {
            "Employee ID":
              employee?.empId || "N/A",

            Name:
              employee?.name || "N/A",

            Email:
              employee?.email || "N/A",

            Phone:
              employee?.phone || "N/A",

            "Join Date":
              formatDate(
                employee?.hireDate
              ),

            Salary:
              profile?.slry || "N/A",

            Designation:
              profile?.Des || "N/A",

            "Date of Birth":
              formatDate(
                profile?.DOB ||
                  employee?.dob
              ),

            Gender:
              employee?.gender || "N/A",

            Shift:
              employee?.shift || "N/A",

            Role:
              employee?.role || "N/A",

            Company:
              profile?.Company_Name ||
              "N/A",

            "Bank Name":
              userAccount?.bank_name ||
              "N/A",

            "Account Number":
              userAccount?.account_number ||
              "N/A",

            "IFSC Code":
              userAccount?.Ifsc_code ||
              "N/A",
          };
        });

      const worksheet =
        XLSX.utils.json_to_sheet(
          formattedData
        );

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Employees"
      );

      const excelBuffer =
        XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

      const blob = new Blob(
        [excelBuffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

      saveAs(
        blob,
        "All_Employees.xlsx"
      );
    } catch (error) {
      console.error(
        "Employee export failed:",
        error
      );

      alert(
        "Failed to export employees."
      );
    } finally {
      setExportingEmployees(false);
    }
  };

  /* =======================================================
     ATTENDANCE DOWNLOAD
  ======================================================= */

  const downloadAttendance = async () => {
    if (downloadingAttendance) return;

    try {
      let payload = {
        format: fileFormat,
      };

      if (
        downloadType === "single" &&
        date
      ) {
        payload.date = date;
      } else if (
        downloadType === "range" &&
        fromDate &&
        toDate
      ) {
        if (
          new Date(fromDate) >
          new Date(toDate)
        ) {
          alert(
            "From date cannot be after To date."
          );
          return;
        }

        payload.fromDate = fromDate;
        payload.toDate = toDate;
      } else {
        alert(
          "Please enter valid date(s) before downloading."
        );
        return;
      }

      setDownloadingAttendance(true);

      const res = await axios.post(
        `${BASE_URL}/api/admin/download`,
        payload,
        {
          responseType: "blob",
        }
      );

      const extension =
        fileFormat === "pdf"
          ? "pdf"
          : "xlsx";

      const fileName =
        downloadType === "single"
          ? `attendance_${date}.${extension}`
          : `attendance_${fromDate}_to_${toDate}.${extension}`;

      const blob = new Blob(
        [res.data],
        {
          type:
            fileFormat === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        fileName
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "Attendance download failed:",
        err
      );

      alert(
        "Failed to download attendance. " +
          getApiErrorMessage(
            err,
            "Server error"
          )
      );
    } finally {
      setDownloadingAttendance(false);
    }
  };

  /* =======================================================
     DOWNLOAD TYPE CHANGE
  ======================================================= */

  const handleDownloadTypeChange = (
    type
  ) => {
    setDownloadType(type);

    setDate("");
    setFromDate("");
    setToDate("");
  };

  /* =======================================================
     CLOSE DOWNLOAD PANEL
  ======================================================= */

  const closeDownloadPanel = () => {
    setDownloadOpen(false);
  };

  /* =======================================================
     OPEN PROFILE
  ======================================================= */

  const handleViewProfile = (
    employee
  ) => {
    if (!employee?.empId) return;

    setSelectedProfileId(
      employee.empId
    );

    setToggleProfile(true);
  };

  /* =======================================================
     EMPLOYEE SALARY
  ======================================================= */

  const getSalary = (employee) => {
    const salary =
      employee?.profile?.slry ??
      employee?.salary ??
      "";

    if (
      salary === "" ||
      salary === null
    ) {
      return "—";
    }

    const numericSalary = Number(
      String(salary).replace(
        /[^0-9.-]+/g,
        ""
      )
    );

    if (
      !Number.isNaN(numericSalary)
    ) {
      return `₹${numericSalary.toLocaleString(
        "en-IN"
      )}`;
    }

    return String(salary);
  };

  /* =======================================================
     OPEN EDIT MODAL
  ======================================================= */

  const openEditModal = async (
    employee
  ) => {
    if (
      !employee?.empId ||
      savingEdit
    ) {
      return;
    }

    try {
      /*
        Fetch the latest employee from
        the actual backend before opening
        the edit form.
      */

      const response =
        await axios.get(
          `${BASE_URL}/api/admin/user/${encodeURIComponent(
            employee.empId
          )}`
        );

      const latestEmployee =
        response?.data || employee;

      setEditingEmployee(
        latestEmployee
      );

      setEditForm({
        name:
          latestEmployee?.name || "",

        email:
          latestEmployee?.email || "",

        phone:
          latestEmployee?.phone || "",

        hireDate:
          formatDateForInput(
            latestEmployee?.hireDate
          ),

        gender:
          latestEmployee?.gender || "",

        dob:
          latestEmployee?.dob || "",

        shift:
          latestEmployee?.shift || "",

        role:
          latestEmployee?.role ||
          "employee",
      });

      setEditOpen(true);

      /*
        Keep compatibility with your
        existing parent edit handler.

        If the parent expects handleEdit,
        it will still be called.
      */
      if (typeof handleEdit === "function") {
        try {
          handleEdit(
            employee.empId,
            latestEmployee
          );
        } catch (parentError) {
          console.warn(
            "Existing handleEdit callback failed:",
            parentError
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to fetch employee:",
        error
      );

      /*
        If the detail API fails, still
        allow editing using the employee
        data already loaded in the list.
      */

      setEditingEmployee(
        employee
      );

      setEditForm({
        name:
          employee?.name || "",

        email:
          employee?.email || "",

        phone:
          employee?.phone || "",

        hireDate:
          formatDateForInput(
            employee?.hireDate
          ),

        gender:
          employee?.gender || "",

        dob:
          employee?.dob || "",

        shift:
          employee?.shift || "",

        role:
          employee?.role ||
          "employee",
      });

      setEditOpen(true);
    }
  };

  /* =======================================================
     EDIT INPUT HANDLER
  ======================================================= */

  const handleEditInputChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setEditForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  /* =======================================================
     CLOSE EDIT MODAL
  ======================================================= */

  const closeEditModal = () => {
    if (savingEdit) return;

    setEditOpen(false);
    setEditingEmployee(null);

    setEditForm({
      name: "",
      email: "",
      phone: "",
      hireDate: "",
      gender: "",
      dob: "",
      shift: "",
      role: "employee",
    });
  };

  /* =======================================================
     SAVE EDIT
  ======================================================= */

  const saveEmployeeEdit = async (
    event
  ) => {
    event.preventDefault();

    if (savingEdit) return;

    const empId =
      editingEmployee?.empId;

    if (!empId) {
      alert(
        "Employee ID is missing."
      );
      return;
    }

    /* ---------------------------------
       FRONTEND VALIDATION
    --------------------------------- */

    const name =
      editForm.name.trim();

    const email =
      editForm.email.trim();

    const phone =
      editForm.phone.trim();

    if (!name) {
      alert(
        "Employee name is required."
      );
      return;
    }

    if (!email) {
      alert(
        "Employee email is required."
      );
      return;
    }

    if (!phone) {
      alert(
        "Employee phone is required."
      );
      return;
    }

    if (!editForm.hireDate) {
      alert(
        "Hire date is required."
      );
      return;
    }

    /* ---------------------------------
       PAYLOAD
       
       These fields exist in backend
       User schema and are accepted by
       /api/admin/user/:empId/update
    --------------------------------- */

    const payload = {
      name,
      email,
      phone,
      hireDate:
        editForm.hireDate,

      gender:
        editForm.gender.trim(),

      dob:
        editForm.dob.trim(),

      shift:
        editForm.shift.trim(),

      role:
        editForm.role,
    };

    try {
      setSavingEdit(true);

      const response =
        await axios.put(
          `${BASE_URL}/api/admin/user/${encodeURIComponent(
            empId
          )}/update`,
          payload,
          {
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      const updatedUser =
        response?.data?.user;

      /*
        Update local employee immediately.
        This avoids forcing the user to
        reload the page.
      */

      setLocalEmployees(
        (previousEmployees) =>
          previousEmployees.map(
            (employee) => {
              if (
                String(
                  employee?.empId
                ) !== String(empId)
              ) {
                return employee;
              }

              return {
                ...employee,

                ...(updatedUser ||
                  payload),

                empId:
                  employee.empId,
              };
            }
          )
      );

      alert(
        response?.data?.message ||
          "Employee updated successfully."
      );

      closeEditModal();

      /*
        Optional parent refresh.
        If your parent provides this callback,
        the full employee list can be fetched
        again from the backend.
      */

      if (
        typeof onEmployeesRefresh ===
        "function"
      ) {
        try {
          await onEmployeesRefresh();
        } catch (refreshError) {
          console.warn(
            "Employee refresh failed after update:",
            refreshError
          );
        }
      }
    } catch (error) {
      console.error(
        "Employee update failed:",
        error
      );

      alert(
        getApiErrorMessage(
          error,
          "Failed to update employee."
        )
      );
    } finally {
      setSavingEdit(false);
    }
  };

  /* =======================================================
     DELETE EMPLOYEE
  ======================================================= */

  const deleteEmployeeFromApi = async (
    employee
  ) => {
    const empId =
      employee?.empId;

    if (!empId) {
      alert(
        "Employee ID is missing."
      );
      return;
    }

    if (
      deletingEmployeeId ||
      savingEdit
    ) {
      return;
    }

    const employeeName =
      employee?.name ||
      "this employee";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${employeeName}?\n\nThis will permanently delete the employee account from the attendance system.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingEmployeeId(
        String(empId)
      );

      const response =
        await axios.delete(
          `${BASE_URL}/api/admin/user/${encodeURIComponent(
            empId
          )}/delete`
        );

      /*
        Remove employee immediately
        from local list.
      */

      setLocalEmployees(
        (previousEmployees) =>
          previousEmployees.filter(
            (item) =>
              String(
                item?.empId
              ) !== String(empId)
          )
      );

      alert(
        response?.data?.message ||
          "Employee deleted successfully."
      );

      /*
        Keep old parent callback compatible.
        The old handleDelete may contain
        additional parent logic.
      */

      if (typeof handleDelete === "function") {
        try {
          handleDelete(empId);
        } catch (parentError) {
          console.warn(
            "Existing handleDelete callback failed:",
            parentError
          );
        }
      }

      if (
        typeof onEmployeesRefresh ===
        "function"
      ) {
        try {
          await onEmployeesRefresh();
        } catch (refreshError) {
          console.warn(
            "Employee refresh failed after delete:",
            refreshError
          );
        }
      }
    } catch (error) {
      console.error(
        "Employee delete failed:",
        error
      );

      alert(
        getApiErrorMessage(
          error,
          "Failed to delete employee."
        )
      );
    } finally {
      setDeletingEmployeeId("");
    }
  };

  /* =======================================================
     EMPLOYEE ACTIONS
  ======================================================= */

  const renderEmployeeActions = (
    employee
  ) => {
    const name =
      employee?.name ||
      "employee";

    const employeeId =
      String(
        employee?.empId || ""
      );

    const isDeleting =
      deletingEmployeeId ===
      employeeId;

    return (
      <div className="flex items-center gap-[8px]">
        {/* VIEW */}

        <button
          type="button"
          onClick={() =>
            handleViewProfile(
              employee
            )
          }
          aria-label={`View ${name}`}
          title="View profile"
          className="
            inline-flex
            h-[38px]
            flex-1
            items-center
            justify-center
            gap-[7px]
            rounded-[10px]
            border
            border-[#DCE5ED]
            bg-white
            px-[12px]
            text-[12px]
            font-[500]
            text-[#013C74]
            transition
            hover:border-[#013C74]
            hover:bg-[#F4F8FC]
            active:scale-[0.98]

            sm:h-[36px]
            sm:flex-none
          "
        >
          <Eye
            size={15}
            strokeWidth={1.9}
          />

          <span>
            View
          </span>
        </button>

        {/* EDIT */}

        <button
          type="button"
          aria-label={`Edit ${name}`}
          title="Edit employee"
          onClick={() =>
            openEditModal(
              employee
            )
          }
          disabled={
            savingEdit ||
            Boolean(
              deletingEmployeeId
            )
          }
          className="
            inline-flex
            h-[38px]
            w-[38px]
            shrink-0
            items-center
            justify-center
            rounded-[10px]
            border
            border-[#E2E7EC]
            bg-white
            text-[#202020]
            transition
            hover:border-[#013C74]
            hover:bg-[#F0F5F9]
            hover:text-[#013C74]
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Pencil
            size={16}
            strokeWidth={1.8}
          />
        </button>

        {/* DELETE */}

        <button
          type="button"
          aria-label={`Delete ${name}`}
          title="Delete employee"
          onClick={() =>
            deleteEmployeeFromApi(
              employee
            )
          }
          disabled={
            isDeleting ||
            savingEdit
          }
          className="
            inline-flex
            h-[38px]
            w-[38px]
            shrink-0
            items-center
            justify-center
            rounded-[10px]
            border
            border-[#E8E1E1]
            bg-white
            text-[#202020]
            transition
            hover:border-[#F0CACA]
            hover:bg-[#FFF4F4]
            hover:text-[#DC2626]
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {isDeleting ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Trash2
              size={16}
              strokeWidth={1.8}
            />
          )}
        </button>
      </div>
    );
  };

  /* =======================================================
     EDIT MODAL FIELD
  ======================================================= */

  const renderEditField = ({
    label,
    name,
    type = "text",
    placeholder,
    required = false,
  }) => {
    return (
      <div className="min-w-0">
        <label
          htmlFor={`edit-${name}`}
          className="
            mb-[7px]
            block
            text-[12px]
            font-[500]
            text-[#374151]
          "
        >
          {label}

          {required && (
            <span className="ml-[3px] text-[#DC2626]">
              *
            </span>
          )}
        </label>

        <input
          id={`edit-${name}`}
          name={name}
          type={type}
          value={
            editForm[name] || ""
          }
          onChange={
            handleEditInputChange
          }
          placeholder={placeholder}
          required={required}
          disabled={savingEdit}
          className="
            box-border
            h-[44px]
            w-full
            min-w-0
            rounded-[11px]
            border
            border-[#DCE3E9]
            bg-white
            px-[13px]
            text-[13px]
            text-[#202020]
            outline-none
            transition
            placeholder:text-[#A0A7AE]
            focus:border-[#013C74]
            focus:ring-2
            focus:ring-[#013C74]/10
            disabled:cursor-not-allowed
            disabled:bg-[#F7F8F9]
          "
        />
      </div>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        w-full
        min-w-0
        pb-[30px]

        sm:pb-[50px]

        lg:pb-[80px]
      "
    >
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div
        className="
          flex
          w-full
          items-start
          gap-[12px]

          sm:gap-[20px]

          lg:gap-[24px]
        "
      >
        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={onBack}
          aria-label="Back to dashboard"
          className="
            mt-[1px]
            flex
            h-[50px]
            w-[50px]
            shrink-0
            items-center
            justify-center
            rounded-[16px]
            border
            border-[#E5E7EB]
            bg-white
            text-[#151515]
            shadow-[1px_0.5px_1px_0px_#0000001A]
            transition
            duration-200
          "
        >
          <ChevronLeft
            className="
              h-[24px]
              w-[24px]

              sm:h-[26px]
              sm:w-[26px]
            "
          />
        </button>

        {/* TITLE */}

        <div className="min-w-0 flex-1">
          <h1
            className="
              m-0
              text-[24px]
              font-[600]
              leading-[29px]
              tracking-[-0.035em]
              text-[#202020]

              min-[390px]:text-[26px]

              sm:text-[30px]
              sm:leading-[36px]

              lg:text-[36px]
              lg:leading-[43px]
            "
          >
            Employee Management
          </h1>

          <p
            className="
              m-0
              mt-[3px]
              max-w-[100%]
              text-[13px]
              font-[400]
              leading-[19px]
              text-[#606060]

              sm:mt-[4px]
              sm:text-[15px]
              sm:leading-[22px]

              lg:text-[16px]
              lg:leading-[24px]
            "
          >
            View and manage employee information
          </p>
        </div>
      </div>

      {/* =================================================
          ATTENDANCE DOWNLOAD PANEL
      ================================================= */}

      {downloadOpen && (
        <div
          className="
            relative
            mt-[14px]
            w-full
            overflow-hidden
            rounded-[18px]
            border
            border-[#E2E8F0]
            bg-white
            p-[14px]
            shadow-[0px_6px_20px_rgba(16,24,40,0.07)]

            sm:mt-[16px]
            sm:rounded-[20px]
            sm:p-[20px]

            lg:p-[22px]
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-[12px]
            "
          >
            <div className="min-w-0">
              <h3
                className="
                  m-0
                  text-[15px]
                  font-[600]
                  text-[#202020]

                  sm:text-[16px]
                "
              >
                Download Attendance
              </h3>

              <p
                className="
                  m-0
                  mt-[3px]
                  text-[11px]
                  leading-[17px]
                  text-[#707070]

                  sm:text-[12px]
                "
              >
                Choose a date or date range
              </p>
            </div>

            <button
              type="button"
              onClick={
                closeDownloadPanel
              }
              aria-label="Close attendance download"
              className="
                flex
                h-[32px]
                w-[32px]
                shrink-0
                items-center
                justify-center
                rounded-[9px]
                text-[#666]
                transition
                hover:bg-[#F2F4F7]
              "
            >
              <X size={17} />
            </button>
          </div>

          <div
            className="
              mt-[15px]
              grid
              grid-cols-2
              gap-[8px]

              sm:flex
              sm:flex-wrap
              sm:gap-[10px]
            "
          >
            <button
              type="button"
              onClick={() =>
                handleDownloadTypeChange(
                  "single"
                )
              }
              className={`
                inline-flex
                h-[40px]
                items-center
                justify-center
                gap-[6px]
                rounded-[10px]
                border
                px-[8px]
                text-[12px]
                font-[500]
                transition

                sm:justify-start
                sm:gap-[8px]
                sm:px-[13px]
                sm:text-[13px]

                ${
                  downloadType === "single"
                    ? "border-[#013C74] bg-[#F0F6FC] text-[#013C74]"
                    : "border-[#E0E5EA] bg-white text-[#555]"
                }
              `}
            >
              <CalendarDays size={15} />

              <span>
                Single Date
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleDownloadTypeChange(
                  "range"
                )
              }
              className={`
                inline-flex
                h-[40px]
                items-center
                justify-center
                gap-[6px]
                rounded-[10px]
                border
                px-[8px]
                text-[12px]
                font-[500]
                transition

                sm:justify-start
                sm:gap-[8px]
                sm:px-[13px]
                sm:text-[13px]

                ${
                  downloadType === "range"
                    ? "border-[#013C74] bg-[#F0F6FC] text-[#013C74]"
                    : "border-[#E0E5EA] bg-white text-[#555]"
                }
              `}
            >
              <CalendarRange size={15} />

              <span>
                Date Range
              </span>
            </button>
          </div>

          {downloadType ===
            "single" && (
            <div className="mt-[15px] w-full sm:max-w-[260px]">
              <label
                className="
                  mb-[6px]
                  block
                  text-[11px]
                  font-[500]
                  text-[#4B5563]

                  sm:text-[12px]
                "
              >
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
                className="
                  box-border
                  h-[42px]
                  w-full
                  min-w-0
                  rounded-[10px]
                  border
                  border-[#D9E0E7]
                  bg-white
                  px-[11px]
                  text-[12px]
                  text-[#303030]
                  outline-none
                  transition
                  focus:border-[#013C74]
                  focus:ring-2
                  focus:ring-[#013C74]/10

                  sm:text-[13px]
                "
              />
            </div>
          )}

          {downloadType ===
            "range" && (
            <div
              className="
                mt-[15px]
                grid
                grid-cols-1
                gap-[11px]

                sm:grid-cols-2
                sm:max-w-[550px]
                sm:gap-[12px]
              "
            >
              <div className="min-w-0">
                <label
                  className="
                    mb-[6px]
                    block
                    text-[11px]
                    font-[500]
                    text-[#4B5563]

                    sm:text-[12px]
                  "
                >
                  From
                </label>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) =>
                    setFromDate(
                      event.target.value
                    )
                  }
                  className="
                    box-border
                    h-[42px]
                    w-full
                    min-w-0
                    rounded-[10px]
                    border
                    border-[#D9E0E7]
                    bg-white
                    px-[11px]
                    text-[12px]
                    text-[#303030]
                    outline-none
                    transition
                    focus:border-[#013C74]
                    focus:ring-2
                    focus:ring-[#013C74]/10

                    sm:text-[13px]
                  "
                />
              </div>

              <div className="min-w-0">
                <label
                  className="
                    mb-[6px]
                    block
                    text-[11px]
                    font-[500]
                    text-[#4B5563]

                    sm:text-[12px]
                  "
                >
                  To
                </label>

                <input
                  type="date"
                  value={toDate}
                  onChange={(event) =>
                    setToDate(
                      event.target.value
                    )
                  }
                  className="
                    box-border
                    h-[42px]
                    w-full
                    min-w-0
                    rounded-[10px]
                    border
                    border-[#D9E0E7]
                    bg-white
                    px-[11px]
                    text-[12px]
                    text-[#303030]
                    outline-none
                    transition
                    focus:border-[#013C74]
                    focus:ring-2
                    focus:ring-[#013C74]/10

                    sm:text-[13px]
                  "
                />
              </div>
            </div>
          )}

          {downloadType && (
            <div
              className="
                mt-[15px]
                flex
                w-full
                flex-col
                gap-[10px]

                sm:flex-row
                sm:items-end
              "
            >
              <div className="w-full sm:max-w-[220px]">
                <label
                  className="
                    mb-[6px]
                    block
                    text-[11px]
                    font-[500]
                    text-[#4B5563]

                    sm:text-[12px]
                  "
                >
                  File Format
                </label>

                <select
                  value={fileFormat}
                  onChange={(event) =>
                    setFileFormat(
                      event.target.value
                    )
                  }
                  className="
                    box-border
                    h-[42px]
                    w-full
                    rounded-[10px]
                    border
                    border-[#D9E0E7]
                    bg-white
                    px-[11px]
                    text-[12px]
                    text-[#303030]
                    outline-none
                    focus:border-[#013C74]

                    sm:text-[13px]
                  "
                >
                  <option value="excel">
                    Excel (.xlsx)
                  </option>
                </select>
              </div>

              <button
                type="button"
                onClick={
                  downloadAttendance
                }
                disabled={
                  downloadingAttendance
                }
                className="
                  inline-flex
                  h-[42px]
                  w-full
                  items-center
                  justify-center
                  gap-[8px]
                  rounded-[10px]
                  bg-[#013C74]
                  px-[16px]
                  text-[12px]
                  font-[500]
                  text-white
                  transition
                  hover:bg-[#02345F]
                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  sm:w-auto
                  sm:text-[13px]
                "
              >
                {downloadingAttendance ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Download size={16} />
                )}

                <span>
                  {downloadingAttendance
                    ? "Downloading..."
                    : "Download Attendance"}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* =================================================
          DESKTOP EMPLOYEE TABLE
      ================================================= */}

      <div
        className="
          mt-[20px]
          hidden
          w-full
          overflow-hidden
          rounded-[24px]
          border
          border-[#E5E9ED]
          bg-white
          shadow-[0px_1px_3px_rgba(16,24,40,0.05)]

          sm:mt-[24px]

          md:block

          lg:mt-[28px]
          lg:rounded-[30px]
        "
      >
        <div
          className="
            w-full
            overflow-x-auto
            overscroll-x-contain
          "
        >
          <table
            className="
              w-full
              min-w-[1000px]
              border-collapse
            "
          >
            <thead>
              <tr
                className="
                  h-[60px]
                  bg-[#E9F0F6]
                "
              >
                <th
                  className="
                    whitespace-nowrap
                    px-[28px]
                    text-left
                    text-[14px]
                    font-[600]
                    text-[#171717]
                  "
                >
                  Employee ID
                </th>

                <th
                  className="
                    whitespace-nowrap
                    px-[24px]
                    text-left
                    text-[14px]
                    font-[600]
                    text-[#171717]
                  "
                >
                  Employee Name
                </th>

                <th
                  className="
                    whitespace-nowrap
                    px-[24px]
                    text-left
                    text-[14px]
                    font-[600]
                    text-[#171717]
                  "
                >
                  Email
                </th>

                <th
                  className="
                    whitespace-nowrap
                    px-[24px]
                    text-left
                    text-[14px]
                    font-[600]
                    text-[#171717]
                  "
                >
                  Phone
                </th>

                <th
                  className="
                    whitespace-nowrap
                    px-[24px]
                    text-left
                    text-[14px]
                    font-[600]
                    text-[#171717]
                  "
                >
                  Join Date
                </th>

                <th
                  className="
                    whitespace-nowrap
                    px-[24px]
                    text-center
                    text-[14px]
                    font-[600]
                    text-[#171717]
                  "
                >
                  Action
                </th>

                <th
                  className="
                    whitespace-nowrap
                    px-[28px]
                    text-center
                    text-[14px]
                    font-[600]
                    text-[#171717]
                  "
                >
                  Edit Detail
                </th>
              </tr>
            </thead>

            <tbody>
              {employeeRows.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="
                      h-[180px]
                      px-[24px]
                      text-center
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col
                        items-center
                        justify-center
                      "
                    >
                      <div
                        className="
                          flex
                          h-[48px]
                          w-[48px]
                          items-center
                          justify-center
                          rounded-[14px]
                          bg-[#F1F5F9]
                          text-[#64748B]
                        "
                      >
                        <Eye size={21} />
                      </div>

                      <p
                        className="
                          mt-[12px]
                          text-[14px]
                          font-[500]
                          text-[#333]
                        "
                      >
                        No employees found
                      </p>

                      <p
                        className="
                          mt-[3px]
                          text-[12px]
                          text-[#777]
                        "
                      >
                        Employee records
                        will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                employeeRows.map(
                  (
                    employee,
                    index
                  ) => {
                    const employeeId =
                      employee?.empId ||
                      "—";

                    const name =
                      employee?.name ||
                      "—";

                    const email =
                      employee?.email ||
                      "—";

                    const phone =
                      employee?.phone ||
                      "—";

                    const joinDate =
                      formatDate(
                        employee?.hireDate
                      );

                    return (
                      <tr
                        key={
                          employeeId !==
                          "—"
                            ? employeeId
                            : `employee-${index}`
                        }
                        className="
                          h-[56px]
                          border-t
                          border-[#E2E2E2]
                          bg-white
                          transition
                          hover:bg-[#FAFCFE]
                        "
                      >
                        <td
                          className="
                            whitespace-nowrap
                            px-[28px]
                            text-left
                            text-[14px]
                            font-[400]
                            text-[#181818]
                          "
                        >
                          {employeeId}
                        </td>

                        <td
                          className="
                            max-w-[220px]
                            whitespace-nowrap
                            px-[24px]
                            text-left
                            text-[14px]
                            font-[500]
                            text-[#181818]
                          "
                        >
                          <span className="block truncate">
                            {name}
                          </span>
                        </td>

                        <td
                          className="
                            max-w-[250px]
                            whitespace-nowrap
                            px-[24px]
                            text-left
                            text-[14px]
                            font-[400]
                            text-[#181818]
                          "
                        >
                          <span className="block truncate">
                            {email}
                          </span>
                        </td>

                        <td
                          className="
                            whitespace-nowrap
                            px-[24px]
                            text-left
                            text-[14px]
                            font-[400]
                            text-[#181818]
                          "
                        >
                          {phone}
                        </td>

                        <td
                          className="
                            whitespace-nowrap
                            px-[24px]
                            text-left
                            text-[14px]
                            font-[400]
                            text-[#181818]
                          "
                        >
                          {joinDate}
                        </td>

                        <td
                          className="
                            whitespace-nowrap
                            px-[24px]
                            text-center
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleViewProfile(
                                employee
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              justify-center
                              text-[14px]
                              font-[500]
                              text-[#013C74]
                              transition
                              hover:text-[#022D55]
                            "
                          >
                            View
                          </button>
                        </td>

                        <td
                          className="
                            whitespace-nowrap
                            px-[20px]
                            text-center
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              justify-center
                              gap-[18px]
                            "
                          >
                            <button
                              type="button"
                              aria-label={`Edit ${name}`}
                              title="Edit employee"
                              onClick={() =>
                                openEditModal(
                                  employee
                                )
                              }
                              className="
                                inline-flex
                                h-[32px]
                                w-[32px]
                                items-center
                                justify-center
                                rounded-[8px]
                                text-[#202020]
                                transition
                                hover:bg-[#F0F4F8]
                                hover:text-[#013C74]
                              "
                            >
                              <Pencil
                                size={17}
                                strokeWidth={1.8}
                              />
                            </button>

                            <button
                              type="button"
                              aria-label={`Delete ${name}`}
                              title="Delete employee"
                              onClick={() =>
                                deleteEmployeeFromApi(
                                  employee
                                )
                              }
                              disabled={
                                deletingEmployeeId ===
                                String(
                                  employee?.empId ||
                                    ""
                                )
                              }
                              className="
                                inline-flex
                                h-[32px]
                                w-[32px]
                                items-center
                                justify-center
                                rounded-[8px]
                                text-[#202020]
                                transition
                                hover:bg-[#FFF1F1]
                                hover:text-[#DC2626]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              {deletingEmployeeId ===
                              String(
                                employee?.empId ||
                                  ""
                              ) ? (
                                <Loader2
                                  size={17}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={17}
                                  strokeWidth={1.8}
                                />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================
          MOBILE EMPLOYEE CARDS
      ================================================= */}

      <div
        className="
          mt-[18px]
          block
          w-full
          md:hidden
        "
      >
        {employeeRows.length ===
        0 ? (
          <div
            className="
              flex
              min-h-[220px]
              w-full
              flex-col
              items-center
              justify-center
              rounded-[22px]
              border
              border-[#E5E9ED]
              bg-white
              px-[20px]
              text-center
              shadow-[0px_1px_3px_rgba(16,24,40,0.05)]
            "
          >
            <div
              className="
                flex
                h-[52px]
                w-[52px]
                items-center
                justify-center
                rounded-[15px]
                bg-[#F1F5F9]
                text-[#64748B]
              "
            >
              <UserRound size={22} />
            </div>

            <p
              className="
                mt-[12px]
                text-[14px]
                font-[600]
                text-[#333]
              "
            >
              No employees found
            </p>

            <p
              className="
                mt-[4px]
                text-[12px]
                leading-[18px]
                text-[#777]
              "
            >
              Employee records will
              appear here.
            </p>
          </div>
        ) : (
          <div
            className="
              flex
              w-full
              flex-col
              gap-[12px]
              px-[16px]
            "
          >
            {employeeRows.map(
              (
                employee,
                index
              ) => {
                const employeeId =
                  employee?.empId ||
                  "—";

                const name =
                  employee?.name ||
                  "—";

                const email =
                  employee?.email ||
                  "—";

                const phone =
                  employee?.phone ||
                  "—";

                const joinDate =
                  formatDate(
                    employee?.hireDate
                  );

                const salary =
                  getSalary(employee);

                const isDeleting =
                  deletingEmployeeId ===
                  String(
                    employee?.empId ||
                      ""
                  );

                return (
                  <article
                    key={
                      employeeId !==
                      "—"
                        ? employeeId
                        : `mobile-employee-${index}`
                    }
                    className="
                      box-border
                      w-full
                      min-w-0
                      overflow-hidden
                      rounded-[20px]
                      border
                      border-[#E5E9ED]
                      bg-white
                      p-[14px]
                      shadow-[0px_1px_4px_rgba(16,24,40,0.05)]
                    "
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        justify-between
                        gap-[10px]
                      "
                    >
                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-[10px]
                        "
                      >
                        <div
                          className="
                            flex
                            h-[42px]
                            w-[42px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-[12px]
                            bg-[#EAF2F8]
                            text-[14px]
                            font-[600]
                            text-[#013C74]
                          "
                        >
                          {name !==
                          "—"
                            ? name
                                .charAt(
                                  0
                                )
                                .toUpperCase()
                            : "?"}
                        </div>

                        <div className="min-w-0">
                          <h3
                            className="
                              m-0
                              truncate
                              text-[14px]
                              font-[600]
                              leading-[20px]
                              text-[#202020]
                            "
                          >
                            {name}
                          </h3>

                          <p
                            className="
                              m-0
                              mt-[1px]
                              truncate
                              text-[11px]
                              leading-[16px]
                              text-[#777]
                            "
                          >
                            Employee ID:{" "}
                            {employeeId}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleViewProfile(
                            employee
                          )
                        }
                        aria-label={`View ${name}`}
                        className="
                          inline-flex
                          h-[34px]
                          w-[34px]
                          shrink-0
                          items-center
                          justify-center
                          rounded-[9px]
                          bg-[#F0F6FC]
                          text-[#013C74]
                          transition
                          hover:bg-[#E3EFF8]
                          active:scale-[0.97]
                        "
                      >
                        <Eye
                          size={17}
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>

                    <div
                      className="
                        my-[13px]
                        h-px
                        w-full
                        bg-[#EDF0F2]
                      "
                    />

                    <div
                      className="
                        grid
                        w-full
                        min-w-0
                        grid-cols-1
                        gap-[10px]
                      "
                    >
                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-[9px]
                        "
                      >
                        <div
                          className="
                            flex
                            h-[30px]
                            w-[30px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-[8px]
                            bg-[#F5F7F9]
                            text-[#687684]
                          "
                        >
                          <Mail size={14} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="
                              m-0
                              text-[10px]
                              font-[400]
                              text-[#8A8A8A]
                            "
                          >
                            Email
                          </p>

                          <p
                            className="
                              m-0
                              truncate
                              text-[12px]
                              font-[500]
                              text-[#242424]
                            "
                            title={email}
                          >
                            {email}
                          </p>
                        </div>
                      </div>

                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-[9px]
                        "
                      >
                        <div
                          className="
                            flex
                            h-[30px]
                            w-[30px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-[8px]
                            bg-[#F5F7F9]
                            text-[#687684]
                          "
                        >
                          <Phone size={14} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="
                              m-0
                              text-[10px]
                              font-[400]
                              text-[#8A8A8A]
                            "
                          >
                            Phone
                          </p>

                          <p
                            className="
                              m-0
                              truncate
                              text-[12px]
                              font-[500]
                              text-[#242424]
                            "
                          >
                            {phone}
                          </p>
                        </div>
                      </div>

                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-[9px]
                        "
                      >
                        <div
                          className="
                            flex
                            h-[30px]
                            w-[30px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-[8px]
                            bg-[#F5F7F9]
                            text-[#687684]
                          "
                        >
                          <CalendarDays size={14} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="
                              m-0
                              text-[10px]
                              font-[400]
                              text-[#8A8A8A]
                            "
                          >
                            Join Date
                          </p>

                          <p
                            className="
                              m-0
                              text-[12px]
                              font-[500]
                              text-[#242424]
                            "
                          >
                            {joinDate}
                          </p>
                        </div>
                      </div>

                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-[9px]
                        "
                      >
                        <div
                          className="
                            flex
                            h-[30px]
                            w-[30px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-[8px]
                            bg-[#F5F7F9]
                            text-[#687684]
                          "
                        >
                          <BriefcaseBusiness size={14} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="
                              m-0
                              text-[10px]
                              font-[400]
                              text-[#8A8A8A]
                            "
                          >
                            Salary
                          </p>

                          <p
                            className="
                              m-0
                              text-[12px]
                              font-[600]
                              text-[#242424]
                            "
                          >
                            {salary}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="
                        mt-[14px]
                        flex
                        w-full
                        items-center
                        gap-[8px]
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(
                            employee
                          )
                        }
                        disabled={
                          isDeleting ||
                          savingEdit
                        }
                        className="
                          inline-flex
                          h-[38px]
                          flex-1
                          items-center
                          justify-center
                          gap-[7px]
                          rounded-[10px]
                          border
                          border-[#DCE5ED]
                          bg-white
                          text-[12px]
                          font-[500]
                          text-[#013C74]
                          transition
                          hover:border-[#013C74]
                          hover:bg-[#F4F8FC]
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <Pencil
                          size={15}
                        />

                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteEmployeeFromApi(
                            employee
                          )
                        }
                        disabled={
                          isDeleting ||
                          savingEdit
                        }
                        className="
                          inline-flex
                          h-[38px]
                          w-[38px]
                          shrink-0
                          items-center
                          justify-center
                          rounded-[10px]
                          border
                          border-[#E8E1E1]
                          bg-white
                          text-[#202020]
                          transition
                          hover:border-[#F0CACA]
                          hover:bg-[#FFF4F4]
                          hover:text-[#DC2626]
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {isDeleting ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2
                            size={16}
                          />
                        )}
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* =================================================
          EDIT EMPLOYEE MODAL
      ================================================= */}

      {editOpen && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/40
            px-[14px]
            py-[20px]
            backdrop-blur-[2px]

            sm:px-[24px]
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeEditModal();
            }
          }}
        >
          <div
            className="
              flex
              max-h-[calc(100vh-40px)]
              w-full
              max-w-[720px]
              flex-col
              overflow-hidden
              rounded-[22px]
              bg-white
              shadow-[0px_20px_60px_rgba(0,0,0,0.18)]

              sm:max-h-[calc(100vh-60px)]
              sm:rounded-[26px]
            "
          >
            {/* MODAL HEADER */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-between
                border-b
                border-[#E9EDF1]
                px-[18px]
                py-[16px]

                sm:px-[24px]
                sm:py-[19px]
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-[11px]
                "
              >
                <div
                  className="
                    flex
                    h-[40px]
                    w-[40px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-[11px]
                    bg-[#EAF2F8]
                    text-[#013C74]
                  "
                >
                  <UserCog
                    size={19}
                  />
                </div>

                <div className="min-w-0">
                  <h2
                    className="
                      m-0
                      truncate
                      text-[17px]
                      font-[600]
                      leading-[22px]
                      text-[#202020]

                      sm:text-[19px]
                    "
                  >
                    Edit Employee
                  </h2>

                  <p
                    className="
                      m-0
                      mt-[2px]
                      truncate
                      text-[11px]
                      text-[#777]

                      sm:text-[12px]
                    "
                  >
                    Employee ID:{" "}
                    {editingEmployee?.empId ||
                      "—"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  closeEditModal
                }
                disabled={savingEdit}
                aria-label="Close edit employee"
                className="
                  flex
                  h-[36px]
                  w-[36px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[9px]
                  text-[#666]
                  transition
                  hover:bg-[#F3F5F7]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <X size={19} />
              </button>
            </div>

            {/* MODAL BODY */}

            <form
              onSubmit={
                saveEmployeeEdit
              }
              className="
                min-h-0
                flex-1
                overflow-y-auto
                px-[18px]
                py-[18px]

                sm:px-[24px]
                sm:py-[22px]
              "
            >
              {/* EMPLOYEE ID */}

              <div
                className="
                  mb-[17px]
                  rounded-[11px]
                  border
                  border-[#E4EAF0]
                  bg-[#F7F9FB]
                  px-[13px]
                  py-[11px]
                "
              >
                <p
                  className="
                    m-0
                    text-[10px]
                    font-[500]
                    uppercase
                    tracking-[0.04em]
                    text-[#8A929B]
                  "
                >
                  Employee ID
                </p>

                <p
                  className="
                    m-0
                    mt-[2px]
                    text-[13px]
                    font-[600]
                    text-[#013C74]
                  "
                >
                  {editingEmployee?.empId ||
                    "—"}
                </p>

                <p
                  className="
                    m-0
                    mt-[2px]
                    text-[10px]
                    text-[#8A8A8A]
                  "
                >
                  Employee ID cannot be
                  changed.
                </p>
              </div>

              {/* BASIC INFORMATION */}

              <div
                className="
                  grid
                  grid-cols-1
                  gap-[14px]

                  sm:grid-cols-2
                  sm:gap-[16px]
                "
              >
                {renderEditField({
                  label: "Full Name",
                  name: "name",
                  placeholder:
                    "Enter employee name",
                  required: true,
                })}

                {renderEditField({
                  label: "Email",
                  name: "email",
                  type: "email",
                  placeholder:
                    "Enter email address",
                  required: true,
                })}

                {renderEditField({
                  label: "Phone",
                  name: "phone",
                  type: "tel",
                  placeholder:
                    "Enter phone number",
                  required: true,
                })}

                {renderEditField({
                  label: "Hire Date",
                  name: "hireDate",
                  type: "date",
                  required: true,
                })}

                {renderEditField({
                  label: "Date of Birth",
                  name: "dob",
                  type: "date",
                  placeholder:
                    "Select date of birth",
                })}

                {renderEditField({
                  label: "Shift",
                  name: "shift",
                  placeholder:
                    "e.g. Morning",
                })}

                {/* GENDER */}

                <div className="min-w-0">
                  <label
                    htmlFor="edit-gender"
                    className="
                      mb-[7px]
                      block
                      text-[12px]
                      font-[500]
                      text-[#374151]
                    "
                  >
                    Gender
                  </label>

                  <select
                    id="edit-gender"
                    name="gender"
                    value={
                      editForm.gender
                    }
                    onChange={
                      handleEditInputChange
                    }
                    disabled={savingEdit}
                    className="
                      box-border
                      h-[44px]
                      w-full
                      min-w-0
                      rounded-[11px]
                      border
                      border-[#DCE3E9]
                      bg-white
                      px-[13px]
                      text-[13px]
                      text-[#202020]
                      outline-none
                      transition
                      focus:border-[#013C74]
                      focus:ring-2
                      focus:ring-[#013C74]/10
                      disabled:cursor-not-allowed
                      disabled:bg-[#F7F8F9]
                    "
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="male">
                      Male
                    </option>

                    <option value="female">
                      Female
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                {/* ROLE */}

                <div className="min-w-0">
                  <label
                    htmlFor="edit-role"
                    className="
                      mb-[7px]
                      block
                      text-[12px]
                      font-[500]
                      text-[#374151]
                    "
                  >
                    Role
                  </label>

                  <select
                    id="edit-role"
                    name="role"
                    value={
                      editForm.role
                    }
                    onChange={
                      handleEditInputChange
                    }
                    disabled={savingEdit}
                    className="
                      box-border
                      h-[44px]
                      w-full
                      min-w-0
                      rounded-[11px]
                      border
                      border-[#DCE3E9]
                      bg-white
                      px-[13px]
                      text-[13px]
                      text-[#202020]
                      outline-none
                      transition
                      focus:border-[#013C74]
                      focus:ring-2
                      focus:ring-[#013C74]/10
                      disabled:cursor-not-allowed
                      disabled:bg-[#F7F8F9]
                    "
                  >
                    <option value="employee">
                      Employee
                    </option>

                    <option value="manager">
                      Manager
                    </option>

                    <option value="admin">
                      Admin
                    </option>
                  </select>
                </div>
              </div>

              {/* NOTE */}

              <div
                className="
                  mt-[18px]
                  rounded-[11px]
                  border
                  border-[#E3EAF1]
                  bg-[#F7FAFC]
                  px-[13px]
                  py-[11px]
                "
              >
                <p
                  className="
                    m-0
                    text-[11px]
                    leading-[17px]
                    text-[#687684]
                  "
                >
                  Password, employee ID,
                  and profile photo are
                  not changed from this
                  form.
                </p>
              </div>

              {/* MODAL ACTIONS */}

              <div
                className="
                  mt-[22px]
                  flex
                  flex-col-reverse
                  gap-[9px]

                  sm:flex-row
                  sm:justify-end
                "
              >
                <button
                  type="button"
                  onClick={
                    closeEditModal
                  }
                  disabled={savingEdit}
                  className="
                    inline-flex
                    h-[44px]
                    w-full
                    items-center
                    justify-center
                    rounded-[11px]
                    border
                    border-[#DCE3E9]
                    bg-white
                    px-[18px]
                    text-[13px]
                    font-[500]
                    text-[#444]
                    transition
                    hover:bg-[#F7F8F9]
                    disabled:cursor-not-allowed
                    disabled:opacity-50

                    sm:w-auto
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="
                    inline-flex
                    h-[44px]
                    w-full
                    items-center
                    justify-center
                    gap-[8px]
                    rounded-[11px]
                    bg-[#013C74]
                    px-[20px]
                    text-[13px]
                    font-[500]
                    text-white
                    transition
                    hover:bg-[#02345F]
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-60

                    sm:w-auto
                  "
                >
                  {savingEdit ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save
                        size={16}
                      />

                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
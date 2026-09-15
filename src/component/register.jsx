"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiUpload,
} from "react-icons/fi";

const BASE_URL = "https://attendance-backend-final-4.onrender.com";
const AUTH_API = `${BASE_URL}/api/auth`;

const initialForm = {
  name: "",
  phone: "",
  email: "",
  gender: "",
  hireDate: "",
  aadhaarNumber: "",
  panNumber: "",
  accountNumber: "",
  ifscCode: "",
  password: "",
  confirmPassword: "",
  photo: "",
  photoName: "",
};

function RegisterUser({
  onBack,
  companyName = "Athratech Pvt Limited",
  adminName = "Gustavo Xavier",
  adminRole = "User",
  adminImage = "",
  onProfileAction,
  onLogout,
}) {
  const [token, setToken] = useState("");
  const [form, setForm] = useState(initialForm);
  const [generatedEmpId, setGeneratedEmpId] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token") || "");
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const adminInitials = useMemo(() => {
    return String(adminName)
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [adminName]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const convertFileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });

  const handlePhotoPick = async (file) => {
    if (!file) return;

    setError("");
    setSuccessMsg("");

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    const maxSizeMB = 2;

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, and WEBP images are allowed.");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Photo too large. Max ${maxSizeMB}MB allowed.`);
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      setForm((prev) => ({
        ...prev,
        photo: base64,
        photoName: file.name,
      }));
    } catch {
      setError("Failed to read image file.");
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    await handlePhotoPick(file);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    await handlePhotoPick(file);
  };

  const validateForm = () => {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      gender: form.gender.trim(),
      hireDate: form.hireDate,
      password: form.password,
      photo: form.photo,
    };

    if (!token) {
      return "Token missing. Please login as HR Admin first.";
    }

    if (
      !payload.name ||
      !payload.email ||
      !payload.phone ||
      !payload.hireDate ||
      !payload.password ||
      !payload.photo
    ) {
      return "Please fill all required fields (including photo).";
    }

    if (form.password !== form.confirmPassword) {
      return "Password and Confirm Password do not match.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMsg("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      gender: form.gender.trim(),
      hireDate: form.hireDate,
      password: form.password,
      photo: form.photo,
      aadhaarNumber: form.aadhaarNumber.trim(),
      panNumber: form.panNumber.trim(),
      accountNumber: form.accountNumber.trim(),
      ifscCode: form.ifscCode.trim(),
    };

    try {
      setLoading(true);

      const response = await axios.post(`${AUTH_API}/register-form`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const createdEmpId = response?.data?.empId || "";
      setGeneratedEmpId(createdEmpId);
      setSuccessMsg(
        createdEmpId
          ? `Registered successfully. Employee ID: ${createdEmpId}`
          : "Registered successfully."
      );
      setForm(initialForm);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";
      setError(message);
      console.error("REGISTER ERROR:", {
        status: err?.response?.status,
        data: err?.response?.data,
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#F3F5F7] px-[16px] pb-[40px]  sm:px-[20px] md:px-[24px] lg:px-[28px]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="flex items-start gap-[24px]">
          <button
            type="button"

            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                navigate(-1);
              }
            }}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[16px] border border-[#E7EBF0] bg-[#FFFFFF] text-[#111111] shadow-[0px_2px_8px_rgba(16,24,40,0.04)]"
          >
            <FiChevronLeft className="h-[24px] w-[24px]" />
          </button>

          <div className="pt-[1px]">
            <h1 className="text-[28px] font-[700] leading-[34px] tracking-[-0.03em] text-[#222222] sm:text-[34px] sm:leading-[41px]">
              Register New Employee
            </h1>
            <p className="mt-[3px] text-[14px] font-[400] leading-[20px] text-[#616161] sm:text-[16px] sm:leading-[24px]">
              Add new member to the organization
            </p>
          </div>
        </div>

        <div className="mt-[30px] rounded-[32px] border border-[#E8ECF1] bg-[#FFFFFF] px-[18px] pb-[26px] pt-[20px] shadow-[0px_2px_8px_rgba(16,24,40,0.04)] sm:px-[28px] sm:pb-[28px] sm:pt-[22px]">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-x-[28px] gap-y-[18px] md:grid-cols-2 md:gap-y-[20px]"
          >
            <TextField
              label="Employee Name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              autoComplete="off"
            />

            <TextField
              label="Phone Number"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              autoComplete="off"
            />

            <TextField
              label="Email"
            type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              autoComplete="off"
            />

            <SelectField
              label="Gender"
              value={form.gender}
              onChange={(e) => setField("gender", e.target.value)}
              options={[
                { label: "Select Gender", value: "" },
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
            />

            <DateField
              label="Joining Date"
              value={form.hireDate}
              onChange={(e) => setField("hireDate", e.target.value)}
            />

            <TextField
              label="Aadhar Card Number"
              value={form.aadhaarNumber}
              onChange={(e) => setField("aadhaarNumber", e.target.value)}
              autoComplete="off"
            />

            <TextField
              label="Pan Card Number"
              value={form.panNumber}
              onChange={(e) => setField("panNumber", e.target.value)}
              autoComplete="off"
            />

            <TextField
              label="Account Number"
              value={form.accountNumber}
              onChange={(e) => setField("accountNumber", e.target.value)}
              autoComplete="off"
            />

            <TextField
              label="IFSC Code"
              value={form.ifscCode}
              onChange={(e) => setField("ifscCode", e.target.value)}
              autoComplete="off"
            />

            <div className="md:col-span-2">
              <label className="mb-[10px] block text-[16px] font-[500] leading-[24px] text-[#444444]">
                Upload Photo
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={handleDrop}
                className={`flex h-[188px] w-full flex-col items-center justify-center rounded-[22px] border border-[#E5E9EF] bg-[#FAFBFD] px-[20px] text-center transition-colors ${dragActive ? "border-[#0B4477] bg-[#F4F8FD]" : ""
                  }`}
              >
                {form.photo ? (
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={form.photo}
                      alt="Uploaded preview"
                      className="h-[72px] w-[72px] rounded-[18px] object-cover"
                    />
                    <p className="mt-[12px] max-w-full truncate text-[14px] font-[500] leading-[20px] text-[#6D6D6D]">
                      {form.photoName}
                    </p>
                    <p className="mt-[4px] text-[13px] font-[400] leading-[18px] text-[#8A8A8A]">
                      Click to change photo
                    </p>
                  </div>
                ) : (
                  <>
                    <FiUpload className="h-[22px] w-[22px] text-[#8A8A8A]" />
                    <p className="mt-[10px] text-[14px] font-[500] leading-[20px] text-[#7C7C7C] sm:text-[16px]">
                      Click to upload or drag and drop
                    </p>
                  </>
                )}
              </button>
            </div>

            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              autoComplete="new-password"
            />

            <TextField
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
              autoComplete="new-password"
            />

            {(error || successMsg) && (
              <div className="md:col-span-2">
                {error ? (
                  <div className="rounded-[16px] border border-[#F1C6C6] bg-[#FFF5F5] px-[16px] py-[12px] text-[14px] font-[500] leading-[20px] text-[#C62828]">
                    {error}
                  </div>
                ) : null}

                {successMsg ? (
                  <div className="rounded-[16px] border border-[#C7E8D0] bg-[#F2FBF5] px-[16px] py-[12px] text-[14px] font-[500] leading-[20px] text-[#177245]">
                    {successMsg}
                  </div>
                ) : null}
          </div>
        )}

            <div className="md:col-span-2 mt-[4px]">
              <button
                type="submit"
                disabled={loading}
                className="h-[46px] w-full rounded-[14px] bg-[#063F73] px-[24px] text-[16px] font-[600] leading-[20px] text-[#FFFFFF] shadow-[0px_2px_8px_rgba(6,63,115,0.18)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 sm:w-[392px]"
              >
                {loading ? "Registering..." : "Register Employee"}
        </button>
            </div>
      </form>
        </div>
      </div>
    </div>
  );
}

function TextField({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  readOnly = false,
  disabled = false,
  autoComplete = "off",
}) {
  return (
    <div>
      <label className="mb-[10px] block text-[16px] font-[500] leading-[24px] text-[#444444]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`h-[50px] w-full rounded-[16px] border border-[#E5E9EF] bg-[#FAFBFD] px-[16px] text-[15px] font-[400] leading-[20px] text-[#222222] outline-none transition-colors placeholder:text-[#B6BCC6] focus:border-[#0B4477] ${disabled
          ? "cursor-not-allowed text-[#98A1AE]"
          : ""
          }`}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-[10px] block text-[16px] font-[500] leading-[24px] text-[#444444]">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="h-[50px] w-full appearance-none rounded-[16px] border border-[#E5E9EF] bg-[#FAFBFD] px-[16px] pr-[48px] text-[15px] font-[400] leading-[20px] text-[#222222] outline-none transition-colors focus:border-[#0B4477]"
        >
          {options.map((option) => (
            <option key={option.value || option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <FiChevronDown className="pointer-events-none absolute right-[16px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#7D8692]" />
      </div>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-[10px] block text-[16px] font-[500] leading-[24px] text-[#444444]">
        {label}
      </label>

      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={onChange}
          className="h-[50px] w-full rounded-[16px] border border-[#E5E9EF] bg-[#FAFBFD] px-[16px] text-[15px] font-[400] leading-[20px] text-[#222222] outline-none transition-colors focus:border-[#0B4477] [color-scheme:light]"
        />
      </div>
    </div>
  );
}

export default RegisterUser;
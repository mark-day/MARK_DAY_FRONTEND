import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Login({ setIsLoggedIn }) {
  const [form, setForm] = useState({ empId: "", password: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const BACKEND_URL = "https://attendance-backend-final-4.onrender.com";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setStatus("");

  try {
    const res = await axios.post(`${BACKEND_URL}/api/auth/login`, form);

    const userData = {
      empId: res.data.empId,
      name: res.data.name,
      role: res.data.role,
    };
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("empId", res.data.empId);
    localStorage.setItem("userId", res.data._id);
    localStorage.setItem("role", res.data.role);

    console.log(res.data.role)
    localStorage.setItem("user", JSON.stringify(userData));


    if (res.data.role === "hr_admin") {
      navigate("/hradmin", { replace: true });
    } else if (res.data.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard/userhome", { replace: true });
    }

  } catch (err) {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Invalid credentials";

    setStatus(msg);
    } finally {
    setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] px-4">

      {/* Login Card */}
      <div className="
        w-full 
        max-w-[580px] 
        bg-white 
        rounded-[28px] 
        shadow-[0_12px_40px_rgba(0,0,0,0.08)] 
        lg:p-8 p-5 sm:p-12
      ">

        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-[28px] sm:text-[36px] font-semibold text-[#1F2937] mb-2">
            Welcome Back 👋
          </h2>
          <p className="text-[#6B7280] text-[14px] sm:text-[16px]">
          Sign in to access your attendance dashboard
        </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Employee ID */}
        <div>
            <label className="block text-[14px] sm:text-[15px] font-medium text-[#111827] mb-2">
            Employee ID
          </label>
          <input
            type="text"
              name="empId"
            value={form.empId}
            onChange={handleChange}
              required
              className="
                w-full h-[50px] sm:h-[54px]
                rounded-[14px]
                border border-[#E5E7EB]
                bg-[#F9FAFB]
                px-4
                text-[14px] sm:text-[15px]
                focus:outline-none
                focus:ring-2 focus:ring-[#0F3E68]/30
                focus:border-[#0F3E68]
                transition
              "
          />
        </div>

          {/* Password */}
          <div>
            <label className="block text-[14px] sm:text-[15px] font-medium text-[#111827] mb-2">
            Password
          </label>

          <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
                required
                className="
                  w-full h-[50px] sm:h-[54px]
                  rounded-[14px]
                  border border-[#E5E7EB]
                  bg-[#F9FAFB]
                  px-4 pr-12
                  text-[14px] sm:text-[15px]
                  focus:outline-none
                  focus:ring-2 focus:ring-[#0F3E68]/30
                  focus:border-[#0F3E68]
                  transition
                "
            />

            <button
              type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-[13px] sm:text-[14px]">
            <label className="flex items-center gap-2 text-[#374151]">
              <input type="checkbox" className="accent-[#0F3E68]" />
              Remember Me
          </label>

            {/* <button
          type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-[#0F3E68] font-medium hover:underline"
        >
          Forgot Password?
            </button> */}
      </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full h-[52px] sm:h-[56px]
              rounded-[16px]
              bg-[#0F3E68]
              text-white
              text-[15px] sm:text-[16px]
              font-medium
              shadow-[0_8px_20px_rgba(15,62,104,0.25)]
              hover:bg-[#0c3357]
              transition
              flex items-center justify-center
            "
          >
            {loading ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
            ) : (
              "Login"
            )}
          </button>

          {status && (
            <p className="text-red-500 text-center text-[14px]">
              {status}
            </p>
          )}
      </form>

      </div>
    </div>
  );
}
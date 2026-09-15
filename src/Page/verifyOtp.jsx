import { useState } from "react";
import axios from "axios";

export default function VerifyOtp({ phone, onSuccess }) {
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  const handleVerify = async () => {
    try {
      const res = await axios.post("https://attendance-backend-final-4.onrender.com/api/auth/verify-otp", {
        phone,
        otp,
      });
      setMsg(res.data.msg);
      onSuccess(); // move to reset password
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.msg || "Failed to verify OTP");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Step 2: Verify OTP</h2>
      <input
        className="border p-2 mt-2"
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button className="bg-green-600 text-white p-2 ml-2" onClick={handleVerify}>
        Verify
      </button>
      <p className="mt-2 text-sm text-gray-600">{msg}</p>
    </div>
  );
}

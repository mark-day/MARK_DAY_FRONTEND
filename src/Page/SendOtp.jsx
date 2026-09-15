import { useState } from "react";
import axios from "axios";

export default function SendOtp({ onSuccess }) {
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");

  const handleSend = async () => {
    try {
      const res = await axios.post("https://attendance-backend-final-4.onrender.com/api/auth/send-otp", {
        phone,
      });
      setMsg(res.data.msg);
      onSuccess(phone); 
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.msg || "Failed to send OTP");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Step 1: Send OTP</h2>
      <input
        className="border p-2 mt-2"
        type="text"
        placeholder="Enter phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button className="bg-blue-600 text-white p-2 ml-2" onClick={handleSend}>
        Send OTP
      </button>
      <p className="mt-2 text-sm text-gray-600">{msg}</p>
    </div>
  );
}

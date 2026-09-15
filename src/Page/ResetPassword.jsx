import { useState } from "react";
import axios from "axios";

export default function ResetPassword({ phone }) {
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleReset = async () => {
    try {
      const res = await axios.post("https://attendance-backend-final-4.onrender.com/api/auth/reset-password", {
        phone,
        newPassword,
      });
      setMsg(res.data.msg);
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.msg || "Failed to reset password");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Step 3: Reset Password</h2>
      <input
        className="border p-2 mt-2"
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button className="bg-purple-600 text-white p-2 ml-2" onClick={handleReset}>
        Reset
      </button>
      <p className="mt-2 text-sm text-gray-600">{msg}</p>
    </div>
  );
}

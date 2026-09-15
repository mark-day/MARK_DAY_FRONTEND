import { useState } from "react";
import axios from "axios";

const BASE_URL = "https://attendance-backend-final-4.onrender.com";

function CheckIn({ empId }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported in your browser");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await axios.post(`${BASE_URL}/api/location/update-location`, {
            empId,
            latitude,
            longitude,
          });

          setMessage(res.data.message || "Check-in successful!");
        } catch (err) {
          console.error(err);
          setMessage("Error sending location");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setMessage("Location access denied");
        setLoading(false);
      }
    );
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Check-In / Check-Out</h2>
      <button onClick={handleCheckIn} disabled={loading}>
        {loading ? "Marking..." : "Mark Attendance"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CheckIn;

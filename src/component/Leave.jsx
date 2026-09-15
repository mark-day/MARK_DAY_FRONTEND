import axios from 'axios';
import { useEffect, useState } from 'react';

const LeaveForm = ({ employeeId, employeeName }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [myLeaves, setMyLeaves] = useState([]);

  const API_BASE = 'https://attendance-backend-final-4.onrender.com/api/leave';

  const applyLeave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!startDate || !endDate || !reason) {
      setError('⚠️ All fields are required.');
      return;
    }

    console.log('📤 Submitting leave:', {
      employeeId,
      employeeName,
      startDate,
      endDate,
      reason
    });

    try {
      const res = await axios.post(`${API_BASE}/apply`, {
        employeeId,
        employeeName,
        startDate,
        endDate,
        reason
      });

      setMessage(res.data.message || 'Leave request submitted.');
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchMyLeaves();
    } catch (err) {
      console.error(' Error response:', err.response);
      const serverError = err.response?.data?.error || 'Failed to apply for leave.';
      setError(` ${serverError}`);
    }
  };


  const fetchMyLeaves = async () => {
    try {
      const res = await axios.get(`${API_BASE}/my/${employeeId}`);
      setMyLeaves(res.data);
    } catch (err) {
      console.error(' Failed to fetch leave history:', err);
    }
  };

  useEffect(() => {
    if (employeeId) fetchMyLeaves();
  }, [employeeId]);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>
      
      <form onSubmit={applyLeave} className="space-y-3">
        <input
          type="date"
          className="w-full border rounded p-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <input
          type="date"
          className="w-full border rounded p-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <textarea
          className="w-full border rounded p-2"
          placeholder="Reason for leave"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        ></textarea>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Submit Leave
        </button>

 
        {message && <p className="text-green-600 mt-2">{message}</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>

      <h3 className="text-lg font-semibold mt-8">My Leave Requests</h3>
      <ul className="mt-3 space-y-2">
        {myLeaves.map((leave) => (
          <li key={leave._id} className="border p-3 rounded shadow">
            <p><strong>{new Date(leave.startDate).toLocaleDateString()} ➜ {new Date(leave.endDate).toLocaleDateString()}</strong></p>
            <p>Reason: {leave.reason}</p>
            <p>Status: 
              <span className={
                leave.status === 'approved'
                  ? 'text-green-600'
                  : leave.status === 'rejected'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }>
                {' ' + leave.status}
              </span>
            </p>
            {leave.approvedBy && <p>Approved By: {leave.approvedBy}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaveForm;

import React, { useState } from 'react';
import './UserProfileAdd.css';

function UserProfileAdd({ setToggleAddp, onProfileAdded }) {
  const [formData, setFormData] = useState({
    empId: '',
    Company_Name: '',
    slry: '',
    DOB: '',
    Des: '',
    bank_name: '',
    account_number: '',
    Ifsc_code: '',
  });

  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('Submitting...');

    try {
      const res = await fetch(
        'https://attendance-backend-final-4.onrender.com/api/emp/add-details',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        console.error('Server response:', result);
        throw new Error(result.message || 'Something went wrong');
      }

      setStatus('✅ Profile added successfully!');

      // 🔑 Reset form
      setFormData({
        empId: '',
        Company_Name: '',
        slry: '',
        DOB: '',
        Des: '',
        bank_name: '',
        account_number: '',
        Ifsc_code: '',
      });

      // 🔑 Call parent refresh if provided
      if (onProfileAdded) onProfileAdded(result.profile);

      // 🔑 Close modal after short delay
      setTimeout(() => {
        setToggleAddp(false);
        setStatus('');
      }, 1200);
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="UserProfileAdd">
      <div className="cross" onClick={() => setToggleAddp(false)}>
        ✕
      </div>
      <h2>Add Employee Salary Details</h2>

      <form onSubmit={handleSubmit} className="UserProfileAdd-form">
        <input
          type="text"
          name="empId"
          placeholder="Employee ID (empId)"
          value={formData.empId}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="Company_Name"
          placeholder="Company Name"
          value={formData.Company_Name}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="slry"
          placeholder="Salary"
          value={formData.slry}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="DOB"
          placeholder="Date of Birth"
          value={formData.DOB}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="Des"
          placeholder="Designation"
          value={formData.Des}
          onChange={handleChange}
          required
        />

        <h4>Bank Account Info</h4>

        <input
          type="text"
          name="bank_name"
          placeholder="Bank Name"
          value={formData.bank_name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="account_number"
          placeholder="Account Number"
          value={formData.account_number}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="Ifsc_code"
          placeholder="IFSC Code"
          value={formData.Ifsc_code}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {status && <p className="status">{status}</p>}
    </div>
  );
}

export default UserProfileAdd;

import React, { useEffect, useState } from 'react';

function UserProfile({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      setUser(null);
      setProfile(null);

      try {
        const res = await fetch(
          `https://attendance-backend-final-4.onrender.com/api/emp/get-details/${userId.trim()}`
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || 'Failed to fetch user profile');
        }

        const data = await res.json();

        if (!data.user || !data.profile) {
          throw new Error('Incomplete profile data');
        }

        setUser(data.user);
        setProfile(data.profile);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (!userId) return <p>No User Selected</p>;

  return (
    <div
      className="UserProfile"
      style={{
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
      }}
    >
      <button onClick={onClose} style={{ marginBottom: '1rem' }}>
        Close Profile
      </button>
      <h2>User Profile for ID: {userId}</h2>

      {loading && <p>Loading user data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {user && profile && (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li><strong>Employee ID:</strong> {user.empId}</li>
          <li><strong>Name:</strong> {user.name}</li>
          <li><strong>Email:</strong> {user.email || '-'}</li>
          <li><strong>Phone:</strong> {user.phone || '-'}</li>
          <li><strong>Hire Date:</strong> {user.hireDate || '-'}</li>

          <li><strong>Company Name:</strong> {profile.Company_Name || '-'}</li>
          <li><strong>Salary:</strong> {profile.slry || '-'}</li>
          <li><strong>Date of Birth:</strong> {profile.DOB || '-'}</li>
          <li><strong>Designation:</strong> {profile.Des || '-'}</li>

          <li>
            <strong>Bank Details:</strong>
            <ul>
              <li><strong>Bank Name:</strong> {profile.userAccount?.bank_name || '-'}</li>
              <li><strong>Account Number:</strong> {profile.userAccount?.account_number || '-'}</li>
              <li><strong>IFSC Code:</strong> {profile.userAccount?.Ifsc_code || '-'}</li>
            </ul>
          </li>
        </ul>
      )}
    </div>
  );
}

export default UserProfile;

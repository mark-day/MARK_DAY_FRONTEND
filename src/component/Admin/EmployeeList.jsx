import React, { useEffect, useState } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditEmployeeModal from "./EditEmployeeModal";
import "../Admin.css";

const BASE_URL = "https://attendance-backend-final-4.onrender.com";

const EmployeeList = ({ setView, showNotification }) => {
  const [employees, setEmployees] = useState([]);
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    phone: "",
    hireDate: "",
  });
  const [editEmpId, setEditEmpId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    hireDate: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch employee list
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/user`);
      setEmployees(res.data);
    } catch (error) {
      showNotification("Failed to fetch employees");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle registration form change
  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new employee registration
  const handleRegSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.phone || !regForm.hireDate) {
      showNotification("Please fill all fields");
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/api/admin/user`, regForm);
      setEmployees((prev) => [...prev, res.data]);
      showNotification("Employee registered successfully");
      setRegForm({ name: "", email: "", phone: "", hireDate: "" });
    } catch (err) {
      showNotification("Failed to register employee");
    }
  };

  // Delete employee
  const handleDelete = async (empId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/admin/user/${empId}/delete`);
      setEmployees((prev) => prev.filter((e) => e.empId !== empId));
      showNotification("Employee deleted successfully");
    } catch (err) {
      showNotification("Failed to delete employee");
    }
  };

  // Handle edit form submit
  const handleEditSubmit = async () => {
    if (!editForm.name || !editForm.email || !editForm.phone || !editForm.hireDate) {
      showNotification("Please fill all fields");
      return;
    }
    try {
      const res = await axios.put(`${BASE_URL}/api/admin/user/${editEmpId}/update`, editForm);
      setEmployees((prev) =>
        prev.map((e) => (e.empId === editEmpId ? res.data.user : e))
      );
      setEditEmpId(null);
      showNotification("Employee updated successfully");
    } catch (err) {
      showNotification("Failed to update employee");
    }
  };

  return (
    <div className="section-box">
      <button className="btn-secondary back-btn" onClick={() => setView(null)}>
        Back
      </button>

      <h3 className="mainheading">Employee List</h3>

      <div className="flex justify-between mb-4">
        <CSVLink data={employees} filename="employees.csv" className="btn-primary">
          Download CSV
        </CSVLink>
      </div>

      {loading ? (
        <p>Loading employees...</p>
      ) : employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table className="custom-table w-full">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.empId}>
                <td>{e.empId}</td>
                <td>{e.name}</td>
                <td>{e.email}</td>
                <td>{e.phone}</td>
                <td>{e.hireDate}</td>
                <td className="action-buttons">
                  <button
                    className="btn-icon"
                    title="Edit Employee"
                    onClick={() => {
                      setEditEmpId(e.empId);
                      setEditForm({
                        name: e.name,
                        email: e.email,
                        phone: e.phone,
                        hireDate: e.hireDate,
                      });
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    title="Delete Employee"
                    onClick={() => handleDelete(e.empId)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editEmpId && (
        <EditEmployeeModal
          form={editForm}
          setForm={setEditForm}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditEmpId(null)}
        />
      )}
    </div>
  );
};

export default EmployeeList;

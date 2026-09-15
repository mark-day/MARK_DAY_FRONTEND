import React, { useState } from "react";
import axios from "axios";

const RegisterUser = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://attendance-backend-final-4.onrender.com/api/admin/register",
        form
      );
      alert("User registered successfully!");
      setForm({ name: "", email: "", phone: "", password: "" });
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Failed to register user.");
    }
  };

  return (
    <div className="register-container">
      <h2>Register New User</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Phone:</label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn-primary">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterUser;

import { useState } from "react";
import { useNavigate } from "react-router-dom";


const AdminLogin = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const admins = [
    { name: "aman", password: "Aman123", role: "admin", route: "/admin" },
    { name: "savita", password: "savita123", role: "hradmin", route: "/hradmin" },
    { name: "heeralal", password: "Hera123", role: "admin", route: "/admin" },
    { name: "arvind", password: "Arvind123", role: "admin", route: "/admin" },
    { name: "santosh", password: "Santosh123", role: "admin", route: "/admin" },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const trimmedName = name.trim().toLowerCase();
    const trimmedPassword = password.trim();

    const admin = admins.find(
      (a) =>
        a.name.toLowerCase() === trimmedName &&
        a.password === trimmedPassword
    );

    if (admin) {
      // ✅ Persistent Admin Login
      localStorage.setItem("isAdminLoggedIn", "true");
      localStorage.setItem("role", admin.role);
      localStorage.setItem("empId", admin.name);
      localStorage.setItem("name", admin.name);

      navigate(admin.route);
    } else {
      setError("Invalid details. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="admin-login-container">
      <form onSubmit={handleLogin} className="admin-login-form" noValidate>
        <h2>Admin Login</h2>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Admin Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          aria-label="Admin Name"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
          aria-label="Password"
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="Loginuser" onClick={() => navigate("/login")}>
          Login As Employee
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;

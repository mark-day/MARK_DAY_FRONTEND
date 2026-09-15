import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ setIsLoggedIn }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedInLocal, setIsLoggedInLocal] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const empLogin = localStorage.getItem("isLoggedIn") === "true";
    const adminLogin = localStorage.getItem("isAdminLoggedIn") === "true";
    setIsLoggedInLocal(empLogin);
    setIsAdminLoggedIn(adminLogin);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsLoggedInLocal(false);
    setIsAdminLoggedIn(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="w-full bg-[#F4F6F9] px-6 py-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm px-6 py-4 flex justify-between items-center">
        
        {/* Logo / Title */}
        <Link to="/dashboard/userhome">
          <h1 className="text-[18px] md:text-[20px] font-semibold text-[#1E293B] tracking-wide">
            Athratech Pvt Limited
          </h1>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {!isLoggedInLocal && !isAdminLoggedIn && (
            <>
              <Link
                to="/login"
                className="text-[#334155] font-medium hover:text-[#0F3D63] transition"
              >
                Login
              </Link>
              <Link
                to="/admin-login"
                className="text-[#334155] font-medium hover:text-[#0F3D63] transition"
              >
                Admin
              </Link>
            </>
          )}

          {(isLoggedInLocal || isAdminLoggedIn) && (
            <button
              onClick={handleLogout}
              className="bg-[#0F3D63] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#0C2F4E] transition"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-2xl text-[#1E293B]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 bg-white rounded-2xl shadow-sm px-6 py-4 flex flex-col gap-4 max-w-7xl mx-auto">
          {!isLoggedInLocal && !isAdminLoggedIn && (
            <>
              <Link
                to="/login"
                className="text-[#334155] font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/admin-login"
                className="text-[#334155] font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            </>
          )}

          {(isLoggedInLocal || isAdminLoggedIn) && (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="bg-[#0F3D63] text-white px-5 py-2 rounded-full text-sm font-medium"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

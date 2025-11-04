import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";

const Header = () => {
  const [loginUser, setLoginUser] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    let user = null;
    try { user = JSON.parse(localStorage.getItem("user")); } catch (e) { user = null; }
    if (user) {
      setLoginUser(user);
    }
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("user");
    message.success("Logout Successfully");
    navigate("/login");
  };
  return (
    <header className="app-navbar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" className="app-brand">Portfolio Management</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ color: 'var(--muted)' }}>{loginUser && loginUser.name}</div>
          {loginUser && loginUser.role === "admin" && (
            <Link to="/admin" className="app-nav nav-link">Admin Panel</Link>
          )}
          <button className="btn-flat" onClick={logoutHandler} style={{ background: 'var(--primary)', color: 'white' }}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

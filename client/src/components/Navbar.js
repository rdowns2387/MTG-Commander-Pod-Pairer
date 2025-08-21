import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import Logo from "../img/logo192.png";

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const guestLinks = (
    <ul>
      <li>
        <Link to="/login">Login</Link>
      </li>
      <li>
        <Link to="/register">Register</Link>
      </li>
    </ul>
  );

  const authLinks = (
    <ul>
      <li>
        <Link to="/dashboard">Dashboard</Link>
      </li>
      <li>
        <Link to="/match-history">Match History</Link>
      </li>
      <li>
        <Link to="/profile">Profile</Link>
      </li>
      <li>
        <a href="#!" onClick={handleLogout}>
          Logout
        </a>
      </li>
    </ul>
  );

  return (
    <nav className="navbar">
      <h1>
        <Link to="/">EDH in PDX</Link>
      </h1>
      {currentUser ? (
        <>
          {/* <span className="welcome">Welcome, {currentUser.firstName}</span> */}
          {authLinks}
        </>
      ) : (
        guestLinks
      )}
    </nav>
  );
};

export default Navbar;

import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import Logo from "../img/logo192.png";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    pin: "",
  });
  const [alert, setAlert] = useState(null);

  const { login, error, clearError, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, pin } = formData;

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (currentUser) {
      navigate("/dashboard");
    }

    // Set alert if there's an error
    if (error) {
      setAlert({ type: "danger", msg: error });
      clearError();
    }
  }, [currentUser, navigate, error, clearError]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      setAlert({ type: "danger", msg: "PIN must be exactly 4 digits" });
      return;
    }

    try {
      await login({ email, pin });
      navigate("/dashboard");
    } catch (err) {
      setAlert({
        type: "danger",
        msg: err.response?.data?.message || "Login failed",
      });
    }
  };

  return (
    <div className="form-container">
      <img className="form-logo" src={Logo} />
      <h1 className="form-title">Pod Finder</h1>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={onChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pin">PIN (4 digits)</label>
          <input
            type="password"
            name="pin"
            id="pin"
            value={pin}
            onChange={onChange}
            className="form-control"
            maxLength="4"
            pattern="[0-9]{4}"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Login
        </button>
      </form>

      <p className="my-1">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;

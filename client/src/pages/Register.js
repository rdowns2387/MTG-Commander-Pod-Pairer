import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import Logo from "../img/logo192.png";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    pin: "",
    confirmPin: "",
  });
  const [alert, setAlert] = useState(null);

  const { register, error, clearError, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { firstName, lastName, email, pin, confirmPin } = formData;

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

    // Check if PINs match
    if (pin !== confirmPin) {
      setAlert({ type: "danger", msg: "PINs do not match" });
      return;
    }

    try {
      await register({ firstName, lastName, email, pin });
      navigate("/dashboard");
    } catch (err) {
      setAlert({
        type: "danger",
        msg: err.response?.data?.message || "Registration failed",
      });
    }
  };

  return (
    <div className="form-container">
      <img className="form-logo" src={Logo} />

      <h1 className="form-title">Register</h1>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={firstName}
            onChange={onChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={lastName}
            onChange={onChange}
            className="form-control"
            required
          />
        </div>

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

        <div className="form-group">
          <label htmlFor="confirmPin">Confirm PIN</label>
          <input
            type="password"
            name="confirmPin"
            id="confirmPin"
            value={confirmPin}
            onChange={onChange}
            className="form-control"
            maxLength="4"
            pattern="[0-9]{4}"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Register
        </button>
      </form>

      <p className="my-1">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;

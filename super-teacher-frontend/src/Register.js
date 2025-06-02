import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import bg from './bg.jpeg';
import logo from './logo2.png';

export default function Register({ switchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rollnumber: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("https://chrono-lms.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess("Registration successful! You can now log in.");
        setFormData({ name: "", email: "", password: "", rollnumber: "", role: "student" });
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          maxWidth: "450px",
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "1rem",
        }}
      >
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" style={{ height: "60px" }} />
        </div>

        <form onSubmit={submit}>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="mb-3">
            <label className="form-label" style={{ color: "#2872bc" }}>Name</label>
            <input
              name="name"
              type="text"
              className="form-control"
              placeholder="Enter name"
              required
              value={formData.name}
              onChange={handleChange}
              style={{ borderColor: "#40aeef" }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ color: "#2872bc" }} >Email</label>
            <input
              name="email"
              type="email"
              className="form-control"
              placeholder="Enter email"
              required
              value={formData.email}
              onChange={handleChange}
              style={{ borderColor: "#40aeef" }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ color: "#2872bc" }}>Roll Number</label>
            <input
              name="rollnumber"
              type="text"
              className="form-control"
              placeholder="Enter roll number"
              required
              value={formData.rollnumber}
              onChange={handleChange}
              style={{ borderColor: "#40aeef" }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ color: "#2872bc" }}>Password</label>
            <input
              name="password"
              type="password"
              className="form-control"
              placeholder="Enter password"
              required
              value={formData.password}
              onChange={handleChange}
              style={{ borderColor: "#40aeef" }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ color: "#2872bc" }}>Register As</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
              style={{ borderColor: "#40aeef" }}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "#3ca651", color: "white" }}
          >
            Register
          </button>
        </form>

        <p className="text-center mt-3">
          Already have an account?{" "}
          <button
            type="button"
            className="btn mb-1 btn-link"
            style={{ color: "#f10909"  }}
            onClick={switchToLogin}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

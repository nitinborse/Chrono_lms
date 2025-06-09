import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "./logo2.png";
import bg from "./bg.jpeg";
import { Eye, EyeOff } from "lucide-react"; // Importing lucide-react icons

function Login({ onLogin, switchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function submit(e) {
    e.preventDefault();
    onLogin(email, password);
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "120px",
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "1rem",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" style={{ height: "60px" }} />
        </div>

        <form onSubmit={submit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label" style={{ color: "#2872bc" }}>
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ borderColor: "#40aeef" }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label" style={{ color: "#2872bc" }}>
              Password
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="password"
                placeholder="Enter password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ borderColor: "#40aeef" }}
              />
              <span
                className="input-group-text"
                style={{ cursor: "pointer", background: "white" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "#3ca651", color: "white" }}
          >
            Login
          </button>
        </form>

        <p className="text-center mt-3">
          Don't have an account?{" "}
          <button
            type="button"
            className="btn mb-1 btn-link"
            style={{ color: "#f10909" }}
            onClick={switchToRegister}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;

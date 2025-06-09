import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate
} from "react-router-dom";

import { LoaderProvider, useLoader } from "./LoaderContext";
import Loader from "./Loader2";

import Login from "./Login2";
import Register from "./Register";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import CourseTopics from "./CourseTopic";
import Header from "./Header";
import EnrolledStudents from "./EnrolledStudent";
import TopicFeedbackDashboard from "./TopicFeedbackReport";
import AttendanceReport from "./AttendanceReport";
import ProtectedRoute from "./ProtectedRoute";

// Login wrapper
function LoginWrapper() {
  const navigate = useNavigate();
  const { setLoading } = useLoader();

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const res = await fetch("https://chrono-lms.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("rollnumber", data.rollnumber);
        localStorage.setItem("name", data.name);
        navigate(data.role === "student" ? "/studentdashboard" : "/teacherdashboard");
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      alert("Something went wrong");
    }
  };

  return <Login onLogin={handleLogin} switchToRegister={() => navigate("/register")} />;
}

// Register wrapper
function RegisterWrapper() {
  const navigate = useNavigate();

  const handleRegister = (email, password, name) => {
    alert("Registered successfully");
    navigate("/");
  };

  return <Register onRegister={handleRegister} switchToLogin={() => navigate("/")} />;
}

// Header layout
function Layout({ children }) {
  const location = useLocation();
  const hideHeader = ["/", "/register"].includes(location.pathname);
  const userName = localStorage.getItem("name") || "User";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      {!hideHeader && <Header userName={userName} onLogout={handleLogout} />}
      {children}
    </>
  );
}

// Main App
function AppContent() {
  const { loading } = useLoader();

  return (
    <>
      {loading && <Loader />}
      <Router>
        <Routes>
          <Route
            path="*"
            element={
              (() => {
                const token = localStorage.getItem("token");
                const role = localStorage.getItem("role");
                if (!token || !role) return <Navigate to="/" replace />;
                return <Navigate to={role === "student" ? "/studentdashboard" : "/teacherdashboard"} replace />;
              })()
            }
          />
          <Route path="/" element={<LoginWrapper />} />
          <Route path="/register" element={<RegisterWrapper />} />
          <Route path="/studentdashboard" element={<ProtectedRoute><Layout><StudentDashboard /></Layout></ProtectedRoute>} />
          <Route path="/teacherdashboard" element={<ProtectedRoute><Layout><TeacherDashboard /></Layout></ProtectedRoute>} />
          <Route path="/topicfeedback" element={<ProtectedRoute><Layout><TopicFeedbackDashboard /></Layout></ProtectedRoute>} />
          <Route path="/topics" element={<ProtectedRoute><Layout><CourseTopics /></Layout></ProtectedRoute>} />
          <Route path="/attendancereport" element={<ProtectedRoute><Layout><AttendanceReport /></Layout></ProtectedRoute>} />
          <Route path="/enrolledstudents" element={<ProtectedRoute><Layout><EnrolledStudents /></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </>
  );
}

// Export main app with loader provider
export default function App() {
  return (
    <LoaderProvider>
      <AppContent />
    </LoaderProvider>
  );
}

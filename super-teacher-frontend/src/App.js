import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate 
} from "react-router-dom";

import Login from "./Login2";
import Register from "./Register";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import CourseTopics from "./CourseTopic";
import Header from "./Header";
import EnrolledStudents from "./EnrolledStudent";
import TopicFeedbackDashboard from "./TopicFeedbackReport";
import AttendanceReport from "./AttendanceReport";
import ProtectedRoute from "./ProtectedRoute"; // 🔒 Import protection

// Wrapper to allow useNavigate in Login
function LoginWrapper() {
  const navigate = useNavigate();

  async function handleLogin(email, password) {
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("rollnumber", data.rollnumber);
        localStorage.setItem("name", data.name);

        if (data.role === "student") {
          navigate("/studentdashboard");
        } else {
          navigate("/teacherdashboard");
        }
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong");
    }
  }

  return (
    <Login
      onLogin={handleLogin}
      switchToRegister={() => navigate("/register")}
    />
  );
}

// Wrapper to allow useNavigate in Register
function RegisterWrapper() {
  const navigate = useNavigate();

  const handleRegister = (email, password, name) => {
    alert("Registered successfully");
    navigate("/");
  };

  return (
    <Register
      onRegister={handleRegister}
      switchToLogin={() => navigate("/")}
    />
  );
}

// Layout component to show header conditionally
function Layout({ children }) {
  const location = useLocation();
  const hideHeaderPaths = ["/", "/register"];
  const hideHeader = hideHeaderPaths.includes(location.pathname);

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

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
  path="*"
  element={
    (() => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token || !role) {
        // Not logged in, redirect to login page
        return <Navigate to="/" replace />;
      }

      // Redirect based on role
      if (role === "student") {
        return <Navigate to="/studentdashboard" replace />;
      } else {
        // For super teacher or any other role
        return <Navigate to="/teacherdashboard" replace />;
      }
    })()
  }
/>          <Route path="/" element={<LoginWrapper />} />
        <Route path="/register" element={<RegisterWrapper />} />

        {/* Protected routes */}
        <Route
          path="/studentdashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacherdashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <TeacherDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/topicfeedback"
          element={
            <ProtectedRoute>
              <Layout>
                <TopicFeedbackDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/topics"
          element={
            <ProtectedRoute>
              <Layout>
                <CourseTopics />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendancereport"
          element={
            <ProtectedRoute>
              <Layout>
                <AttendanceReport />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrolledstudents"
          element={
            <ProtectedRoute>
              <Layout>
                <EnrolledStudents />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

import React from "react";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../src/logo2.png";
// import AttendanceReport from "./AttendanceReport";
export default function Header({ userName, onLogout }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <Navbar bg="light" expand="md" className="mb-4 shadow-sm">
      <Container>
        <Navbar.Brand href="/">
          <img
            src={logo}
            alt="Logo"
            height="60"
            className="d-inline-block align-top me-2"
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="align-items-center">

            {/* Only show these tabs for teacher role */}
            {role === "super" && (
              <>
                <Nav.Link
                  onClick={() => navigate("/teacherdashboard")}
                  className="me-3"
                  style={{ cursor: "pointer" }}
                >
                  Dashboard
                </Nav.Link>

                <Nav.Link
                  onClick={() => navigate("/enrolledstudents")}
                  className="me-3"
                  style={{ cursor: "pointer" }}
                >
                  Enrolled Students
                </Nav.Link>
                <Nav.Link
                  onClick={() => navigate("/topicfeedback")}
                  className="me-3"
                  style={{ cursor: "pointer" }}
                >
                  Topic Feedback
                </Nav.Link>
                <Nav.Link
                  onClick={() => navigate("/attendancereport")}
                  className="me-3"
                  style={{ cursor: "pointer" }}
                >
                  Attendance Report
                </Nav.Link>
              </>
                
            )}

            <NavDropdown title={userName || "User"} id="basic-nav-dropdown" align="end">
              <NavDropdown.Item onClick={handleProfile}>Profile</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

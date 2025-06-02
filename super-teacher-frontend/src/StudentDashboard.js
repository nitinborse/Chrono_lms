import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [course, setCourse] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000",
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/courses");
      setCourse(res.data.course || "");
    } catch (err) {
      if (err.response?.status === 400) {
        setCourse(""); // Not selected
      } else {
        alert("Error loading dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (c) => {
    if (course) return;
    setSelectedCourse(c);
  };

  const handleSubmitCourse = async () => {
    try {
      await api.post("/select-course", { course: selectedCourse });
      setCourse(selectedCourse);
      setSelectedCourse("");
    } catch (err) {
      alert("Error submitting course");
    }
  };

  const handleGoToTopics = () => {
    navigate("/topics");
  };

  const courses = ["Web Development", "Python", "AI", "DBMS", "Robotics", "Swift"];

  return (
    <div className="container py-4">
      <h3 className="mb-4">Student Dashboard</h3>
      {loading ? (
        <p>Loading...</p>
      ) : course ? (
        <>
          <div className="alert alert-success">
            🎓 Your Selected Course: <strong>{course}</strong>
          </div>
          <div className="text-center">
            <button className="btn btn-primary" onClick={handleGoToTopics}>
              View Course Topics & Give Feedback
            </button>
          </div>
        </>
      ) : (
        <>
          <h4 className="mb-3">Select Your Course</h4>
          <div className="row">
            {courses.map((c) => (
              <div
                className={`col-md-4 col-lg-3 mb-3 card ${selectedCourse === c ? "border-success border-2" : "border"}`}
                key={c}
                onClick={() => handleCourseClick(c)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body text-center">
                  <h5 className="card-title">{c}</h5>
                </div>
              </div>
            ))}
          </div>
          {selectedCourse && (
            <div className="text-center mt-3">
              <button className="btn btn-success" onClick={handleSubmitCourse}>
                Submit Course Selection
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

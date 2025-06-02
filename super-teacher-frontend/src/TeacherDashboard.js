import React, { useState } from "react";
import {
  Card,
} from "react-bootstrap";

const courses = ["Web Development", "Python", "AI", "DBMS", "Robotics", "Swift"];

export default function TeacherDashboard() {
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicCourse, setNewTopicCourse] = useState(courses[0]);
  const token = localStorage.getItem("token");

  const handleAddTopic = async () => {
    if (!newTopicTitle.trim()) return alert("Topic title is required");

    try {
      await fetch("https://chrono-lms.onrender.com/add-topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course: newTopicCourse,
          title: newTopicTitle,
          class_date: new Date().toISOString().slice(0, 10),
        }),
      });

      setNewTopicTitle("");
      alert("Topic added successfully!");
    } catch (err) {
      alert("Error adding topic");
    }
  };

  return (
    <div className="container py-4">
       <Card className="shadow mb-4">
              <Card.Body>
      <h2 className="mb-4">👨‍🏫 Super Teacher Dashboard</h2>

      <div className="card p-3 mb-4 shadow">
        <h5>Add New Topic</h5>
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Course</label>
            <select
              className="form-select"
              value={newTopicCourse}
              onChange={(e) => setNewTopicCourse(e.target.value)}
            >
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-5">
            <label className="form-label">Topic Title</label>
            <input
              type="text"
              className="form-control"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              placeholder="Enter topic title"
            />
          </div>
          <div className="col-md-3">
            <button className="btn btn-primary w-100" onClick={handleAddTopic}>
              ➕ Add Topic
            </button>
          </div>
        </div>
      </div>
      </Card.Body>
      </Card>
      
    </div>
  );
}

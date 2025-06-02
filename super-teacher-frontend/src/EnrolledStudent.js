// src/pages/EnrolledStudents.js
import React, { useState } from "react";
import {
  Card,
} from "react-bootstrap";
const courses = ["Web Development", "Python", "AI", "DBMS", "Robotics", "Swift"];
const teachers = ["Alice", "Bob", "Charlie"];


export default function EnrolledStudents() {
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(teachers[0]);
  

  const token = localStorage.getItem("token");

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await fetch(
        `https://chrono-lms.onrender.com/enrolledstudents?course=${encodeURIComponent(selectedCourse)}&teacher=${encodeURIComponent(selectedTeacher)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch students");
      const studentsData = await res.json();
      setStudents(studentsData);
    } catch (err) {
      alert("Error fetching enrolled students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
       <Card className="shadow mb-4">
       <Card.Body>
      <h2>Enrolled Students</h2>
      <label htmlFor="teacherSelect" className="form-label m-3">Select Teacher</label>
<select
  id="teacherSelect"
  className="form-select"
  value={selectedTeacher}
  onChange={(e) => setSelectedTeacher(e.target.value)}
>
  {teachers.map((name) => (
    <option key={name} value={name}>{name}</option>
  ))}
</select>
      <div className="mb-3">
        
        <label htmlFor="courseSelect" className="form-label">Select Course</label>
        <select
          id="courseSelect"
          className="form-select"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          {courses.map((course) => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>

      <button className="btn btn-primary me-2 mb-3" onClick={fetchStudents} disabled={loading}>
        {loading ? "Loading..." : "Show Enrolled Students"}
      </button>

      {students.length > 0 ? (
        <>
          <h5>Total Students: {students.length}</h5>
          <ul className="list-group mb-3">
            {students.map((stu) => (
              <li key={stu.rollnumber} className="list-group-item">
                {stu.name} - Roll Number: {stu.rollnumber}
              </li>
            ))}
          </ul>
        </>
      ) : !loading ? (
        <p>No students enrolled for this course yet.</p>
      ) : null}
       </Card.Body>
      </Card>
      
    </div>
  );
}

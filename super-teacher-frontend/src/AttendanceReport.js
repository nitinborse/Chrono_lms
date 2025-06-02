import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Card,
} from "react-bootstrap";
const courses = ["Web Development", "Python", "AI", "DBMS", "Robotics", "Swift"];
const teachers = ["Alice", "Bob", "Charlie"];


export default function AttendanceReport() {
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState({}); // { rollnumber: 'Present' | 'Absent' }
  const [selectedTeacher, setSelectedTeacher] = useState(teachers[0]);

  const token = localStorage.getItem("token");

  async function fetchStudents() {
    setLoading(true);
    try {
      // Step 1: Fetch enrolled students
      const res = await fetch(
        `https://chrono-lms.onrender.com/enrolledstudents?course=${encodeURIComponent(selectedCourse)}&teacher=${encodeURIComponent(selectedTeacher)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (!res.ok) throw new Error("Failed to fetch students");
      const studentsData = await res.json();
      setStudents(studentsData);
  
      // Step 2: Fetch today's attendance for this course
      const attRes = await fetch(`https://chrono-lms.onrender.com/attendance?course=${encodeURIComponent(selectedCourse)}&teacher=${encodeURIComponent(selectedTeacher)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!attRes.ok) throw new Error("Failed to fetch attendance");
      const attendanceData = await attRes.json(); // [{ rollnumber, status }]
  
      // Step 3: Build attendance map
      const attendanceMap = {};
      studentsData.forEach((stu) => {
        const record = attendanceData.find((rec) => rec.rollnumber === stu.rollnumber);
        attendanceMap[stu.rollnumber] = record ? record.status : "";
      });
      setAttendance(attendanceMap);
    } catch (err) {
      alert("Error fetching enrolled students or attendance");
      setStudents([]);
      setAttendance({});
    } finally {
      setLoading(false);
    }
  }
  
  function downloadExcel() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB").split("/").join("-"); // e.g., "20-05-2025"
  
    const worksheet = XLSX.utils.json_to_sheet(
      students.map((stu, index) => ({
        SR_No: index + 1,
        Name: stu.name,
        Roll_Numb: stu.rollnumber,
        Email: stu.email || "",
        Course: selectedCourse,
        [`Date(${formattedDate})`]: attendance[stu.rollnumber] || "Not Marked"
      }))
    );
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enrolled Students");
  
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
  
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  
    saveAs(blob, `Enrolled_Students_${selectedCourse}_${formattedDate}.xlsx`);
  }
  

  // Update attendance selection for a student
  function handleAttendanceChange(rollnumber, status) {
    setAttendance((prev) => ({ ...prev, [rollnumber]: status }));
  }

  // Submit attendance data to backend
  async function submitAttendance() {
    const attendanceArr = [];
  
    for (const stu of students) {
      const status = attendance[stu.rollnumber];
      if (!status) {
        alert(`Please mark attendance for roll number: ${stu.rollnumber}`);
        return;
      }
      attendanceArr.push({ rollnumber: stu.rollnumber, status });
    }
  
    const today = new Date().toISOString().split("T")[0]; // Format: yyyy-mm-dd
  
    try {
      const res = await fetch("https://chrono-lms.onrender.com/attendanceData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attendance: attendanceArr,
          course: selectedCourse,
          date: today,
          teacher: selectedTeacher
        })
        ,
      });
  
      if (!res.ok) throw new Error("Failed to save/update attendance");
  
      alert("Attendance submitted/updated successfully");
    } catch (error) {
      alert("Error saving attendance: " + error.message);
    }
  }
  
  return (
    <div className="container py-4">
      <Card className="shadow mb-4">
      <Card.Body>

      <h2>Enrolled Students</h2>
      <div className="mb-3">
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

      {students.length > 0 && (
        <button className="btn btn-danger mb-3" onClick={downloadExcel}>
           Download Excel
        </button>
      )}

      {students.length > 0 ? (
        <>
          <h5>Total Students: {students.length}</h5>

          <ul className="list-group mb-3">
            {students.map((stu) => (
              <li key={stu.rollnumber} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  {stu.name} - Roll Number: {stu.rollnumber}
                </div>

                <div>
                  <button
                    className={`btn btn-sm me-2 ${attendance[stu.rollnumber] === "Present" ? "btn-success" : "btn-outline-secondary"}`}
                    onClick={() => handleAttendanceChange(stu.rollnumber, "Present")}
                  >
                    Present
                  </button>

                  <button
                    className={`btn btn-sm ${attendance[stu.rollnumber] === "Absent" ? "btn-danger" : "btn-outline-secondary"}`}
                    onClick={() => handleAttendanceChange(stu.rollnumber, "Absent")}
                  >
                    Absent
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button className="btn btn-primary" onClick={submitAttendance}>
            Submit Attendance
          </button>
        </>
      ) : !loading ? (
        <p>No students enrolled for this course yet.</p>
      ) : null}
      </Card.Body>
      </Card>
    </div>
  );
}

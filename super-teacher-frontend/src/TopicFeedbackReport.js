import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Form,
  Button,
  Spinner,
  Alert,
  Card,
  Badge,
} from "react-bootstrap";
import { ArrowLeft, ArrowRight } from "react-bootstrap-icons";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const courses = [
  "Web Development",
  "Python",
  "AI",
  "DBMS",
  "Robotics",
  "Swift",
];

export default function TopicFeedbackDashboard() {
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [topics, setTopics] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const studentsPerPage = 8;
  const topicsPerPage = 4;
  const [currentStudentPage, setCurrentStudentPage] = useState(1);
  const [currentTopicPage, setCurrentTopicPage] = useState(1);
  const [showGraph, setShowGraph] = useState(false);

  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://chrono-lms.onrender.com/feedbackmatrix?course=${encodeURIComponent(
          selectedCourse
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();
      setTopics(Array.isArray(data.topics) ? data.topics : []);
      setStudents(Array.isArray(data.students) ? data.students : []);
      setCurrentStudentPage(1);
      setCurrentTopicPage(1);
      setShowGraph(false);
    } catch (err) {
      console.error("Error loading feedback data:", err);
      setError("Failed to load feedback data. Please try again.");
      setTopics([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const indexOfLastStudent = currentStudentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);

  const indexOfLastTopic = currentTopicPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  const currentTopics = topics.slice(indexOfFirstTopic, indexOfLastTopic);

  const getNotUnderstoodCount = (topicId) => {
    return students.reduce((count, student) => {
      const fb = student.feedbacks?.find((f) => f.topic_id === topicId);
      return count + (fb?.status === "not understood" ? 1 : 0);
    }, 0);
  };

  const exportExcelForTopic = (topic) => {
    const notUnderstoodStudents = students.filter((student) => {
      const fb = student.feedbacks?.find((f) => f.topic_id === topic.id);
      return fb?.status === "not understood";
    });

    if (notUnderstoodStudents.length === 0) {
      alert(`No students marked "Not Understood" for topic "${topic.title}"`);
      return;
    }

    const worksheetData = notUnderstoodStudents.map((stu) => ({
      Name: stu.name,
      "Roll Number": stu.rollnumber,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Not Understood Students");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    saveAs(blob, `${topic.title}_NotUnderstoodStudents.xlsx`);
  };

  const renderStatus = (status) => {
    switch (status) {
      case "understood":
        return <Badge bg="success">Understood ✅</Badge>;
      case "not understood":
        return <Badge bg="danger">Not Understood ❌</Badge>;
      default:
        return <Badge bg="secondary">No Feedback ❔</Badge>;
    }
  };

  const graphData = {
    labels: currentTopics.map((t) => t.title),
    datasets: [
      {
        label: "Students Not Understood",
        data: currentTopics.map((t) => getNotUnderstoodCount(t.id)),
        backgroundColor: "rgba(220,53,69,0.7)",
        borderColor: "rgba(220,53,69,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(220,53,69,0.9)",
      },
    ],
  };

  const graphOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y} students did NOT understand`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        precision: 0,
        ticks: { stepSize: 1 },
        title: { display: true, text: "Number of Students" },
      },
      x: {
        title: { display: true, text: "Topics" },
      },
    },
    onClick: (evt, elements) => {
      if (!elements.length) return;
      const idx = elements[0].index;
      const topic = currentTopics[idx];
      exportExcelForTopic(topic);
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="container py-4">
      <Card className="shadow mb-4">
        <Card.Body>
          <h2 className="mb-3"> Student Feedback Matrix</h2>
          <Form className="mb-3">
            <Form.Label>
              <strong>Select Course</strong>
            </Form.Label>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <Form.Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-50"
                disabled={loading}
              >
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </Form.Select>
              <Button
                onClick={fetchData}
                disabled={loading}
                variant="primary"
                className="flex-shrink-0"
              >
                {loading ? <Spinner animation="border" size="sm" /> : "Refresh"}
              </Button>

              <Button
                variant={showGraph ? "success" : "outline-success"}
                onClick={() => setShowGraph((v) => !v)}
                disabled={loading || students.length === 0 || topics.length === 0}
                className="flex-shrink-0"
              >
                {showGraph ? "Hide Graph" : "Show Graph"}
              </Button>
            </div>
          </Form>

          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && students.length === 0 && !error && (
            <p className="text-muted">No feedback data available yet.</p>
          )}

          {!loading && !showGraph && currentStudents.length > 0 && currentTopics.length > 0 && (
            <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
              <Table bordered hover className="text-center align-middle">
                <thead className="table-primary" style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr>
                    <th>Name</th>
                    <th>Roll No</th>
                    {currentTopics.map((topic, idx) => (
                      <th key={idx}>{topic.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student, sIdx) => (
                    <tr key={sIdx}>
                      <td>{student.name}</td>
                      <td>{student.rollnumber}</td>
                      {currentTopics.map((topic, tIdx) => {
                        const fb = student.feedbacks?.find(
                          (f) => f.topic_id === topic.id
                        );
                        const status = fb ? fb.status : "no feedback";
                        return <td key={tIdx}>{renderStatus(status)}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {!loading && showGraph && currentTopics.length > 0 && (
            <div style={{ height: "400px" }}>
              <Bar data={graphData} options={graphOptions} />
              <p className="mt-2 text-muted text-center small">
                Click a bar to download students who did NOT understand that topic.
              </p>
            </div>
          )}
        </Card.Body>

        {!showGraph && students.length > 0 && topics.length > 0 && (
          <Card.Footer className="bg-light d-flex flex-wrap justify-content-between align-items-center gap-3 px-3 py-2">
            <div className="d-flex align-items-center gap-2">
              <Button
                variant="outline-secondary"
                disabled={currentStudentPage === 1}
                onClick={() => setCurrentStudentPage((p) => p - 1)}
              >
                <ArrowLeft /> Prev Students
              </Button>
              <span className="text-muted">
                Page {currentStudentPage} / {Math.ceil(students.length / studentsPerPage)}
              </span>
              <Button
                variant="outline-secondary"
                disabled={currentStudentPage >= students.length / studentsPerPage}
                onClick={() => setCurrentStudentPage((p) => p + 1)}
              >
                Next Students <ArrowRight />
              </Button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Button
                variant="outline-secondary"
                disabled={currentTopicPage === 1}
                onClick={() => setCurrentTopicPage((p) => p - 1)}
              >
                <ArrowLeft /> Prev Topics
              </Button>
              <span className="text-muted">
                Page {currentTopicPage} / {Math.ceil(topics.length / topicsPerPage)}
              </span>
              <Button
                variant="outline-secondary"
                disabled={currentTopicPage >= topics.length / topicsPerPage}
                onClick={() => setCurrentTopicPage((p) => p + 1)}
              >
                Next Topics <ArrowRight />
              </Button>
            </div>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
}

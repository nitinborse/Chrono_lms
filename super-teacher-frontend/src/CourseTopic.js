import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CourseTopics() {
  const [topics, setTopics] = useState([]);
  const [course, setCourse] = useState("");
  const [feedbacks, setFeedbacks] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const rollNo = localStorage.getItem('rollnumber');


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
      setTopics(res.data.topics || []);
      setFeedbacks(res.data.feedbacks || {});
      setSubmitted(res.data.submitted || false);
    } catch {
      alert("Error loading topics");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (topicId, status) => {
    if (submitted) return;
    setFeedbacks((prev) => ({ ...prev, [topicId]: status }));
  };

  const handleSubmitFeedback = async () => {
    try {
      await api.post("/feedback-submit", { 
        feedbacks, 
        rollnumber: rollNo  // send rollnumber from localStorage here
      });
      setSubmitted(true);
      alert("Feedback submitted successfully!");
    } catch {
      alert("Error submitting feedback.");
    }
  };
  

  return (
    <div className="container py-4">
      <h3>Course Topics: {course}</h3>
      {loading ? (
        <p>Loading...</p>
      ) : topics.length === 0 ? (
        <p>No topics available yet.</p>
      ) : (
        <div className="row mt-3">
          {topics.map((topic) => (
            <div className="col-md-6 col-lg-4 mb-4" key={topic.id}>
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{topic.title}</h5>
                  <p className="card-text text-muted">Date: {topic.class_date}</p>
                  <div className="mt-auto">
                    <button
                      className={`btn btn-sm me-2 ${feedbacks[topic.id] === "understood"
                        ? "btn-success"
                        : "btn-outline-success"
                        }`}
                      disabled={submitted}
                      onClick={() => handleFeedback(topic.id, "understood")}
                    >
                      Understood
                    </button>
                    <button
                      className={`btn btn-sm ${feedbacks[topic.id] === "not understood"
                        ? "btn-danger"
                        : "btn-outline-danger"
                        }`}
                      disabled={submitted}
                      onClick={() => handleFeedback(topic.id, "not understood")}
                    >
                      Not Understood
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!submitted && topics.length > 0 && (
        <div className="text-center mt-4">
          <button className="btn btn-primary" onClick={handleSubmitFeedback}>
            Submit Feedback
          </button>
        </div>
      )}

      {submitted && (
        <div className="alert alert-success text-center mt-4">
          ✅ Feedback submitted successfully.
        </div>
      )}
    </div>
  );
}

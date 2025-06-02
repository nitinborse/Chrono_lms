// src/api.js
import axios from "axios";

const API_URL = "http://localhost:5000"; // change if deployed

const api = axios.create({
  baseURL: API_URL,
});

// Set JWT token header automatically
export function setToken(token) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

// Auth APIs
export const loginUser = (email, password) =>
  api.post("/login", { email, password });

export const registerUser = (data) =>
  api.post("/register", data);

// Student APIs
export const getTopics = () => api.get("/topics");
export const selectCourse = (course) => api.post("/select-course", { course });
export const sendFeedback = (topic_id, status) =>
  api.post("/feedback", { topic_id, status });

// Teacher APIs
export const getDashboard = () => api.get("/dashboard");
export const addTopic = (topic) => api.post("/add-topic", topic);

export default api;

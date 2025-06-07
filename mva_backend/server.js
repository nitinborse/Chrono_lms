const db = require('./db');
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
  origin: ['https://chrono-lms-frontend.onrender.com', 'http://localhost:3000' , 'http://localhost:5000'],
  headers: ["Content-Type"],
  credentials: true,
}));


app.use(express.json());


// JWT Middleware
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post("/register", async (req, res) => {
  const { name, email, password, role = "student", rollnumber } = req.body;

  try {
    const existing = await db.query(
      "SELECT * FROM users WHERE rollnumber = $1",
      [rollnumber]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Roll number already exists" });
    }

    await db.query(
      "INSERT INTO users (name, email, password, role, rollnumber) VALUES ($1, $2, $3, $4, $5)",
      [name, email, password, role, rollnumber]
    );

    res.sendStatus(201);
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Error registering user" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user || user.password !== password) {
      return res.status(403).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, rollnumber: user.rollnumber },
      process.env.JWT_SECRET
    );

    res.json({ token, role: user.role, name: user.name, rollnumber: user.rollnumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error" });
  }
});

app.post("/select-course", authenticateToken, async (req, res) => {
  const { course, teacher } = req.body;
  const userId = req.user.id;

  if (!course || !teacher) return res.status(400).json({ message: "Course and teacher are required" });

  try {
    const result = await db.query("SELECT * FROM user_courses WHERE user_id = $1", [userId]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: "Course already selected, cannot change" });
    }

    await db.query("INSERT INTO user_courses (user_id, course, teacher) VALUES ($1, $2, $3)", [userId, course, teacher]);
    res.status(200).json({ message: "Course selected successfully" });
  } catch (err) {
    console.error("Error selecting course:", err);
    res.status(500).json({ message: "Error selecting course" });
  }
});

app.post("/add-topic", authenticateToken, async (req, res) => {
  if (req.user.role !== "super") return res.sendStatus(403);
  const { course, title, class_date } = req.body;
  try {
    await db.query("INSERT INTO topics (course, title, class_date) VALUES ($1, $2, $3)", [course, title, class_date]);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding topic" });
  }
});

app.get("/courses", authenticateToken, async (req, res) => {
  try {
    let topics = [];
    let feedbacks = {};
    let submitted = false;

    const courseResult = await db.query("SELECT course FROM user_courses WHERE user_id = $1", [req.user.id]);
    const course = courseResult.rows[0]?.course;
    if (!course) return res.status(400).json({ message: "No course selected" });

    const topicResult = await db.query(
      "SELECT id, title, class_date FROM topics WHERE course = $1 AND class_date = CURRENT_DATE ORDER BY class_date ASC",
      [course]
    );
    topics = topicResult.rows;

    const topicIds = topics.map(t => t.id);
    if (topicIds.length > 0) {
      const feedbackResult = await db.query(
        `SELECT topic_id, status FROM feedback WHERE user_id = $1 AND topic_id = ANY($2)`,
        [req.user.id, topicIds]
      );

      feedbackResult.rows.forEach(fb => {
        feedbacks[fb.topic_id] = fb.status;
      });

      submitted = topicIds.every(id => feedbacks[id]);
    }

    res.json({ course, topics, feedbacks, submitted });
  } catch (err) {
    console.error("Error in GET /courses:", err);
    res.status(500).json({ message: "Error loading course data" });
  }
});

app.get("/topics", authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const result = await db.query("SELECT course FROM user_courses WHERE user_id = $1", [req.user.id]);
    const course = result.rows[0]?.course;
    if (!course) return res.status(400).json({ message: "No course selected" });

    const topics = await db.query("SELECT * FROM topics WHERE course = $1 AND class_date <= $2 ORDER BY class_date ASC", [course, today]);
    res.json(topics.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching topics" });
  }
});

app.post("/feedback", authenticateToken, async (req, res) => {
  const { topic_id, status } = req.body;
  const userId = req.user.id;

  try {
    await db.query(
      `INSERT INTO feedback (user_id, topic_id, status) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, topic_id) DO UPDATE SET status = EXCLUDED.status`,
      [userId, topic_id, status]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting feedback" });
  }
});

app.get("/enrolledstudents", authenticateToken, async (req, res) => {
  const { course, teacher } = req.query;
  if (!course || !teacher) return res.status(400).json({ message: "Course and teacher query params are required" });

  try {
    const result = await db.query(
      `SELECT u.name, u.rollnumber
       FROM users u
       JOIN user_courses uc ON u.id = uc.user_id
       WHERE uc.course = $1 AND uc.teacher = $2`,
      [course, teacher]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching enrolled students:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

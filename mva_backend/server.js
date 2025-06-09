require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("./db"); // your DB connection module

const app = express();
const PORT = process.env.PORT || 5000;

// Correct CORS setup
const allowedOrigins = [
  "https://chrono-lms-frontend.onrender.com",
  "http://localhost:3000"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// JWT Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Registration route
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

// Login route
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

// Select course route
// app.post("/select-course", authenticateToken, async (req, res) => {
//   const { course, teacher } = req.body;
//   const userId = req.user.id;

//   if (!course || !teacher) return res.status(400).json({ message: "Course and teacher are required" });

//   try {
//     const result = await db.query("SELECT * FROM user_courses WHERE user_id = $1", [userId]);
//     if (result.rows.length > 0) {
//       return res.status(400).json({ message: "Course already selected, cannot change" });
//     }

//     await db.query("INSERT INTO user_courses (user_id, course, teacher) VALUES ($1, $2, $3)", [userId, course, teacher]);
//     res.status(200).json({ message: "Course selected successfully" });
//   } catch (err) {
//     console.error("Error selecting course:", err);
//     res.status(500).json({ message: "Error selecting course" });
//   }
// });

app.post("/select-course", authenticateToken, async (req, res) => {
  const { course } = req.body;
  const userId = req.user.id;

  if (!course) return res.status(400).json({ message: "Course is required" });

  const teacherMap = {
    "Web Development": ["Nitin Borse", "Dipak Patil"],
    "Python": ["Nitin Paliwal", "Vipin Yadav"],
    "AI": ["Tanishka Mam", "Balwant Singht"],
    "DBMS": ["Durgesh Pandey", "Jay Khatri"],
    "Robotics": ["Vipin Yadav"],
    "Swift": ["Balwant Singht"]
  };

  const teachers = teacherMap[course];

  if (!teachers) return res.status(400).json({ message: "Invalid course name" });

  try {
    const existing = await db.query("SELECT * FROM user_courses WHERE user_id = $1", [userId]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Course already selected, cannot change" });
    }

    let assignedTeacher = teachers[0];

    if (teachers.length === 2) {
      const countResult = await db.query(
        `SELECT teacher, COUNT(*) as count
         FROM user_courses
         WHERE course = $1 AND teacher = ANY($2)
         GROUP BY teacher`,
        [course, teachers]
      );

      const counts = {
        [teachers[0]]: 0,
        [teachers[1]]: 0
      };

      countResult.rows.forEach(row => {
        counts[row.teacher] = parseInt(row.count);
      });

      assignedTeacher = counts[teachers[0]] <= counts[teachers[1]] ? teachers[0] : teachers[1];
    }

    await db.query(
      "INSERT INTO user_courses (user_id, course, teacher) VALUES ($1, $2, $3)",
      [userId, course, assignedTeacher]
    );

    res.status(200).json({ message: `Course selected successfully. Assigned to ${assignedTeacher}` });

  } catch (err) {
    console.error("Error selecting course:", err);
    res.status(500).json({ message: "Error selecting course" });
  }
});


// Add topic route (Super Teacher only)
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

// Get course topics and feedback
app.get("/courses", authenticateToken, async (req, res) => {
  try {
    let feedbacks = {};
    let submitted = false;

    const courseResult = await db.query("SELECT course FROM user_courses WHERE user_id = $1", [req.user.id]);
    const course = courseResult.rows[0]?.course;
    if (!course) return res.status(400).json({ message: "No course selected" });

    const topicResult = await db.query(
      "SELECT id, title, class_date FROM topics WHERE course = $1 AND class_date = CURRENT_DATE ORDER BY class_date ASC",
      [course]
    );
    const topics = topicResult.rows;

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

// Get all topics up to today
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

// Submit or update feedback
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

app.get('/attendance', authenticateToken, async (req, res) => {
  const course = req.query.course;
  const teacher = req.query.teacher;

  if (!course || !teacher) {
    return res.status(400).json({ message: "Course and teacher are required" });
  }

  try {
    const result = await db.query(
      `SELECT rollnumber, status FROM attendance 
       WHERE course = $1 AND teacher = $2 AND attendance_date = CURRENT_DATE`,
      [course, teacher]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/attendanceData', authenticateToken, async (req, res) => {
  const { attendance, course, date, teacher } = req.body;

  if (!course || !date || !Array.isArray(attendance) || !teacher) {
    return res.status(400).json({ message: "Course, teacher, date, and attendance data are required" });
  }

  try {
    for (const record of attendance) {
      const { rollnumber, status } = record;

      // UPSERT logic
      await db.query(
        `INSERT INTO attendance (rollnumber, status, attendance_date, course, teacher)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (rollnumber, attendance_date, course, teacher)
         DO UPDATE SET status = EXCLUDED.status`,
        [rollnumber, status, date, course, teacher]
      );
    }

    res.json({ message: "Attendance submitted/updated successfully" });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Get enrolled students for a course and teacher
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

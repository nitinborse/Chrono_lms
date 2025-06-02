// const express = require('express');
// require('dotenv').config();
// const db = require('./db');
// const cors = require('cors');

// const app = express();
// const allowedOrigins = [
//   'http://localhost:5173',                // local dev
//   'https://chronospheremva.netlify.app'  // Netlify deployed frontend
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps, curl)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     } else {
//       return callback(new Error('CORS not allowed from this origin: ' + origin), false);
//     }
//   },
//   credentials: true,
// }));

// app.use(express.json());

// // Fetch all users
// app.get('/users', async (req, res) => {
//   try {
//     const [results] = await db.query('SELECT * FROM alumni');
//     res.json(results);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Add user (simple example)
// app.post('/users', async (req, res) => {
//   const { name, email } = req.body;
//   try {
//     const [result] = await db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
//     res.status(201).json({ id: result.insertId, name, email });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Search alumni
// app.get('/api/alumni/search', async (req, res) => {
//   let query = req.query.q;  // <== use `let` instead of `const`
//   if (!query || query.length < 2) {
//     return res.status(400).json({ error: 'Query too short' });
//   }

//   // Convert slug (aditi-sinha) to full name format (Aditi Sinha)
//   if (query.includes('-')) {
//     query = query
//       .split('-')
//       .map(part => part.charAt(0).toUpperCase() + part.slice(1))
//       .join(' ');
//   }

//   try {
//     const likeQuery = `%${query}%`;
//     const [result] = await db.query(`
//       SELECT * FROM alumni 
//       WHERE 
//         name LIKE ? OR 
//         email LIKE ? OR 
//         mobile LIKE ? OR 
//         rollnumber LIKE ? OR 
//         city LIKE ?
//       LIMIT 1
//     `, [likeQuery, likeQuery, likeQuery, likeQuery, likeQuery]);

//     res.json(result[0] || {});
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Submit (Insert or Update) alumni form
// app.post('/api/alumni/submit', async (req, res) => {
//   const data = req.body;

//   const connection = await db.getConnection();
//   try {
//     const [existing] = await connection.query('SELECT id FROM alumni WHERE rollnumber = ?', [data.rollnumber]);

//     if (existing.length > 0) {
//       // UPDATE
//       const updateQuery = `
//         UPDATE alumni SET
//           name = ?, dob = ?, mobile = ?, whatsapp_no = ?, email = ?,
//           mva_passing_year = ?, address = ?, city = ?, marital_status = ?,
//           graduation = ?, graduation_year = ?, post_graduation = ?, post_graduation_year = ?,
//           fb_url = ?, insta_url = ?, linkedin_url = ?, x_url = ?, profession = ?,
//           designation = ?, company_name = ?, remark = ?, photo_url = ?, tech_expertise = ?,
//           domain_expertise = ?, mva_memories = ?, after_mva_life = ?
//         WHERE rollnumber = ?
//       `;

//       await connection.query(updateQuery, [
//         data.name, data.dob, data.mobile, data.whatsapp_no, data.email,
//         data.mva_passing_year, data.address, data.city, data.marital_status,
//         data.graduation, data.graduation_year, data.post_graduation, data.post_graduation_year,
//         data.fb_url, data.insta_url, data.linkedin_url, data.x_url, data.profession,
//         data.designation, data.company_name, data.remark, data.photo_url, data.tech_expertise,
//         data.domain_expertise, data.mva_memories, data.after_mva_life,
//         data.rollnumber
//       ]);
//     } else {
//       // INSERT
//       const insertQuery = `
//         INSERT INTO alumni (
//           name, dob, mobile, whatsapp_no, email,
//           mva_passing_year, rollnumber, address, city, marital_status,
//           graduation, graduation_year, post_graduation, post_graduation_year,
//           fb_url, insta_url, linkedin_url, x_url, profession,
//           designation, company_name, remark, photo_url, tech_expertise,
//           domain_expertise, mva_memories, after_mva_life
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;

//       await connection.query(insertQuery, [
//         data.name, data.dob, data.mobile, data.whatsapp_no, data.email,
//         data.mva_passing_year, data.rollnumber, data.address, data.city, data.marital_status,
//         data.graduation, data.graduation_year, data.post_graduation, data.post_graduation_year,
//         data.fb_url, data.insta_url, data.linkedin_url, data.x_url, data.profession,
//         data.designation, data.company_name, data.remark, data.photo_url, data.tech_expertise,
//         data.domain_expertise, data.mva_memories, data.after_mva_life
//       ]);
//     }

//     res.status(200).json({ message: 'Success' });
//   } catch (err) {
//     console.error('DB Error:', err);
//     res.status(500).json({ message: 'Error saving data' });
//   } finally {
//     connection.release();
//   }
// });

// // Login
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   if (!username || !password) {
//     return res.status(400).json({ message: 'Username and password are required' });
//   }

//   try {
//     const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

//     if (results.length === 0 || results[0].password_hash !== password) {
//       return res.status(401).json({ message: 'Invalid username or password' });
//     }

//     const user = results[0];
//     res.json({
//       message: 'Login successful',
//       user: {
//         id: user.id,
//         username: user.username,
//         role: user.role,
//         name: user.name
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Login error', error: err.message });
//   }
// });

// app.listen(process.env.PORT, () => {
//   console.log(`Server running on http://localhost:${process.env.PORT}`);
// });



const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

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
    // Check if rollnumber already exists
    const [existing] = await db.query(
      "SELECT * FROM users WHERE rollnumber = ?",
      [rollnumber]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Roll number already exists" });
    }

    // Insert user directly (without encrypting password)
    await db.query(
      "INSERT INTO users (name, email, password, role, rollnumber) VALUES (?, ?, ?, ?, ?)",
      [name, email, password, role, rollnumber]
    );

    res.sendStatus(201);
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login user
// Add rollnumber to JWT and response
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user || user.password !== password) {
      return res.status(403).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, rollnumber: user.rollnumber },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      rollnumber: user.rollnumber,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error" });
  }
});


// POST /select-course - student selects a course (only once)
app.post("/select-course", authenticateToken, async (req, res) => {
  const { course } = req.body;
  const userId = req.user.id;

  if (!course) return res.status(400).json({ message: "Course is required" });

  try {
    // Check if course already selected
    const [rows] = await db.query("SELECT * FROM user_courses WHERE user_id = ?", [userId]);

    if (rows.length > 0) {
      return res.status(400).json({ message: "Course already selected, cannot change" });
    }

    // Insert course
    await db.query("INSERT INTO user_courses (user_id, course) VALUES (?, ?)", [userId, course]);

    res.status(200).json({ message: "Course selected successfully" });
  } catch (err) {
    console.error("Error selecting course:", err);
    res.status(500).json({ message: "Error selecting course" });
  }
});

// Super teacher adds topic
app.post("/add-topic", authenticateToken, async (req, res) => {
  if (req.user.role !== "super") return res.sendStatus(403);

  const { course, title, class_date } = req.body;
  try {
    await db.query("INSERT INTO topics (course, title, class_date) VALUES (?, ?, ?)", [course, title, class_date]);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding topic" });
  }
});

// GET /courses - return topics and feedback for logged in student
app.get("/courses", authenticateToken, async (req, res) => {
  try {
    let topics = [];
    let feedbacks = {};
    let submitted = false;

    // Get user's selected course
    const [userCourseRows] = await db.query(
      "SELECT course FROM user_courses WHERE user_id = ?",
      [req.user.id]
    );
    const course = userCourseRows[0]?.course;

    if (!course) {
      return res.status(400).json({ message: "No course selected" });
    }

    // ✅ Get only today's topics for that course
    const [topicResult] = await db.query(
      "SELECT id, title, class_date FROM topics WHERE course = ? AND class_date = CURDATE() ORDER BY class_date ASC",
      [course]
    );
    topics = topicResult;

    const topicIds = topics.map(t => t.id);
    if (topicIds.length > 0) {
      // ✅ Fetch feedbacks only for today's topic(s)
      const [feedbackResult] = await db.query(
        "SELECT topic_id, status FROM feedback WHERE user_id = ? AND topic_id IN (?)",
        [req.user.id, topicIds]
      );

      feedbackResult.forEach(fb => {
        feedbacks[fb.topic_id] = fb.status;
      });

      // ✅ Consider submitted if feedback exists for all today's topics
      submitted = topicIds.every(id => feedbacks[id]);
    }

    res.json({ course, topics, feedbacks, submitted });
  } catch (err) {
    console.error("❌ Error in GET /courses:", err.message);
    res.status(500).json({ message: "Error loading course data" });
  }
});

// GET /topics - topics for logged in student (class_date <= today)
app.get("/topics", authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Get user's course
    const [userCourseRows] = await db.query("SELECT course FROM user_courses WHERE user_id = ?", [req.user.id]);
    const course = userCourseRows[0]?.course;
    if (!course) return res.status(400).json({ message: "No course selected" });

    const [topics] = await db.query(
      "SELECT * FROM topics WHERE course = ? AND class_date <= ? ORDER BY class_date ASC",
      [course, today]
    );
    res.json(topics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching topics" });
  }
});

app.post("/add-topics", authenticateToken, async (req, res) => {
  const { course, title, class_date } = req.body;

  if (!course || !title || !class_date) {
    return res.status(400).json({ message: "Course, title and class_date are required" });
  }

  try {
    const sql = "INSERT INTO topics (course, title, class_date) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [course, title, class_date]);

    res.status(201).json({ message: "Topic added successfully", topicId: result.insertId });
  } catch (err) {
    console.error("Error adding topic:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
// GET /enrolledstudents?course=CourseName
app.get("/enrolledstudents", authenticateToken, async (req, res) => {
  const { course, teacher } = req.query;

  if (!course || !teacher) {
    return res.status(400).json({ message: "Course and teacher query params are required" });
  }

  try {
    const sql = `
      SELECT u.name, u.rollnumber
      FROM users u
      JOIN user_courses uc ON u.id = uc.user_id
      WHERE uc.course = ? AND uc.teacher = ?
    `;
    const [rows] = await db.query(sql, [course, teacher]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching enrolled students:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/enrolled-students
// app.get('/enrolled-students', authenticateToken, async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       `SELECT id, name, email, roll_number, course FROM users WHERE role = 'student' AND course IS NOT NULL`
//     );

//     res.json(rows);
//   } catch (err) {
//     console.error('Error fetching enrolled students:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// POST /feedback - submit feedback for a topic
app.post("/feedback", authenticateToken, async (req, res) => {
  const { topic_id, status } = req.body; // status: e.g. 'understood' or 'not understood'
  try {
    await db.query(
      "INSERT INTO feedback (user_id, topic_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?",
      [req.user.id, topic_id, status, status]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting feedback" });
  }
});

// Super teacher dashboard: list all students with feedbacks
app.get("/dashboard", authenticateToken, async (req, res) => {
  if (req.user.role !== "super") return res.sendStatus(403);

  try {
    const [students] = await db.query(
      `SELECT u.id, u.name, uc.course, t.title, f.status FROM users u
       LEFT JOIN user_courses uc ON u.id = uc.user_id
       LEFT JOIN feedback f ON u.id = f.user_id
       LEFT JOIN topics t ON f.topic_id = t.id
       WHERE u.role = 'student'
       ORDER BY u.name ASC`
    );
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading dashboard" });
  }
});

app.post("/feedback-submit", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const tokenRollnumber = req.user.rollnumber;           // from token
  const bodyRollnumber = req.body.rollnumber || null;    // from frontend

  const rollnumber = tokenRollnumber || bodyRollnumber;  // fallback if one is missing
  const feedbacks = req.body.feedbacks;

  if (!rollnumber) {
    return res.status(400).json({ error: "Rollnumber is required" });
  }

  const values = Object.entries(feedbacks); // [ [topicId, status], ... ]

  try {
    const insertPromises = values.map(([topicId, status]) =>
      db.query(
        "INSERT INTO feedback (user_id, topic_id, status, user_rollnumber) VALUES (?, ?, ?, ?)",
        [userId, topicId, status, rollnumber]   // ✅ now always defined
      )
    );

    await Promise.all(insertPromises);
    res.status(200).json({ message: "Feedback submitted" });
  } catch (err) {
    console.error("Feedback submission error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Add this to your Express server (e.g., server.js)
app.post("/feedback", authenticateToken, async (req, res) => {
  const { topic_id, status } = req.body;
  const userId = req.user.id;
  const user_rollnumber = req.user.user_rollnumber;

  try {
    await db.query(
      "INSERT INTO feedback (user_id, topic_id, status, user_rollnumber) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, rollnumber = ?",
      [userId, topic_id, status, rollnumber, status, user_rollnumber]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting feedback" });
  }
});
app.get("/teacherdashboard", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "super") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const [rows] = await db.query(`
     SELECT users.id, users.name, users.email, uc.course, 
       t.title, t.id as topic_id, t.class_date, f.status
FROM users
JOIN user_courses uc ON uc.user_id = users.id
LEFT JOIN topics t ON t.course = uc.course
LEFT JOIN feedback f ON f.user_id = users.id AND f.topic_id = t.id
WHERE users.role = 'student'
ORDER BY users.name, t.class_date

    `);

    res.json(rows);
  } catch (err) {
    console.error("Teacher dashboard error:", err);
    res.status(500).json({ message: "Error fetching dashboard" });
  }
});

app.get("/feedbackmatrix", authenticateToken, async (req, res) => {
  const { course } = req.query;

  if (!course) {
    return res.status(400).json({ error: "Course is required" });
  }

  try {
    // 1. Get topics for the course
    const [topics] = await db.query(
      "SELECT id, title FROM topics WHERE course = ? ORDER BY class_date ASC",
      [course]
    );

    // 2. Get students enrolled in the course
    const [studentsRaw] = await db.query(
      "SELECT id, name, rollnumber FROM users u JOIN user_courses uc ON u.id = uc.user_id WHERE u.role = 'student' AND uc.course = ?",
      [course]
    );

    const studentIds = studentsRaw.map((s) => s.id);
    if (studentIds.length === 0) {
      return res.json({ topics, students: [] });
    }

    // 3. Get feedback entries
    const [feedbacks] = await db.query(
      `SELECT user_id, topic_id, status 
       FROM feedback 
       WHERE user_id IN (?) AND topic_id IN (?)`,
      [studentIds, topics.map((t) => t.id)]
    );

    // 4. Group feedback by student
    const feedbackMap = {};
    feedbacks.forEach(({ user_id, topic_id, status }) => {
      if (!feedbackMap[user_id]) feedbackMap[user_id] = [];
      feedbackMap[user_id].push({ topic_id, status });
    });

    // 5. Build final structure
    const students = studentsRaw.map((student) => ({
      name: student.name,
      rollnumber: student.rollnumber,
      feedbacks: feedbackMap[student.id] || [],
    }));

    res.json({ topics, students });
  } catch (err) {
    console.error("Error in /feedbackmatrix:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get('/attendance', authenticateToken, async (req, res) => {
  const course = req.query.course;
  const teacher = req.query.teacher;

  if (!course || !teacher) {
    return res.status(400).json({ message: "Course and teacher are required" });
  }

  try {
    const [rows] = await db.query(
      `SELECT rollnumber, status FROM attendance 
       WHERE course = ? AND teacher = ? AND attendance_date = CURRENT_DATE`,
      [course, teacher]
    );
    res.json(rows);
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
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), teacher = VALUES(teacher)`,
        [rollnumber, status, date, course, teacher]
      );
    }

    res.json({ message: "Attendance submitted/updated successfully" });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


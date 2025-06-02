// src/components/CourseSelector.js
import React from "react";
import styles from "./Dashboard.module.css";

export default function CourseSelector({ courses, onSelect }) {
  return (
    <div>
      <h3>Select your course:</h3>
      <div className={styles.courseGrid}>
        {courses.map((c) => (
          <button
            key={c}
            className={styles.courseBtn}
            onClick={() => onSelect(c)}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

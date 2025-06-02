// src/components/TopicItem.js
import React from "react";
import styles from "./Dashboard.module.css";

export default function TopicItem({ topic, feedback, onFeedback }) {
  return (
    <div className={styles.topicItem}>
      <div>{topic.title}</div>
      <div>
        <button
          className={`${styles.feedbackBtn} ${
            feedback === "understood" ? styles.green : ""
          }`}
          onClick={() => onFeedback(topic.id, "understood")}
          aria-label="Understood"
        >
          ✅
        </button>
        <button
          className={`${styles.feedbackBtn} ${
            feedback === "not understood" ? styles.red : ""
          }`}
          onClick={() => onFeedback(topic.id, "not understood")}
          aria-label="Not understood"
        >
          ❌
        </button>
      </div>
    </div>
  );
}

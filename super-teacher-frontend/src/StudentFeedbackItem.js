// src/components/StudentFeedbackItem.js
import React from "react";

export default function StudentFeedbackItem({ feedback }) {
  return (
    <li>
      {feedback.topic_title} :{" "}
      <span
        style={{
          color: feedback.status === "understood" ? "green" : "red",
        }}
      >
        {feedback.status}
      </span>
    </li>
  );
}

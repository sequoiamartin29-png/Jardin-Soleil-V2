import React from "react";

export default function EmptyState({
  title,
  message,
  icon = "🌿",
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 30px",
        background: "#FFFDF8",
        borderRadius: "24px",
        border: "1px solid #ECE4D8",
      }}
    >
      <div
        style={{
          fontSize: "60px",
          marginBottom: "18px",
        }}
      >
        {icon}
      </div>

      <h2
        style={{
          color: "#43523D",
          marginBottom: "10px",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          color: "#777",
          maxWidth: "500px",
          margin: "0 auto",
          lineHeight: 1.6,
        }}
      >
        {message}
      </p>
    </div>
  );
}

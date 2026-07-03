import React from "react";

export default function Badge({
  children,
  color = "#7F9B74",
}) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 14px",
        borderRadius: "999px",
        background: color,
        color: "white",
        fontSize: "14px",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

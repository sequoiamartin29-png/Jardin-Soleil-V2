import React from "react";

export default function ProgressRing({
  value = 0,
  label = "Progress",
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          border: "10px solid #AFC7A0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          fontWeight: "bold",
          color: "#43523D",
          background: "#FFFDF8",
        }}
      >
        {value}%
      </div>

      <p
        style={{
          marginTop: "12px",
          fontWeight: 600,
        }}
      >
        {label}
      </p>
    </div>
  );
}

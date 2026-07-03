import React from "react";

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f2ef",
        color: "#3d4a34",
        fontFamily: "Georgia, serif",
        padding: "40px"
      }}
    >
      <h1>🌿 Jardin Soleil</h1>

      <h2>Garden Command Center</h2>

      <p>
        Welcome home, Sequoia.
      </p>

      <hr />

      <h3>Today's Dashboard</h3>

      <ul>
        <li>🌤 Weather: Coming Soon</li>
        <li>🌳 Orchard Status</li>
        <li>🌿 Garden Tasks</li>
        <li>📝 Garden Log</li>
        <li>📸 Gallery</li>
        <li>🎮 Word Search</li>
      </ul>

      <hr />

      <h3>Jardin Soleil</h3>

      <p>
        Official records begin July 1, 2026.
      </p>
    </div>
  );
}

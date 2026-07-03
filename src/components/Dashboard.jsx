import React from "react";
import { starterTasks } from "../data/jardinData";

export default function Dashboard() {
  return (
    <div
      style={{
        background: "#fffdf8",
        borderRadius: "20px",
        padding: "30px",
        boxShadow: "0 10px 25px rgba(0,0,0,.08)",
        marginTop: "30px"
      }}
    >
      <h2>🌸 Good Morning, Sequoia</h2>

      <p>
        Welcome back to <strong>Jardin Soleil</strong>.
      </p>

      <hr />

      <h3>Today's Tasks</h3>

      <ul>
        {starterTasks.map((task, index) => (
          <li key={index}>{task}</li>
        ))}
      </ul>

      <hr />

      <h3>Garden At A Glance</h3>

      <div>
        🌳 Orchard: 14 Trees
      </div>

      <div>
        🌿 Garden: Active
      </div>

      <div>
        📅 Records Started: July 1, 2026
      </div>

      <div>
        🌸 Theme: French Chalet
      </div>
    </div>
  );
}

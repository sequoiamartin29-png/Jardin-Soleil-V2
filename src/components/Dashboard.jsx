import React from "react";
import { plants } from "../data/plants";

export default function Dashboard({ journalEntries = [] }) {
  const totalPlants = plants.length;

  const averageHealth =
    plants.length > 0
      ? Math.round(
          plants.reduce((sum, plant) => sum + (plant.health || 100), 0) /
            plants.length
        )
      : 0;

  const orchardTrees = plants.filter(
    (plant) => plant.category === "Orchard"
  ).length;

  const citrusTrees = plants.filter(
    (plant) => plant.category === "Citrus"
  ).length;

  const recentEntries = journalEntries.slice(0, 5);

  const cardStyle = {
    background: "#FFFDF9",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid #ECE4D8",
    boxShadow: "0 10px 24px rgba(0,0,0,.08)"
  };

  return (
    <section style={{ marginTop: "40px" }}>
      <h1
        style={{
          color: "#5D6B46",
          fontSize: "46px",
          marginBottom: "8px"
        }}
      >
        🌿 Jardin Soleil Command Center
      </h1>

      <p
        style={{
          color: "#777",
          fontSize: "18px",
          marginBottom: "35px"
        }}
      >
        Welcome back. Here's the current status of your garden.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "18px"
        }}
      >
        <div style={cardStyle}>
          <h3>🌳 Total Plants</h3>
          <h1>{totalPlants}</h1>
        </div>

        <div style={cardStyle}>
          <h3>❤️ Average Health</h3>
          <h1>{averageHealth}%</h1>
        </div>

        <div style={cardStyle}>
          <h3>🌳 Orchard Trees</h3>
          <h1>{orchardTrees}</h1>
        </div>

        <div style={cardStyle}>
          <h3>🍋 Citrus Trees</h3>
          <h1>{citrusTrees}</h1>
        </div>

        <div style={cardStyle}>
          <h3>📝 Journal Entries</h3>
          <h1>{journalEntries.length}</h1>
        </div>

        <div style={cardStyle}>
          <h3>📅 Last Update</h3>
          <p>
            {journalEntries.length
              ? new Date(journalEntries[0].createdAt).toLocaleString()
              : "No entries yet"}
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: "35px",
          ...cardStyle
        }}
      >
        <h2 style={{ color: "#5D6B46" }}>
          🌿 Recent Garden Activity
        </h2>

        {recentEntries.length === 0 ? (
          <p>No journal entries yet.</p>
        ) : (
          recentEntries.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: "14px 0",
                borderBottom: "1px solid #ECE4D8"
              }}
            >
              <strong>{entry.type}</strong>

              <p style={{ margin: "6px 0" }}>
                {entry.notes || "No notes"}
              </p>

              <small>
                {new Date(entry.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

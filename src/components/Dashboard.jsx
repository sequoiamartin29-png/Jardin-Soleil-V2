import React from "react";
import { useGarden } from "../context/GardenContext";

export default function Dashboard() {
  const { stats } = useGarden();

  const cardStyle = {
    background: "#FFFDF9",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid #ECE4D8",
    boxShadow: "0 10px 24px rgba(0,0,0,.08)"
  };

  return (
    <section style={{ marginTop: "40px" }}>
      <h1 style={{ color: "#5D6B46", fontSize: "46px" }}>
        🌞 Good Morning, Sequoia
      </h1>

      <p style={{ color: "#777", fontSize: "18px", marginBottom: "35px" }}>
        Welcome back to Jardin Soleil. Here is today’s garden brief.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "18px"
        }}
      >
        <div style={cardStyle}>
          <h3>🌿 Total Plants</h3>
          <h1>{stats.totalPlants}</h1>
        </div>

        <div style={cardStyle}>
          <h3>❤️ Garden Health</h3>
          <h1>{stats.averageHealth}%</h1>
        </div>

        <div style={cardStyle}>
          <h3>🌳 Orchard</h3>
          <h1>{stats.orchardCount}</h1>
        </div>

        <div style={cardStyle}>
          <h3>🍋 Citrus</h3>
          <h1>{stats.citrusCount}</h1>
        </div>

        <div style={cardStyle}>
          <h3>📝 Journal Entries</h3>
          <h1>{stats.journalCount}</h1>
        </div>

        <div style={cardStyle}>
          <h3>📸 Photos</h3>
          <h1>{stats.photoCount}</h1>
        </div>
      </div>

      <div style={{ marginTop: "35px", ...cardStyle }}>
        <h2 style={{ color: "#5D6B46" }}>🌿 Morning Garden Brief</h2>

        <ul style={{ lineHeight: "2" }}>
          <li>Garden health is currently {stats.averageHealth}%.</li>
          <li>{stats.totalPlants} plants are being tracked.</li>
          <li>{stats.journalCount} journal entries saved.</li>
          <li>{stats.photoCount} photos saved.</li>
          <li>
            {stats.plantsNeedingAttention.length} plants need extra attention.
          </li>
        </ul>
      </div>

      <div style={{ marginTop: "35px", ...cardStyle }}>
        <h2 style={{ color: "#5D6B46" }}>📅 Recent Activity</h2>

        {stats.recentEntries.length === 0 ? (
          <p>No recent entries yet.</p>
        ) : (
          stats.recentEntries.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: "14px 0",
                borderBottom: "1px solid #ECE4D8"
              }}
            >
              <strong>{entry.type}</strong>
              <p>{entry.notes || "No notes added."}</p>
              <small>{new Date(entry.createdAt).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

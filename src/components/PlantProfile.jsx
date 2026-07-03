import React, { useMemo } from "react";

const cardStyle = {
  background: "#FFFDF9",
  borderRadius: "24px",
  padding: "22px",
  border: "1px solid #EFE5D8",
  boxShadow: "0 10px 24px rgba(0,0,0,.07)"
};

export default function PlantProfile({ plant, journalEntries = [] }) {
  const history = useMemo(() => {
    if (!plant) return [];
    return journalEntries.filter((entry) => entry.plantId === plant.id);
  }, [journalEntries, plant]);

  if (!plant) {
    return (
      <section style={{ marginTop: "40px" }} className="card">
        <h2>🌿 No Plant Selected</h2>
        <p>Go to the Plant Directory and choose a plant profile.</p>
      </section>
    );
  }

  const latestEntry = history[0];

  const countType = (keyword) =>
    history.filter((entry) => entry.type.includes(keyword)).length;
    const health =
    latestEntry?.health ??
    plant.health ??
    100;

  return (
    <section style={{ marginTop: "40px" }}>
      <div
        style={{
          background: "linear-gradient(135deg,#FFF9F3,#F8F3EC)",
          borderRadius: "32px",
          padding: "34px",
          border: "1px solid #EFE5D8",
          boxShadow: "0 12px 30px rgba(0,0,0,.08)"
        }}
      >
        <h1 style={{ margin: 0, color: "#5D6B46", fontSize: "44px" }}>
          🌿 {plant.name}
        </h1>

        <p style={{ color: "#777", fontSize: "20px" }}>
          {plant.type} • {plant.location}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "18px",
            marginTop: "30px"
          }}
        >
          <div style={cardStyle}>
            <h3>❤️ Health</h3>
            <h2>{health}%</h2>
          </div>

          <div style={cardStyle}>
            <h3>📝 Journal Entries</h3>
            <h2>{history.length}</h2>
          </div>

          <div style={cardStyle}>
            <h3>💧 Waterings</h3>
            <h2>{countType("Water")}</h2>
          </div>

          <div style={cardStyle}>
            <h3>🌱 Fertilizer</h3>
            <h2>{countType("Fertilizer")}</h2>
          </div>
                    <div style={cardStyle}>
            <h3>🍎 Harvests</h3>
            <h2>{countType("Harvest")}</h2>
          </div>

          <div style={cardStyle}>
            <h3>🐛 Pest Reports</h3>
            <h2>{countType("Pest")}</h2>
          </div>

          <div style={cardStyle}>
            <h3>☀️ Sun</h3>
            <p>{plant.sun}</p>
          </div>

          <div style={cardStyle}>
            <h3>💧 Water Needs</h3>
            <p>{plant.water}</p>
          </div>
        </div>

        <div
          style={{
            marginTop: "32px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "20px"
          }}
        >
          <div style={cardStyle}>
            <h3>🌸 Bloom Window</h3>
            <p>{plant.bloom}</p>
          </div>

          <div style={cardStyle}>
            <h3>🍽 Harvest Window</h3>
            <p>{plant.harvest}</p>
          </div>

          <div style={cardStyle}>
            <h3>📸 Photos</h3>
            <p>{plant.photos?.length || 0} saved photos</p>
          </div>
                    <div style={cardStyle}>
            <h3>🌱 Fertilizer</h3>
            <p>{plant.fertilizer}</p>
          </div>
        </div>

        <div
          style={{
            marginTop: "32px",
            ...cardStyle
          }}
        >
          <h3>📅 Recent Activity</h3>

          {history.length === 0 ? (
            <p>No journal entries yet for this plant.</p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {history.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    padding: "16px",
                    borderRadius: "18px",
                    background: "#F8F3EC"
                  }}
                >
                  <strong>{entry.type}</strong>
                  <p>{new Date(entry.createdAt).toLocaleString()}</p>
                  <p>{entry.notes || "No notes added."}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

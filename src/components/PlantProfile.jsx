import React from "react";
import { useGarden } from "../context/GardenContext";

const cardStyle = {
  background: "#FFFDF9",
  borderRadius: "24px",
  padding: "22px",
  border: "1px solid #ECE4D8",
  boxShadow: "0 10px 24px rgba(0,0,0,.08)"
};

export default function PlantProfile() {
  const {
    selectedPlant,
    getEntriesForPlant,
    getPhotosForPlant,
  } = useGarden();

  if (!selectedPlant) {
    return (
      <section style={{ marginTop: "40px" }}>
        <div style={cardStyle}>
          <h2>🌿 No Plant Selected</h2>
          <p>
            Choose a plant from the Orchard, Plant Directory, or Garden Map.
          </p>
        </div>
      </section>
    );
  }

  const history = getEntriesForPlant(selectedPlant.id);
  const photos = getPhotosForPlant(selectedPlant.id);

  const count = (keyword) =>
    history.filter((entry) =>
      entry.type.toLowerCase().includes(keyword.toLowerCase())
    ).length;

  return (
    <section style={{ marginTop: "40px" }}>
      <h1 style={{ color: "#5D6B46", fontSize: "46px" }}>
        🌿 {selectedPlant.name}
      </h1>

      <p style={{ color: "#777", fontSize: "18px" }}>
        {selectedPlant.type}
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
          <h1>{selectedPlant.health}%</h1>
        </div>

        <div style={cardStyle}>
          <h3>📝 Journal</h3>
          <h1>{history.length}</h1>
        </div>

        <div style={cardStyle}>
          <h3>📸 Photos</h3>
          <h1>{photos.length}</h1>
        </div>

        <div style={cardStyle}>
          <h3>💧 Waterings</h3>
          <h1>{count("Water")}</h1>
        </div>

        <div style={cardStyle}>
          <h3>🌱 Fertilizer</h3>
          <h1>{count("Fertilizer")}</h1>
        </div>

        <div style={cardStyle}>
          <h3>🍎 Harvests</h3>
          <h1>{count("Harvest")}</h1>
        </div>
      </div>

      <div style={{ marginTop: "35px", ...cardStyle }}>
        <h2>📅 Plant Timeline</h2>

        {history.length === 0 ? (
          <p>No journal history yet.</p>
        ) : (
          history.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: "14px 0",
                borderBottom: "1px solid #ECE4D8"
              }}
            >
              <strong>{entry.type}</strong>

              <p>{entry.notes || "No notes added."}</p>

              <small>
                {new Date(entry.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "35px", ...cardStyle }}>
        <h2>🌱 Plant Information</h2>

        <p>
          <strong>Category:</strong> {selectedPlant.category}
        </p>

        <p>
          <strong>Location:</strong> {selectedPlant.location}
        </p>

        <p>
          <strong>Sun:</strong> {selectedPlant.sun}
        </p>

        <p>
          <strong>Water:</strong> {selectedPlant.water}
        </p>

        <p>
          <strong>Bloom:</strong> {selectedPlant.bloom}
        </p>

        <p>
          <strong>Harvest:</strong> {selectedPlant.harvest}
        </p>
      </div>
    </section>
  );
}

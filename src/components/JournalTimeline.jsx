import React from "react";
import { useGarden } from "../context/GardenContext";

export default function JournalTimeline({ entries = [] }) {
  const { plants } = useGarden();
  const getPlantName = (entry) => {
    return plants.find((plant) => plant.id === entry.plantId)?.name || entry.deletedPlantName || "Jardin Soleil";
  };

  return (
    <section style={{ marginTop: "50px" }}>
      <h2 style={{ fontSize: "42px", color: "#5D6B46" }}>
        📅 Journal Timeline
      </h2>

      <p style={{ color: "#777", fontSize: "18px", marginBottom: "30px" }}>
        Every saved garden entry appears here in newest-first order.
      </p>

      {entries.length === 0 ? (
        <div className="card">
          <h3>🌿 No journal entries yet</h3>
          <p>
            Add your first watering, harvest, pest note, photo note, or garden
            observation from the New Journal Entry page.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "18px" }}>
          {entries.map((entry) => (
            <article key={entry.id} className="card">
              <h3>{entry.type}</h3>

              <p>
                <strong>Plant:</strong> {getPlantName(entry)}{entry.plantDeleted ? " (historical — plant deleted)" : ""}
              </p>

              <p>
                <strong>Health:</strong> {entry.health}%
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(entry.createdAt).toLocaleString()}
              </p>

              <p>{entry.notes || "No notes added."}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

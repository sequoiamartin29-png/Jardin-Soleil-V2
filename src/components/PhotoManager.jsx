import React, { useMemo, useState } from "react";
import { plants } from "../data/plants";

export default function PhotoManager() {
  const [selectedPlant, setSelectedPlant] = useState("All");
  const [photos, setPhotos] = useState([]);

  const filteredPhotos = useMemo(() => {
    if (selectedPlant === "All") return photos;
    return photos.filter((photo) => photo.plantId === selectedPlant);
  }, [photos, selectedPlant]);

  const handleUpload = (event) => {
    const files = Array.from(event.target.files || []);

    const newPhotos = files.map((file) => ({
      id: Date.now() + Math.random(),
      plantId: selectedPlant === "All" ? null : selectedPlant,
      name: file.name,
      date: new Date().toISOString(),
      url: URL.createObjectURL(file)
    }));

    setPhotos((current) => [...newPhotos, ...current]);
  };

  return (
    <section style={{ marginTop: "40px" }}>
      <h1
        style={{
          color: "#5D6B46",
          fontSize: "46px",
          marginBottom: "10px"
        }}
      >
        📸 Photo Manager
      </h1>

      <p
        style={{
          color: "#777",
          marginBottom: "30px"
        }}
      >
        Organize every photo from Jardin Soleil by plant.
      </p>

      <div
        style={{
          display: "flex",
          gap: "18px",
          flexWrap: "wrap",
          marginBottom: "30px"
        }}
      >
        <select
          value={selectedPlant}
          onChange={(e) => setSelectedPlant(e.target.value)}
          style={{
            padding: "14px",
            borderRadius: "14px"
          }}
        >
          <option value="All">All Plants</option>

          {plants.map((plant) => (
            <option
              key={plant.id}
              value={plant.id}
            >
              {plant.name}
            </option>
          ))}
        </select>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
        />
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="card">
          <h2>No Photos Yet</h2>

          <p>
            Upload your first Jardin Soleil photo to begin building your
            visual garden history.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px"
          }}
        >
          {filteredPhotos.map((photo) => (
            <article
              key={photo.id}
              style={{
                background: "#FFFDF9",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid #ECE4D8",
                boxShadow:
                  "0 8px 20px rgba(0,0,0,.08)"
              }}
            >
              <img
                src={photo.url}
                alt={photo.name}
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover"
                }}
              />

              <div style={{ padding: "18px" }}>
                <strong>{photo.name}</strong>

                <p
                  style={{
                    color: "#777",
                    marginTop: "8px"
                  }}
                >
                  {new Date(photo.date).toLocaleString()}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

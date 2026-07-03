import React from "react";
import { plants } from "../data/plants";

const badgeColors = {
  Healthy: "#6BA368",
  Growing: "#8FA06A",
  Producing: "#D9A441",
  Fruiting: "#D9A441",
  Monitoring: "#C98F48",
  Recovering: "#C46C6C",
  "New Arrival": "#6C9EC4"
};

const getIcon = (type = "") => {
  if (type.includes("Apple")) return "🍎";
  if (type.includes("Pear")) return "🍐";
  if (type.includes("Lemon")) return "🍋";
  if (type.includes("Mandarin")) return "🍊";
  if (
    type.includes("Peach") ||
    type.includes("Apricot") ||
    type.includes("Nectarine")
  )
    return "🍑";
  if (type.includes("Cherry")) return "🍒";
  if (type.includes("Plum")) return "🟣";
  return "🌳";
};

export default function Orchard({ onSelectPlant }) {
  const orchardPlants = plants.filter(
    (plant) =>
      plant.category === "Orchard" ||
      plant.category === "Citrus"
  );

  return (
    <section style={{ marginTop: "40px" }}>
      <h1
        style={{
          color: "#5D6B46",
          fontSize: "46px",
          marginBottom: "10px"
        }}
      >
        🌳 Jardin Soleil Orchard
      </h1>

      <p
        style={{
          color: "#777",
          marginBottom: "35px",
          fontSize: "18px"
        }}
      >
        Every fruit tree and citrus currently growing in Jardin Soleil.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
          gap: "22px"
        }}
      >
        {orchardPlants.map((plant) => (
          <article
            key={plant.id}
            style={{
              background: "#FFFDF9",
              borderRadius: "28px",
              overflow: "hidden",
              border: "1px solid #ECE4D8",
              boxShadow: "0 10px 24px rgba(0,0,0,.08)"
            }}
          >
            <div
              style={{
                height: "170px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "72px",
                background:
                  "linear-gradient(135deg,#F9E6EB,#EEF3E3)"
              }}
            >
              {getIcon(plant.type)}
            </div>

            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px"
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      color: "#53633F"
                    }}
                  >
                    {plant.name}
                  </h2>

                  <p
                    style={{
                      marginTop: "6px",
                      color: "#777"
                    }}
                  >
                    {plant.type}
                  </p>
                </div>

                <span
                  style={{
                    background:
                      badgeColors[plant.status] ||
                      "#8FA06A",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    height: "fit-content"
                  }}
                >
                  {plant.status}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: "12px",
                  marginTop: "20px"
                }}
              >
                <div className="card">
                  ❤️ {plant.health}%
                </div>

                <div className="card">
                  📍 {plant.location}
                </div>

                <div className="card">
                  ☀️ {plant.sun}
                </div>

                <div className="card">
                  💧 {plant.water}
                </div>
              </div>

              <button
                onClick={() => onSelectPlant(plant)}
                style={{
                  marginTop: "22px",
                  width: "100%",
                  padding: "14px",
                  borderRadius: "16px",
                  border: "none",
                  background: "#8FA06A",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                🌿 Open Plant Profile
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

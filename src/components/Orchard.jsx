import React from "react";
import { plants } from "../data/plants";

const orchardPlants = plants.filter(
  (plant) =>
    plant.category === "Orchard" ||
    plant.category === "Citrus"
);

const statusColors = {
  Healthy: "#8FBF8F",
  Growing: "#A7C97A",
  Producing: "#F4C26B",
  Fruiting: "#F4C26B",
  Monitoring: "#D7B36A",
  Recovery: "#D99999",
  Recovering: "#D99999",
  "New Arrival": "#8FC8C7"
};

export default function Orchard() {
  return (
    <section
      style={{
        marginTop: "40px"
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg,#FFF9F3,#F8F3EC)",
          borderRadius: "30px",
          padding: "35px",
          border: "1px solid #EFE5D8",
          boxShadow: "0 12px 30px rgba(0,0,0,.08)"
        }}
      >
        <h2
          style={{
            color: "#5D6B46",
            fontSize: "42px"
          }}
        >
          🌳 Jardin Soleil Orchard
        </h2>

        <p
          style={{
            color: "#777",
            fontSize: "18px",
            marginBottom: "35px"
          }}
        >
          Living database of every fruit tree and citrus in Jardin Soleil.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))",
            gap: "24px"
          }}
        >
                    {orchardPlants.map((plant) => {
            const badgeColor =
              statusColors[plant.status] || "#B8C8A0";

            const icon =
              plant.type.includes("Apple")
                ? "🍎"
                : plant.type.includes("Pear")
                ? "🍐"
                : plant.type.includes("Lemon")
                ? "🍋"
                : plant.type.includes("Mandarin")
                ? "🍊"
                : plant.type.includes("Peach") ||
                  plant.type.includes("Nectarine") ||
                  plant.type.includes("Apricot")
                ? "🍑"
                : plant.type.includes("Cherry")
                ? "🍒"
                : plant.type.includes("Plum")
                ? "🟣"
                : "🌳";

            return (
              <article
                key={plant.id}
                style={{
                  background: "#FFFDF9",
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: "1px solid #EFE5D8",
                  boxShadow: "0 12px 28px rgba(0,0,0,.08)"
                }}
              >
                <div
                  style={{
                    height: "155px",
                    background:
                      "linear-gradient(135deg,#F7DDE5,#EEF2DD)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "68px"
                  }}
                >
                  {icon}
                </div>
                                <div style={{ padding: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "14px",
                      alignItems: "flex-start"
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: "0 0 8px",
                          color: "#53633F",
                          fontSize: "25px"
                        }}
                      >
                        {plant.name}
                      </h3>

                      <p style={{ margin: 0, color: "#777" }}>
                        {plant.type}
                      </p>
                    </div>

                    <span
                      style={{
                        background: badgeColor,
                        color: "white",
                        padding: "7px 12px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {plant.status}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      display: "grid",
                      gridTemplateColumns: "repeat(2,1fr)",
                      gap: "12px"
                    }}
                  >
                    <div className="card">
                      <strong>❤️ Health</strong>
                      <p>{plant.health}%</p>
                    </div>

                    <div className="card">
                      <strong>📍 Location</strong>
                      <p>{plant.location}</p>
                    </div>
                  </div>
                                                    <div
                    style={{
                      marginTop: "22px",
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: "10px"
                    }}
                  >
                    <button>🌿 Profile</button>
                    <button>📸 Gallery</button>
                    <button>📖 Journal</button>
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "16px",
                      borderTop: "1px solid #ECE4D8",
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#777",
                      fontSize: "14px"
                    }}
                  >
                    <span>☀️ {plant.sun}</span>
                    <span>💧 {plant.water}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
                                  

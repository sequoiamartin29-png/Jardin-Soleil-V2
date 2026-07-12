import React, { useMemo } from "react";
import { useGarden } from "../context/GardenContext";

const orchardGroups = [
  "Apples",
  "Pears",
  "Plums",
  "Cherries",
  "Citrus",
  "Stone Fruit",
  "Figs",
  "Pomegranates",
  "Persimmons",
  "Other Fruit Trees"
];

const getOrchardGroup = (plant) => {
  const identity = [plant.category, plant.type, plant.variety, plant.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\bcitrus\b|citrangequat|lemon|lime|mandarin|orange|grapefruit|kumquat/.test(identity)) return "Citrus";
  if (/\bapples?\b/.test(identity)) return "Apples";
  if (/\bpears?\b/.test(identity)) return "Pears";
  if (/\bplums?\b/.test(identity)) return "Plums";
  if (/cherr(?:y|ies)/.test(identity)) return "Cherries";
  if (/peach|nectarine|apricot/.test(identity)) return "Stone Fruit";
  if (/\bfigs?\b/.test(identity)) return "Figs";
  if (/pomegranate/.test(identity)) return "Pomegranates";
  if (/persimmon/.test(identity)) return "Persimmons";
  return "Other Fruit Trees";
};

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
  const { plants } = useGarden();
  const orchardPlants = plants.filter(
    (plant) =>
      plant.category === "Orchard" ||
      plant.category === "Citrus"
  );
  const groupedPlants = useMemo(() => {
    const groups = Object.fromEntries(orchardGroups.map((group) => [group, []]));

    orchardPlants.forEach((plant) => groups[getOrchardGroup(plant)].push(plant));

    return orchardGroups
      .map((group) => ({
        group,
        plants: groups[group].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
        )
      }))
      .filter(({ plants: grouped }) => grouped.length > 0);
  }, [orchardPlants]);

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

      {groupedPlants.map(({ group, plants: grouped }) => {
        const headingId = `orchard-group-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

        return (
          <section key={group} aria-labelledby={headingId} style={{ marginBottom: "42px" }}>
            <h2
              id={headingId}
              style={{
                borderBottom: "1px solid rgba(200,169,91,.48)",
                color: "#53633F",
                fontFamily: 'Baskerville, "Palatino Linotype", Georgia, serif',
                fontSize: "30px",
                fontWeight: 500,
                margin: "0 0 20px",
                paddingBottom: "11px"
              }}
            >
              {group}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
                gap: "22px"
              }}
            >
              {grouped.map((plant) => (
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

                  {plant.nickname && (
                    <p style={{ color: "#8A6F45", margin: "6px 0 0" }}>
                      {plant.nickname}
                    </p>
                  )}

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
      })}
    </section>
  );
}

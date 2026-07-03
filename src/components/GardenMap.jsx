import React from "react";
import { useGarden } from "../context/GardenContext";

const zones = [
  {
    title: "🌳 Orchard Walkway",
    description: "Main fruit tree corridor",
    plants: ["Mr. Pear", "Fruit Cocktail #1", "Fruit Cocktail #2", "4-in-1 Plum", "4-in-1 Cherry"]
  },
  {
    title: "🍎 Apple Row",
    description: "Apple collection",
    plants: ["Arkansas Black #1", "Arkansas Black #2", "Honeycrisp", "Fuji", "Granny Smith", "Dorsett Golden", "Yellow Delicious"]
  },
  {
    title: "🍋 Citrus Collection",
    description: "Container citrus trees",
    plants: ["Mr. Lemone'", "Ms. Kishu", "Mr. Page"]
  },
  {
    title: "🍑 Peach Corner",
    description: "Peaches and ornamental peach",
    plants: ["August Lady", "Beetlepeach"]
  },
  {
    title: "🌿 Tea Corridor",
    description: "Tea herbs and medicinal herbs",
    plants: ["Tea Plant", "Mint Collection", "Lemon Balm", "Chamomile", "Stevia"]
  },
  {
    title: "🥕 Vegetable Beds",
    description: "Seasonal vegetables",
    plants: ["Tomatoes", "Peppers", "Japanese Eggplant", "Squash & Zucchini"]
  }
];

export default function GardenMap() {
  const { plants, setSelectedPlant } = useGarden();

  const openPlant = (plantName) => {
    const found = plants.find((plant) => plant.name === plantName);
    if (found) setSelectedPlant(found);
  };

  return (
    <section style={{ marginTop: "40px" }}>
      <h1 style={{ color: "#5D6B46", fontSize: "46px" }}>
        🗺️ Jardin Soleil Garden Map
      </h1>

      <p style={{ color: "#777", marginBottom: "30px" }}>
        A first digital layout of your garden zones. Plant markers will become clickable profile shortcuts.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: "22px"
        }}
      >
        {zones.map((zone) => (
          <article
            key={zone.title}
            className="card"
            style={{
              background: "#FFFDF9",
              borderRadius: "28px",
              border: "1px solid #ECE4D8"
            }}
          >
            <h2 style={{ color: "#53633F" }}>{zone.title}</h2>
            <p style={{ color: "#777" }}>{zone.description}</p>

            <div style={{ display: "grid", gap: "10px", marginTop: "18px" }}>
              {zone.plants.map((plantName) => (
                <button
                  key={plantName}
                  onClick={() => openPlant(plantName)}
                  style={{
                    textAlign: "left",
                    background: "#F8F3EC",
                    color: "#3D4A34",
                    border: "1px solid #ECE4D8"
                  }}
                >
                  🌿 {plantName}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

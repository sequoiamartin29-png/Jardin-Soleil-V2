import React from "react";

const supplies = [
  { icon: "🌱", name: "Soil", items: ["Moisture Control", "Kellogg Organic", "Topsoil", "Compost"] },
  { icon: "🪴", name: "Pots & Grow Bags", items: ["10 gal bags", "Terracotta pots", "Nursery pots", "Saucers"] },
  { icon: "🌿", name: "Fertilizer", items: ["Garden-Tone", "Citrus fertilizer", "Root stimulator", "Water-soluble feed"] },
  { icon: "🪵", name: "Mulch & Support", items: ["Pine bark mulch", "Stakes", "Plant ties", "Pavers"] },
  { icon: "🧰", name: "Tools", items: ["Watering cans", "Hose", "Pruners", "Gloves"] }
];

export default function Inventory() {
  return (
    <section style={{ marginTop: "50px" }}>
      <h2 style={{ fontSize: "42px", color: "#5D6B46" }}>
        📦 Garden Inventory
      </h2>

      <p style={{ color: "#777", fontSize: "18px", marginBottom: "35px" }}>
        Track the supplies that actually keep Jardin Soleil alive.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "25px"
        }}
      >
                {supplies.map((supply) => (
          <article
            key={supply.name}
            style={{
              background: "#FFFDF9",
              borderRadius: "28px",
              padding: "26px",
              border: "1px solid #EFE5D8",
              boxShadow: "0 12px 28px rgba(0,0,0,.08)"
            }}
          >
            <div style={{ fontSize: "48px" }}>{supply.icon}</div>

            <h3 style={{ color: "#53633F", fontSize: "26px" }}>
              {supply.name}
            </h3>

            <ul>
              {supply.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <button style={{ marginTop: "15px" }}>
              ➕ Update Inventory
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

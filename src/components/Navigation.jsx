import React from "react";

const menu = [
  { icon: "🏠", label: "Dashboard" },
  { icon: "🌳", label: "Orchard" },
  { icon: "🌿", label: "Plant Directory" },
  { icon: "🌱", label: "Garden" },
  { icon: "📖", label: "Logbook" },
  { icon: "➕", label: "New Journal Entry" },
  { icon: "📅", label: "Journal Timeline" },
  { icon: "📸", label: "Gallery" },
  { icon: "🌤", label: "Weather" },
  { icon: "📦", label: "Inventory" },
  { icon: "🎓", label: "Learning" },
  { icon: "🎮", label: "Word Search" }
];

export default function Navigation({ activePage, setPage }) {
  return (
    <nav
      style={{
        background: "#FFFDF9",
        borderRadius: "28px",
        padding: "24px",
        marginBottom: "30px",
        border: "1px solid #ECE4D8",
        boxShadow: "0 10px 25px rgba(0,0,0,.08)"
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: "14px"
        }}
      >
        {menu.map((item) => {
          const active = activePage === item.label;

          return (
            <button
              key={item.label}
              onClick={() => setPage(item.label)}
              style={{
                background: active ? "#B8C8A0" : "#F8F3EC",
                color: active ? "#FFF" : "#44503A",
                border: active
                  ? "2px solid #8FA06A"
                  : "1px solid #ECE4D8",
                borderRadius: "18px",
                padding: "18px",
                cursor: "pointer",
                transition: ".2s",
                fontWeight: 700
              }}
            >
              <div
                style={{
                  fontSize: "30px",
                  marginBottom: "8px"
                }}
              >
                {item.icon}
              </div>

              {item.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid #ECE4D8",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "15px"
        }}
      >
        <div>
          <strong style={{ color: "#5D6B46" }}>
            Current Page
          </strong>

          <p
            style={{
              margin: "6px 0 0",
              color: "#777"
            }}
          >
            {activePage}
          </p>
        </div>

        <button
          onClick={() => setPage("New Journal Entry")}
          style={{
            background: "#8FA06A",
            color: "white",
            border: "none",
            borderRadius: "18px",
            padding: "14px 24px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          ➕ Quick Journal Entry
        </button>
      </div>
    </nav>
  );
}

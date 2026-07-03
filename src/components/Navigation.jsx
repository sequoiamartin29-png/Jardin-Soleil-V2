import React from "react";

const menu = [
  { icon: "🏠", label: "Dashboard" },
  { icon: "🌳", label: "Orchard" },
  { icon: "🌿", label: "Garden" },
  { icon: "📖", label: "Logbook" },
  { icon: "📸", label: "Gallery" },
  { icon: "🌤", label: "Weather" },
  { icon: "📦", label: "Inventory" }
];

export default function Navigation({ activePage, setPage }) {
  return (
    <nav
      style={{
        background: "#FFFDF9",
        borderRadius: "24px",
        padding: "24px",
        marginBottom: "35px",
        border: "1px solid #EFE5D8",
        boxShadow: "0 10px 25px rgba(0,0,0,.08)"
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: "14px"
        }}
      >
                {menu.map((item) => {
          const isActive = activePage === item.label;

          return (
            <button
              key={item.label}
              onClick={() => setPage(item.label)}
              style={{
                padding: "18px",
                borderRadius: "18px",
                border: isActive ? "2px solid #8FA06A" : "1px solid #EFE5D8",
                background: isActive ? "#DDE8C8" : "#F8F3EC",
                color: "#3D4A34",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: 700,
                boxShadow: isActive
                  ? "0 8px 18px rgba(93,107,70,.22)"
                  : "none"
              }}
            >
              <div style={{ fontSize: "30px" }}>{item.icon}</div>

              <div style={{ marginTop: "8px" }}>
                {item.label}
              </div>
            </button>
          );
        })}
              </div>

      <div
        style={{
          marginTop: "25px",
          paddingTop: "20px",
          borderTop: "1px solid #ECE4D8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
          style={{
            padding: "14px 22px",
            borderRadius: "16px",
            border: "none",
            background: "#B8C8A0",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          ➕ Quick Log
        </button>
      </div>
    </nav>
  );
}

import React from "react";

const menu = [
  { icon: "🏠", label: "Dashboard" },
  { icon: "🌳", label: "Orchard" },
  { icon: "🌿", label: "Garden" },
  { icon: "📖", label: "Logbook" },
  { icon: "📸", label: "Gallery" },
  { icon: "🌤", label: "Weather" },
  { icon: "📦", label: "Inventory" },
  { icon: "🎓", label: "Learning" },
  { icon: "🤖", label: "Plant AI" },
  { icon: "⚙️", label: "Settings" }
];

export default function Navigation() {
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
      <h2
        style={{
          marginTop: 0,
          color: "#5D6B46"
        }}
      >
        🌿 Jardin Soleil
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: "15px",
          marginTop: "20px"
        }}
      >
        {menu.map((item) => (
          <button
            key={item.label}
            style={{
              padding: "18px",
              borderRadius: "18px",
              border: "none",
              background: "#F8F3EC",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: 600,
              transition: ".2s"
            }}
          >
            <div style={{ fontSize: "30px" }}>
              {item.icon}
            </div>

            <div
              style={{
                marginTop: "10px"
              }}
            >
              {item.label}
            </div>
          </button>
        ))}
      </div>
            <div
        style={{
          marginTop: "28px",
          paddingTop: "20px",
          borderTop: "1px solid #ECE4D8"
        }}
      >
        <h3
          style={{
            color: "#5D6B46",
            marginBottom: "15px"
          }}
        >
          🌞 Today's Snapshot
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "15px"
          }}
        >
          <div className="card">
            <strong>🌡 Weather</strong>
            <p>Loading...</p>
          </div>

          <div className="card">
            <strong>💧 Last Watering</strong>
            <p>Not Logged</p>
          </div>

          <div className="card">
            <strong>🍅 Harvest</strong>
            <p>None Today</p>
          </div>

          <div className="card">
            <strong>📸 Photos</strong>
            <p>0 Added</p>
          </div>
        </div>
      </div>
            <div
        style={{
          marginTop: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          paddingTop: "20px",
          borderTop: "1px solid #ECE4D8"
        }}
      >
        <div>
          <strong>🌸 Jardin Soleil</strong>
          <p
            style={{
              margin: "6px 0 0",
              color: "#777"
            }}
          >
            Garden Command Center
          </p>
        </div>

        <button>
          ➕ Quick Garden Log
        </button>
      </div>
    </nav>
  );
}

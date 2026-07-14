import React from "react";

const todaysLogs = [
  {
    icon: "💧",
    title: "Watering",
    description: "Record every watering session.",
    color: "#DDEFFC"
  },
  {
    icon: "🌱",
    title: "Fertilizer",
    description: "Track fertilizer applications.",
    color: "#E8F5DE"
  },
  {
    icon: "✂️",
    title: "Pruning",
    description: "Log pruning and maintenance.",
    color: "#F8EFD8"
  },
  {
    icon: "🐛",
    title: "Pests",
    description: "Document insects and damage.",
    color: "#FDE4E4"
  },
  {
    icon: "🤒",
    title: "Disease",
    description: "Track plant health issues.",
    color: "#FFE6E6"
  },
  {
    icon: "🌸",
    title: "Blooms",
    description: "Celebrate new flowers.",
    color: "#FCEAF4"
  },
  {
    icon: "🍅",
    title: "Harvest",
    description: "Record fruits and vegetables picked.",
    color: "#FFF1D9"
  },
  {
    icon: "📸",
    title: "Photo",
    description: "Attach progress photos.",
    color: "#EAE8FF"
  },
  {
    icon: "📝",
    title: "Garden Notes",
    description: "General observations and ideas.",
    color: "#F5F5F5"
  }
];

export default function Logbook({onNavigate}) {
  return (
    <section className="js-estate-page"
      style={{
        marginTop: "50px"
      }}
    >
      <h2
        style={{
          fontSize: "42px",
          color: "#5D6B46"
        }}
      >
        📖 Garden Logbook
      </h2>

      <p
        style={{
          color: "#777",
          fontSize: "18px",
          marginBottom: "35px"
        }}
      >
        Beginning July 1, every action in Jardin Soleil will be recorded here.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: "24px"
        }}
      >
        {todaysLogs.map((log) => (
          <div
            key={log.title}
            style={{
              background: log.color,
              borderRadius: "24px",
              padding: "24px",
              boxShadow: "0 10px 20px rgba(0,0,0,.08)"
            }}
          >
            <div
              style={{
                fontSize: "48px"
              }}
            >
              {log.icon}
            </div>

            <h3>{log.title}</h3>

            <p>{log.description}</p>
                        <div
              style={{
                marginTop: "20px",
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: "10px"
              }}
            >
              <button type="button" onClick={()=>onNavigate?.("New Journal Entry")}>➕ New Entry</button>
              <button type="button" onClick={()=>onNavigate?.("Journal Timeline")}>📂 View History</button>
            </div>

            <div
              style={{
                marginTop: "18px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(0,0,0,.08)"
              }}
            >
              <small
                style={{
                  color: "#666"
                }}
              >
                Last Entry: None Yet
              </small>
            </div>
          </div>
        ))}

        <div
          style={{
            background: "#FFFDF9",
            borderRadius: "24px",
            padding: "28px",
            border: "2px dashed #D7D7D7",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "240px"
          }}
        >
          <div
            style={{
              fontSize: "60px",
              marginBottom: "18px"
            }}
          >
            📅
          </div>

          <h3>Today's Timeline</h3>

          <p
            style={{
              textAlign: "center",
              color: "#666",
              lineHeight: "1.7"
            }}
          >
            Every watering, bloom, harvest, pest observation,
            fertilizing, pruning session and note will appear
            here in chronological order.
          </p>
                  <div
          style={{
            marginTop: "24px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: "12px"
          }}
        >
          <button type="button" onClick={()=>onNavigate?.("Weather")}>🌤 Weather</button>
          <button type="button" onClick={()=>onNavigate?.("Gallery")}>📸 Daily Gallery</button>
          <button type="button" disabled title="No garden statistics destination currently exists.">📊 Statistics</button>
          <button type="button" onClick={()=>onNavigate?.("Journal Timeline")}>🗂 Full Journal</button>
        </div>
      </div>
    </div>
  </section>
  );
}

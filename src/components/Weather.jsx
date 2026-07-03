import React from "react";

const forecast = [
  {
    day: "Today",
    icon: "☀️",
    high: "90°",
    low: "74°",
    note: "Check citrus moisture"
  },
  {
    day: "Tomorrow",
    icon: "⛅",
    high: "88°",
    low: "72°",
    note: "Inspect tomatoes"
  },
  {
    day: "Day 3",
    icon: "🌦",
    high: "85°",
    low: "70°",
    note: "Watch for rain"
  }
];

export default function Weather() {
  return (
    <section style={{ marginTop: "50px" }}>
      <h2
        style={{
          fontSize: "42px",
          color: "#5D6B46"
        }}
      >
        🌤 Garden Weather
      </h2>

      <p
        style={{
          color: "#777",
          fontSize: "18px",
          marginBottom: "35px"
        }}
      >
        Weather guidance for Jardin Soleil.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: "24px"
        }}
      >
        {forecast.map((day) => (
          <article
            key={day.day}
            style={{
              background: "#FFFDF9",
              borderRadius: "28px",
              padding: "26px",
              border: "1px solid #EFE5D8",
              boxShadow: "0 12px 28px rgba(0,0,0,.08)"
            }}
          >
            <div
              style={{
                fontSize: "60px",
                textAlign: "center"
              }}
            >
              {day.icon}
            </div>

            <h3 style={{ textAlign: "center" }}>
              {day.day}
            </h3>

            <h2
              style={{
                textAlign: "center",
                color: "#5D6B46"
              }}
            >
              {day.high} / {day.low}
            </h2>

            <p
              style={{
                textAlign: "center",
                color: "#666"
              }}
            >
              {day.note}
            </p>
                        <div
              style={{
                marginTop: "20px",
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: "10px"
              }}
            >
              <button>💧 Water Guide</button>
              <button>🌱 Garden Tasks</button>
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
              <span>🌡 Forecast</span>
              <span>☔ Garden Ready</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

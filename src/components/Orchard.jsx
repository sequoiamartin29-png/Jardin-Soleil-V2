import React from "react";
import { orchardPlants } from "../data/jardinData";

const statusColors = {
  Healthy: "#8FBF8F",
  Growing: "#A7C97A",
  Producing: "#F4C26B",
  Fruiting: "#F4C26B",
  Monitoring: "#D7B36A",
  Recovery: "#D99999",
  Recovering: "#D99999",
  "New Arrival": "#8FC8C7",
  "Mixed Recovery": "#D99999"
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
            "linear-gradient(135deg,#FFF9F3 0%,#F8F3EC 100%)",
          borderRadius: "28px",
          padding: "40px",
          border: "1px solid #EFE5D8",
          boxShadow: "0 15px 35px rgba(0,0,0,.08)"
        }}
      >
        <h2
          style={{
            fontSize: "42px",
            marginBottom: "10px",
            color: "#5D6B46"
          }}
        >
          🌳 Jardin Soleil Orchard
        </h2>

        <p
          style={{
            fontSize: "18px",
            color: "#6D6D6D",
            maxWidth: "700px",
            lineHeight: "1.8"
          }}
        >
          Every tree in Jardin Soleil has its own living profile.
          Track growth, health, harvests, photos and journal
          entries as your orchard matures season after season.
        </p>

        <div
          style={{
            display: "flex",
            gap: "18px",
            flexWrap: "wrap",
            marginTop: "35px",
            marginBottom: "40px"
          }}
        >
          <div className="card">
            <h3>🌳 Trees</h3>

            <h1
              style={{
                margin: 0,
                color: "#5D6B46"
              }}
            >
              {orchardPlants.length}
            </h1>
          </div>

          <div className="card">
            <h3>🍎 Apples</h3>

            <h1
              style={{
                margin: 0,
                color: "#5D6B46"
              }}
            >
              7
            </h1>
          </div>

          <div className="card">
            <h3>🍋 Citrus</h3>

            <h1
              style={{
                margin: 0,
                color: "#5D6B46"
              }}
            >
              3
            </h1>
          </div>

          <div className="card">
            <h3>🍑 Stone Fruit</h3>

            <h1
              style={{
                margin: 0,
                color: "#5D6B46"
              }}
            >
              7
            </h1>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(330px,1fr))",
            gap: "25px"
          }}
        >
                    {orchardPlants.map((tree) => {
            const badgeColor =
              statusColors[tree.status] || "#B8C8A0";

            return (
              <article
                key={tree.id}
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
                    height: "150px",
                    background:
                      "linear-gradient(135deg,#F7DDE5,#EEF2DD)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "64px"
                  }}
                >
                  {tree.type.includes("Apple")
                    ? "🍎"
                    : tree.type.includes("Pear")
                    ? "🍐"
                    : tree.type.includes("Lemon")
                    ? "🍋"
                    : tree.type.includes("Mandarin")
                    ? "🍊"
                    : tree.type.includes("Peach") ||
                      tree.type.includes("Nectarine") ||
                      tree.type.includes("Apricot")
                    ? "🍑"
                    : tree.type.includes("Cherry")
                    ? "🍒"
                    : tree.type.includes("Plum")
                    ? "🟣"
                    : "🌳"}
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
                          fontSize: "24px",
                          color: "#53633F"
                        }}
                      >
                        {tree.name}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "#7B746B"
                        }}
                      >
                        {tree.type}
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
                      {tree.status}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      padding: "14px",
                      borderRadius: "18px",
                      background: "#F8F3EC"
                    }}
                  >
                    <strong>Location</strong>
                    <p style={{ margin: "6px 0 0" }}>
                      {tree.location}
                    </p>
                  </div>

                  <p
                    style={{
                      lineHeight: "1.7",
                      color: "#5E5E5E",
                      minHeight: "90px"
                    }}
                  >
                    {tree.notes}
                  </p>
                                    <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: "10px",
                      marginTop: "20px"
                    }}
                  >
                    <button>
                      🌿 Profile
                    </button>

                    <button>
                      📖 Journal
                    </button>

                    <button>
                      📸 Gallery
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: "22px",
                      borderTop: "1px solid #ECE4D8",
                      paddingTop: "18px",
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#777",
                      fontSize: "14px"
                    }}
                  >
                    <span>💧 Water Log</span>
                    <span>🌱 Care History</span>
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

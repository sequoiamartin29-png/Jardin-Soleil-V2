import React from "react";

const albums = [
  {
    title: "🌳 Orchard",
    count: 17,
    description: "Fruit trees and citrus"
  },
  {
    title: "🌿 Herbs & Tea",
    count: 16,
    description: "Medicinal and culinary herbs"
  },
  {
    title: "🥕 Vegetables",
    count: 15,
    description: "Seasonal vegetables"
  },
  {
    title: "🌸 Flowers",
    count: 3,
    description: "Ornamental flowers"
  },
  {
    title: "🍓 Berries",
    count: 7,
    description: "Berry collection"
  },
  {
    title: "🍉 Melons",
    count: 2,
    description: "Summer melons"
  }
];

export default function Gallery() {
  return (
    <section style={{ marginTop: "50px" }}>
      <h2
        style={{
          fontSize: "42px",
          color: "#5D6B46"
        }}
      >
        📸 Garden Gallery
      </h2>

      <p
        style={{
          color: "#777",
          fontSize: "18px",
          marginBottom: "35px"
        }}
      >
        Organize every photo by garden collection and watch Jardin Soleil
        transform season after season.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: "25px"
        }}
      >
                {albums.map((album) => (
          <article
            key={album.title}
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
                height: "170px",
                background:
                  "linear-gradient(135deg,#F7DDE5,#EEF2DD)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "64px"
              }}
            >
              {album.title.split(" ")[0]}
            </div>

            <div style={{ padding: "24px" }}>
              <h3
                style={{
                  marginTop: 0,
                  color: "#53633F",
                  fontSize: "26px"
                }}
              >
                {album.title}
              </h3>

              <p style={{ color: "#666" }}>
                {album.description}
              </p>

              <p>
                <strong>{album.count}</strong> plants connected
              </p>
                            <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: "10px",
                  marginTop: "20px"
                }}
              >
                <button>📸 View Photos</button>
                <button>⬆️ Upload</button>
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
                <span>🖼 Album</span>
                <span>📅 Timeline</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

import React from "react";

const sections = [
  {
    title: "🥕 Vegetable Garden",
    subtitle: "Seasonal harvests",
    plants: [
      "Big Boy Tomato",
      "Early Girl Tomato",
      "Roma Tomatoes",
      "Little Napoli Tomato",
      "Husky Cherry Tomato",
      "Pineapple Tomato",
      "Japanese Eggplant",
      "Zucchini",
      "Yellow Squash",
      "Sugar Ann Peas",
      "Blue Lake Bush Beans",
      "Bell Peppers",
      "Cubanelle",
      "Banana Pepper",
      "Sweet Jalapeño"
    ]
  },
  {
    title: "🌿 Herb & Tea Garden",
    subtitle: "Kitchen • Apothecary • Tea",
    plants: [
      "Peppermint",
      "Chocolate Mint",
      "Apple Mint",
      "Orange Mint",
      "Indian Mint",
      "Strawberry Mint",
      "Pineapple Mint",
      "Lemon Balm",
      "Chamomile",
      "Stevia",
      "Bee Balm",
      "Pineapple Sage",
      "Lemon Verbena",
      "Tea Plant",
      "Lemon Thyme",
      "Golden Lemon Thyme"
    ]
  },
  {
    title: "🍓 Berry Collection",
    subtitle: "Fresh Fruit",
    plants: [
      "3-in-1 Blueberry",
      "Legacy Blueberry",
      "Blackberry",
      "Raspberry",
      "Goji Berry",
      "Strawberries",
      "Concord Grape"
    ]
  },
  {
    title: "🌸 Flower Garden",
    subtitle: "Color & Pollinators",
    plants: [
      "Julie Andrews Rose",
      "Lavender",
      "Eucalyptus"
    ]
  },
  {
    title: "🍉 Melon Patch",
    subtitle: "Summer Harvest",
    plants: [
      "Black Diamond Watermelon",
      "Crimson Sweet Watermelon"
    ]
  }
];

export default function Garden() {
  return (
    <section
      style={{
        marginTop: "50px"
      }}
    >
      <h2
        style={{
          color: "#5D6B46",
          fontSize: "42px"
        }}
      >
        🌿 Garden Collections
      </h2>

      <p
        style={{
          color: "#777",
          fontSize: "18px",
          marginBottom: "35px"
        }}
      >
        Every collection in Jardin Soleil organized into beautiful French
        chalet inspired garden rooms.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
          gap: "25px"
        }}
      >
                {sections.map((section) => (
          <article
            key={section.title}
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
                background:
                  "linear-gradient(135deg,#F8E8EE,#EEF5E7)",
                padding: "28px"
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#55653F",
                  fontSize: "28px"
                }}
              >
                {section.title}
              </h3>

              <p
                style={{
                  marginTop: "10px",
                  color: "#6D6D6D"
                }}
              >
                {section.subtitle}
              </p>
            </div>

            <div
              style={{
                padding: "24px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "24px"
                }}
              >
                {section.plants.map((plant) => (
                  <span
                    key={plant}
                    style={{
                      background: "#F4EFE7",
                      padding: "8px 14px",
                      borderRadius: "999px",
                      fontSize: "14px",
                      color: "#5A5A5A"
                    }}
                  >
                    {plant}
                  </span>
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "10px"
                }}
              >
                <button>🌱 Plants</button>
                <button>📸 Photos</button>
                <button>📝 Journal</button>
              </div>
                            <div
                style={{
                  marginTop: "24px",
                  paddingTop: "18px",
                  borderTop: "1px solid #ECE4D8",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: "#777"
                }}
              >
                <span>📊 {section.plants.length} Plants</span>
                <span>🌿 Collection</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

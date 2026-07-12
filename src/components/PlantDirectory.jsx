import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import BotanicalIcon from "./icons/BotanicalIcon";
import { isOrchardFruitTree, normalizePlantText } from "../utils/plantClassification";

const filters = [
  "All",
  "Orchard",
  "Citrus",
  "Vegetables",
  "Herbs",
  "Flowers"
];

const plantGroups = [
  "Citrus Trees",
  "Other Fruit Trees",
  "Berries and Vines",
  "Herbs",
  "Vegetables",
  "Flowers and Perennials",
  "Houseplants and Container Plants",
  "Other / Uncategorized"
];

const getPlantGroup = (plant) => {
  const identity = [
    plant.category,
    plant.type,
    plant.variety,
    plant.name,
    plant.location
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\bcitrus\b|citrangequat|lemon|lime|mandarin|orange|grapefruit|kumquat/.test(identity)) {
    return "Citrus Trees";
  }
  if (/berr(?:y|ies)|grape|vine|strawberry|raspberry|blackberry|blueberry|goji/.test(identity)) {
    return "Berries and Vines";
  }
  if (/\borchard\b|fruit[ -]?tree|apple|pear|plum|cherry|peach|nectarine|apricot|fig|persimmon|pomegranate|quince/.test(identity)) {
    return "Other Fruit Trees";
  }
  if (/\bherbs?\b|\btea\b|mint|thyme|sage|basil|rosemary|chamomile|stevia|balm|verbena/.test(identity)) {
    return "Herbs";
  }
  if (/vegetable|tomato|pepper|eggplant|squash|zucchini|carrot|lettuce|cucurbit|melon/.test(identity)) {
    return "Vegetables";
  }
  if (/flower|perennial|rose|lavender|camellia|hydrangea|eucalyptus/.test(identity)) {
    return "Flowers and Perennials";
  }
  if (/houseplant|indoor|container|potted|patio plant/.test(identity)) {
    return "Houseplants and Container Plants";
  }
  return "Other / Uncategorized";
};

export default function PlantDirectory({ onSelectPlant }) {
  const { plants } = useGarden();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredPlants = useMemo(() => {
    const normalizedSearch = normalizePlantText(search);

    return plants.filter((plant) => {
      const searchablePlant = normalizePlantText([
        plant.name,
        plant.nickname,
        plant.commonName,
        plant.botanicalName,
        plant.variety,
        plant.type,
        plant.category,
        plant.group,
        plant.location
      ].filter(Boolean).join(" "));
      const matchesSearch = !normalizedSearch || searchablePlant.includes(normalizedSearch);

      const matchesFilter =
        normalizedSearch || filter === "All" || plant.category === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const groupedPlants = useMemo(() => {
    const groups = Object.fromEntries(plantGroups.map((group) => [group, []]));

    filteredPlants.forEach((plant) => {
      groups[getPlantGroup(plant)].push(plant);
    });

    return plantGroups
      .map((group) => ({
        group,
        plants: groups[group].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
        )
      }))
      .filter(({ plants: grouped }) => grouped.length > 0);
  }, [filteredPlants]);

  return (
    <section style={{ marginTop: "40px" }}>
      <h1
        style={{
          color: "#5D6B46",
          fontSize: "46px",
          marginBottom: "8px"
        }}
      >
        🌿 Plant Directory
      </h1>

      <p
        style={{
          color: "#777",
          marginBottom: "28px"
        }}
      >
        Browse every plant growing in Jardin Soleil.
      </p>

      <input
        placeholder="Search plants..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          if (e.target.value) setFilter("All");
        }}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "16px",
          border: "1px solid #DDD",
          marginBottom: "20px"
        }}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "30px"
        }}
      >
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            style={{
              background:
                filter === item ? "#8FA06A" : "#F8F3EC",
              color:
                filter === item ? "white" : "#53633F",
              border: "none",
              borderRadius: "16px",
              padding: "10px 18px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <p aria-live="polite" style={{ color: "#6E745F", margin: "-12px 0 28px" }}>
        Showing <strong>{filteredPlants.length}</strong> {filteredPlants.length === 1 ? "plant" : "plants"}
        {search.trim() ? ` for “${search.trim()}”` : ""} · {plants.filter(isOrchardFruitTree).length} orchard fruit trees
      </p>

      {groupedPlants.map(({ group, plants: grouped }) => {
        const headingId = `plant-group-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

        return (
          <section key={group} aria-labelledby={headingId} style={{ marginBottom: "38px" }}>
            <h2
              id={headingId}
              style={{
                color: "#53633F",
                fontFamily: 'Baskerville, "Palatino Linotype", Georgia, serif',
                fontSize: "28px",
                fontWeight: 500,
                margin: "0 0 18px",
                paddingBottom: "10px",
                borderBottom: "1px solid rgba(200,169,91,.45)"
              }}
            >
              {group}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
                gap: "20px"
              }}
            >
              {grouped.map((plant) => (
                <article
                  key={plant.id}
            style={{
              background: "#FFFDF9",
              borderRadius: "24px",
              padding: "22px",
              border: "1px solid #ECE4D8",
              boxShadow:
                "0 10px 24px rgba(0,0,0,.08)"
            }}
          >
            <div
              style={{
                fontSize: "56px"
              }}
            >
              <BotanicalIcon plant={plant} size="xl" decorative />
            </div>

            <h2
              style={{
                marginBottom: "6px",
                color: "#53633F"
              }}
            >
              {plant.name}
            </h2>

            {plant.nickname && (
              <p style={{ color: "#8A6F45", margin: "0 0 6px" }}>
                {plant.nickname}
              </p>
            )}

            <p style={{ color: "#777" }}>
              {plant.type}
            </p>

            <p>
              ❤️ {plant.health}% • 📍 {plant.location}
            </p>

            <button
              onClick={() => onSelectPlant(plant)}
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "14px",
                borderRadius: "16px",
                border: "none",
                background: "#8FA06A",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              🌿 Open Profile
            </button>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}

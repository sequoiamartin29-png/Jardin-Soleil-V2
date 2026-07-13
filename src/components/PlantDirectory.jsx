import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import BotanicalIcon from "./icons/BotanicalIcon";
import { getPlantDirectoryGroup, isOrchardFruitTree, normalizePlantText, plantDirectoryGroups } from "../utils/plantClassification";

const filters = [
  "All",
  "Orchard",
  "Citrus",
  "Vegetables",
  "Herbs",
  "Flowers"
];

export default function PlantDirectory({ onSelectPlant, onAddPlant, onViewArchived }) {
  const { plants, activePlants, stats } = useGarden();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredPlants = useMemo(() => {
    const normalizedSearch = normalizePlantText(search);

    return activePlants.filter((plant) => {
      const directoryGroup = getPlantDirectoryGroup(plant);
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

      const matchesFilter = normalizedSearch || filter === "All" ||
        (filter === "Orchard" && isOrchardFruitTree(plant)) ||
        (filter === "Citrus" && directoryGroup === "Citrus Trees") ||
        (filter === "Vegetables" && directoryGroup === "Vegetables") ||
        (filter === "Herbs" && directoryGroup === "Herbs") ||
        (filter === "Flowers" && directoryGroup === "Flowers and Perennials");

      return matchesSearch && matchesFilter;
    });
  }, [activePlants, search, filter]);

  const groupedPlants = useMemo(() => {
    const groups = Object.fromEntries(plantDirectoryGroups.map((group) => [group, []]));

    filteredPlants.forEach((plant) => {
      groups[getPlantDirectoryGroup(plant)].push(plant);
    });

    return plantDirectoryGroups
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
      <div style={{display:"flex",flexWrap:"wrap",gap:"10px",margin:"0 0 22px"}}><button type="button" onClick={onAddPlant} style={{background:"#61764F",border:"1px solid #4D603E",borderRadius:"16px",color:"white",cursor:"pointer",fontWeight:800,padding:"13px 20px"}}>Add New Plant</button><button type="button" onClick={onViewArchived} style={{background:"#F8F1E4",border:"1px solid #BFA267",borderRadius:"16px",color:"#53633F",cursor:"pointer",fontWeight:800,padding:"13px 20px"}}>Archived Plants ({plants.filter((plant)=>plant.archived||String(plant.status).toLocaleLowerCase()==="archived").length})</button></div>

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
        <span>{` · ${stats.mintVarietyCount} mint varieties · ${stats.edibleHerbCount} edibles & herbs · ${stats.gardenZoneCount} garden zones`}</span>
      </p>

      {groupedPlants.map(({ group, plants: grouped }) => {
        const headingId = `plant-group-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        const mintMembers = group === "Herbs" ? grouped.filter((plant) => plant.group === "Mints" || plant.collection === "Mint Collection") : [];
        const orderedGrouped = group === "Herbs" ? [...mintMembers, ...grouped.filter((plant) => plant.group !== "Mints" && plant.collection !== "Mint Collection")] : grouped;

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
              {mintMembers.length > 0 && <h3 style={{gridColumn:"1 / -1",color:"#6A7654",fontFamily:"Georgia,serif",fontSize:"22px",margin:"0"}}>Mints</h3>}
              {orderedGrouped.map((plant, index) => (
                <React.Fragment key={plant.id}>
                {mintMembers.length > 0 && index === mintMembers.length && <h3 style={{gridColumn:"1 / -1",color:"#6A7654",fontFamily:"Georgia,serif",fontSize:"22px",margin:"12px 0 0"}}>Other Herbs</h3>}
                <article
                  key={`${plant.id}-card`}
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
              {plant.health !== undefined && plant.health !== null ? `Health ${plant.health}%` : "Health not recorded"} · {plant.location || "Location not recorded"}
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
                </React.Fragment>
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}

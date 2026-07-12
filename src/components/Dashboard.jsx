import React from "react";
import { useGarden } from "../context/GardenContext";
import dashboardArtwork from "../assets/jardin-soleil-dashboard.jpeg";
import "./Dashboard.css";

const dashboardHotspots = [
  { label: "Dashboard", page: "Dashboard", area: [1.2, 19.1, 14.1, 4.4] },
  { label: "My Garden", page: "Garden", area: [1.2, 23.6, 14.1, 3.8] },
  { label: "Orchard", page: "Orchard", area: [1.2, 27.5, 14.1, 3.8] },
  { label: "Daily Logs", page: "Logbook", area: [1.2, 31.4, 14.1, 3.9] },
  { label: "Tasks", page: "Garden", area: [1.2, 35.4, 14.1, 3.8] },
  { label: "Calendar", page: "Journal Timeline", area: [1.2, 39.3, 14.1, 3.8] },
  { label: "Plant Finder", page: "Plant Directory", area: [1.2, 43.2, 14.1, 3.8] },
  { label: "Nursery", page: "Inventory", area: [1.2, 47.1, 14.1, 3.7] },
  { label: "Photo Gallery", page: "Gallery", area: [1.2, 50.9, 14.1, 3.8] },
  { label: "Botanical Word Search", page: "Word Search", area: [1.2, 54.8, 14.1, 4.2] },
  { label: "AI Assistant", page: "Learning", area: [1.2, 59.1, 14.1, 3.6] },
  { label: "Resources", page: "Learning", area: [1.2, 62.8, 14.1, 3.7] },
  { label: "Settings", page: "Dashboard", area: [1.2, 70.5, 14.1, 3.7] },
  { label: "Orchard Gate", page: "Orchard", area: [38.2, 36.1, 18.1, 4.2] },
  { label: "Orchard garden area", page: "Orchard", area: [23.5, 40.3, 17.4, 5.2] },
  { label: "Flower and Perennials", page: "Garden", area: [56.7, 40.1, 16.1, 5.7] },
  { label: "Tea and Herb Corridor", page: "Garden", area: [17.2, 49.2, 16.3, 5.8] },
  { label: "Vegetable Garden", page: "Garden", area: [61.5, 49.8, 16.7, 5.5] },
  { label: "Berry Zone", page: "Garden", area: [20.5, 60.6, 16.8, 5.5] },
  { label: "Container Collection", page: "Garden", area: [59.1, 60.7, 17.2, 5.4] },
  { label: "Nursery Shed", page: "Inventory", area: [39.1, 67.1, 18.8, 4.7] },
  { label: "Water", page: "Garden", area: [1.8, 96.2, 19.3, 2.7] },
  { label: "Feed", page: "Inventory", area: [21.2, 96.2, 19.2, 2.7] },
  { label: "Care", page: "New Journal Entry", area: [59.5, 96.2, 18.1, 2.7] },
  { label: "Harvest", page: "Logbook", area: [77.7, 96.2, 20.4, 2.7] },
];

const isFruitTree = (plant) => {
  if (plant.isFruitTree === true || plant.plantType === "fruit-tree") return true;

  const searchable = [
    plant.category,
    plant.type,
    plant.name,
    plant.variety,
    plant.location,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  return (
    /\borchards?\b|\bcitrus(?:es)?\b|fruit[\s-]*trees?/.test(searchable) ||
    /\b(apple|pear|plum|cherr(?:y|ies)|peach|nectarine|apricot|lemon|lime|mandarin|orange|grapefruit|kumquat|fig|pomegranate|persimmon|pawpaw|mulberr(?:y|ies)|quince|olive)s?\b/.test(searchable)
  );
};

export default function Dashboard({ onNavigate }) {
  const { stats, plants, journalEntries } = useGarden();
  const navigate = (page) => onNavigate?.(page);

  const mintCount = plants.filter((plant) =>
    `${plant.name || ""} ${plant.type || ""}`.toLowerCase().includes("mint")
  ).length;
  const edibleHerbCount = plants.filter((plant) =>
    /orchard|citrus|edible|herb|vegetable|berry|tea/i.test(
      `${plant.category || ""} ${plant.type || ""}`
    )
  ).length;
  const gardenBedCount = new Set(
    plants
      .filter((plant) => !/orchard/i.test(plant.location || ""))
      .map((plant) => plant.location)
      .filter(Boolean)
  ).size;
  const newestEntry = [...journalEntries].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )[0];
  const spotlightPlant = [...stats.plantsNeedingAttention].sort(
    (a, b) => (a.health ?? 100) - (b.health ?? 100)
  )[0];
  const activeCarePlants = plants
    .filter((plant) =>
      (plant.health ?? 100) < 85 || /recovering|monitoring|care|stress/i.test(plant.status || "")
    )
    .sort((a, b) => (a.health ?? 100) - (b.health ?? 100))
    .slice(0, 5);
  const gardenHealth = plants.length
    ? Math.round(plants.reduce((total, plant) => total + (plant.health ?? 100), 0) / plants.length)
    : 0;
  const fruitTreeCount = plants.filter(isFruitTree).length;

  const liveStats = [
    { label: "Fruit Trees", value: fruitTreeCount || "None" },
    { label: "Mint Varieties", value: mintCount || "None" },
    { label: "Edibles & Herbs", value: edibleHerbCount || "None" },
    { label: "Garden Beds", value: gardenBedCount || "None" },
    { label: "Photos Logged", value: stats.photoCount || "None" },
  ];

  return (
    <section className="js-dashboard-artwork" aria-label="Jardin Soleil dashboard">
      <p className="js-dashboard-artwork__summary" id="dashboard-garden-summary">
        Jardin Soleil currently tracks {stats.totalPlants} plants, {stats.orchardCount} orchard trees,
        {stats.journalCount} garden notes, and {stats.photoCount} photos.
      </p>

      <div className="js-dashboard-artwork__canvas" aria-describedby="dashboard-garden-summary">
        <img
          className="js-dashboard-artwork__image"
          src={dashboardArtwork}
          alt="Illustrated Jardin Soleil French botanical estate dashboard with chalet, formal gardens, fountain, garden panels, and navigation"
        />

        <div className="js-dashboard-artwork__fountain" aria-hidden="true">
          <span className="js-dashboard-artwork__water" />
          <span className="js-dashboard-artwork__ripple js-dashboard-artwork__ripple--one" />
          <span className="js-dashboard-artwork__ripple js-dashboard-artwork__ripple--two" />
          <span className="js-dashboard-artwork__jet" />
          <span className="js-dashboard-artwork__sparkle js-dashboard-artwork__sparkle--one" />
          <span className="js-dashboard-artwork__sparkle js-dashboard-artwork__sparkle--two" />
          <span className="js-dashboard-artwork__sparkle js-dashboard-artwork__sparkle--three" />
        </div>

        <div className="js-dashboard-artwork__live-data">
          <div className="js-dashboard-artwork__stats" aria-label="Live garden statistics">
            {liveStats.map(({ label, value }) => (
              <div className="js-dashboard-artwork__stat" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <section className="js-dashboard-artwork__tasks" aria-label="Today's active care tasks">
            {activeCarePlants.length ? (
              <ul>
                {activeCarePlants.map((plant) => (
                  <li key={plant.id}>Check {plant.name}</li>
                ))}
              </ul>
            ) : (
              <p>No active care tasks</p>
            )}
          </section>

          <section className="js-dashboard-artwork__recent" aria-label="Recent log entry">
            <h2>Recent Log Entry</h2>
            {newestEntry ? (
              <>
                <strong>{newestEntry.type || "Garden note"}</strong>
                <p>{newestEntry.notes || "No notes were added."}</p>
                <small>{new Date(newestEntry.createdAt).toLocaleDateString()}</small>
              </>
            ) : (
              <p>No journal entries yet</p>
            )}
          </section>

          <section className="js-dashboard-artwork__spotlight" aria-label="Plant spotlight">
            <h2>Plant Spotlight</h2>
            {spotlightPlant ? (
              <>
                <strong>{spotlightPlant.name}</strong>
                <p>{spotlightPlant.status || "Needs attention"}</p>
                <small>{spotlightPlant.health ?? 100}% health</small>
              </>
            ) : (
              <p>All plants are thriving</p>
            )}
          </section>

          <section className="js-dashboard-artwork__health" aria-label={`${gardenHealth}% garden health`}>
            <strong>{gardenHealth}%</strong>
            <span>{plants.length ? "Overall Health" : "No plants tracked"}</span>
            <span className="js-dashboard-artwork__health-progress" aria-hidden="true">
              <i style={{ width: `${gardenHealth}%` }} />
            </span>
          </section>
        </div>

        <nav className="js-dashboard-artwork__hotspots" aria-label="Interactive Jardin Soleil estate map">
          {dashboardHotspots.map(({ label, page, area: [left, top, width, height] }) => (
            <button
              type="button"
              className="js-dashboard-artwork__hotspot"
              key={label}
              aria-label={label}
              title={label}
              onClick={() => navigate(page)}
              style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
            />
          ))}
        </nav>
      </div>
    </section>
  );
}

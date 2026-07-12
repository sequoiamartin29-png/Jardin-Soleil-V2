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

export default function Dashboard({ onNavigate }) {
  const { stats, photos } = useGarden();
  const navigate = (page) => onNavigate?.(page);

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

        <div className="js-dashboard-artwork__photo-stat" aria-live="polite" aria-label={`${photos.length} photos logged`}>
          <strong>{photos.length}</strong>
          <span>Photos Logged</span>
        </div>

        <div className="js-dashboard-artwork__fruit-stat" aria-live="polite" aria-label={`${stats.orchardCount} fruit trees`}>
          <strong>{stats.orchardCount}</strong>
          <span>Fruit Trees</span>
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

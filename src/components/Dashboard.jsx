import React, { useEffect, useState } from "react";
import { useGarden } from "../context/GardenContext";
import dashboardArtwork from "../assets/jardin-soleil-dashboard.jpeg";
import BuddyCompanion from "./dashboard/BuddyCompanion";
import EstateEnvironment from "./dashboard/EstateEnvironment";
import DashboardStatCard from "./dashboard/DashboardStatCard";
import { useEstateEnvironment } from "../context/EstateEnvironmentContext";
import "./Dashboard.css";

const DEBUG_ANIMATIONS = false;

const dashboardHotspots = [
  { label: "Orchard Gate", page: "Orchard", area: [38.2, 36.1, 18.1, 4.2] },
  { label: "Orchard garden area", page: "Orchard", area: [23.5, 40.3, 17.4, 5.2] },
  { label: "Flower and Perennials", page: "Garden Collections", area: [56.7, 40.1, 16.1, 5.7] },
  { label: "Tea and Herb Corridor", page: "Garden Collections", area: [17.2, 49.2, 16.3, 5.8] },
  { label: "Vegetable Garden", page: "Garden Collections", area: [61.5, 49.8, 16.7, 5.5] },
  { label: "Berry Zone", page: "Garden Collections", area: [20.5, 60.6, 16.8, 5.5] },
  { label: "Container Collection", page: "Garden Collections", area: [59.1, 60.7, 17.2, 5.4] },
  { label: "Nursery Shed", page: "Inventory", area: [39.1, 67.1, 18.8, 4.7] },
  { label: "View All Tasks", page: "Tasks", area: [80.1, 49.7, 16.4, 2.1] },
  { label: "View Calendar", page: "Calendar", area: [80.1, 63.9, 16.4, 2.0] },
  { label: "View Full Forecast", page: "Weather", area: [79.8, 79.5, 16.8, 2.0] },
  { label: "View All Logs", page: "Logbook", area: [20.8, 83.8, 16.5, 1.9] },
  { label: "View Harvests", page: "Logbook", area: [41.0, 83.8, 15.2, 1.9] },
  { label: "View Plant Directory", page: "Plant Directory", area: [60.4, 83.8, 15.5, 1.9] },
  { label: "View Orchard", page: "Orchard", area: [24.7, 93.9, 13.2, 1.8] },
  { label: "View Garden Details", page: "Garden Collections", area: [57.0, 93.9, 16.1, 1.8] },
  { label: "Add New Plant", page: "Add New Plant", area: [81.0, 84.9, 16.2, 2.4] },
  { label: "Log Garden Update", page: "New Journal Entry", area: [81.0, 87.6, 16.2, 2.4] },
  { label: "Take Photo", page: "Photo Manager", area: [81.0, 90.3, 16.2, 2.4] },
  { label: "Add to Task List", page: "Tasks", area: [81.0, 93.0, 16.2, 2.4] },
  { label: "Water", page: "Garden Collections", area: [1.8, 96.2, 19.3, 2.7] },
  { label: "Feed", page: "Inventory", area: [21.2, 96.2, 19.2, 2.7] },
  { label: "Care", page: "New Journal Entry", area: [59.5, 96.2, 18.1, 2.7] },
  { label: "Harvest", page: "Logbook", area: [77.7, 96.2, 20.4, 2.7] },
];

export default function Dashboard({ onNavigate }) {
  const { stats } = useGarden();
  const environment = useEstateEnvironment();
  const [localNow, setLocalNow] = useState(() => new Date());
  const [animationsPaused, setAnimationsPaused] = useState(() => document.hidden);
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";

  useEffect(() => {
    const timer = window.setInterval(() => setLocalNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setAnimationsPaused(document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  const localHour = localNow.getHours();
  const isDayGarden = localHour >= 6 && localHour < 18;
  const gardenLight = localHour >= 5 && localHour < 12
    ? { icon: "☀️", label: "Morning garden light" }
    : localHour >= 12 && localHour < 18
      ? { icon: "🌤️", label: "Afternoon garden light" }
      : localHour >= 18 && localHour < 21
        ? { icon: "🌅", label: "Evening garden light" }
        : { icon: "🌙", label: "Night garden" };

  return (
    <section className="js-dashboard-artwork" aria-label="Jardin Soleil dashboard">
      <p className="js-dashboard-artwork__summary" id="dashboard-garden-summary">
        Jardin Soleil currently tracks {stats.totalPlants} plants, {stats.orchardCount} orchard trees,
        {stats.journalCount} garden notes, and {stats.photoCount} photos.
      </p>

      <div className="js-dashboard-artwork__viewport">
      <div className="js-dashboard-artwork__canvas" aria-describedby="dashboard-garden-summary">
        <div className="js-dashboard-artwork__pieces">
          <div className="js-dashboard-artwork__upper">
            <img src={dashboardArtwork} alt="Illustrated Jardin Soleil French botanical estate dashboard with chalet, formal gardens, fountain, garden panels, and navigation" />
          </div>
          <div className="js-dashboard-artwork__stat-strip">
            <div className="js-dashboard-artwork__strip-side js-dashboard-artwork__strip-side--left" aria-hidden="true"><img src={dashboardArtwork} alt="" /></div>
            <div className="js-dashboard-artwork__stat-placeholder" aria-hidden="true" />
            <div className="js-dashboard-artwork__strip-side js-dashboard-artwork__strip-side--right" aria-hidden="true"><img src={dashboardArtwork} alt="" /></div>
          </div>
          <div className="js-dashboard-artwork__lower" aria-hidden="true"><img src={dashboardArtwork} alt="" /></div>
        </div>

        <EstateEnvironment paused={animationsPaused} />

        <div
          className={`js-garden-motion ${isDayGarden ? "is-day" : "is-evening"} weather-${environment.condition} phase-${environment.phase} intensity-${environment.settings.intensity.toLowerCase()}${environment.windy ? " is-windy" : ""}${!environment.settings.wildlife ? " wildlife-off" : ""}${animationsPaused ? " is-paused" : ""}${DEBUG_ANIMATIONS ? " is-debug" : ""}`}
          aria-hidden="true"
        >
          <div className="js-fountain-motion">
            <span className="js-fountain-motion__basin" />
            <span className="js-fountain-motion__ripple js-fountain-motion__ripple--one" />
            <span className="js-fountain-motion__ripple js-fountain-motion__ripple--two" />
            <span className="js-fountain-motion__jet js-fountain-motion__jet--left" />
            <span className="js-fountain-motion__jet js-fountain-motion__jet--center" />
            <span className="js-fountain-motion__jet js-fountain-motion__jet--right" />
            <span className="js-fountain-motion__mist" />
            <span className="js-fountain-motion__sparkle js-fountain-motion__sparkle--one" />
            <span className="js-fountain-motion__sparkle js-fountain-motion__sparkle--two" />
          </div>

          <span className="js-butterfly js-butterfly--one" /><span className="js-butterfly js-butterfly--two" />
          <span className="js-butterfly js-butterfly--three" /><span className="js-butterfly js-butterfly--four" />
          <span className="js-bee js-bee--one" /><span className="js-bee js-bee--two" /><span className="js-bee js-bee--three" />
          <span className="js-moth" />
          <span className="js-hummingbird"><i /><b /></span>

          <span className="js-bloom js-bloom--one" /><span className="js-bloom js-bloom--two" /><span className="js-bloom js-bloom--three" />
          <span className="js-leaf-sway js-leaf-sway--one" /><span className="js-leaf-sway js-leaf-sway--two" />
          <span className="js-pollen js-pollen--one" /><span className="js-pollen js-pollen--two" /><span className="js-pollen js-pollen--three" />

          {DEBUG_ANIMATIONS && <div className="js-motion-debug">
            <span style={{ left:"44.2%", top:"48.4%" }}>Fountain 44.2%, 48.4%</span>
            <span style={{ left:"34%", top:"56%" }}>Butterfly 34%, 56%</span>
            <span style={{ left:"35%", top:"58%" }}>Bee 35%, 58%</span>
            <span style={{ left:"16%", top:"56%" }}>Hummingbird 16%, 56%</span>
          </div>}
        </div>

        {environment.settings.buddy&&<BuddyCompanion onOpenJournal={() => onNavigate?.("Buddy's Garden Journal")} onOpenLogger={() => onNavigate?.("Buddy Garden Day")} paused={animationsPaused} weatherMode={environment.buddyMode} />}

        <section className="js-dashboard-artwork__clock" aria-label={`Local date and time in ${localTimeZone}`}>
          <span className="js-dashboard-artwork__weekday">{localNow.toLocaleDateString(undefined, { weekday:"long" })}</span>
          <span className="js-dashboard-artwork__date">{localNow.toLocaleDateString(undefined, { month:"long", day:"numeric", year:"numeric" })}</span>
          <time dateTime={localNow.toISOString()}>{localNow.toLocaleTimeString(undefined, { hour:"numeric", minute:"2-digit" })}</time>
          <span className="js-dashboard-artwork__zone">{localTimeZone.replace(/_/g, " ")}</span>
          <span className="js-dashboard-artwork__local-weather"><b aria-hidden="true">{gardenLight.icon}</b>{environment.weather ? `${environment.conditionLabel} · ${Math.round(environment.weather.temperature)}°F` : gardenLight.label}</span>
        </section>

        <button className="js-dashboard-artwork__health-action" type="button" onClick={() => onNavigate?.("Plant Health Center")}>Plant Health Center</button>

        <nav className="js-dashboard-artwork__hotspots" aria-label="Interactive Jardin Soleil estate map">
          {dashboardHotspots.map(({ label, page, area: [left, top, width, height] }) => (
            <button
              type="button"
              className="js-dashboard-artwork__hotspot"
              key={label}
              aria-label={label}
              title={label}
              onClick={() => onNavigate?.(page)}
              style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
            />
          ))}
        </nav>
      </div>

      <div
        className="js-dashboard-stat-overlay"
        role="region"
        aria-label="Live garden statistics. Scroll horizontally on small screens."
        tabIndex="0"
      >
        <div className="js-dashboard-stat-row">
          <DashboardStatCard icon="fruitTree" value={stats.orchardCount} label="Fruit Trees" />
          <DashboardStatCard icon="mint" value={stats.mintVarietyCount} label="Mint Varieties" subtext={`${stats.mintVarietyCount} Current`} />
          <DashboardStatCard icon="edibles" value={stats.edibleHerbCount} label="Edibles & Herbs" />
          <DashboardStatCard icon="zones" value={stats.gardenZoneCount} label="Garden Zones" />
          <DashboardStatCard icon="photos" value={stats.photoCount} label="Photos Logged" />
        </div>
      </div>
      </div>
    </section>
  );
}

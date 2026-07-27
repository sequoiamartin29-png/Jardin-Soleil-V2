import React, { useEffect, useState } from "react";
import { useGarden } from "../context/GardenContext";
import { useEstateEnvironment } from "../context/EstateEnvironmentContext";
import { getDashboardHotspots, getDashboardSkin } from "../data/dashboardSkins";
import DashboardStatCard from "./dashboard/DashboardStatCard";
import EstateEnvironment from "./dashboard/EstateEnvironment";
import EstateWildlife from "./wildlife/EstateWildlife";
import "./Dashboard.css";

export default function Dashboard({ onNavigate, skinId }) {
  const {
    stats,
    activePlants,
    gardenProfile,
    journalEntries,
    tasks,
    calendarEntries,
  } = useGarden();
  const environment = useEstateEnvironment();
  const [localNow, setLocalNow] = useState(() => new Date());
  const [animationsPaused, setAnimationsPaused] = useState(() => document.hidden);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [failedSkinId, setFailedSkinId] = useState("");

  const requestedSkin = getDashboardSkin(skinId);
  const defaultSkin = getDashboardSkin();
  const displayedSkin = failedSkinId === requestedSkin.id ? defaultSkin : requestedSkin;
  const hotspots = getDashboardHotspots(displayedSkin.hotspotMapId);
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

  useEffect(() => setFailedSkinId(""), [requestedSkin.id]);

  const localHour = localNow.getHours();
  const spotlightPlant = activePlants[spotlightIndex % Math.max(activePlants.length, 1)];
  const recentEntry = journalEntries[0];
  const recentHarvest = journalEntries.find((entry) => /harvest/i.test(`${entry.type || ""} ${entry.title || ""}`));
  const openTasks = tasks.filter((task) => !task.completed && !task.isTemplate && !task.archived).slice(0, 5);
  const upcomingEvents = calendarEntries
    .filter((entry) => !entry.date || entry.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"))
    .slice(0, 3);
  const welcomeTitle = gardenProfile.ownerDisplayName
    ? `Welcome back, ${gardenProfile.ownerDisplayName}.`
    : gardenProfile.gardenName
      ? `Welcome to ${gardenProfile.gardenName}.`
      : "Welcome to your garden.";
  const gardenLight = localHour >= 5 && localHour < 12
    ? { icon:"☀️", label:"Morning garden light" }
    : localHour >= 12 && localHour < 18
      ? { icon:"🌤️", label:"Afternoon garden light" }
      : localHour >= 18 && localHour < 21
        ? { icon:"🌅", label:"Evening garden light" }
        : { icon:"🌙", label:"Night garden" };

  const moveSpotlight = (amount) => {
    if (activePlants.length) {
      setSpotlightIndex((current) => (current + amount + activePlants.length) % activePlants.length);
    }
  };
  const randomSpotlight = () => {
    if (activePlants.length < 2) return;
    setSpotlightIndex((current) => {
      let next = current;
      while (next === current) next = Math.floor(Math.random() * activePlants.length);
      return next;
    });
  };

  return (
    <section
      className="js-dashboard"
      aria-label="Jardin Soleil dashboard"
      data-dashboard-skin={requestedSkin.id}
      data-overlay-tone={displayedSkin.overlayTone}
      data-text-contrast={displayedSkin.textContrast}
      style={{
        "--dashboard-skin-accent":displayedSkin.accent,
        "--dashboard-skin-glow":displayedSkin.glow,
      }}
    >
      <p className="js-dashboard__summary" id="dashboard-garden-summary">
        Jardin Soleil currently tracks {stats.totalPlants} plants, {stats.orchardCount} orchard trees,
        {stats.journalCount} garden notes, and {stats.photoCount} photos.
      </p>

      <header className="js-dashboard__heading">
        <p>Jardin Soleil · Your living estate</p>
        <h1>{welcomeTitle}</h1>
        <span>
          {activePlants.length
            ? `Here’s what’s growing in ${gardenProfile.gardenName || "your garden"} today.`
            : "Your garden is ready to grow."}
        </span>
      </header>

      {!activePlants.length && (
        <section className="js-dashboard-empty-welcome" aria-labelledby="dashboard-empty-title">
          <div>
            <span aria-hidden="true">✦</span>
            <div>
              <h2 id="dashboard-empty-title">Your garden is ready to grow.</h2>
              <p>Begin with one plant or create the spaces that will become your garden.</p>
            </div>
          </div>
          <nav aria-label="Start building your garden">
            <button type="button" onClick={() => onNavigate?.("Add New Plant")}>Add Your First Plant</button>
            <button type="button" onClick={() => onNavigate?.("Garden Settings", { settingsSection:"manage" })}>Create a Garden Zone</button>
            <button type="button" onClick={() => onNavigate?.("Plant Finder")}>Identify a Plant</button>
            <button type="button" onClick={() => onNavigate?.("Learning")}>Explore Learning</button>
          </nav>
        </section>
      )}

      <section className="js-dashboard-stats" aria-label="Live garden statistics">
        <DashboardStatCard icon="edibles" value={stats.totalPlants} label="Plants" accessibleName={`Open Plant Directory — ${stats.totalPlants} plants`} onClick={() => onNavigate?.("Plant Directory")} />
        <DashboardStatCard icon="mint" value={stats.vegetableCount} label="Vegetables" accessibleName={`Open Vegetables — ${stats.vegetableCount} vegetables`} onClick={() => onNavigate?.("Plant Directory", { initialFilter:"Vegetables" })} />
        <DashboardStatCard icon="fruitTree" value={stats.fruitTreeCount} label="Fruit Trees" accessibleName={`Open Orchard — ${stats.fruitTreeCount} fruit trees`} onClick={() => onNavigate?.("Orchard")} />
        <DashboardStatCard icon="zones" value={stats.gardenZoneCount} label="Garden Zones" accessibleName={`Open Garden Collections — ${stats.gardenZoneCount} zones`} onClick={() => onNavigate?.("Garden Collections")} />
        <DashboardStatCard icon="photos" value={stats.photoCount} label="Photos Logged" accessibleName={`Open Garden Gallery — ${stats.photoCount} photos`} onClick={() => onNavigate?.("Gallery")} />
      </section>

      <div className="js-dashboard-canvas" aria-describedby="dashboard-garden-summary">
        <picture className="js-dashboard-canvas__art">
          <source media="(max-width: 700px)" srcSet={displayedSkin.mobileImage} />
          <img
            src={displayedSkin.desktopImage}
            onError={() => {
              if (requestedSkin.id !== defaultSkin.id) setFailedSkinId(requestedSkin.id);
            }}
            alt={`Illustrated ${displayedSkin.name} estate with château, formal garden regions, paths, and central fountain`}
          />
        </picture>
        <span className="js-dashboard-canvas__tone" aria-hidden="true" />

        <EstateEnvironment paused={animationsPaused} />
        <EstateWildlife paused={animationsPaused} />

        <nav className="js-dashboard-hotspots" aria-label="Interactive Jardin Soleil estate map">
          {hotspots.map(({ id, label, page, desktop, mobile }) => (
            <button
              type="button"
              className={`js-dashboard-hotspot js-dashboard-hotspot--${id}`}
              key={id}
              aria-label={`Open ${label}`}
              onClick={() => onNavigate?.(page)}
              style={{
                "--hotspot-left":`${desktop[0]}%`,
                "--hotspot-top":`${desktop[1]}%`,
                "--hotspot-width":`${desktop[2]}%`,
                "--hotspot-height":`${desktop[3]}%`,
                "--hotspot-mobile-left":`${mobile[0]}%`,
                "--hotspot-mobile-top":`${mobile[1]}%`,
                "--hotspot-mobile-width":`${mobile[2]}%`,
                "--hotspot-mobile-height":`${mobile[3]}%`,
              }}
            >
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {failedSkinId === requestedSkin.id && (
        <p className="js-dashboard__fallback" role="status">
          This artwork could not be loaded, so French Chalet is being shown.
        </p>
      )}

      <div className="js-dashboard-live-layout">
        <main className="js-dashboard-main-column">
          <section className="js-dashboard-activity-grid" aria-label="Garden activity">
            <article className="js-dashboard-panel js-dashboard-activity-card">
              <header><span>Recent Log</span><h2>{recentEntry?.title || "No journal entries yet."}</h2></header>
              <p>{recentEntry?.notes || recentEntry?.observations || "Your first garden note will appear here."}</p>
              <footer>
                <small>{recentEntry?.date ? new Date(`${recentEntry.date}T12:00:00`).toLocaleDateString() : "Ready for your first note"}</small>
                <button type="button" onClick={() => onNavigate?.("Journal")}>View Journal</button>
              </footer>
            </article>

            <article className="js-dashboard-panel js-dashboard-activity-card">
              <header><span>Harvest Spotlight</span><h2>{recentHarvest?.title || "No harvests yet."}</h2></header>
              <p>{recentHarvest?.notes || "Harvests you record will appear here."}</p>
              <footer>
                <small>{recentHarvest?.date ? new Date(`${recentHarvest.date}T12:00:00`).toLocaleDateString() : "Waiting for your first harvest"}</small>
                <button type="button" onClick={() => onNavigate?.("Journal", { journalView:"harvests" })}>View Harvests</button>
              </footer>
            </article>

            <article className="js-dashboard-panel js-dashboard-activity-card">
              <header>
                <span>Plant Spotlight</span>
                <h2>{spotlightPlant?.nickname || spotlightPlant?.name || "No spotlight plant yet."}</h2>
              </header>
              <p>{spotlightPlant ? spotlightPlant.variety || spotlightPlant.category || "Garden plant" : "Add a plant to begin your daily spotlight."}</p>
              <footer>
                <div className="js-dashboard-spotlight-controls" role="group" aria-label="Plant Spotlight controls">
                  <button type="button" aria-label="Previous spotlight plant" disabled={activePlants.length < 2} onClick={() => moveSpotlight(-1)}>‹</button>
                  <button type="button" aria-label="Choose a random spotlight plant" disabled={activePlants.length < 2} onClick={randomSpotlight}>↻</button>
                  <button type="button" aria-label="Next spotlight plant" disabled={activePlants.length < 2} onClick={() => moveSpotlight(1)}>›</button>
                </div>
                <button type="button" onClick={() => onNavigate?.(spotlightPlant ? "Plant Directory" : "Add New Plant")}>
                  {spotlightPlant ? "View Plants" : "Add Plant"}
                </button>
              </footer>
            </article>
          </section>

          <section className="js-dashboard-status-grid" aria-label="Garden status">
            <article className="js-dashboard-panel js-dashboard-status-card">
              <div><span>Orchard Status</span><strong>{stats.fruitTreeCount}</strong></div>
              <p>{stats.fruitTreeCount ? `${stats.fruitTreeCount} ${stats.fruitTreeCount === 1 ? "fruit tree" : "fruit trees"} recorded.` : "Add a fruit tree to begin your orchard ledger."}</p>
              <button type="button" onClick={() => onNavigate?.("Orchard")}>View Orchard</button>
            </article>
            <article className="js-dashboard-panel js-dashboard-status-card">
              <div><span>Garden Health</span><strong>{stats.totalPlants ? `${stats.averageHealth}%` : "—"}</strong></div>
              <p>{stats.totalPlants ? `${stats.plantsNeedingAttention.length} plants currently need attention.` : "Add plants to begin tracking garden health."}</p>
              <button type="button" onClick={() => onNavigate?.("Plant Health Center")}>Plant Health Center</button>
            </article>
          </section>
        </main>

        <aside className="js-dashboard-right-rail" aria-label="Dashboard planning and weather">
          <article className="js-dashboard-panel js-dashboard-weather-panel">
            <header>
              <div>
                <span>{localNow.toLocaleDateString(undefined, { weekday:"long" })}</span>
                <strong>{localNow.toLocaleDateString(undefined, { month:"long", day:"numeric", year:"numeric" })}</strong>
              </div>
              <time dateTime={localNow.toISOString()}>{localNow.toLocaleTimeString(undefined, { hour:"numeric", minute:"2-digit" })}</time>
            </header>
            <div className="js-dashboard-weather-panel__condition">
              <b aria-hidden="true">{gardenLight.icon}</b>
              <div>
                <strong>{environment.weather ? environment.conditionLabel : gardenLight.label}</strong>
                <span>{environment.weather ? `${Math.round(environment.weather.temperatureF)}°F${environment.weather.isStale ? " · Last known" : ""}` : localTimeZone.replace(/_/g, " ")}</span>
              </div>
            </div>
            <button type="button" onClick={() => onNavigate?.("Weather")}>View Full Forecast</button>
          </article>

          <article className="js-dashboard-panel js-dashboard-rail-card">
            <header><span>Today’s Tasks</span><button type="button" onClick={() => onNavigate?.("Tasks")}>View all</button></header>
            {openTasks.length ? (
              <ul>{openTasks.map((task) => <li key={task.id}><span aria-hidden="true">□</span>{task.title}</li>)}</ul>
            ) : <p>Your tasks will appear here.</p>}
          </article>

          <article className="js-dashboard-panel js-dashboard-rail-card">
            <header><span>Upcoming Events</span><button type="button" onClick={() => onNavigate?.("Calendar")}>Calendar</button></header>
            {upcomingEvents.length ? (
              <ul>{upcomingEvents.map((entry) => <li key={entry.id}><time>{entry.date ? new Date(`${entry.date}T12:00:00`).toLocaleDateString(undefined, { month:"short", day:"numeric" }) : "Soon"}</time>{entry.title}</li>)}</ul>
            ) : <p>Upcoming garden events will appear here.</p>}
          </article>

          <article className="js-dashboard-panel js-dashboard-quick-actions">
            <header><span>Quick Actions</span></header>
            <div>
              <button type="button" onClick={() => onNavigate?.("Add New Plant")}>Add New Plant</button>
              <button type="button" onClick={() => onNavigate?.("New Journal Entry")}>Log Garden Update</button>
              <button type="button" onClick={() => onNavigate?.("Photo Manager")}>Take Photo</button>
              <button type="button" onClick={() => onNavigate?.("Tasks")}>Add to Task List</button>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

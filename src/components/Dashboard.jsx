import React from "react";
import {
  CalendarDays,
  Camera,
  CloudSun,
  Droplets,
  Flower2,
  Leaf,
  NotebookPen,
  Plus,
  Sprout,
  Trees,
} from "lucide-react";
import { useGarden } from "../context/GardenContext";
import "./Dashboard.css";

const gardenAreas = [
  { name: "Orchard", detail: "Apples · Pears · Stone fruit", icon: Trees, tone: "sage" },
  { name: "Tea Garden", detail: "Herbs · Camellia · Mint", icon: Leaf, tone: "blue" },
  { name: "Kitchen Garden", detail: "Vegetables · Summer beds", icon: Sprout, tone: "blush" },
  { name: "Citrus Court", detail: "Lemon · Kishu mandarin", icon: Flower2, tone: "gold" },
];

export default function Dashboard({ onNavigate }) {
  const { stats } = useGarden();

  const navigate = (page) => onNavigate?.(page);
  const attentionCount = stats.plantsNeedingAttention.length;
  const recentEntry = stats.recentEntries[0];

  return (
    <section className="js-dashboard" aria-labelledby="dashboard-title">
      <header className="js-dashboard__welcome">
        <div className="js-dashboard__welcome-flourish" aria-hidden="true">
          <i /><i /><i /><i /><i />
        </div>
        <div>
          <p className="js-dashboard__eyebrow">Jardin Soleil · Garden Estate</p>
          <h1 id="dashboard-title">Bonjour, welcome to your garden</h1>
          <p className="js-dashboard__intro">
            A quiet view of everything growing, blooming, and waiting for your care.
          </p>
        </div>

        <div className="js-crest" aria-label="Jardin Soleil floral crest">
          <span className="js-crest__leaf js-crest__leaf--one" />
          <span className="js-crest__leaf js-crest__leaf--two" />
          <span className="js-crest__leaf js-crest__leaf--three" />
          <span className="js-crest__leaf js-crest__leaf--four" />
          <span className="js-crest__flower">✦</span>
          <strong>JS</strong>
        </div>
      </header>

      <div className="js-dashboard__stat-ribbon" aria-label="Garden summary">
        <div><Trees aria-hidden="true" /><strong>{stats.orchardCount}</strong><span>Orchard Trees</span></div>
        <div><Leaf aria-hidden="true" /><strong>{stats.totalPlants}</strong><span>Plants Tracked</span></div>
        <div><Sprout aria-hidden="true" /><strong>{stats.citrusCount}</strong><span>Citrus Trees</span></div>
        <div><NotebookPen aria-hidden="true" /><strong>{stats.journalCount}</strong><span>Garden Notes</span></div>
        <div><Camera aria-hidden="true" /><strong>{stats.photoCount}</strong><span>Photos Logged</span></div>
      </div>

      <div className="js-dashboard__layout">
        <aside className="js-dashboard__rail" aria-label="Dashboard shortcuts">
          <p className="js-dashboard__rail-title">Explore</p>
          <button type="button" onClick={() => navigate("Orchard")}>
            <Trees aria-hidden="true" />
            <span>Orchard</span>
          </button>
          <button type="button" onClick={() => navigate("Garden")}>
            <Sprout aria-hidden="true" />
            <span>Garden</span>
          </button>
          <button type="button" onClick={() => navigate("Journal Timeline")}>
            <NotebookPen aria-hidden="true" />
            <span>Journal</span>
          </button>
          <button type="button" onClick={() => navigate("Gallery")}>
            <Camera aria-hidden="true" />
            <span>Gallery</span>
          </button>

          <div className="js-dashboard__rail-note">
            <Flower2 aria-hidden="true" />
            <span>{stats.totalPlants} plants lovingly tracked</span>
          </div>
        </aside>

        <div className="js-garden-map" aria-label="Jardin Soleil garden overview">
          <div className="js-garden-map__watercolor" aria-hidden="true">
            <i className="js-garden-map__bed js-garden-map__bed--one" />
            <i className="js-garden-map__bed js-garden-map__bed--two" />
            <i className="js-garden-map__bed js-garden-map__bed--three" />
            <i className="js-garden-map__bed js-garden-map__bed--four" />
            <i className="js-garden-map__bed js-garden-map__bed--five" />
            <i className="js-garden-map__bed js-garden-map__bed--six" />
            <i className="js-garden-map__path js-garden-map__path--horizontal" />
            <i className="js-garden-map__path js-garden-map__path--vertical" />
          </div>
          <div className="js-garden-map__compass" aria-hidden="true">
            <span className="is-north">N</span>
            <span className="is-east">E</span>
            <span className="is-south">S</span>
            <span className="is-west">W</span>
          </div>
          <div className="js-garden-map__rings" aria-hidden="true" />
          <div className="js-garden-map__center">
            <i aria-hidden="true">✦</i>
            <span>Jardin</span>
            <strong>Soleil</strong>
            <small>Est. 2026</small>
          </div>

          {gardenAreas.map(({ name, detail, icon: Icon, tone }, index) => (
            <button
              type="button"
              className={`js-garden-map__plot js-garden-map__plot--${index + 1} is-${tone}`}
              key={name}
              onClick={() => navigate(name === "Kitchen Garden" || name === "Tea Garden" ? "Garden" : "Orchard")}
            >
              <Icon aria-hidden="true" />
              <span>{name}</span>
              <small>{detail}</small>
            </button>
          ))}
        </div>

        <aside className="js-dashboard__panels" aria-label="Garden information">
          <article className="js-info-card js-info-card--weather">
            <div className="js-info-card__heading">
              <span className="js-info-card__icon"><CloudSun aria-hidden="true" /></span>
              <div>
                <p>Garden outlook</p>
                <h2>A beautiful day to tend</h2>
              </div>
            </div>
            <div className="js-weather-row">
              <span><Droplets aria-hidden="true" /> Check soil moisture</span>
              <button type="button" onClick={() => navigate("Weather")}>View weather</button>
            </div>
          </article>

          <article className="js-info-card">
            <div className="js-info-card__heading">
              <span className="js-info-card__icon"><Leaf aria-hidden="true" /></span>
              <div>
                <p>Estate health</p>
                <h2>{stats.averageHealth}% thriving</h2>
              </div>
            </div>
            <div className="js-health-meter" aria-label={`${stats.averageHealth}% garden health`}>
              <span style={{ width: `${stats.averageHealth}%` }} />
            </div>
            <p className="js-info-card__copy">
              {attentionCount === 0
                ? "Everything in the garden is looking wonderfully settled."
                : `${attentionCount} ${attentionCount === 1 ? "plant needs" : "plants need"} a little extra attention.`}
            </p>
          </article>

          <article className="js-info-card">
            <div className="js-info-card__heading">
              <span className="js-info-card__icon"><CalendarDays aria-hidden="true" /></span>
              <div>
                <p>Latest journal note</p>
                <h2>{recentEntry?.type || "Your journal awaits"}</h2>
              </div>
            </div>
            <p className="js-info-card__copy">
              {recentEntry?.notes || "Capture a bloom, harvest, watering, or quiet garden observation."}
            </p>
          </article>
        </aside>
      </div>

      <div className="js-dashboard__lower-grid">
        <article className="js-lower-card">
          <p>Recent log entry</p>
          <h2>{recentEntry?.type || "A fresh page is waiting"}</h2>
          <span>{recentEntry?.notes || "Begin your garden story with today’s first observation."}</span>
          <button type="button" onClick={() => navigate("Journal Timeline")}>View all logs</button>
        </article>
        <article className="js-lower-card js-lower-card--blush">
          <p>Garden spotlight</p>
          <h2>{attentionCount ? "A little extra care" : "Everything is flourishing"}</h2>
          <span>{attentionCount ? `${attentionCount} plants are ready for a closer look.` : "Your tracked plants are settled and thriving."}</span>
          <button type="button" onClick={() => navigate("Plant Directory")}>View plant directory</button>
        </article>
        <article className="js-lower-card js-lower-card--health">
          <p>Garden health</p>
          <div className="js-lower-card__score">{stats.averageHealth}%</div>
          <span>Overall estate vitality</span>
          <button type="button" onClick={() => navigate("Plant Directory")}>View details</button>
        </article>
      </div>

      <footer className="js-dashboard__actions" aria-label="Garden actions">
        <div className="js-dashboard__action-intro">
          <span><Flower2 aria-hidden="true" /></span>
          <div>
            <p>Today at Jardin Soleil</p>
            <strong>{stats.journalCount} journal notes · {stats.photoCount} garden photos</strong>
          </div>
        </div>
        <div className="js-dashboard__action-buttons">
          <button type="button" className="is-secondary" onClick={() => navigate("Garden")}>
            <Droplets aria-hidden="true" /> Water
          </button>
          <button type="button" className="is-secondary" onClick={() => navigate("Inventory")}>
            <Leaf aria-hidden="true" /> Feed
          </button>
          <button type="button" className="is-secondary" onClick={() => navigate("Photo Manager")}>
            <Camera aria-hidden="true" /> Photo
          </button>
          <button type="button" className="is-primary" onClick={() => navigate("New Journal Entry")}>
            <Plus aria-hidden="true" /> Care note
          </button>
        </div>
      </footer>
    </section>
  );
}

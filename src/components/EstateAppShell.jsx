import React from "react";
import BotanicalIcon from "./icons/BotanicalIcon";
import "./EstateAppShell.css";

const themeIcons = {
  dashboard:"flower",
  orchard:"apple",
  herbarium:"herb",
  apothecary:"tea",
  journal:"flower",
  calendar:"lavender",
  conservatory:"shrub",
  "plant-health":"herb",
  nursery:"container-plant",
  learning:"generic-plant",
};

export default function EstateAppShell({
  page,
  pageTitle = page,
  theme = "herbarium",
  accent = "sage",
  menuOpen,
  onToggleMenu,
  menuTriggerRef,
  onNavigate,
  children,
}) {
  const isDashboard = theme === "dashboard";
  const icon = themeIcons[theme] || "generic-plant";

  return (
    <div className={`js-estate-app-shell js-estate-app-shell--${theme}`} data-theme={theme} data-accent={accent}>
      <div className="js-estate-app-shell__lighting" aria-hidden="true" />
      <div className="js-estate-app-shell__canopy" aria-hidden="true"><span /><span /><span /><span /></div>
      <div className="js-estate-app-shell__gold-frame" aria-hidden="true" />

      <button
        ref={menuTriggerRef}
        className="js-estate-app-shell__menu"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="estate-navigation-drawer"
        onClick={onToggleMenu}
      >
        <span aria-hidden="true">☰</span>
        <strong>Menu</strong>
      </button>

      <header className="js-estate-app-shell__brand" aria-label="Jardin Soleil estate frame">
        <div className="js-estate-app-shell__crest" aria-hidden="true">
          <BotanicalIcon type={icon} size="sm" decorative />
          <b>JS</b>
        </div>
        <div>
          <p>Jardin Soleil</p>
          <span>{pageTitle}</span>
        </div>
        <small>Rooted in purpose · Grown with love</small>
      </header>

      <main className="js-estate-app-shell__main" id="estate-page-content">
        <div className="js-estate-app-shell__content-window">
          <div className="js-estate-app-shell__page" key={page} data-page={page}>
            {children}
          </div>
        </div>
      </main>

      {!isDashboard && <footer className="js-estate-app-shell__footer">
        <div><span>Current estate room</span><strong>{pageTitle}</strong></div>
        <nav aria-label="Estate quick actions">
          <button type="button" onClick={() => onNavigate?.("Dashboard")}>Return to Dashboard</button>
          <button type="button" onClick={() => onNavigate?.("New Journal Entry")}>Quick Journal Entry</button>
        </nav>
      </footer>}
    </div>
  );
}

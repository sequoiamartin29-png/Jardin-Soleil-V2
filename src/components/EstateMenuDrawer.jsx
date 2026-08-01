import React, { useEffect, useRef, useState } from "react";
import BotanicalIcon from "./icons/BotanicalIcon";
import "./EstateMenuDrawer.css";

export const estateDrawerSections = [
  { title:"Garden", items:[
    { label:"Dashboard", page:"Dashboard", icon:"tree" },
    { label:"My Garden", page:"Garden Collections", icon:"flower" },
    { label:"Plants", page:"Plant Directory", icon:"generic-plant" },
    { label:"Garden Zones", page:"Garden Settings", context:{ settingsSection:"manage" }, icon:"container-plant" },
  ] },
  { title:"Care & Records", items:[
    { label:"Watering Wizard", page:"Watering Wizard", icon:"lavender" },
    { label:"Tasks", page:"Tasks", icon:"vegetable" },
    { label:"Journal", page:"Journal", icon:"herb" },
    { label:"Plant Health", page:"Plant Health Center", icon:"shrub", badge:"health" },
    { label:"Plant Finder", page:"Plant Finder", icon:"generic-plant" },
    { label:"Harvests", page:"Journal", context:{ journalView:"harvests" }, icon:"generic-fruit-tree" },
    { label:"Calendar", page:"Calendar", icon:"flower" },
    { label:"Gallery", page:"Gallery", icon:"flower" },
  ] },
  { title:"Discover", items:[
    { label:"Learning Center", page:"Learning", icon:"tree" },
    { label:"Garden Games", page:"Garden Games", icon:"lavender" },
  ] },
  { title:"Preferences", items:[
    { label:"Appearance", action:"appearance", icon:"lavender" },
    { label:"Settings", page:"Garden Settings", context:{ settingsSection:"profile" }, icon:"flower" },
    { label:"Privacy & Support", page:"Privacy & Support", icon:"herb" },
  ] },
];

export default function EstateMenuDrawer({
  open,
  onClose,
  onNavigate,
  onOpenAppearance,
  activePage,
  activeContext = {},
  healthAlerts = [],
  returnFocusRef,
}) {
  const drawerRef = useRef(null);
  const closeRef = useRef(null);
  const wasOpen = useRef(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    wasOpen.current = true;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeRef.current?.focus());
    const keydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...drawerRef.current.querySelectorAll(
        'button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])',
      )];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", keydown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open || !wasOpen.current) return;
    wasOpen.current = false;
    requestAnimationFrame(() => returnFocusRef?.current?.focus());
  }, [open, returnFocusRef]);

  if (!open) return null;

  const choose = (item) => {
    if (item.action === "appearance") {
      setAppearanceOpen((value) => !value);
      return;
    }
    onClose();
    if (item.badge === "health") {
      if (healthAlerts.length === 1) {
        const [alert] = healthAlerts;
        if (alert.healthCaseId) {
          onNavigate("Plant Health Center", {
            diagnosisId:alert.healthCaseId,
            plantId:alert.plantId || "",
            alertId:alert.id,
          });
        } else if (alert.plantId) {
          onNavigate("Plant Profile", {
            plantId:alert.plantId,
            section:"health",
            alertId:alert.id,
          });
        } else {
          onNavigate("Plant Health Center");
        }
        return;
      }
      if (healthAlerts.length > 1) {
        onNavigate("Plant Health Center", { mode:"needs-attention" });
        return;
      }
    }
    onNavigate(item.page, {
      ...(item.context || {}),
    });
  };
  const contextualDestinationActive = estateDrawerSections
    .flatMap((section) => section.items)
    .some((item) => item.page === activePage
      && item.context
      && Object.entries(item.context).every(([key, value]) => activeContext[key] === value));

  return (
    <div className="js-estate-drawer-shell">
      <div className="js-estate-drawer-backdrop" aria-hidden="true" onMouseDown={onClose} />
      <aside id="estate-navigation-drawer" className="js-estate-drawer" ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="estate-drawer-title">
        <header>
          <div className="js-estate-drawer__crest" aria-hidden="true">JS</div>
          <div><p>Jardin Soleil</p><h2 id="estate-drawer-title">Estate Menu</h2></div>
          <button ref={closeRef} type="button" aria-label="Close estate menu" onClick={onClose}>×</button>
        </header>

        <nav aria-label="Jardin Soleil destinations">
          {estateDrawerSections.map((section) => {
            const sectionId = `drawer-${section.title.replace(/[^a-z]+/gi, "-").toLocaleLowerCase()}`;
            return (
              <section key={section.title} aria-labelledby={sectionId}>
                <h3 id={sectionId}>{section.title}</h3>
                <div>
                  {section.items.map((item) => {
                    const active = activePage === item.page
                      && (item.context
                        ? Object.entries(item.context).every(([key, value]) => activeContext[key] === value)
                        : !contextualDestinationActive);
                    if (item.action === "appearance") {
                      return (
                        <div className="js-estate-drawer__appearance" key={item.label}>
                          <button type="button" aria-expanded={appearanceOpen} aria-controls="estate-appearance-submenu" onClick={() => choose(item)}>
                            <BotanicalIcon type={item.icon} size="sm" decorative />
                            <span>{item.label}<small>{appearanceOpen ? "Hide options" : "Dashboard and display"}</small></span>
                            <b aria-hidden="true">{appearanceOpen ? "−" : "+"}</b>
                          </button>
                          {appearanceOpen && (
                            <div id="estate-appearance-submenu">
                              <button type="button" onClick={() => { onClose(); onOpenAppearance?.(); }}>
                                <BotanicalIcon type="flower" size="sm" decorative />
                                <span>Dashboard Skins<small>Preview and apply</small></span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return (
                      <button type="button" key={item.label} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined} onClick={() => choose(item)}>
                        <BotanicalIcon type={item.icon} size="sm" decorative />
                        <span>{item.label}{active && <small>Current page</small>}</span>
                        {item.badge === "health" && healthAlerts.length > 0 && (
                          <b className="js-estate-drawer__badge" aria-label={`${healthAlerts.length} unread plant health ${healthAlerts.length === 1 ? "alert" : "alerts"}`}>
                            {healthAlerts.length > 99 ? "99+" : healthAlerts.length}
                          </b>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}

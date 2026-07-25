import React, { useEffect, useRef } from "react";
import { useEstateEnvironment } from "../context/EstateEnvironmentContext";
import { dashboardSkins, getDashboardSkin } from "../data/dashboardSkins";
import { WILDLIFE_ACTIVITY_LEVELS } from "../data/estateWildlife";
import "./DashboardSkinDialog.css";

export default function DashboardSkinDialog({
  open,
  activeSkinId,
  previewSkinId,
  onPreview,
  onApply,
  onClose,
}) {
  const { settings, updateSetting } = useEstateEnvironment();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeRef.current?.focus());

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
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

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      requestAnimationFrame(() => previousFocusRef.current?.focus?.());
    };
  }, [open, onClose]);

  if (!open) return null;

  const previewSkin = getDashboardSkin(previewSkinId);

  return (
    <div
      className="js-skin-dialog__backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="js-skin-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-skins-title"
        aria-describedby="dashboard-skins-description"
      >
        <header>
          <div>
            <p>Appearance · Dashboard</p>
            <h2 id="dashboard-skins-title">Dashboard Skins</h2>
            <span id="dashboard-skins-description">
              Preview an estate atmosphere, then apply it when you are ready.
            </span>
          </div>
          <button ref={closeRef} type="button" aria-label="Close Dashboard Skins" onClick={onClose}>×</button>
        </header>

        <div className="js-skin-dialog__active-preview" data-tone={previewSkin.overlayTone}>
          <picture>
            <source media="(max-width: 620px)" srcSet={previewSkin.mobileImage} />
            <img src={previewSkin.desktopImage} alt="" />
          </picture>
          <div>
            <span>Previewing</span>
            <strong>{previewSkin.name}</strong>
          </div>
        </div>

        <section className="js-skin-dialog__wildlife" aria-labelledby="wildlife-activity-title">
          <div>
            <p>Estate animation</p>
            <h3 id="wildlife-activity-title">Wildlife Activity</h3>
            <span>Choose how often weather-appropriate birds and insects visit the dashboard.</span>
          </div>
          <label>
            <select
              aria-label="Wildlife Activity"
              value={settings.wildlifeActivity}
              onChange={(event) => updateSetting("wildlifeActivity", event.target.value)}
            >
              {WILDLIFE_ACTIVITY_LEVELS.map((level) => <option key={level}>{level}</option>)}
            </select>
          </label>
        </section>

        <div className="js-skin-dialog__options" role="list">
          {dashboardSkins.map((skin) => {
            const isActive = skin.id === activeSkinId;
            const isPreviewing = skin.id === previewSkinId;
            return (
              <article
                className={`${isActive ? "is-active " : ""}${isPreviewing ? "is-previewing" : ""}`.trim()}
                key={skin.id}
                role="listitem"
              >
                <picture>
                  <img src={skin.thumbnail} alt={`${skin.name} dashboard background preview`} />
                </picture>
                <div className="js-skin-dialog__copy">
                  <span>{isActive ? "Currently Active" : isPreviewing ? "Previewing" : "Dashboard skin"}</span>
                  <strong>{skin.name}</strong>
                  <p>{skin.description}</p>
                </div>
                <div className="js-skin-dialog__actions">
                  <button
                    type="button"
                    aria-pressed={isPreviewing}
                    onClick={() => onPreview(skin.id)}
                  >
                    Preview
                  </button>
                  <button
                    className="is-primary"
                    type="button"
                    disabled={isActive}
                    onClick={() => onApply(skin.id)}
                  >
                    {isActive ? "Currently Active" : "Apply Skin"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <footer>
          <span>Previewing does not change your saved selection.</span>
          <div>
            <button type="button" onClick={onClose}>Cancel</button>
            <button className="is-primary" type="button" onClick={() => onApply(previewSkin.id)}>
              Apply Previewed Skin
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

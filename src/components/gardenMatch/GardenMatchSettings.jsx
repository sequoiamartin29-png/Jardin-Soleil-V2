import React from "react";

export default function GardenMatchSettings({ settings, onChange }) {
  const setSetting = (key, value) => onChange({ ...settings, [key]:value });

  return (
    <details className="garden-match-settings">
      <summary>Game settings</summary>
      <div className="garden-match-settings__grid">
        <label>
          <span>Sound</span>
          <select value={settings.sound ? "on" : "off"} onChange={(event) => setSetting("sound", event.target.value === "on")}>
            <option value="off">Off</option>
            <option value="on">On</option>
          </select>
        </label>
        <label>
          <span>Motion</span>
          <select value={settings.reducedMotion ? "reduced" : "full"} onChange={(event) => setSetting("reducedMotion", event.target.value === "reduced")}>
            <option value="full">Full</option>
            <option value="reduced">Reduced</option>
          </select>
        </label>
        <label>
          <span>Match facts</span>
          <select value={settings.facts ? "on" : "off"} onChange={(event) => setSetting("facts", event.target.value === "on")}>
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
        </label>
        <label>
          <span>Preview</span>
          <select value={settings.previewDuration} onChange={(event) => setSetting("previewDuration", event.target.value)}>
            <option value="difficulty">Difficulty default</option>
            <option value="off">Off</option>
            <option value="short">Short</option>
            <option value="long">Long</option>
          </select>
        </label>
        <label>
          <span>Card size</span>
          <select value={settings.cardSize} onChange={(event) => setSetting("cardSize", event.target.value)}>
            <option value="compact">Compact</option>
            <option value="comfortable">Comfortable</option>
            <option value="large">Large</option>
          </select>
        </label>
        <label>
          <span>Contrast</span>
          <select value={settings.highContrast ? "high" : "standard"} onChange={(event) => setSetting("highContrast", event.target.value === "high")}>
            <option value="standard">Standard</option>
            <option value="high">High contrast</option>
          </select>
        </label>
        <label>
          <span>Buddy hints</span>
          <select value={settings.buddyHints ? "on" : "off"} onChange={(event) => setSetting("buddyHints", event.target.value === "on")}>
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
        </label>
      </div>
    </details>
  );
}

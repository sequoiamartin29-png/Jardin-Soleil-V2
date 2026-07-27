import React from "react";
import EstatePage from "./EstatePage";

const supportEmail = "tierrafleur.design@gmail.com";

export default function Privacy({ onNavigate }) {
  return (
    <EstatePage
      id="privacy-support-title"
      title="Privacy & Support"
      description="A plain-language guide to what Jardin Soleil stores, what leaves your device, and how to get help."
      icon="herb"
      className="js-privacy"
    >
      <section className="js-estate-panel">
        <p>Last updated · July 27, 2026</p>
        <h2>Your garden belongs to you</h2>
        <p>Jardin Soleil does not require an account. Plants, garden zones, journal entries, tasks, saved photos, learning progress, game progress, recipes, and preferences are stored on your device unless you deliberately use an online feature.</p>
        <p>Use <button type="button" className="js-privacy__inline" onClick={() => onNavigate?.("Garden Settings", { settingsSection:"manage" })}>Garden Settings → Manage Garden</button> to export a backup before changing phones, clearing app data, or reinstalling.</p>
      </section>

      <section className="js-estate-panel">
        <h2>Online features you control</h2>
        <ul>
          <li><strong>Weather:</strong> a city or approximate coordinates are sent to Open-Meteo only when weather is requested. Precise location permission is optional.</li>
          <li><strong>Plant Finder:</strong> a selected plant photo and limited observation context are sent through Jardin Soleil’s secure function to Pl@ntNet when you choose photo identification.</li>
          <li><strong>The Conservatory:</strong> external AI is off unless enabled in Conservatory settings. When enabled, your question and only the context options you selected are sent to the configured provider.</li>
          <li><strong>Plant Health:</strong> photo analysis remains local and guided unless an external photo-analysis service is explicitly configured and used.</li>
        </ul>
        <p>Jardin Soleil does not sell personal information or use garden records for advertising.</p>
      </section>

      <section className="js-estate-panel">
        <h2>Device permissions</h2>
        <p>Camera or photo-library access is used only when you choose a photo. Location is used only for local weather or an identification observation. Microphone access is used only when you start voice logging. You can deny these permissions and continue using the rest of the app.</p>
      </section>

      <section className="js-estate-panel">
        <h2>Delete, export, or ask for help</h2>
        <p>You can export, import, or clear local garden data from Garden Settings. Removing the app may permanently remove data that was not exported first.</p>
        <div className="js-privacy__actions">
          <button type="button" onClick={() => onNavigate?.("Garden Settings", { settingsSection:"manage" })}>Open Garden Data Controls</button>
          <a href={`mailto:${supportEmail}`}>Email Support</a>
          <a href="https://tierrafleur.com" target="_blank" rel="noreferrer">Tierra Fleur Designs</a>
        </div>
        <p>Support: <a href={`mailto:${supportEmail}`}>{supportEmail}</a></p>
      </section>
    </EstatePage>
  );
}

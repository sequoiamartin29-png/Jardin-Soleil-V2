import React from "react";
import BotanicalIcon from "./icons/BotanicalIcon";
import "./TeaApothecary.css";

const apothecarySections = [
  ["Tea Blend Library", "Saved tea blends will appear here once blend creation is introduced."],
  ["Herbal Ingredients", "Ingredient profiles will gather the estate’s tea herbs, aromatics, and traditional uses."],
  ["Seasonal Recipes", "Seasonal infusion recipes will be organized here by harvest and time of year."],
  ["Wellness Blends", "Wellness-focused blends will appear here with clear ingredient and preparation notes."],
  ["Favorites", "Favorite blends and recipes will be collected here for quick return visits."],
];

export default function TeaApothecary({ onNavigate }) {
  return (
    <section className="js-apothecary" aria-labelledby="apothecary-title">
      <header className="js-apothecary__hero">
        <BotanicalIcon type="tea" size="xl" decorative />
        <div><p>Jardin Soleil · Herbarium</p><h1 id="apothecary-title">Tea Apothecary</h1><span>A dedicated home for estate-grown teas, ingredients, recipes, and restorative blends.</span></div>
      </header>
      <button className="js-apothecary__back" type="button" onClick={() => onNavigate?.("Learning")}>← Back to Learning Center</button>
      <div className="js-apothecary__grid">
        {apothecarySections.map(([title, empty]) => <article key={title}><BotanicalIcon type={title === "Herbal Ingredients" ? "herb" : "tea"} size="md" decorative /><h2>{title}</h2><p>{empty}</p><span>Collection ready for future entries</span></article>)}
      </div>
    </section>
  );
}

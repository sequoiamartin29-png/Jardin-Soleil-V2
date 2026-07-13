import React, { useState } from "react";
import BotanicalIcon from "./icons/BotanicalIcon";
import { teaBlends } from "../data/teaBlends";
import TeaWorkflow from "./TeaWorkflow";
import "./TeaApothecary.css";

export default function TeaApothecary({ onNavigate, onConsultHerbalist }) {
  const [selectedBlend, setSelectedBlend] = useState(null);

  if (selectedBlend) {
    return <TeaBlendProfile blend={selectedBlend} onBack={() => setSelectedBlend(null)} />;
  }

  return (
    <section className="js-apothecary" aria-labelledby="apothecary-title">
      <header className="js-apothecary__hero">
        <BotanicalIcon type="tea" size="xl" decorative />
        <div><p>Jardin Soleil · Herbarium</p><h1 id="apothecary-title">Tea Apothecary</h1><span>Estate-grown teas, herbal ingredients, seasonal recipes, and restorative botanical blends.</span></div>
      </header>

      <div className="js-apothecary__toolbar">
        <button className="js-apothecary__back" type="button" onClick={() => onNavigate?.("Learning")}>← Back to Learning Center</button>
        <p><strong>{teaBlends.length}</strong> apothecary blends</p>
        <button type="button" onClick={onConsultHerbalist}>Consult the Herbalist</button>
      </div>

      <section aria-labelledby="blend-library-title">
        <div className="js-apothecary__section-heading"><p>Tea Blend Library</p><h2 id="blend-library-title">Estate recipes</h2></div>
        {teaBlends.length ? (
          <div className="js-apothecary__blend-grid">
            {teaBlends.map((blend) => <TeaBlendCard key={blend.id} blend={blend} onOpen={() => setSelectedBlend(blend)} />)}
          </div>
        ) : <p className="js-apothecary__empty">No tea blends have been added to the apothecary yet.</p>}
      </section>

      <TeaWorkflow blends={teaBlends} />
    </section>
  );
}

function TeaBlendCard({ blend, onOpen }) {
  const isAvailable = blend.inventory.quantity > 0;
  return (
    <article className="js-tea-card">
      <div className="js-tea-card__top"><BotanicalIcon type={blend.iconType} size="lg" decorative /><span className={isAvailable ? "is-ready" : "is-waiting"}>{blend.harvestStatus}</span></div>
      <h3>{blend.name}</h3><p className="js-tea-card__subtitle">{blend.subtitle}</p>
      <dl>
        <div><dt>Ingredients</dt><dd>{blend.ingredients.join(" · ")}</dd></div>
        <div><dt>Flavor</dt><dd>{blend.flavorProfile.join(" · ")}</dd></div>
        <div><dt>Wellness</dt><dd>{blend.wellnessBenefits.join(" · ")}</dd></div>
        <div><dt>Brewing</dt><dd>{blend.brewing.temperature} · {blend.brewing.steepTime}</dd></div>
        <div><dt>Caffeine</dt><dd>{blend.caffeineLevel}</dd></div>
        <div><dt>Season</dt><dd>{blend.seasonalAvailability}</dd></div>
        <div><dt>Inventory</dt><dd>{blend.inventory.quantity} {blend.inventory.unit}</dd></div>
      </dl>
      <button type="button" onClick={onOpen} aria-label={`Open ${blend.name} profile`}>View blend profile</button>
    </article>
  );
}

function TeaBlendProfile({ blend, onBack }) {
  return (
    <section className="js-apothecary js-tea-profile" aria-labelledby="tea-blend-title">
      <button className="js-apothecary__back" type="button" onClick={onBack}>← Back to Tea Blend Library</button>
      <header className="js-tea-profile__hero"><BotanicalIcon type={blend.iconType} size="xl" decorative /><div><p>Jardin Soleil · Apothecary Recipe</p><h1 id="tea-blend-title">{blend.name}</h1><span>{blend.subtitle}</span></div><strong>{blend.inventory.quantity} {blend.inventory.unit}</strong></header>
      <div className="js-tea-profile__grid">
        <article><h2>Botanical ingredients</h2><ul>{blend.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul><p className="js-tea-profile__status">{blend.harvestStatus}</p></article>
        <article><h2>Flavor profile</h2><div className="js-tea-profile__tags">{blend.flavorProfile.map((flavor) => <span key={flavor}>{flavor}</span>)}</div><h3>Seasonal availability</h3><p>{blend.seasonalAvailability}</p></article>
        <article><h2>Wellness traditions</h2><ul>{blend.wellnessBenefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul><p><strong>Caffeine:</strong> {blend.caffeineLevel}</p></article>
        <article><h2>Brewing instructions</h2><dl><div><dt>Water</dt><dd>{blend.brewing.temperature}</dd></div><div><dt>Steep</dt><dd>{blend.brewing.steepTime}</dd></div><div><dt>Measure</dt><dd>{blend.brewing.serving}</dd></div></dl></article>
      </div>
      <article className="js-tea-profile__notes"><h2>Apothecary notes</h2><p>{blend.notes}</p></article>
    </section>
  );
}

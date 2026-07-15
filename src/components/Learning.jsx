import React, { useState } from "react";
import BotanicalIcon from "./icons/BotanicalIcon";
import "./Learning.css";

const sections = ["Orchard", "Herbs", "Vegetables", "Botanical Vocabulary"];
const lessonsBySection = {
  Orchard: [
    { title:"Orchard Foundations", description:"Learn fruit tree care, pruning, grafting and harvesting.", level:"Beginner" },
    { title:"Seasonal Pruning", description:"Understand dormant cuts, structure, airflow, and careful summer corrections.", level:"Intermediate" },
  ],
  Herbs: [
    { title:"Herb Garden Foundations", description:"Explore medicinal herbs, tea plants and culinary herbs.", level:"Beginner" },
    { title:"Harvesting Aromatic Herbs", description:"Time and preserve fragrant leaves for tea, kitchen, and apothecary use.", level:"Intermediate" },
  ],
  Vegetables: [
    { title:"Seed to Harvest", description:"Grow vegetables from seed to harvest with thoughtful seasonal care.", level:"Beginner" },
    { title:"Productive Garden Beds", description:"Plan succession, companion planting, and soil renewal for productive beds.", level:"Advanced" },
  ],
  "Botanical Vocabulary": [
    { title:"The Language of Plants", description:"Study horticulture and botany terms used throughout Jardin Soleil.", level:"Beginner" },
    { title:"Plant Structure & Growth", description:"Learn cambium, xylem, phloem, canopy, rootstock, and scion terminology.", level:"Intermediate" },
  ],
};

export default function Learning({ onNavigate }) {
  const [activeSection, setActiveSection] = useState("Orchard");
  const [favorites, setFavorites] = useState(() => new Set());
  const [completed, setCompleted] = useState(() => new Set());
  const lessons = lessonsBySection[activeSection] || [];
  const toggle = (setter, title) => setter((current) => {
    const next = new Set(current);
    if (next.has(title)) next.delete(title); else next.add(title);
    return next;
  });

  return (
    <section className="js-learning" aria-labelledby="learning-title">
      <header className="js-learning__hero">
        <p>Jardin Soleil · Botanical Education</p>
        <h1 id="learning-title">Learning Center</h1>
        <span>Grow your horticultural knowledge alongside the estate.</span>
      </header>

      <div className="js-learning__layout">
        <nav className="js-learning__sections" aria-label="Botanical learning sections" role="tablist" aria-orientation="vertical">
          <h2>Botanical Learning</h2>
          {sections.map((section) => (
            <button key={section} type="button" role="tab" aria-selected={activeSection === section} aria-controls="learning-section-panel" onClick={() => setActiveSection(section)}>{section}</button>
          ))}
        </nav>

        <div className="js-learning__panel" id="learning-section-panel" role="tabpanel" tabIndex="0">
          <div className="js-learning__panel-heading"><div><p>Current study</p><h2>{activeSection}</h2></div><span>{completed.size} lessons completed</span></div>
          {lessons.length ? (
            <div className="js-learning__lessons">
              {lessons.map((lesson) => (
                <article key={lesson.title}>
                  <span className="js-learning__level">{lesson.level}</span>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                  <div className="js-learning__lesson-actions">
                    <button type="button" aria-pressed={completed.has(lesson.title)} onClick={() => toggle(setCompleted, lesson.title)}>{completed.has(lesson.title) ? "✓ Completed" : "Mark complete"}</button>
                    <button type="button" aria-pressed={favorites.has(lesson.title)} onClick={() => toggle(setFavorites, lesson.title)}>{favorites.has(lesson.title) ? "★ Favorite" : "☆ Favorite"}</button>
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="js-learning__empty">No lessons are available in this section yet.</p>}
        </div>
      </div>

      <section className="js-learning__feature js-learning__feature--tea" aria-labelledby="tea-feature-title">
        <BotanicalIcon type="tea" size="xl" decorative />
        <div><p>Dedicated collection</p><h2 id="tea-feature-title">Tea Apothecary</h2><span>Explore blend libraries, herbal ingredients, seasonal recipes, and wellness infusions.</span></div>
        <button type="button" onClick={() => onNavigate?.("Tea Apothecary")}>Enter Tea Apothecary</button>
      </section>

      <section className="js-learning__games" aria-labelledby="games-title">
        <div className="js-learning__section-title"><p>Interactive study</p><h2 id="games-title">Botanical Games</h2></div>
        <div>
          <article><span aria-hidden="true">🔎</span><h3>Word Search</h3><p>Play verified horticulture word-search puzzles at four difficulty levels.</p><button type="button" onClick={() => onNavigate?.("Word Search")}>Play Word Search</button></article>
          <article><span aria-hidden="true">🌿</span><h3>Garden Match</h3><p>Pair collectible botanical cards from the orchard, gardens, and estate journal.</p><button type="button" onClick={() => onNavigate?.("Garden Match")}>Play Garden Match</button></article>
          <article><span aria-hidden="true">🏆</span><h3>Garden Challenges</h3><p>Complete daily and seasonal gardening challenges.</p><button type="button" onClick={() => onNavigate?.("Garden Challenges")}>Open Challenges</button></article>
        </div>
      </section>
    </section>
  );
}

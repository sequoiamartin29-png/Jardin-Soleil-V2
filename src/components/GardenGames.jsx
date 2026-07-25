import React from "react";
import BotanicalIcon from "./icons/BotanicalIcon";
import EstatePage from "./EstatePage";
import "./GardenGames.css";

const games = [
  {
    title:"Garden Match",
    route:"Garden Match",
    icon:"flower",
    badge:"Memory game",
    description:"Match botanical cards from the orchard, gardens, and living collections.",
    accent:"sage",
  },
  {
    title:"Daily Challenges",
    route:"Garden Challenges",
    icon:"generic-fruit-tree",
    badge:"Daily activities",
    description:"Complete three rotating garden prompts and build a steady seasonal streak.",
    accent:"rose",
  },
  {
    title:"Botanical Word Search",
    route:"Word Search",
    icon:"mint",
    badge:"Word puzzle",
    description:"Find garden and horticulture words across four thoughtfully prepared levels.",
    accent:"lavender",
  },
];

export default function GardenGames({ onNavigate }) {
  return (
    <EstatePage
      id="garden-games-title"
      eyebrow="Jardin Soleil · Botanical Games"
      title="Garden Games"
      description="A quiet collection of botanical games, daily activities, and garden puzzles."
      icon="flower"
      className="js-garden-games"
      actions={<button className="js-estate-button" type="button" onClick={() => onNavigate?.("Dashboard")}>Back to Dashboard</button>}
    >
      <section className="js-garden-games__intro" aria-labelledby="garden-games-collection-title">
        <span aria-hidden="true">JS</span>
        <div>
          <p>Play at your own pace</p>
          <h2 id="garden-games-collection-title">Choose a garden game</h2>
          <small>Progress and rewards remain saved on this device.</small>
        </div>
      </section>

      <div className="js-garden-games__grid">
        {games.map((game) => (
          <article className={`js-garden-game-card is-${game.accent}`} key={game.route}>
            <div>
              <BotanicalIcon type={game.icon} size="lg" decorative />
              <span>{game.badge}</span>
            </div>
            <h2>{game.title}</h2>
            <p>{game.description}</p>
            <button type="button" onClick={() => onNavigate?.(game.route)}>
              Open {game.title}<span aria-hidden="true">→</span>
            </button>
          </article>
        ))}
      </div>
    </EstatePage>
  );
}

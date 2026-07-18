import React from "react";
import BotanicalIcon from "./icons/BotanicalIcon";
import EstatePage from "./EstatePage";
import "./BuddyGarden.css";

const games = [
  {
    title:"Garden Match",
    route:"Garden Match",
    icon:"flower",
    badge:"Memory game",
    description:"Match botanical cards from the orchard, gardens, and Jardin Soleil collections.",
    detail:"Collect pairs and play the complete upgraded Garden Match experience.",
    accent:"sage",
  },
  {
    title:"Garden Challenge",
    route:"Garden Challenges",
    icon:"apple",
    badge:"Estate challenges",
    description:"Complete daily, weekly, and seasonal goals inspired by activity around the estate.",
    detail:"Track progress and celebrate each finished garden challenge.",
    accent:"rose",
  },
  {
    title:"Word Search",
    route:"Word Search",
    icon:"mint",
    badge:"Word puzzle",
    description:"Find garden and horticulture words across four thoughtfully prepared difficulty levels.",
    detail:"Choose a puzzle and put your botanical vocabulary to work.",
    accent:"lavender",
  },
];

export default function BuddyGarden({ onNavigate }) {
  return <EstatePage
    id="buddy-garden-title"
    eyebrow="Jardin Soleil · Botanical Games"
    title="Buddy’s Garden"
    description="Choose a garden game to play."
    icon="tree"
    className="js-buddy-garden"
    actions={<button className="js-estate-button" type="button" onClick={() => onNavigate?.("Dashboard")}>Back to Dashboard</button>}
  >
    <section className="js-buddy-garden__welcome" aria-labelledby="buddy-game-collection-title">
      <div className="js-buddy-garden__buddy" aria-hidden="true"><span>JS</span><i>🐾</i></div>
      <div><p>Meet Buddy by the garden gate</p><h2 id="buddy-game-collection-title">What shall we play today?</h2><span>Every completed Jardin Soleil garden game is gathered here.</span></div>
    </section>

    <div className="js-buddy-garden__grid">
      {games.map((game, index) => <article className={`js-buddy-game-card is-${game.accent}`} key={game.route} style={{ "--card-order":index }}>
        <div className="js-buddy-game-card__top"><BotanicalIcon type={game.icon} size="lg" decorative/><span>{game.badge}</span></div>
        <h2>{game.title}</h2>
        <p>{game.description}</p>
        <small>{game.detail}</small>
        <button type="button" onClick={() => onNavigate?.(game.route)} aria-label={`Play ${game.title}`}>Play {game.title}<span aria-hidden="true">→</span></button>
      </article>)}
    </div>

    <aside className="js-buddy-garden__note"><span aria-hidden="true">✦</span><p><strong>Buddy’s tip</strong> Take your time, notice the details, and enjoy the garden.</p></aside>
  </EstatePage>;
}

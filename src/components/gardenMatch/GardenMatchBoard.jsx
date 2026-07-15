import React from "react";
import GardenMatchCard from "./GardenMatchCard";

export default function GardenMatchBoard({ deck, flippedIds, matchedPairIds, hintIds = [], locked, previewActive, difficultyId, settings, onSelect }) {
  if (!deck.length) {
    return <p className="garden-match__empty" role="status">This garden collection does not have enough complete pairs yet. Please choose another category.</p>;
  }

  return (
    <div
      className={`garden-match-board garden-match-board--${difficultyId} garden-match-board--cards-${settings.cardSize}${settings.highContrast ? " is-high-contrast" : ""}${settings.reducedMotion ? " is-reduced-motion" : ""}`}
      aria-label="Garden Match card board"
      aria-busy={locked || previewActive}
    >
      {deck.map((card) => (
        <GardenMatchCard
          key={card.instanceId}
          card={card}
          isFlipped={previewActive || flippedIds.includes(card.instanceId)}
          isMatched={matchedPairIds.has(card.pairId)}
          isHinted={hintIds.includes(card.instanceId)}
          disabled={locked || previewActive}
          reducedMotion={settings.reducedMotion}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

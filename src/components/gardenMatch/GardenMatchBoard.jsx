import React from "react";
import GardenMatchCard from "./GardenMatchCard";

export default function GardenMatchBoard({ deck, flippedIds, matchedPairIds, locked, difficultyId, onSelect }) {
  if (!deck.length) {
    return <p className="garden-match__empty" role="status">This garden collection does not have enough complete pairs yet. Please choose another category.</p>;
  }

  return (
    <div
      className={`garden-match-board garden-match-board--${difficultyId}`}
      aria-label="Garden Match card board"
      aria-busy={locked}
    >
      {deck.map((card) => (
        <GardenMatchCard
          key={card.instanceId}
          card={card}
          isFlipped={flippedIds.includes(card.instanceId)}
          isMatched={matchedPairIds.has(card.pairId)}
          disabled={locked}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

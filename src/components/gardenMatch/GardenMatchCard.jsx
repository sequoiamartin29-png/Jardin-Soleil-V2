import React from "react";
import { gardenMatchCardTypeLabels } from "../../data/gardenMatchData";
import { activateGardenMatchFromKeyboard } from "../../utils/gardenMatchGame";

export default function GardenMatchCard({ card, isFlipped, isMatched, disabled, onSelect }) {
  const stateLabel = isMatched
    ? `${card.title}, matched`
    : isFlipped
      ? `${card.title}, face up`
      : "Face-down Jardin Soleil botanical card";

  return (
    <button
      className={`garden-match-card${isFlipped || isMatched ? " is-flipped" : ""}${isMatched ? " is-matched" : ""}`}
      type="button"
      aria-label={stateLabel}
      aria-pressed={isFlipped || isMatched}
      data-pair-id={card.pairId}
      disabled={disabled || isMatched}
      onClick={() => onSelect(card)}
      onKeyDown={(event) => activateGardenMatchFromKeyboard(event, () => onSelect(card))}
    >
      <span className="garden-match-card__inner">
        <span className="garden-match-card__face garden-match-card__back" aria-hidden={isFlipped || isMatched}>
          <span className="garden-match-card__vine garden-match-card__vine--top" aria-hidden="true">❦</span>
          <span className="garden-match-card__crest" aria-hidden="true">JS</span>
          <span className="garden-match-card__estate">Jardin Soleil</span>
          <span className="garden-match-card__vine garden-match-card__vine--bottom" aria-hidden="true">❧</span>
        </span>
        <span className="garden-match-card__face garden-match-card__front" aria-hidden={!isFlipped && !isMatched}>
          <span className="garden-match-card__type">{gardenMatchCardTypeLabels[card.cardType] || card.cardType}</span>
          <span className="garden-match-card__art" aria-hidden="true">
            {card.image ? <img src={card.image} alt="" /> : <span>{card.emoji}</span>}
          </span>
          <strong>{card.title}</strong>
          {card.description && <small>{card.description}</small>}
          {isMatched && <span className="garden-match-card__matched-label">Matched</span>}
        </span>
      </span>
    </button>
  );
}

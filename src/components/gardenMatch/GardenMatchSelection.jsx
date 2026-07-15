import React from "react";
import { activateGardenMatchFromKeyboard, formatGardenMatchTime } from "../../utils/gardenMatchGame";

export default function GardenMatchSelection({ categories, difficulties, categoryId, difficultyId, scores, onCategoryChange, onDifficultyChange, onStart }) {
  const selectedScore = scores[`${categoryId}:${difficultyId}`];

  return (
    <div className="garden-match-selection">
      <section aria-labelledby="garden-match-category-title">
        <div className="garden-match-section-heading">
          <span>First, choose a collection</span>
          <h2 id="garden-match-category-title">Which garden shall we explore?</h2>
        </div>
        <div className="garden-match-category-grid" role="group" aria-label="Garden Match categories">
          {categories.map((category) => (
            <button
              className={`garden-match-category${category.id === categoryId ? " is-selected" : ""}`}
              type="button"
              key={category.id}
              aria-pressed={category.id === categoryId}
              onClick={() => onCategoryChange(category.id)}
              onKeyDown={(event) => activateGardenMatchFromKeyboard(event, () => onCategoryChange(category.id))}
            >
              <span aria-hidden="true">{category.emoji}</span>
              <strong>{category.label}</strong>
              <small>{category.description}</small>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="garden-match-difficulty-title">
        <div className="garden-match-section-heading">
          <span>Then, choose a challenge</span>
          <h2 id="garden-match-difficulty-title">How many pairs are blooming?</h2>
        </div>
        <div className="garden-match-difficulty-grid" role="group" aria-label="Garden Match difficulty levels">
          {difficulties.map((difficulty) => (
            <button
              className={`garden-match-difficulty${difficulty.id === difficultyId ? " is-selected" : ""}`}
              type="button"
              key={difficulty.id}
              aria-pressed={difficulty.id === difficultyId}
              onClick={() => onDifficultyChange(difficulty.id)}
              onKeyDown={(event) => activateGardenMatchFromKeyboard(event, () => onDifficultyChange(difficulty.id))}
            >
              <span>{difficulty.pairCount} pairs</span>
              <strong>{difficulty.label}</strong>
              <small>{difficulty.description}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="garden-match-selection__footer">
        <div aria-live="polite">
          {selectedScore ? (
            <><span>Estate best</span><strong>{formatGardenMatchTime(selectedScore.bestTimeMs)} · {selectedScore.bestMoves} moves</strong></>
          ) : (
            <><span>Estate best</span><strong>No completed game yet</strong></>
          )}
        </div>
        <button className="garden-match-button garden-match-button--primary" type="button" onClick={onStart} onKeyDown={(event) => activateGardenMatchFromKeyboard(event, onStart)}>Begin Garden Match</button>
      </div>
    </div>
  );
}

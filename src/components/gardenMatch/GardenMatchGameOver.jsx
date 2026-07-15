import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function GardenMatchGameOver({ reason, onReplay, onNewGame }) {
  const replayRef = useRef(null);
  useEffect(() => { replayRef.current?.focus(); }, []);

  return createPortal(
    <div className="garden-match-completion-backdrop">
      <div className="garden-match-completion garden-match-game-over" role="dialog" aria-modal="true" aria-labelledby="garden-match-over-title">
        <div className="garden-match-completion__seal" aria-hidden="true">JS</div>
        <p>The garden gate has gently closed</p>
        <h2 id="garden-match-over-title">{reason === "moves" ? "The Last Move Was Used" : "The Sundial Has Set"}</h2>
        <p className="garden-match-game-over__copy">
          {reason === "moves"
            ? "A few botanical pairs are still waiting. Try a new path through the cards."
            : "The estate clock has chimed, but every card will be waiting for another stroll."}
        </p>
        <div className="garden-match-completion__actions">
          <button ref={replayRef} className="garden-match-button garden-match-button--primary" type="button" onClick={onReplay}>Try This Garden Again</button>
          <button className="garden-match-button" type="button" onClick={onNewGame}>Choose a New Game</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

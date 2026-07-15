import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { activateGardenMatchFromKeyboard, formatGardenMatchTime } from "../../utils/gardenMatchGame";

export default function GardenMatchCompletion({ result, category, difficulty, bestScore, onReplay, onNewGame }) {
  const replayRef = useRef(null);

  useEffect(() => {
    replayRef.current?.focus();
  }, []);

  return createPortal(
    <div className="garden-match-completion-backdrop">
      <div className="garden-match-completion" role="dialog" aria-modal="true" aria-labelledby="garden-match-complete-title">
        <div className="garden-match-completion__petals" aria-hidden="true"><span>✦</span><span>❀</span><span>✦</span></div>
        <div className="garden-match-completion__seal" aria-hidden="true">JS</div>
        <p>Every botanical pair has been gathered</p>
        <h2 id="garden-match-complete-title">The Garden Is Matched!</h2>
        <div className="garden-match-completion__stats">
          <span><small>Time</small><strong>{formatGardenMatchTime(result.timeMs)}</strong></span>
          <span><small>Moves</small><strong>{result.moves}</strong></span>
          <span><small>Collection</small><strong>{category.label}</strong></span>
          <span><small>Difficulty</small><strong>{difficulty.label}</strong></span>
        </div>
        {bestScore && <p className="garden-match-completion__best">Estate best · {formatGardenMatchTime(bestScore.bestTimeMs)} · {bestScore.bestMoves} moves</p>}
        <div className="garden-match-completion__actions">
          <button ref={replayRef} className="garden-match-button garden-match-button--primary" type="button" onClick={onReplay} onKeyDown={(event) => activateGardenMatchFromKeyboard(event, onReplay)}>Replay This Garden</button>
          <button className="garden-match-button" type="button" onClick={onNewGame} onKeyDown={(event) => activateGardenMatchFromKeyboard(event, onNewGame)}>Choose a New Game</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

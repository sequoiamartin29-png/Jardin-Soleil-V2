import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { formatGardenMatchTime } from "../../utils/gardenMatchGame";

export default function GardenMatchCompletion({ result, collection, difficulty, mode, bestScore, dailyRewardGranted, newRewards = [], onReplay, onNewGame }) {
  const replayRef = useRef(null);

  useEffect(() => { replayRef.current?.focus(); }, []);

  return createPortal(
    <div className="garden-match-completion-backdrop">
      <div className="garden-match-completion" role="dialog" aria-modal="true" aria-labelledby="garden-match-complete-title">
        <div className="garden-match-completion__petals" aria-hidden="true"><span>✦</span><span>❀</span><span>✦</span></div>
        <div className="garden-match-completion__seal" aria-hidden="true">JS</div>
        <p>Every botanical pair has been gathered</p>
        <h2 id="garden-match-complete-title">The Garden Is Matched!</h2>
        <strong className="garden-match-completion__rank">{result.rank}</strong>
        <div className="garden-match-completion__stats">
          <span><small>Score</small><strong>{result.score.toLocaleString()}</strong></span>
          <span><small>Time</small><strong>{formatGardenMatchTime(result.timeMs)}</strong></span>
          <span><small>Moves</small><strong>{result.moves}</strong></span>
          <span><small>Accuracy</small><strong>{Math.round(result.accuracy * 100)}%</strong></span>
          <span><small>Efficiency</small><strong>+{result.efficiency}</strong></span>
          <span><small>Hints</small><strong>{result.hintsUsed}</strong></span>
          <span><small>Best combo</small><strong>{result.highestCombo}</strong></span>
          <span><small>Mode</small><strong>{mode.label}</strong></span>
          <span><small>Collection</small><strong>{collection.title}</strong></span>
          <span><small>Difficulty</small><strong>{difficulty.label}</strong></span>
        </div>
        <p className="garden-match-completion__fact"><span>Estate note</span>{collection.completionFact}</p>
        {bestScore && <p className="garden-match-completion__best">Estate best · {formatGardenMatchTime(bestScore.bestTimeMs)} · {bestScore.bestMoves} moves{bestScore.bestScore ? ` · ${bestScore.bestScore.toLocaleString()} points` : ""}</p>}
        {dailyRewardGranted && <p className="garden-match-completion__reward">✦ Today's Daily Bloom reward has been added to your estate keepsakes.</p>}
        {newRewards.length > 0 && <p className="garden-match-completion__reward">Unlocked: {newRewards.join(", ")}</p>}
        <div className="garden-match-completion__actions">
          <button ref={replayRef} className="garden-match-button garden-match-button--primary" type="button" onClick={onReplay}>Replay This Garden</button>
          <button className="garden-match-button" type="button" onClick={onNewGame}>Choose a New Game</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

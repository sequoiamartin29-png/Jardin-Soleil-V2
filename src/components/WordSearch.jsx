import React, { useState } from "react";
import { createWordSearchPuzzle, lineBetween } from "../utils/wordSearchPuzzle";

const difficultyCounts = { Easy: 6, Medium: 10, Hard: 14, Expert: 18 };
const cellKey = ({ row, column }) => `${row}-${column}`;

export default function WordSearch() {
  const [difficulty, setDifficulty] = useState("Easy");
  const [puzzle, setPuzzle] = useState(() => createWordSearchPuzzle(difficultyCounts.Easy));
  const [selectionStart, setSelectionStart] = useState(null);
  const [foundWords, setFoundWords] = useState(() => new Set());
  const [foundCells, setFoundCells] = useState(() => new Set());
  const [message, setMessage] = useState("Select the first and last letter of a word.");

  const startNewPuzzle = (level = difficulty) => {
    setPuzzle(createWordSearchPuzzle(difficultyCounts[level]));
    setSelectionStart(null);
    setFoundWords(new Set());
    setFoundCells(new Set());
    setMessage("New puzzle ready. Select the first and last letter of a word.");
  };

  const changeDifficulty = (level) => {
    setDifficulty(level);
    startNewPuzzle(level);
  };

  const selectCell = (row, column) => {
    if (!selectionStart) {
      setSelectionStart({ row, column });
      setMessage("Now select the final letter.");
      return;
    }

    const path = lineBetween(selectionStart, { row, column });
    setSelectionStart(null);
    if (!path) {
      setMessage("Selections must be horizontal, vertical, or diagonal.");
      return;
    }

    const selectedText = path.map((cell) => puzzle.grid[cell.row][cell.column]).join("");
    const reversedText = [...selectedText].reverse().join("");
    const matchedWord = puzzle.words.find((word) =>
      !foundWords.has(word) && (word === selectedText || word === reversedText)
    );

    if (!matchedWord) {
      setMessage("That selection is not an unfound target word. Try again.");
      return;
    }

    const nextFoundWords = new Set(foundWords).add(matchedWord);
    const nextFoundCells = new Set(foundCells);
    path.forEach((cell) => nextFoundCells.add(cellKey(cell)));
    setFoundWords(nextFoundWords);
    setFoundCells(nextFoundCells);
    setMessage(nextFoundWords.size === puzzle.words.length ? "Garden complete! Every word has been found." : `${matchedWord} found!`);
  };

  return (
    <section style={{ marginTop:"50px" }}>
      <h2 style={{ fontSize:"42px", color:"#5D6B46" }}>🎮 Garden Word Search</h2>
      <p style={{ color:"#777", fontSize:"18px", marginBottom:"30px" }}>Every game contains a verified set of hidden Jardin Soleil words.</p>

      <div style={{ display:"flex", gap:"12px", flexWrap:"wrap", marginBottom:"30px" }}>
        {Object.keys(difficultyCounts).map((level) => (
          <button key={level} type="button" onClick={() => changeDifficulty(level)} style={{ background:difficulty===level ? "#8FA06A" : "#B8C8A0" }}>{level}</button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"24px" }}>
        <div className="card" style={{ minHeight:"360px", background:"linear-gradient(135deg,#FFFDF9,#F8F3EC)" }}>
          <h3>🧩 Puzzle Board</h3>
          <p aria-live="polite" style={{ color:"#68735B", minHeight:"24px" }}>{message}</p>
          <div role="grid" aria-label={`${difficulty} word-search puzzle`} style={{ display:"grid", gridTemplateColumns:`repeat(${puzzle.grid.length},1fr)`, gap:"6px", marginTop:"12px" }}>
            {puzzle.grid.flatMap((row, rowIndex) => row.map((letter, columnIndex) => {
              const key = `${rowIndex}-${columnIndex}`;
              const isStart = selectionStart?.row === rowIndex && selectionStart?.column === columnIndex;
              const isFound = foundCells.has(key);
              return (
                <button
                  role="gridcell"
                  type="button"
                  key={key}
                  aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}, ${letter}`}
                  aria-pressed={isStart || isFound}
                  onClick={() => selectCell(rowIndex, columnIndex)}
                  style={{ background:isFound ? "#DDE8CC" : isStart ? "#F2D8DF" : "#FFF", border:isStart ? "2px solid #C58B9A" : "1px solid transparent", borderRadius:"8px", minWidth:0, padding:"8px 2px", textAlign:"center", fontWeight:"bold", color:"#5D6B46", boxShadow:"0 4px 10px rgba(0,0,0,.06)" }}
                >
                  {letter}
                </button>
              );
            }))}
          </div>
        </div>

        <div className="card">
          <h3>🌿 Words To Find</h3>
          <ul>{puzzle.words.map((word) => <li key={word} style={{ textDecoration:foundWords.has(word) ? "line-through" : "none", color:foundWords.has(word) ? "#7F9B74" : "inherit" }}>{word}</li>)}</ul>
          <button type="button" onClick={() => startNewPuzzle()}>🔄 New Puzzle</button>
          {foundWords.size === puzzle.words.length && <p role="status" style={{ color:"#53633F", fontWeight:700 }}>🏆 Garden complete!</p>}
        </div>

        <div className="card">
          <h3>🏆 How to Play</h3>
          <ul><li>Select the first and last letter of a word.</li><li>Words run horizontally, vertically, or diagonally.</li><li>Words may read forward or backward.</li><li>Matching letters may overlap.</li></ul>
        </div>
      </div>
    </section>
  );
}

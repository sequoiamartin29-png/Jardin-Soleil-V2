export const WORD_SEARCH_SIZE = 10;

export const gardenVocabulary = [
  "APPLE", "PEAR", "PLUM", "CHERRY", "LEMON", "KISHU", "PAGE", "PEACH", "APRICOT",
  "NECTARINE", "GRAFT", "ROOT", "CANOPY", "CAMBIUM", "XYLEM", "PHLOEM", "MULCH",
  "PRUNE", "HARVEST", "BLOOM", "MINT", "THYME", "STEVIA", "CHAMOMILE", "SAGE",
  "TOMATO", "PEPPER", "EGGPLANT", "SQUASH", "ZUCCHINI", "CARROT", "LETTUCE",
  "POLLEN", "FLOWER", "SEED", "ORCHARD"
];

export const directions = [
  [-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const shuffle = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
};

const coordinatesFor = (row, column, [rowStep, columnStep], length, size) => {
  const endRow = row + rowStep * (length - 1);
  const endColumn = column + columnStep * (length - 1);
  if (endRow < 0 || endRow >= size || endColumn < 0 || endColumn >= size) return null;
  return Array.from({ length }, (_, index) => [row + rowStep * index, column + columnStep * index]);
};

const placementCandidates = (grid, word, size) => {
  const candidates = [];
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      directions.forEach((direction) => {
        const coordinates = coordinatesFor(row, column, direction, word.length, size);
        if (coordinates && coordinates.every(([r, c], index) => !grid[r][c] || grid[r][c] === word[index])) {
          const overlap = coordinates.reduce((total, [r, c]) => total + (grid[r][c] ? 1 : 0), 0);
          candidates.push({ coordinates, overlap });
        }
      });
    }
  }

  return shuffle(candidates).sort((a, b) => b.overlap - a.overlap);
};

const placeAllWords = (grid, words, placements, size, index = 0) => {
  if (index === words.length) return true;
  const word = words[index];
  const candidates = placementCandidates(grid, word, size).slice(0, 90);

  for (const { coordinates } of candidates) {
    const newlyFilled = [];
    coordinates.forEach(([row, column], letterIndex) => {
      if (!grid[row][column]) newlyFilled.push([row, column]);
      grid[row][column] = word[letterIndex];
    });
    placements[word] = coordinates;

    if (placeAllWords(grid, words, placements, size, index + 1)) return true;

    newlyFilled.forEach(([row, column]) => { grid[row][column] = ""; });
    delete placements[word];
  }
  return false;
};

export function wordExists(grid, word) {
  const normalizedWord = word.toUpperCase();
  const size = grid.length;
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      for (const direction of directions) {
        const coordinates = coordinatesFor(row, column, direction, normalizedWord.length, size);
        if (coordinates && coordinates.every(([r, c], index) => grid[r][c] === normalizedWord[index])) return true;
      }
    }
  }
  return false;
}

export function verifyPuzzle({ grid, words }) {
  return words.every((word) => wordExists(grid, word));
}

export function createWordSearchPuzzle(wordCount, size = wordCount >= 14 ? 12 : WORD_SEARCH_SIZE) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const selectedWords = shuffle(gardenVocabulary.filter((word) => word.length <= size)).slice(0, wordCount);
    const placementOrder = [...selectedWords].sort((a, b) => b.length - a.length);
    const grid = Array.from({ length: size }, () => Array(size).fill(""));
    const placements = {};
    if (!placeAllWords(grid, placementOrder, placements, size)) continue;

    grid.forEach((row) => row.forEach((cell, column) => {
      if (!cell) row[column] = alphabet[Math.floor(Math.random() * alphabet.length)];
    }));

    const puzzle = { grid, words: selectedWords, placements };
    if (verifyPuzzle(puzzle)) return puzzle;
  }

  throw new Error("Unable to generate a complete word-search puzzle.");
}

export function lineBetween(start, end) {
  if (!start || !end) return null;
  const rowDistance = end.row - start.row;
  const columnDistance = end.column - start.column;
  const isStraight = rowDistance === 0 || columnDistance === 0 || Math.abs(rowDistance) === Math.abs(columnDistance);
  if (!isStraight) return null;
  const length = Math.max(Math.abs(rowDistance), Math.abs(columnDistance)) + 1;
  const rowStep = Math.sign(rowDistance);
  const columnStep = Math.sign(columnDistance);
  return Array.from({ length }, (_, index) => ({ row: start.row + rowStep * index, column: start.column + columnStep * index }));
}

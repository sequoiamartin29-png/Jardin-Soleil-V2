export function normalizePlantText(value = "") {
  return value.toLocaleLowerCase().trim().replace(/\s+/g, " ");
}

export function isOrchardFruitTree(plant) {
  const identity = [plant?.category, plant?.type, plant?.group, plant?.variety, plant?.name]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return /\borchards?\b|\bcitrus(?:es)?\b|fruit trees?|\bapples?\b|\bpears?\b|\bplums?\b|\bcherr(?:y|ies)\b|peaches?|nectarines?|apricots?|\bfigs?\b|stone fruit/.test(identity);
}

export const isFruitTreeRecord = isOrchardFruitTree;

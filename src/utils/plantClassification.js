export function normalizePlantText(value = "") {
  return value.toLocaleLowerCase().trim().replace(/\s+/g, " ");
}

export function isOrchardFruitTree(plant) {
  return orchardDirectoryGroups.includes(getPlantDirectoryGroup(plant));
}

export const isFruitTreeRecord = isOrchardFruitTree;

const edibleHerbCategories = new Set([
  "herb", "herbs", "herbs & tea", "herbs and tea", "tea herb", "tea herbs",
  "culinary herb", "culinary herbs", "vegetable", "vegetables", "edible", "edibles"
]);
const explicitlyNonEdibleCategories = new Set([
  "orchard", "fruit tree", "fruit trees", "citrus", "citrus tree", "citrus trees",
  "flower", "flowers", "flowers & perennials", "flowers and perennials", "shrub", "shrubs"
]);

export function isEdibleOrHerbPlant(plant) {
  if (!plant?.id || plant.collection === "Mint Collection" || normalizePlantText(plant.id).replace(/[_-]+/g, " ") === "mint collection") return false;
  const category = normalizePlantText(plant.category).replace(/[_-]+/g, " ");
  const group = normalizePlantText(plant.group).replace(/[_-]+/g, " ");
  const type = normalizePlantText(plant.type).replace(/[_-]+/g, " ");
  if (explicitlyNonEdibleCategories.has(category)) return false;
  if (edibleHerbCategories.has(category) || edibleHerbCategories.has(group)) return true;
  return ["mint", "sage", "herb", "tea herb", "culinary herb", "tomato", "pepper", "eggplant", "cucumber", "squash", "vegetable"].includes(type);
}

const gardenLocationAliases = new Map([
  ["herbs garden", "Herb & Tea Garden"], ["herb garden", "Herb & Tea Garden"],
  ["herbs & tea garden", "Herb & Tea Garden"], ["herbs and tea garden", "Herb & Tea Garden"],
  ["vegetables garden", "Vegetable Garden"], ["vegetable garden", "Vegetable Garden"],
  ["flowers garden", "Flower & Perennial Garden"], ["flower garden", "Flower & Perennial Garden"],
  ["flowers & perennials garden", "Flower & Perennial Garden"], ["flowers and perennials garden", "Flower & Perennial Garden"],
]);

export function normalizeGardenLocation(location) {
  const normalized = normalizePlantText(location).replace(/[_-]+/g, " ");
  if (!normalized || ["unknown", "unassigned", "not recorded", "none"].includes(normalized)) return "";
  return gardenLocationAliases.get(normalized) || normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getUniqueGardenBeds(plants = []) {
  return [...new Set(plants.map((plant) => normalizeGardenLocation(plant.location)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity:"base" }));
}

export function countUniquePlants(plants = [], predicate = () => true) {
  const ids = new Set();
  plants.forEach((plant) => { if (predicate(plant) && plant.id) ids.add(plant.id); });
  return ids.size;
}

export function getMintVarietyNames(plants = []) {
  const varieties = new Set();
  plants.forEach((plant) => {
    if (normalizePlantText(plant.id).replace(/[_-]+/g, " ") === "mint collection") return;
    const type = normalizePlantText(plant.type).replace(/[_-]+/g, " ");
    if (type !== "mint") return;
    const listed = String(plant.variety || "").split(",").map((name) => name.trim()).filter(Boolean);
    if (listed.length) listed.forEach((name) => varieties.add(normalizePlantText(name)));
    else if (plant.name) varieties.add(normalizePlantText(plant.name));
  });
  return [...varieties].sort((a, b) => a.localeCompare(b));
}

export const plantDirectoryGroups = [
  "Citrus Trees",
  "Apples",
  "Pears",
  "Plums",
  "Cherries",
  "Peach / Stone Fruit",
  "Figs",
  "Other Fruit Trees",
  "Berries and Vines",
  "Herbs",
  "Vegetables",
  "Flowers and Perennials",
  "Houseplants and Container Plants",
  "Other / Uncategorized"
];

export const orchardDirectoryGroups = [
  "Apples", "Pears", "Plums", "Cherries", "Citrus Trees",
  "Peach / Stone Fruit", "Figs", "Other Fruit Trees"
];

export function getPlantDirectoryGroup(plant) {
  const category = normalizePlantText(plant?.category).replace(/[_-]+/g, " ");
  const type = normalizePlantText(plant?.type).replace(/[_-]+/g, " ");
  const group = normalizePlantText(plant?.group).replace(/[_-]+/g, " ");

  if (["vegetable", "vegetables"].includes(category)) return "Vegetables";
  if (["herb", "herbs", "herbs & tea", "herbs and tea", "tea"].includes(category)) return "Herbs";
  if (["flower", "flowers", "flowers & perennials", "flowers and perennials", "perennial", "perennials"].includes(category)) return "Flowers and Perennials";
  if (["berries", "berry", "berries and vines", "vines"].includes(category)) return "Berries and Vines";
  if (["houseplant", "houseplants", "container plant", "container plants"].includes(category)) return "Houseplants and Container Plants";

  if (["plum", "plums"].includes(group)) return "Plums";
  if (["peach", "peaches", "peach / stone fruit", "stone fruit"].includes(group)) return "Peach / Stone Fruit";
  if (["fig", "figs"].includes(group)) return "Figs";
  if (["apple", "apples"].includes(group)) return "Apples";
  if (["pear", "pears"].includes(group)) return "Pears";
  if (["cherry", "cherries"].includes(group)) return "Cherries";
  if (["citrus", "citrus trees"].includes(group)) return "Citrus Trees";

  if (["mint", "sage", "herb", "tea herb", "flowering herb"].includes(type) || group === "herbs") return "Herbs";
  if (["tomato", "pepper", "eggplant", "cucumber", "squash", "vegetable"].includes(type) || group === "vegetables") return "Vegetables";
  if (["rose", "flower", "perennial"].includes(type) || ["flowers & perennials", "flowers and perennials"].includes(group)) return "Flowers and Perennials";
  if (["citrus", "citrus tree"].includes(type) || ["citrus", "citrus tree", "citrus trees"].includes(category)) return "Citrus Trees";
  if (["apple", "apple tree"].includes(type)) return "Apples";
  if (["pear", "pear tree", "4 in 1 pear"].includes(type)) return "Pears";
  if (["plum", "plum tree"].includes(type)) return "Plums";
  if (["cherry", "cherry tree"].includes(type)) return "Cherries";
  if (["peach", "peach tree", "bonfire patio peach", "nectarine / peach", "nectarine / apricot"].includes(type)) return "Peach / Stone Fruit";
  if (["fig", "fig tree"].includes(type)) return "Figs";
  if (["fruit tree"].includes(type) || ["orchard", "fruit tree", "fruit trees"].includes(category)) return "Other Fruit Trees";
  if (["berry", "vine"].includes(type)) return "Berries and Vines";
  if (["houseplant", "container plant"].includes(type)) return "Houseplants and Container Plants";
  return "Other / Uncategorized";
}

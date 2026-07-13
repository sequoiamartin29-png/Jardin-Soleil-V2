export const botanicalIconTypes = [
  "apple", "pear", "peach", "plum", "cherry", "fig", "lemon", "mandarin", "orange",
  "kumquat", "citrangequat", "blueberry", "raspberry", "blackberry", "strawberry", "grape",
  "mint", "tea", "herb", "tomato", "pepper", "cucumber", "squash", "eggplant", "flower",
  "rose", "lavender", "tree", "shrub", "vegetable", "container-plant", "generic-fruit-tree",
  "generic-plant"
];

const rules = [
  ["citrangequat", /thomasville|citrangequat|ms\.?\s*quatt/],
  ["plum", /fruit cocktail(?: tree)?\s*#?3|\bfc3\b|\bplums?\b/],
  ["peach", /fruit snacks sensational|sensational peach|\bpeaches?\b|bonfire patio peach/],
  ["blueberry", /pink lemonade blueberry|blueberr/],
  ["raspberry", /raspberr/],
  ["blackberry", /blackberr/],
  ["strawberry", /strawberr/],
  ["mandarin", /kishu|page mandarin|mandarin|tangerine|clementine/],
  ["kumquat", /kumquat/],
  ["lemon", /meyer lemon|mr\.?\s*lemone|\blemons?\b/],
  ["orange", /\boranges?\b|satsuma/],
  ["apple", /\bapples?\b|honeycrisp|fuji|granny smith|arkansas black|dorsett golden|yellow delicious/],
  ["pear", /\bpears?\b/],
  ["cherry", /\bcherr(?:y|ies)\b/],
  ["fig", /\bfigs?\b/],
  ["peach", /peach|nectarine|apricot|stone fruit/],
  ["grape", /grape|vineyard|\bvines?\b/],
  ["mint", /peppermint|chocolate mint|apple mint|orange mint|pineapple mint|indian mint|strawberry mint|\bmint\b/],
  ["tea", /camellia sinensis|tea plant|tea garden/],
  ["lavender", /lavender/],
  ["rose", /\brose\b/],
  ["tomato", /tomato/],
  ["pepper", /pepper|jalapeño|jalapeno/],
  ["cucumber", /cucumber/],
  ["squash", /squash|zucchini|cucurbit|melon/],
  ["eggplant", /eggplant/],
  ["flower", /flower|perennial|hydrangea|eucalyptus/],
  ["herb", /\bherbs?\b|thyme|sage|basil|rosemary|chamomile|stevia|balm|verbena/],
  ["vegetable", /vegetable|lettuce|carrot|pea|bean/],
  ["container-plant", /houseplant|indoor|container|potted/],
  ["shrub", /shrub|bush/],
];

export function resolveBotanicalIconType(plantOrType) {
  if (typeof plantOrType === "string") {
    const normalizedType = plantOrType.toLocaleLowerCase().trim().replace(/[\s_]+/g, "-");
    if (botanicalIconTypes.includes(normalizedType)) return normalizedType;
  }

  const plant = typeof plantOrType === "object" && plantOrType ? plantOrType : {};
  const explicitType = String(plant.iconType || "").toLocaleLowerCase().trim().replace(/[\s_]+/g, "-");
  if (botanicalIconTypes.includes(explicitType)) return explicitType;
  const identity = [plant.name, plant.nickname, plant.variety, plant.botanicalName, plant.type, plant.group, plant.category, plant.location]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  const match = rules.find(([, pattern]) => pattern.test(identity));
  if (match) return match[0];
  if (/orchard|citrus|fruit[ -]?tree/.test(identity)) return "generic-fruit-tree";
  if (/plant|garden/.test(identity)) return "generic-plant";
  return "generic-plant";
}

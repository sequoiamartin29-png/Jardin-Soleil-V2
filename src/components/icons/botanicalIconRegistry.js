export const botanicalIconTypes = [
  "apple", "pear", "peach", "plum", "cherry", "fig", "lemon", "mandarin", "orange",
  "kumquat", "citrangequat", "blueberry", "raspberry", "blackberry", "strawberry", "grape",
  "mint", "tea", "herb", "tomato", "pepper", "cucumber", "squash", "eggplant", "flower",
  "rose", "lavender", "tree", "shrub", "vegetable", "container-plant", "generic-fruit-tree",
  "generic-plant"
];

const rules = [
  ["citrangequat", /citrangequat/],
  ["plum", /\bplums?\b/],
  ["peach", /\bpeaches?\b/],
  ["blueberry", /blueberr/],
  ["raspberry", /raspberr/],
  ["blackberry", /blackberr/],
  ["strawberry", /strawberr/],
  ["mandarin", /mandarin|tangerine|clementine/],
  ["kumquat", /kumquat/],
  ["lemon", /\blemons?\b/],
  ["orange", /\boranges?\b/],
  ["apple", /\bapples?\b/],
  ["pear", /\bpears?\b/],
  ["cherry", /\bcherr(?:y|ies)\b/],
  ["fig", /\bfigs?\b/],
  ["peach", /peach|nectarine|apricot|stone fruit/],
  ["grape", /grape|vineyard|\bvines?\b/],
  ["mint", /\bmints?\b|peppermint|spearmint/],
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

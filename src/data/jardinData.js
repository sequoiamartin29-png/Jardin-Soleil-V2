export const gardenStartDate = "2026-07-01";

export const orchardPlants = [
  {
    id: "mr-pear",
    name: "Mr. Pear",
    type: "4-in-1 Pear",
    category: "Orchard",
    location: "Orchard walkway",
    status: "Producing",
    notes: "Multi-graft pear tree with developing pears. Needs staking and regular water checks during heat and wind."
  },
  {
    id: "mr-lemone",
    name: "Mr. Lemone'",
    type: "Meyer Lemon",
    category: "Orchard",
    location: "Citrus area / porch side",
    status: "Fruiting",
    notes: "Heavy with lemonlets. Watch for wind tip-over and soil moisture."
  },
  {
    id: "ms-kishu",
    name: "Ms. Kishu",
    type: "Kishu Mandarin",
    category: "Orchard",
    location: "Citrus area",
    status: "New growth",
    notes: "Recently arrived citrus tree. Needs stable pot, protection from storms, and consistent watering."
  },
  {
    id: "beetlepeach",
    name: "Beetlepeach",
    type: "Bonfire Patio Peach",
    category: "Orchard",
    location: "Driveway / front garden",
    status: "Recovery",
    notes: "Ornamental patio peach with burgundy foliage. Watch for new growth after stress."
  },
  {
    id: "fc1",
    name: "Fruit Cocktail 1",
    type: "Nectarine + Peach grafts",
    category: "Orchard",
    location: "Orchard walkway",
    status: "Mixed recovery",
    notes: "Main nectarine growth is active. Peach grafts need monitoring."
  },
  {
    id: "fc2",
    name: "Fruit Cocktail 2",
    type: "Nectarine + Apricot grafts",
    category: "Orchard",
    location: "Orchard walkway",
    status: "Growing",
    notes: "Apricot grafts leafed out. Monitor during heat and wind."
  },
  {
    id: "arkansas-black-1",
    name: "Arkansas Black 1",
    type: "Apple",
    category: "Orchard",
    location: "Right orchard side",
    status: "Monitoring",
    notes: "Watch for woolly aphid signs and water stress."
  },
  {
    id: "arkansas-black-2",
    name: "Arkansas Black 2",
    type: "Apple",
    category: "Orchard",
    location: "Left orchard side",
    status: "Growing",
    notes: "Keep mulch and moisture consistent."
  },
  {
    id: "honeycrisp",
    name: "Honeycrisp",
    type: "Apple",
    category: "Orchard",
    location: "Right orchard side",
    status: "Healthy",
    notes: "One of the healthiest-looking apple trees."
  },
  {
    id: "fuji",
    name: "Fuji",
    type: "Apple",
    category: "Orchard",
    location: "Left orchard side",
    status: "Budding",
    notes: "Pushing new buds and leaves."
  },
  {
    id: "granny-smith",
    name: "Granny Smith",
    type: "Apple",
    category: "Orchard",
    location: "Left orchard side",
    status: "Monitoring",
    notes: "Thin trunk. Watch structure and wind stability."
  },
  {
    id: "dorsett-golden",
    name: "Dorsett Golden",
    type: "Apple",
    category: "Orchard",
    location: "Porch side / orchard",
    status: "Growing",
    notes: "Moved from berry zone area. Monitor after relocation."
  },
  {
    id: "four-in-one-plum",
    name: "4-in-1 Plum",
    type: "Plum",
    category: "Orchard",
    location: "Orchard walkway",
    status: "New growth",
    notes: "Had soft green growth after bare-root arrival."
  },
  {
    id: "four-in-one-cherry",
    name: "4-in-1 Cherry",
    type: "Cherry",
    category: "Orchard",
    location: "Right orchard side",
    status: "Growing",
    notes: "Needs routine water and pest checks."
  }
];

const mintVarietyNames = [
  "Apple Mint", "Chocolate Mint", "Indian Mint", "Orange Mint", "Peppermint",
  "Pineapple Mint", "Strawberry Mint", "Lavender Mint", "Marshmallow Mint",
  "Hillary’s Sweet Lemon Mint", "Hazelnut Mint", "Candied Fruit Mint", "Fruit Sorbet Mint",
  "Berries and Cream Mint", "Banana Mint", "Eau de Cologne Mint", "Jessica’s Sweet Pear Mint",
  "Swiss Mint", "Basil Mint", "Cotton Candy Mint", "Lime Mint", "Ginger Mint",
  "After Eight Mint", "Chewing Gum Mint", "Currant Mint"
];

const mintId = (name) => `mint-${name.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
export const mintPlants = mintVarietyNames.map((name) => ({
  id: mintId(name), name, type:"Mint", category:"Herbs", group:"Mints", collection:"Mint Collection"
}));

export const gardenPlants = [
  {
    id: "tea-plant",
    name: "Ms. Tea",
    type: "Camellia sinensis",
    category: "Herbs & Tea",
    status: "Growing"
  },
  {
    id: "mint-collection",
    name: "Mint Collection",
    type: "Mint",
    variety: mintVarietyNames.join(", "),
    category: "Herbs",
    group: "Herbs",
    collectionMembers: mintPlants.map((plant) => plant.id),
    collectionTotal: mintPlants.length,
    status: "Active"
  },
  {
    id: "lemon-balm",
    name: "Lemon Balm",
    type: "Herb",
    category: "Herbs & Tea",
    status: "Growing"
  },
  {
    id: "stevia",
    name: "Stevia",
    type: "Herb",
    category: "Herbs & Tea",
    status: "Growing"
  },
  {
    id: "chamomile",
    name: "Chamomile",
    type: "Tea herb",
    category: "Herbs & Tea",
    status: "Growing"
  },
  {
    id: "pineapple-sage",
    name: "Pineapple Sage",
    type: "Sage",
    category: "Herbs",
    group: "Herbs",
    status: "Growing"
  },
  {
    id: "honey-melon-sage",
    name: "Honey Melon Sage",
    type: "Sage",
    category: "Herbs",
    group: "Herbs",
    status: "Growing"
  },
  {
    id: "bee-balm",
    name: "Bee Balm",
    type: "Flowering herb",
    category: "Herbs & Tea",
    status: "Growing"
  },
  {
    id: "tomatoes",
    name: "Tomatoes",
    type: "Tomato",
    variety: "Big Boy, Early Girl, Roma, Little Napoli, Husky Red Cherry, Pineapple Tomato",
    category: "Vegetables",
    group: "Vegetables",
    status: "Producing / flowering"
  },
  {
    id: "peppers",
    name: "Peppers",
    type: "Bell, banana, cubanelle, sweet jalapeño/snack peppers",
    category: "Vegetables",
    status: "Growing"
  },
  {
    id: "eggplant",
    name: "Japanese Eggplant",
    type: "Eggplant",
    category: "Vegetables",
    status: "Growing"
  },
  {
    id: "squash-zucchini",
    name: "Squash & Zucchini",
    type: "Cucurbits",
    category: "Vegetables",
    status: "Monitoring"
  },
  {
    id: "carrots-lettuce",
    name: "Carrots & Lettuce",
    type: "Cool-season crops",
    category: "Vegetables",
    status: "Growing"
  },
  {
    id: "rose",
    name: "Ms. Rose",
    type: "Rose",
    variety: "Julie Andrews Hybrid Tea Rose",
    category: "Flowers & Perennials",
    group: "Flowers & Perennials",
    status: "Growing"
  },
  {
    id: "lavender",
    name: "Lavender",
    type: "Flowering herb",
    category: "Flowers",
    status: "Monitoring"
  }
];

export const gardenZones = [
  { id:"vegetable-garden", name:"Vegetable Garden", directoryGroup:"Vegetables" },
  { id:"herb-tea-garden", name:"Herb & Tea Garden", directoryGroup:"Herbs" },
  { id:"berry-vine-zone", name:"Berry & Vine Zone", directoryGroup:"Berries and Vines" },
  { id:"flower-perennial-garden", name:"Flower & Perennial Garden", directoryGroup:"Flowers and Perennials" },
  { id:"melon-patch", name:"Melon Patch", matchType:"melon" },
];

export const starterTasks = [
  "Check citrus moisture",
  "Inspect tomatoes for ripe fruit",
  "Look over Mr. Pear's fruit and stake",
  "Check cloth pots during heat",
  "Log today's watering"
];

export const starterTimeline = [
  {
    date: "2026-07-01",
    title: "Jardin Soleil Command Center begins",
    detail: "Official app records begin fresh from July 1, 2026."
  }
];

export const wordBank = {
  orchard: [
    "APPLE", "PEAR", "PLUM", "CHERRY", "CITRUS", "LEMON", "MANDARIN",
    "NECTARINE", "APRICOT", "GRAFT", "ROOTSTOCK", "LEADER", "SCAFFOLD",
    "CANOPY", "BLOOM", "HARVEST", "FRUIT", "MULCH", "PRUNE"
  ],
  herbs: [
    "MINT", "BALM", "STEVIA", "CHAMOMILE", "SAGE", "THYME", "BASIL",
    "VERBENA", "EUCALYPTUS", "TEA", "HERBAL", "DRYING", "INFUSION"
  ],
  vegetables: [
    "TOMATO", "PEPPER", "EGGPLANT", "SQUASH", "ZUCCHINI", "CUCUMBER",
    "CARROT", "LETTUCE", "BEAN", "PEA", "CORN", "MELON", "POTATO"
  ],
  botany: [
    "CAMBIUM", "PHLOEM", "XYLEM", "NODE", "INTERNODE", "ROOT", "STEM",
    "LEAF", "FLOWER", "POLLEN", "OVARY", "SEED", "TURGID", "CALIPER"
  ]
};

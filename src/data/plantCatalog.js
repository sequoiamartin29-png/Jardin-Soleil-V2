export const plantQuickStarts = {
  Vegetables: [
    "Tomato", "Pepper", "Cucumber", "Lettuce", "Carrot", "Radish", "Onion",
    "Garlic", "Potato", "Green Bean", "Pea", "Broccoli", "Cabbage", "Squash",
    "Zucchini", "Corn", "Eggplant", "Spinach", "Kale",
  ],
  "Fruits & Berries": [
    "Strawberry", "Raspberry", "Blackberry", "Blueberry", "Grape",
    "Watermelon", "Cantaloupe",
  ],
  "Fruit Trees": [
    "Apple", "Pear", "Peach", "Plum", "Cherry", "Fig", "Lemon", "Lime",
    "Orange", "Mandarin", "Apricot", "Persimmon", "Pomegranate",
  ],
  Herbs: [
    "Basil", "Mint", "Rosemary", "Thyme", "Sage", "Parsley", "Cilantro",
    "Dill", "Oregano", "Lavender", "Chamomile", "Lemon Balm",
  ],
};

export const plantCategoryOptions = [
  "Vegetables",
  "Fruits",
  "Fruit Trees",
  "Herbs",
  "Flowers",
  "Shrubs",
  "Vines",
  "Houseplants",
  "Trees",
  "Other",
];

export const plantingMethodOptions = [
  "Seed",
  "Seedling",
  "Transplant",
  "Established Plant",
  "Tree",
  "Container",
  "Unknown",
];

export const gardenTypeOptions = [
  "Vegetable Garden",
  "Fruit Garden",
  "Herb Garden",
  "Orchard",
  "Flower Garden",
  "Pollinator Garden",
  "Container Garden",
  "Indoor Garden",
  "Greenhouse",
  "Mixed Garden",
];

export const gardenZoneSuggestions = [
  "Back Garden",
  "Front Garden",
  "Vegetable Beds",
  "Orchard",
  "Herb Garden",
  "Greenhouse",
  "Balcony",
  "Patio Containers",
  "Raised Bed 1",
  "Raised Bed 2",
  "Indoor Plants",
];

export const categoryForQuickStart = (group) => {
  if (group === "Fruits & Berries") return "Fruits";
  return group;
};

const groups = {
  Soil: ["Moisture Control", "Kellogg Organic", "Topsoil", "Compost"],
  "Pots & Grow Bags": ["10 gal bags", "Terracotta pots", "Nursery pots", "Saucers"],
  Fertilizer: ["Garden-Tone", "Citrus fertilizer", "Root stimulator", "Water-soluble feed"],
  "Mulch & Support": ["Pine bark mulch", "Stakes", "Plant ties", "Pavers"],
  Tools: ["Watering cans", "Hose", "Pruners", "Gloves"],
};

const slug = (value) => value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const starterInventoryItems = Object.entries(groups).flatMap(([category, names]) =>
  names.map((name) => ({
    id: `inventory-${slug(name)}`,
    name,
    category,
    quantity: "",
    unit: "",
    status: "Not counted",
    location: "",
    lowThreshold: "",
    notes: "",
  }))
);

export const teaBlends = [
  {
    id: "soleil-morning-tea",
    name: "Soleil Morning Tea",
    subtitle: "Bright citrus garden infusion",
    iconType: "tea",
    ingredients: ["Camellia sinensis", "Lemon verbena", "Meyer lemon peel", "Pineapple sage"],
    harvestStatus: "Ingredients ready",
    flavorProfile: ["Citrus", "Fresh", "Lightly floral"],
    wellnessBenefits: ["A bright, centering morning ritual", "Aromatic garden herbs", "Gently uplifting"],
    brewing: { temperature: "190°F / 88°C", steepTime: "3–4 minutes", serving: "1 heaping teaspoon per 8 oz cup" },
    caffeineLevel: "Low",
    seasonalAvailability: "Spring through early fall",
    inventory: { quantity: 8, unit: "servings" },
    notes: "Keep the lemon peel restrained so the tea leaf and verbena remain balanced."
  },
  {
    id: "moonlit-mint-tisane",
    name: "Moonlit Mint Tisane",
    subtitle: "Cooling seven-mint evening blend",
    iconType: "mint",
    ingredients: ["Peppermint", "Chocolate mint", "Apple mint", "Pineapple mint", "Chamomile"],
    harvestStatus: "Fresh mint available",
    flavorProfile: ["Cooling", "Softly sweet", "Apple finish"],
    wellnessBenefits: ["Caffeine-free evening ritual", "Cooling aromatic finish", "Calm garden fragrance"],
    brewing: { temperature: "205°F / 96°C", steepTime: "5–7 minutes", serving: "2 teaspoons per 8 oz cup" },
    caffeineLevel: "None",
    seasonalAvailability: "Late spring through fall",
    inventory: { quantity: 14, unit: "servings" },
    notes: "Wonderful served warm after sunset or chilled over ice during summer."
  },
  {
    id: "rose-chamomile-dream",
    name: "Rose & Chamomile Dream",
    subtitle: "Blush floral bedtime tisane",
    iconType: "rose",
    ingredients: ["Chamomile flowers", "Julie Andrews rose petals", "Lemon balm", "Lavender"],
    harvestStatus: "Small-batch harvest",
    flavorProfile: ["Honeyed", "Floral", "Delicate lemon"],
    wellnessBenefits: ["Quiet evening ritual", "Soft floral aroma", "Caffeine-free relaxation"],
    brewing: { temperature: "200°F / 93°C", steepTime: "5 minutes", serving: "1 tablespoon per 10 oz cup" },
    caffeineLevel: "None",
    seasonalAvailability: "Spring and early summer",
    inventory: { quantity: 5, unit: "servings" },
    notes: "Use fully dry rose petals and lavender sparingly for an elegant finish."
  },
  {
    id: "orchard-harvest-infusion",
    name: "Orchard Harvest Infusion",
    subtitle: "Fruit and herb autumn cup",
    iconType: "apple",
    ingredients: ["Dried apple", "Pear peel", "Lemon thyme", "Pineapple sage", "Cinnamon"],
    harvestStatus: "Awaiting orchard harvest",
    flavorProfile: ["Ripe fruit", "Warm spice", "Herbal finish"],
    wellnessBenefits: ["Caffeine-free seasonal cup", "Warming autumn aroma", "Uses preserved orchard harvest"],
    brewing: { temperature: "212°F / 100°C", steepTime: "8–10 minutes", serving: "1 tablespoon per 8 oz cup" },
    caffeineLevel: "None",
    seasonalAvailability: "Late summer through winter",
    inventory: { quantity: 0, unit: "servings" },
    notes: "Replenish after apples and pears are dried at peak ripeness."
  },
  {
    id: "camellia-garden-green",
    name: "Camellia Garden Green",
    subtitle: "Estate tea with fresh herb notes",
    iconType: "tea",
    ingredients: ["Camellia sinensis", "Lemon balm", "Stevia leaf"],
    harvestStatus: "Tea leaves developing",
    flavorProfile: ["Green", "Clean", "Gentle citrus"],
    wellnessBenefits: ["Mindful afternoon ritual", "Light natural caffeine", "Fresh garden character"],
    brewing: { temperature: "175°F / 80°C", steepTime: "2–3 minutes", serving: "1 teaspoon per 8 oz cup" },
    caffeineLevel: "Moderate",
    seasonalAvailability: "Spring flush and summer harvest",
    inventory: { quantity: 3, unit: "servings" },
    notes: "Avoid boiling water to protect the tea’s sweet green character."
  }
];

export const getTeaBlendById = (blendId) => teaBlends.find((blend) => blend.id === blendId);

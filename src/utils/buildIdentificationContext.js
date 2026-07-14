const clean = (value) => String(value || "").trim();
const array = (value) => Array.isArray(value) ? value.map(clean).filter(Boolean) : value ? [clean(value)] : [];
const seasonForDate = (date) => {
  const month = date.getMonth();
  if (month === 11 || month <= 1) return "Winter";
  if (month <= 4) return "Spring";
  if (month <= 7) return "Summer";
  return "Autumn";
};

export function buildIdentificationContext(input = {}) {
  const now = new Date();
  return {
    subject:clean(input.subject || "Unknown"),
    form:clean(input.form || "Unknown"),
    leafArrangement:clean(input.leafArrangement || "Unknown"),
    leafTraits:array(input.leafTraits),
    flowerColors:array(input.flowerColors),
    flowerShapes:array(input.flowerShapes),
    fruit:array(input.fruit),
    stem:array(input.stem),
    habitat:array(input.habitat),
    country:clean(input.country),
    region:clean(input.region),
    usdaZone:clean(input.usdaZone),
    coordinates:input.coordinates && Number.isFinite(input.coordinates.latitude) && Number.isFinite(input.coordinates.longitude)
      ? { latitude:input.coordinates.latitude, longitude:input.coordinates.longitude }
      : null,
    season:clean(input.season || seasonForDate(now)),
    notes:clean(input.notes),
    photoIds:array(input.photoIds),
    sourceMode:clean(input.sourceMode || "Manual Wizard"),
  };
}

export function summarizeIdentificationContext(context) {
  return [
    context.form && context.form !== "Unknown" ? `form: ${context.form}` : "",
    context.leafArrangement && context.leafArrangement !== "Unknown" ? `leaf arrangement: ${context.leafArrangement}` : "",
    context.leafTraits.length ? `leaf traits: ${context.leafTraits.join(", ")}` : "",
    context.flowerColors.length ? `flower colors: ${context.flowerColors.join(", ")}` : "",
    context.flowerShapes.length ? `flower form: ${context.flowerShapes.join(", ")}` : "",
    context.fruit.length ? `fruit: ${context.fruit.join(", ")}` : "",
    context.stem.length ? `stem and habit: ${context.stem.join(", ")}` : "",
    context.habitat.length ? `habitat: ${context.habitat.join(", ")}` : "",
    context.region ? `region: ${context.region}` : "",
    context.season ? `season: ${context.season}` : "",
  ].filter(Boolean).join("; ");
}

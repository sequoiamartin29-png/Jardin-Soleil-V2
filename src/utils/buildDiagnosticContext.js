const clean = (value = "") => String(value).toLocaleLowerCase().trim();
const withinDays = (value, days) => value && Date.now() - new Date(value).getTime() <= days * 86400000;
const careMatches = (entry, terms) => terms.some((term) => clean(entry.type).includes(term));

export function buildDiagnosticContext({ plant, journalEntries = [], environment = {}, assessment = {} }) {
  const careHistory = journalEntries
    .filter((entry) => entry.plantId === plant?.id)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const recentCare = careHistory.filter((entry) => withinDays(entry.createdAt, 30));
  const conditions = new Set(assessment.recentConditions || []);
  const sourceStatus = environment.sourceStatus || "Unavailable";
  const weatherAvailable = ["Live", "Cached"].includes(sourceStatus) && environment.weather;

  if (weatherAvailable) {
    if (["rain", "storm"].includes(environment.condition) || Number(environment.weather.precipitation || 0) > 0.05) conditions.add("heavy rain");
    if (Number(environment.weather.temperature || 0) >= 88) conditions.add("heat");
    if (Number(environment.weather.temperature || 99) <= 34 || environment.condition === "snow") conditions.add("frost");
    if (Number(environment.weather.wind || 0) >= 15) conditions.add("wind");
    if (Number(environment.weather.cloudCover || 0) >= 75) conditions.add("cloudy");
    if (["rain", "storm", "cloudy"].includes(environment.condition) && Number(environment.weather.cloudCover || 0) >= 70) conditions.add("high humidity");
  }

  if (recentCare.some((entry) => careMatches(entry, ["water"]))) conditions.add("recent watering");
  if (recentCare.some((entry) => careMatches(entry, ["feed", "fertiliz"]))) conditions.add("recent feeding");
  if (recentCare.some((entry) => careMatches(entry, ["treat", "pesticide"]))) conditions.add("pesticide use");
  if (recentCare.some((entry) => careMatches(entry, ["repot", "transplant"]))) conditions.add("repotting or transplanting");
  if (recentCare.some((entry) => careMatches(entry, ["prun"]))) conditions.add("pruning");

  const lastWatered = careHistory.find((entry) => careMatches(entry, ["water"]));
  const weatherEvidence = weatherAvailable
    ? `${sourceStatus} weather: ${environment.conditionLabel || environment.condition || "conditions recorded"}${environment.weather.temperature !== undefined ? `, ${Math.round(environment.weather.temperature)}°F` : ""}${environment.weather.precipitation !== undefined ? `, ${environment.weather.precipitation} in precipitation` : ""}`
    : `Weather source: ${sourceStatus}. No live weather claim is being made.`;

  return {
    plant,
    plantText:clean([plant?.name, plant?.nickname, plant?.type, plant?.category, plant?.group, plant?.variety, plant?.botanicalName].filter(Boolean).join(" ")),
    affectedArea:assessment.affectedArea || "whole plant",
    symptoms:assessment.symptoms || [],
    pestEvidence:assessment.pestEvidence || [],
    recentConditions:[...conditions],
    timeline:assessment.timeline || "not recorded",
    season:environment.season || seasonFromDate(new Date()),
    careHistory,
    recentCare,
    lastWatered,
    weatherAvailable:!!weatherAvailable,
    weatherSourceStatus:sourceStatus,
    weatherEvidence,
    photoIds:assessment.photoIds || [],
    photoMode:assessment.photoMode || "symptom",
  };
}

export function inferRecentConditions({ plant, journalEntries = [], environment = {} }) {
  return buildDiagnosticContext({ plant, journalEntries, environment, assessment:{} }).recentConditions;
}

function seasonFromDate(date) {
  const month = date.getMonth();
  return month <= 1 || month === 11 ? "winter" : month <= 4 ? "spring" : month <= 7 ? "summer" : "autumn";
}


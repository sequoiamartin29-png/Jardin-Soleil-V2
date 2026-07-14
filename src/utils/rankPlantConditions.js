import { plantHealthRules } from "./plantHealthRules";

const clean = (value = "") => String(value).toLocaleLowerCase().trim();
const intersection = (left = [], right = []) => left.filter((value) => right.map(clean).includes(clean(value)));

export function rankPlantConditions(context) {
  const symptoms = (context.symptoms || []).map(clean);
  const pests = (context.pestEvidence || []).map(clean);
  const conditions = (context.recentConditions || []).map(clean);
  const affectedArea = clean(context.affectedArea);

  const ranked = plantHealthRules.map((rule) => {
    const symptomMatches = intersection(symptoms, rule.symptoms || []);
    const pestMatches = intersection(pests, rule.pests || []);
    const conditionMatches = intersection(conditions, rule.conditions || []);
    const plantMatches = (rule.plantTerms || []).filter((term) => context.plantText.includes(clean(term)));
    const areaMatch = (rule.areas || []).map(clean).includes(affectedArea);
    const conflicting = intersection(symptoms, rule.conflicts || []);
    let score = .35;
    score += symptomMatches.length * 3;
    score += pestMatches.length * 4;
    score += conditionMatches.length * 1.75;
    score += plantMatches.length * 2.25;
    if (areaMatch) score += 1.5;
    if (pests.includes(clean(rule.id)) || pests.includes(clean(rule.name))) score += 6;
    if (pests.includes("no visible pests") && rule.category === "Pest") score -= 2;
    if (conflicting.length) score -= conflicting.length * 2;

    const why = [];
    if (symptomMatches.length) why.push(`Matches reported symptoms: ${symptomMatches.join(", ")}.`);
    if (pestMatches.length) why.push(`Matches visible pest evidence: ${pestMatches.join(", ")}.`);
    if (conditionMatches.length) why.push(`Recent conditions may support it: ${conditionMatches.join(", ")}.`);
    if (plantMatches.length) why.push(`This possibility is relevant to the recorded plant type: ${plantMatches.join(", ")}.`);
    if (areaMatch) why.push(`The affected ${affectedArea} area is consistent with this possibility.`);
    if (!why.length) why.push("This remains a broad fallback possibility because the recorded evidence is limited.");

    return {
      id:rule.id,
      name:rule.name,
      category:rule.category,
      score:Number(score.toFixed(2)),
      why,
      conflictingEvidence:conflicting.length
        ? `Conflicting reported evidence: ${conflicting.join(", ")}.`
        : "No direct conflict was selected, but visual or laboratory confirmation is still unavailable.",
      inspectNext:rule.inspect,
      cultural:rule.cultural,
    };
  }).sort((a, b) => b.score - a.score).slice(0, 3);

  const margin = (ranked[0]?.score || 0) - (ranked[1]?.score || 0);
  const confidence = ranked[0]?.score >= 11 && margin >= 3 ? "High" : ranked[0]?.score >= 6 ? "Moderate" : "Low";
  return {
    ranked,
    confidence,
    limitation:"These are ranked possibilities, not a guaranteed diagnosis. Confidence is limited without direct inspection or testing.",
  };
}

export function buildTreatmentPlan(possibility, plant) {
  const category = possibility?.category || "Environmental stress";
  const edible = /fruit|vegetable|herb|mint|tea|tomato|pepper|citrus|berry|edible/i.test([plant?.category, plant?.type, plant?.group].join(" "));
  const biological = category === "Pest"
    ? "After confirming the pest, favor conservation of predators and a labeled biological control appropriate to that exact pest."
    : category === "Disease"
      ? "Where a confirmed disease and product label support it, consider a labeled biological fungicide before broader-impact products."
      : "Support root and soil biology with appropriate moisture, drainage, and organic matter rather than applying a pesticide.";
  const organic = category === "Pest"
    ? "If monitoring confirms the pest, consider a labeled insecticidal soap, horticultural oil, or pest-specific organic product. Test sensitive foliage first."
    : category === "Disease"
      ? "Only after reasonable confirmation, consider a product labeled for this disease and plant; options may include labeled sulfur, copper, or biological products depending on the crop."
      : "Correct the environmental cause first. Do not add fertilizer or treatment products unless the observed evidence supports them.";

  return [
    {
      tier:"1. Observation and confirmation",
      target:"Confirm the recorded pattern before intervening.",
      text:possibility?.inspectNext || "Photograph the same tissue, inspect nearby growth, and compare progression over 48–72 hours.",
      safety:"Use clean hands and tools; avoid removing healthy tissue during inspection.",
      pollinators:"No direct pollinator impact.",
    },
    {
      tier:"2. Cultural controls",
      target:`Reduce conditions that may support ${possibility?.name || "the recorded stress"}.`,
      text:possibility?.cultural || "Improve plant-specific watering, airflow, sanitation, and growing conditions.",
      safety:"Change one care factor at a time and monitor the plant before making another major adjustment.",
      pollinators:"Generally pollinator-safe; preserve open blooms and beneficial habitat.",
    },
    {
      tier:"3. Mechanical controls",
      target:category === "Pest" ? "Reduce a confirmed pest population without broad spraying." : "Remove confirmed damaged or infectious material and limit spread.",
      text:category === "Pest" ? "Hand-remove confirmed pests or badly damaged material when practical; clean tools between plants." : "Remove only badly damaged material when appropriate, bag diseased debris, and clean tools between plants.",
      safety:"Wear suitable gloves, avoid composting confirmed diseased material, and disinfect tools between plants.",
      pollinators:"Low direct impact when beneficial insects and occupied blooms are left undisturbed.",
    },
    {
      tier:"4. Biological controls",
      target:category === "Pest" ? "Support or introduce an organism labeled for the confirmed pest." : category === "Disease" ? "Suppress a confirmed disease with a labeled biological product." : "Support soil and root biology while correcting the environmental cause.",
      text:biological,
      safety:"Use only a control labeled for the plant and confirmed problem; follow storage and application directions.",
      pollinators:"Impact varies by product; protect open blooms and follow every pollinator precaution on the label.",
    },
    {
      tier:"5. Organic product options",
      target:`Treat ${possibility?.name || "the confirmed problem"} only after reasonable confirmation.`,
      text:`${organic} Avoid spraying during active pollinator periods or on open blooms.`,
      safety:`Test sensitive foliage first and follow the complete product label.${edible ? " Observe the label’s harvest and pre-harvest interval." : ""}`,
      pollinators:"May affect pollinators despite an organic label; never spray active pollinators or open blooms.",
    },
    {
      tier:"6. Conventional chemical options",
      target:`Use only a labeled product for the confirmed ${possibility?.name || "problem"} when lower-impact steps are insufficient.`,
      text:`Use only a product specifically labeled for the confirmed problem and plant. Follow local law and the entire product label; never infer a rate.${edible ? " For edible plants, follow every harvest and pre-harvest interval on the label—this tool does not invent those intervals." : ""}`,
      safety:"Wear the label-required protective equipment, follow re-entry directions, and keep people and animals away as directed.",
      pollinators:"Potentially harmful; avoid open blooms and active pollinator periods and obey every bee-hazard statement on the label.",
    },
  ];
}

export const immediateSafeActions = [
  "Photograph and mark the affected area so progression can be compared.",
  "Inspect leaf undersides, stems, roots or soil moisture before choosing a treatment.",
  "Isolate a movable plant when a spreading pest or disease is plausible.",
  "Remove only badly damaged material when plant-appropriate and clean tools afterward.",
  "Avoid broad spraying until the cause is better confirmed.",
];

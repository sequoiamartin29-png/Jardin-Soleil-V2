import { plantFinderFieldKey } from "./plantFinderRules.js";

const normalize = (value) => String(value || "").toLocaleLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const values = (items) => (Array.isArray(items) ? items : [items]).map(normalize).filter((value) => value && value !== "unknown" && !value.startsWith("no visible"));
const overlaps = (selected, candidate) => {
  const wanted = values(selected);
  const offered = values(candidate);
  return wanted.filter((item) => offered.some((option) => option === item || option.includes(item) || item.includes(option)));
};

const addCriterion = (state, label, selected, candidate, weight) => {
  const wanted = values(selected);
  if (!wanted.length) return;
  state.possible += wanted.length * weight;
  const matched = overlaps(wanted, candidate);
  if (matched.length) {
    state.score += matched.length * weight;
    state.why.push(`${label}: ${matched.join(", ")}`);
  } else {
    state.conflicts.push(`${label} does not match the field-key description.`);
  }
};

const confidenceFor = (score, possible) => {
  const ratio = possible ? score / possible : 0;
  if (score >= 14 && ratio >= .72) return "High";
  if (score >= 8 && ratio >= .45) return "Moderate";
  return "Low";
};

const nextInspection = (context, candidate) => {
  if (!values(context.leafArrangement).length) return `Check whether the leaves are ${candidate.leafArrangement.join(" or ").toLocaleLowerCase()}.`;
  if (!context.leafTraits?.length) return `Inspect the leaf edge and surface for ${candidate.leafTraits.slice(0, 3).join(", ").toLocaleLowerCase()}.`;
  if (!context.flowerShapes?.length) return `Photograph or note flowers when present: ${candidate.flowerShapes.join(", ").toLocaleLowerCase()}.`;
  if (!context.fruit?.length) return `Look for fruit or seed structures described as ${candidate.fruit.join(" or ").toLocaleLowerCase()}.`;
  if (!context.stem?.length) return `Inspect bark and stems for ${candidate.stem.slice(0, 2).join(" or ").toLocaleLowerCase()}.`;
  return `Compare the full plant, leaf attachment, and reproductive structures with a regional field guide.`;
};

export function rankPlantMatches(context, limit = 5) {
  const ranked = plantFinderFieldKey.map((candidate) => {
    const state = { score:0, possible:0, why:[], conflicts:[] };
    addCriterion(state, "Growth form", context.form, candidate.form, 5);
    addCriterion(state, "Leaf arrangement", context.leafArrangement, candidate.leafArrangement, 5);
    addCriterion(state, "Leaf traits", context.leafTraits, candidate.leafTraits, 2);
    addCriterion(state, "Flower color", context.flowerColors, candidate.flowerColors, 2);
    addCriterion(state, "Flower form", context.flowerShapes, candidate.flowerShapes, 3);
    addCriterion(state, "Fruit or seed structure", context.fruit, candidate.fruit, 4);
    addCriterion(state, "Bark, stem, or habit", context.stem, candidate.stem, 3);
    addCriterion(state, "Habitat", context.habitat, candidate.habitat, 2);
    addCriterion(state, "Region", [context.country, context.region].filter(Boolean), candidate.regions, 1);
    addCriterion(state, "Season", context.season, candidate.seasons, 1);
    return {
      ...candidate,
      score:state.score,
      possibleScore:state.possible,
      confidence:confidenceFor(state.score, state.possible),
      why:state.why.length ? state.why : ["Only a weak general resemblance was found."],
      conflicts:state.conflicts.slice(0, 4),
      inspectNext:nextInspection(context, candidate),
    };
  }).filter((candidate) => candidate.score >= 5)
    .sort((a, b) => b.score - a.score || a.commonName.localeCompare(b.commonName))
    .slice(0, Math.min(5, limit));

  if (!ranked.length || ranked[0].confidence === "Low" && ranked[0].score < 7) return [];
  return ranked;
}

export function searchPlantFieldKey(query, limit = 5) {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (!terms.length) return [];
  return plantFinderFieldKey.map((candidate) => {
    const searchable = normalize([
      candidate.commonName, candidate.botanicalName, candidate.family, candidate.form, candidate.leafArrangement,
      candidate.leafTraits, candidate.flowerColors, candidate.flowerShapes, candidate.fruit, candidate.stem,
      candidate.habitat, candidate.regions, candidate.habit
    ].flat().join(" "));
    const hits = terms.filter((term) => searchable.includes(term));
    return {
      ...candidate,
      score:hits.length * 3,
      possibleScore:terms.length * 3,
      confidence:hits.length === terms.length && terms.length > 1 ? "Moderate" : "Low",
      why:hits.length ? [`Known terms matched: ${hits.join(", ")}`] : [],
      conflicts:[],
      inspectNext:"Continue with the Manual Wizard to compare leaf arrangement, reproductive structures, habitat, and region.",
    };
  }).filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.commonName.localeCompare(b.commonName))
    .slice(0, Math.min(5, limit));
}


import {
  flowerColors,
  flowerShapes,
  fruitTypes,
  habitatTypes,
  leafArrangements,
  leafTraits,
  plantForms,
  stemTraits,
} from "./plantFinderRules.js";

const normalize = (value) => String(value || "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const list = (value) => (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);
const visible = (value) => {
  const normalized = normalize(value);
  return normalized && normalized !== "unknown";
};
const unique = (values) => [...new Map(values.filter(visible).map((value) => [normalize(value), value])).values()];

const definitions = {
  form:{ field:"form", legend:"Which overall plant form is visible?", values:plantForms.filter((value) => value !== "Unknown"), multiple:false },
  leafArrangement:{ field:"leafArrangement", legend:"How do the leaves attach to the stem?", values:leafArrangements.filter((value) => value !== "Unknown"), multiple:false },
  leafTraits:{ field:"leafTraits", legend:"Which leaf details best separate these possibilities?", values:leafTraits, multiple:true },
  flowerColors:{ field:"flowerColors", legend:"Which flower color is visible?", values:flowerColors.filter((value) => value !== "Unknown"), multiple:true },
  flowerShapes:{ field:"flowerShapes", legend:"Which flower shape or arrangement is visible?", values:flowerShapes.filter((value) => value !== "Unknown"), multiple:true },
  fruit:{ field:"fruit", legend:"Which fruit or seed structure is visible?", values:fruitTypes.filter((value) => value !== "Unknown"), multiple:true },
  stem:{ field:"stem", legend:"Which stem, bark, or growth habit is visible?", values:stemTraits.filter((value) => value !== "Unknown"), multiple:true },
  habitat:{ field:"habitat", legend:"Which habitat best matches where the photograph was taken?", values:habitatTypes.filter((value) => value !== "Unknown"), multiple:true },
};

const subjectPriorities = {
  leaf:["leafArrangement", "leafTraits", "form", "stem", "habitat"],
  flower:["flowerShapes", "flowerColors", "leafArrangement", "form", "leafTraits"],
  fruit:["fruit", "leafArrangement", "form", "leafTraits", "stem"],
  bark:["stem", "form", "leafArrangement", "habitat", "leafTraits"],
  "seed pod":["fruit", "form", "leafArrangement", "flowerShapes", "habitat"],
  "whole plant":["form", "leafArrangement", "leafTraits", "flowerShapes", "fruit"],
  "tree shape":["form", "stem", "leafArrangement", "leafTraits", "habitat"],
  unknown:["form", "leafArrangement", "leafTraits", "flowerShapes", "fruit"],
};

const hasObservation = (context, field) => {
  const values = list(context?.[field]).filter(visible);
  return values.length > 0;
};

export function buildPhotoFollowUpQuestions(candidates = [], context = {}, limit = 3) {
  const priority = subjectPriorities[normalize(context.subject)] || subjectPriorities.unknown;
  const orderedFields = [...priority, ...Object.keys(definitions).filter((field) => !priority.includes(field))];
  const questions = [];

  for (const field of orderedFields) {
    if (questions.length >= limit || hasObservation(context, field)) continue;
    const definition = definitions[field];
    const candidateValues = unique(candidates.flatMap((candidate) => list(candidate?.[field])));
    const values = candidateValues.length >= 2 ? candidateValues : definition.values;
    questions.push({ ...definition, values });
  }

  return questions;
}

export function mergePhotoFollowUp(context, answers) {
  return Object.entries(answers).reduce((next, [field, value]) => ({ ...next, [field]:value }), { ...context });
}

const confidenceRank = { Low:0, Moderate:1, High:2 };
const confidenceFromFollowUp = (candidate, score, possible, conflicts) => {
  const ratio = possible ? score / possible : 0;
  let confidence = candidate.confidence || "Low";
  if (score >= 12 && ratio >= .7 && conflicts === 0) confidence = "High";
  else if (score >= 6 && ratio >= .45 && confidenceRank[confidence] < confidenceRank.Moderate) confidence = "Moderate";
  return confidence;
};

export function refinePhotoMatches(candidates = [], context = {}) {
  const weightedFields = [
    ["form", 5, "Plant form"],
    ["leafArrangement", 5, "Leaf arrangement"],
    ["leafTraits", 2, "Leaf details"],
    ["flowerColors", 2, "Flower color"],
    ["flowerShapes", 3, "Flower form"],
    ["fruit", 4, "Fruit or seed"],
    ["stem", 3, "Stem or habit"],
    ["habitat", 2, "Habitat"],
  ];

  return candidates.map((candidate, originalIndex) => {
    let score = 0;
    let possible = 0;
    let conflictCount = 0;
    const followUpWhy = [];
    const followUpConflicts = [];

    weightedFields.forEach(([field, weight, label]) => {
      const selected = list(context[field]).filter(visible);
      const offered = list(candidate[field]).filter(visible);
      if (!selected.length || !offered.length) return;
      possible += selected.length * weight;
      const matched = selected.filter((item) => offered.some((option) => normalize(option) === normalize(item)));
      score += matched.length * weight;
      if (matched.length) followUpWhy.push(`${label} observed: ${matched.join(", ")}`);
      if (!matched.length) {
        conflictCount += 1;
        followUpConflicts.push(`${label} differs from the follow-up observation.`);
      }
    });

    return {
      ...candidate,
      confidence:confidenceFromFollowUp(candidate, score, possible, conflictCount),
      why:[...(candidate.why || []), ...followUpWhy].slice(0, 6),
      conflicts:[...(candidate.conflicts || []), ...followUpConflicts].slice(0, 5),
      followUpScore:score,
      originalIndex,
    };
  }).sort((a, b) => b.followUpScore - a.followUpScore || a.originalIndex - b.originalIndex)
    .map(({ originalIndex, ...candidate }) => candidate)
    .slice(0, 5);
}

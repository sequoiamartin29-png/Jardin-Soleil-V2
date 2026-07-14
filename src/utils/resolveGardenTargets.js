import { getPlantDirectoryGroup, isOrchardFruitTree, normalizePlantText } from "./plantClassification";

const clean = (value = "") => normalizePlantText(String(value))
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[’‘]/g, "'")
  .replace(/[^a-z0-9#'&/ -]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const unique = (values) => [...new Set(values.filter(Boolean))];
const active = (plant) => plant && !plant.archived && !Array.isArray(plant.collectionMembers) && clean(plant.name) !== "mint collection" && !["archived", "removed"].includes(clean(plant.status));
const fieldsFor = (plant) => unique([
  plant.name, plant.displayName, plant.nickname, plant.commonName, plant.botanicalName,
  plant.variety, plant.cultivar,
].map(clean).filter((value) => value.length > 1));
const metadata = (plant) => clean([
  plant.category, plant.group, plant.type, plant.collection, plant.gardenZone,
  plant.location, ...(Array.isArray(plant.tags) ? plant.tags : []),
].join(" "));
const containsPhrase = (text, phrase) => (` ${text} `).includes(` ${phrase} `);
const compact = (value) => clean(value).replace(/[^a-z0-9#]/g, "");
const matchesPlantAlias = (text, alias) => {
  if (containsPhrase(text, alias)) return true;
  // Some canonical legacy names are stored as one word (for example,
  // "Beetlepeach") while people naturally dictate them as two words.
  // Restrict compact matching to those single-token aliases so Apple Mint
  // cannot accidentally match Pineapple Mint.
  return !alias.includes(" ") && alias.length >= 8 && compact(text).includes(compact(alias));
};

export function getActiveGardenPlants(plants = []) {
  return plants.filter(active);
}

export function buildGardenTargetCatalog(plants = [], collections = []) {
  const activePlants = getActiveGardenPlants(plants);
  return {
    activePlants,
    plantAliases: activePlants.map((plant) => ({ plant, aliases:fieldsFor(plant) })),
    collections: collections.map((collection, index) => ({
      ...collection,
      index:index + 1,
      aliases:unique([collection.name, collection.label, collection.id, `zone ${index + 1}`].map(clean)),
    })),
  };
}

const groupPredicates = {
  tomatoes: (plant) => clean(plant.type) === "tomato" || getPlantDirectoryGroup(plant) === "Vegetables" && containsPhrase(clean(plant.name), "tomato"),
  mints: (plant) => clean(plant.type) === "mint" && clean(plant.id) !== "mint collection" && clean(plant.name) !== "mint collection",
  "peach trees": (plant) => getPlantDirectoryGroup(plant) === "Peach / Stone Fruit" && /peach/.test(clean(`${plant.type} ${plant.group} ${plant.name}`)),
  peaches: (plant) => groupPredicates["peach trees"](plant),
  citrus: (plant) => getPlantDirectoryGroup(plant) === "Citrus Trees",
  roses: (plant) => clean(plant.type) === "rose" || getPlantDirectoryGroup(plant) === "Flowers and Perennials" && containsPhrase(clean(plant.name), "rose"),
};

const broadScopes = [
  { type:"estate", label:"Entire Jardin Soleil", phrases:["entire jardin soleil", "whole jardin soleil", "entire estate", "whole estate", "all active plants", "everything", "all plants"], match:() => true },
  { type:"orchard", label:"Orchard", phrases:["orchard"], match:isOrchardFruitTree },
  { type:"vegetable-garden", label:"Vegetable Garden", phrases:["vegetable garden", "kitchen garden", "vegetables"], match:(plant) => getPlantDirectoryGroup(plant) === "Vegetables" },
  { type:"herb-tea-garden", label:"Herb & Tea Garden", phrases:["herb & tea garden", "herb and tea garden", "herb garden", "tea garden", "herbs"], match:(plant) => getPlantDirectoryGroup(plant) === "Herbs" },
  { type:"flowers-perennials", label:"Flowers & Perennials", phrases:["flowers & perennials", "flowers and perennials", "flower garden", "perennials"], match:(plant) => getPlantDirectoryGroup(plant) === "Flowers and Perennials" },
  { type:"citrus", label:"Citrus", phrases:["citrus trees", "citrus"], match:groupPredicates.citrus },
];

function indoorPlant(plant) {
  const text = metadata(plant);
  return /\b(indoor|indoors|houseplant|house plant|sunroom|conservatory interior)\b/.test(text);
}

function result(scopeType, scopeLabel, targetIds, extra = {}) {
  return { scopeType, scopeLabel, targetIds:unique(targetIds), unresolvedTerms:[], warnings:[], needsClarification:false, options:[], ...extra };
}

export function resolveGardenTargets(targetText, plants = [], collections = [], options = {}) {
  const text = clean(targetText);
  const catalog = buildGardenTargetCatalog(plants, collections);
  const { activePlants, plantAliases } = catalog;
  const excludesIndoor = /\bexcept (the )?(indoor|indoors|house ?plants?)\b/.test(text);

  if (options.actionType === "planted" && /\bnew\b/.test(text)) {
    const requestedName = text.replace(/\b(in|at)\b.*$/, "").replace(/^(a|an|the)\s+/, "").trim() || "new plant";
    return result("new-plant", `New plant note: ${requestedName}`, [], {
      recordOnly:true,
      needsClarification:true,
      clarification:`Buddy cannot safely create “${requestedName}” without its required plant details. How should this be recorded?`,
      options:[{ id:"record-only", label:"Log the planting as a note only", scopeType:"new-plant", scopeLabel:`New plant note: ${requestedName}`, targetIds:[], recordOnly:true }],
      warnings:["No canonical plant record will be created from casual wording. Use Add New Plant afterward to complete the record."],
    });
  }

  const exception = text.match(/\b(?:except|excluding)\s+(?:the\s+)?(.+)$/)?.[1]?.trim();
  const exceptionScope = exception && broadScopes.find((scope) =>
    scope.phrases.some((phrase) => containsPhrase(text, phrase) || text === phrase)
  );
  if (exceptionScope) {
    let selected = activePlants.filter(exceptionScope.match);
    let excludedIds = [];
    let excludedLabel = exception;
    if (/^(?:indoor(?: plants?)?|indoors|house ?plants?)$/.test(exception)) {
      excludedIds = selected.filter(indoorPlant).map((plant) => plant.id);
      excludedLabel = "indoor plants";
    } else {
      const excluded = resolveGardenTargets(exception, plants, collections, options);
      if (excluded.needsClarification) return {
        ...excluded,
        clarification:`Buddy understands the ${exceptionScope.label} scope, but needs to know exactly what “${exception}” excludes.`,
      };
      excludedIds = excluded.targetIds;
      excludedLabel = excluded.scopeLabel;
    }
    const excludedSet = new Set(excludedIds);
    selected = selected.filter((plant) => !excludedSet.has(plant.id));
    return result(exceptionScope.type, `${exceptionScope.label} except ${excludedLabel}`, selected.map((plant) => plant.id), {
      warnings:[`${excludedIds.length} active ${excludedIds.length === 1 ? "plant is" : "plants are"} excluded from this action.`],
    });
  }

  const namedMatches = plantAliases.filter(({ aliases }) => aliases.some((alias) => alias.length > 2 && matchesPlantAlias(text, alias)));
  if (namedMatches.length) {
    const ids = unique(namedMatches.map(({ plant }) => plant.id));
    const names = namedMatches.map(({ plant }) => plant.nickname ? `${plant.name} (${plant.nickname})` : plant.name);
    return result(ids.length > 1 ? "named-plants" : "named-plant", names.join(", "), ids);
  }

  for (const collection of catalog.collections) {
    if (!collection.aliases.some((alias) => alias && containsPhrase(text, alias))) continue;
    const collectionNames = unique([collection.name, collection.label].map(clean));
    const ids = activePlants.filter((plant) => collectionNames.includes(clean(plant.collection)) || collectionNames.includes(clean(plant.gardenZone)) || collectionNames.includes(clean(plant.location))).map((plant) => plant.id);
    return result("zone", collection.name || collection.label, ids, ids.length ? {} : { warnings:[`No active plants are currently assigned to ${collection.name || collection.label}.`] });
  }

  if (/^(mint|mints|the mint|mint collection)$/.test(text)) {
    const mintIds = activePlants.filter(groupPredicates.mints).map((plant) => plant.id);
    return result("plant-group", "Mint varieties", [], {
      needsClarification:true,
      clarification:`Did you mean all ${mintIds.length} individual mint varieties or a specific mint?`,
      unresolvedTerms:[text],
      options:[{ id:"all-mints", label:`All ${mintIds.length} mint varieties`, scopeType:"plant-group", scopeLabel:"All mint varieties", targetIds:mintIds }],
    });
  }

  for (const [group, predicate] of Object.entries(groupPredicates)) {
    if (!containsPhrase(text, group)) continue;
    const ids = activePlants.filter(predicate).map((plant) => plant.id);
    return result("plant-group", group.replace(/\b\w/g, (letter) => letter.toUpperCase()), ids);
  }

  for (const scope of broadScopes) {
    if (!scope.phrases.some((phrase) => containsPhrase(text, phrase) || text === phrase)) continue;
    let selected = activePlants.filter(scope.match);
    if (excludesIndoor) selected = selected.filter((plant) => !indoorPlant(plant));
    return result(scope.type, `${scope.label}${excludesIndoor ? " except indoor plants" : ""}`, selected.map((plant) => plant.id), {
      warnings: excludesIndoor ? [`${activePlants.filter(indoorPlant).length} indoor plant records are excluded.`] : [],
    });
  }

  if (!text && ["skipped-watering", "rain-watered", "custom-note"].includes(options.actionType)) {
    return result("estate-note", "Estate weather and care note", []);
  }

  const unresolved = text || "plant or garden area";
  return result("unresolved", "Needs clarification", [], {
    needsClarification:true,
    clarification:`Which saved plant, group, collection, or zone did “${unresolved}” mean?`,
    unresolvedTerms:[unresolved],
    warnings:["Buddy will not guess when a target cannot be resolved from saved estate records."],
  });
}

export function gardenTargetLabel(targetIds = [], plants = []) {
  const names = targetIds.map((id) => plants.find((plant) => plant.id === id)?.nickname || plants.find((plant) => plant.id === id)?.name).filter(Boolean);
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} and ${names.length - 2} more`;
}

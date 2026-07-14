import { buddyActionLabels } from "./buildBulkCareEvents";
import { resolveGardenTargets } from "./resolveGardenTargets";

const actionPattern = /(?:didn['’]t|did not|skipped)\s+water(?:ing)?|rain[- ]watered|treated\s+(?:for\s+)?(?:pests?|insects?|aphids?)|treated\s+(?:for\s+)?(?:disease|fungus|mildew)|treated|watered|fertilized|fed|pruned|deadheaded|inspected|checked|harvested|picked|planted|transplanted|repotted|mulched|photographed|took\s+(?:a\s+)?photo(?:graph)?\s+of|moved|archived|removed|logged|noted/gi;

const classifyAction = (phrase) => {
  const value = phrase.toLocaleLowerCase().replace("’", "'");
  if (/didn't|did not|skipped/.test(value)) return "skipped-watering";
  if (/rain/.test(value)) return "rain-watered";
  if (/pest|insect|aphid/.test(value)) return "treated-pests";
  if (/disease|fungus|mildew/.test(value)) return "treated-disease";
  if (/water/.test(value)) return "watered";
  if (/fertiliz|\bfed\b/.test(value)) return "fertilized";
  if (/prun/.test(value)) return "pruned";
  if (/deadhead/.test(value)) return "deadheaded";
  if (/inspect|check/.test(value)) return "inspected";
  if (/harvest|pick/.test(value)) return "harvested";
  if (/transplant/.test(value)) return "transplanted";
  if (/repot/.test(value)) return "repotted";
  if (/plant/.test(value)) return "planted";
  if (/mulch/.test(value)) return "mulched";
  if (/photo/.test(value)) return "photographed";
  if (/archiv/.test(value)) return "archived";
  if (/remov/.test(value)) return "removed";
  if (/mov/.test(value)) return "moved";
  return "custom-note";
};

const localDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const normalize = (value = "") => String(value).toLocaleLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();

function dateAndTime(text, baseDate, baseTime) {
  const lower = normalize(text);
  const date = new Date(`${baseDate}T12:00:00`);
  if (/\byesterday\b/.test(lower)) date.setDate(date.getDate() - 1);
  let time = baseTime || "";
  if (/\bthis morning\b|\bmorning\b/.test(lower)) time = "09:00";
  if (/\bthis evening\b|\bevening\b/.test(lower)) time = "18:00";
  return { date:localDateKey(date), time };
}

function qualifiers(segment) {
  const text = normalize(segment);
  const amount = /\bdeeply\b|\bdeep watering\b/.test(text) ? "deeply" : /\blightly\b/.test(text) ? "lightly" : /\bthoroughly\b/.test(text) ? "thoroughly" : "";
  const method = /\bwith (?:a |the )?watering can\b/.test(text) ? "watering can" : /\b(?:by|with a|using a) hose\b/.test(text) ? "hose" : /\bby rain\b/.test(text) ? "rain" : "";
  const completion = /\bpartially completed\b|\bpartly\b|\bpartially\b/.test(text) ? "partially completed" : /\bskipped\b|didn't|did not/.test(text) ? "skipped" : /\bcompleted\b/.test(text) ? "completed" : "";
  return { amount, method, completion };
}

function stripQualifiers(text) {
  return String(text)
    .replace(/\b(?:lightly|deeply|thoroughly|this morning|this evening|yesterday|completed|partially completed|partly|partially)\b/gi, " ")
    .replace(/\b(?:with (?:a |the )?watering can|(?:by|with a|using a) hose|by rain)\b/gi, " ")
    .replace(/^[\s,;:.]*(?:the|my|our)\s+/i, "")
    .replace(/[\s,;:.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const actionKeywords = {
  watered:["water", "watering"], fertilized:["fertilize", "fertilizer", "feed", "fed"], pruned:["prune", "pruning"],
  deadheaded:["deadhead"], inspected:["inspect", "check"], harvested:["harvest", "pick"],
  "treated-pests":["treat", "pest", "aphid", "insect"], "treated-disease":["treat", "disease", "fungus", "mildew"],
  photographed:["photo"], "skipped-watering":["water", "watering"], "rain-watered":["water", "rain"],
};

function taskMatches(action, tasks, plants) {
  const keywords = actionKeywords[action.type] || [action.type];
  const targets = action.targetIds || [];
  const names = targets.flatMap((id) => {
    const plant = plants.find((item) => item.id === id);
    return [plant?.name, plant?.nickname].filter(Boolean).map(normalize);
  });
  const scopeWords = normalize(action.scopeLabel).split(" ").filter((word) => word.length > 3);
  return tasks.filter((task) => {
    if (task.completed) return false;
    const title = normalize(task.title);
    const actionMatch = keywords.some((keyword) => title.includes(keyword));
    if (!actionMatch) return false;
    if (task.plantId && targets.includes(task.plantId)) return true;
    return names.some((name) => title.includes(name)) || scopeWords.some((word) => title.includes(word)) || action.scopeType === "estate" && /estate|all|garden/.test(title);
  }).map((task) => ({ id:task.id, title:task.title }));
}

export function parseGardenDay(originalText, { plants = [], collections = [], tasks = [], date, time } = {}) {
  const text = String(originalText || "").trim();
  const baseDate = date || localDateKey(new Date());
  const timing = dateAndTime(text, baseDate, time);
  const matches = [...text.matchAll(actionPattern)];
  const warnings = [];
  const unresolvedTerms = [];

  if (!matches.length) return {
    date:timing.date, time:timing.time, originalText:text, actions:[],
    unresolvedTerms:[text || "No garden activity was entered."],
    warnings:["Buddy could not find a supported care action. Nothing has been changed."],
  };

  const actions = matches.map((match, index) => {
    let type = classifyAction(match[0]);
    const end = matches[index + 1]?.index ?? text.length;
    let segment = text.slice(match.index + match[0].length, end);
    if (/^treated$/i.test(match[0])) type = /disease|fungus|mildew/i.test(segment) ? "treated-disease" : "treated-pests";
    segment = segment.replace(/^\s*(?:the|a|an)\s+/i, "").replace(/\s+(?:and|then|so)\s*$/i, "");
    const targetText = stripQualifiers(segment);
    const resolved = resolveGardenTargets(targetText, plants, collections, { actionType:type, fullText:text });
    const action = {
      id:`proposal-${index + 1}`,
      type,
      label:buddyActionLabels[type] || type,
      targetText,
      ...resolved,
      ...qualifiers(segment),
      notes:type === "skipped-watering" && /rain/.test(normalize(text)) ? "Rain was recorded; no manual watering was applied." : "",
      destructive:["archived", "removed"].includes(type),
      sensitive:["treated-pests", "treated-disease"].includes(type),
    };
    action.taskMatches = taskMatches(action, tasks, plants);
    if (action.destructive) action.warnings = [...action.warnings, "Destructive plant changes are not applied from casual wording. This entry records the statement only unless managed from the plant profile."];
    if (action.sensitive) action.warnings = [...action.warnings, "Treatment records require a second confirmation and do not close Plant Health cases automatically."];
    unresolvedTerms.push(...action.unresolvedTerms);
    warnings.push(...action.warnings);
    return action;
  });

  return {
    date:timing.date,
    time:timing.time,
    originalText:text,
    actions,
    unresolvedTerms:[...new Set(unresolvedTerms)],
    warnings:[...new Set(warnings)],
  };
}

export const supportedBuddyActions = Object.keys(buddyActionLabels);

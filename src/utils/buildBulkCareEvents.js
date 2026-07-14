export const buddyActionLabels = {
  watered:"Watered", fertilized:"Fertilized", pruned:"Pruned", deadheaded:"Deadheaded",
  inspected:"Inspected", harvested:"Harvested", planted:"Planted", transplanted:"Transplanted",
  repotted:"Repotted", mulched:"Mulched", "treated-pests":"Treated for pests",
  "treated-disease":"Treated for disease", photographed:"Photographed", moved:"Moved",
  archived:"Archived", removed:"Removed", "skipped-watering":"Skipped watering",
  "rain-watered":"Rain watered", "custom-note":"Care note",
};

export const careActionTypes = new Set([
  "watered", "fertilized", "pruned", "deadheaded", "inspected", "harvested", "transplanted",
  "repotted", "mulched", "treated-pests", "treated-disease", "photographed", "rain-watered",
]);

export function isTeaHarvestPlant(plant) {
  return /herb|mint|tea|sage/i.test(`${plant?.category || ""} ${plant?.type || ""} ${plant?.group || ""}`);
}

export function summarizeBuddyAction(action, plants = []) {
  const label = buddyActionLabels[action.type] || action.type || "Garden care";
  const count = action.targetIds?.length || 0;
  const scope = action.scopeLabel || (count === 1 ? plants.find((plant) => plant.id === action.targetIds[0])?.name : "Jardin Soleil") || "Jardin Soleil";
  const countText = count ? ` — ${count} active ${count === 1 ? "plant" : "plants"}` : "";
  const qualifiers = [action.amount, action.method, action.completion].filter(Boolean).join(", ");
  return `${label} ${scope}${countText}${qualifiers ? ` (${qualifiers})` : ""}.`;
}

export function buildBuddyJournalEntry(action, record, plants, makeId) {
  const targetIds = [...new Set(action.targetIds || [])];
  const summary = summarizeBuddyAction(action, plants);
  return {
    id:makeId("buddy-care"),
    bulkCareEventId:makeId("bulk-care"),
    buddyLogId:record.id,
    createdAt:record.eventTimestamp,
    date:record.date,
    time:record.time,
    type:buddyActionLabels[action.type] || action.type,
    actionType:action.type,
    notes:[summary, action.notes].filter(Boolean).join(" "),
    plantId:targetIds.length === 1 ? targetIds[0] : "",
    affectedPlantIds:targetIds,
    careEvent:careActionTypes.has(action.type),
    method:action.method || "",
    amount:action.amount || "",
    completion:action.completion || "completed",
    nextDueDate:action.nextDueDate || "",
    source:"Buddy Natural-Language Logger",
    teaHarvest:action.type === "harvested" && targetIds.some((id) => isTeaHarvestPlant(plants.find((item) => item.id === id))),
    linkedDiagnosisIds:action.linkedDiagnosisIds || [],
    recordOnly:Boolean(action.recordOnly),
  };
}

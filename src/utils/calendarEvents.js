const dateKey = (value) => {
  if (!value) return "";
  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export function getGardenCalendarEvents({ tasks = [], journalEntries = [], teaWorkflows = [], plants = [] }) {
  const plantName = (plantId, record = {}) => plants.find((plant) => plant.id === plantId)?.name || record.deletedPlantName || "Garden plant";
  const plantIsActive = (plantId) => {
    const plant = plants.find((item) => item.id === plantId);
    return Boolean(plant && !plant.archived && !["archived", "removed"].includes(String(plant.status || "").toLocaleLowerCase()));
  };
  const events = [];
  tasks.forEach((task) => {
    const date = dateKey(task.dueDate);
    if (date && !task.archived) events.push({ id:`task-${task.id}`, date, title:task.title, type:"Task", completed:Boolean(task.completed), sourceId:task.id });
  });
  journalEntries.forEach((entry) => {
    const occurred = dateKey(entry.careDate || entry.date || entry.createdAt);
    if (occurred) events.push({ id:`journal-${entry.id}`, date:occurred, title:entry.title || entry.type || "Garden journal entry", type:entry.careEvent ? "Care" : /harvest/i.test(entry.type || "") ? "Harvest" : "Journal", plantName:entry.plantId || entry.deletedPlantName ? plantName(entry.plantId, entry) : "" });
    const due = dateKey(entry.nextDueDate);
    if (due && !entry.plantDeleted && plantIsActive(entry.plantId)) events.push({ id:`care-due-${entry.id}`, date:due, title:`${entry.type || "Care"} due`, type:"Care due", plantName:entry.plantId ? plantName(entry.plantId, entry) : "" });
  });
  const workflowDates = [
    ["harvestDate", "Tea harvest"], ["dryingStartDate", "Drying started"], ["dryingCompletionDate", "Drying complete"],
    ["jarredDate", "Herbs jarred"], ["blendCreationDate", "Blend created"], ["brewingDate", "Tea brewed"],
  ];
  teaWorkflows.forEach((workflow) => workflowDates.forEach(([field, label]) => {
    const date = dateKey(workflow[field]);
    if (date) events.push({ id:`workflow-${workflow.id}-${field}`, date, title:label, type:"Garden to Cup", plantName:workflow.plantId || workflow.deletedPlantName ? plantName(workflow.plantId, workflow) : "" });
  }));
  return events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export { dateKey as toCalendarDateKey };

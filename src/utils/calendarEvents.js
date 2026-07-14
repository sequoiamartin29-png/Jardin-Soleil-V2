const dateKey = (value) => {
  if (!value) return "";
  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export function getGardenCalendarEvents({ tasks = [], journalEntries = [], teaWorkflows = [], plants = [] }) {
  const plantName = (plantId) => plants.find((plant) => plant.id === plantId)?.name || "Garden plant";
  const events = [];
  tasks.forEach((task) => {
    const date = dateKey(task.dueDate);
    if (date) events.push({ id:`task-${task.id}`, date, title:task.title, type:"Task", completed:Boolean(task.completed), sourceId:task.id });
  });
  journalEntries.forEach((entry) => {
    const occurred = dateKey(entry.careDate || entry.date || entry.createdAt);
    if (occurred) events.push({ id:`journal-${entry.id}`, date:occurred, title:entry.title || entry.type || "Garden journal entry", type:entry.careEvent ? "Care" : /harvest/i.test(entry.type || "") ? "Harvest" : "Journal", plantName:entry.plantId ? plantName(entry.plantId) : "" });
    const due = dateKey(entry.nextDueDate);
    if (due) events.push({ id:`care-due-${entry.id}`, date:due, title:`${entry.type || "Care"} due`, type:"Care due", plantName:entry.plantId ? plantName(entry.plantId) : "" });
  });
  const workflowDates = [
    ["harvestDate", "Tea harvest"], ["dryingStartDate", "Drying started"], ["dryingCompletionDate", "Drying complete"],
    ["jarredDate", "Herbs jarred"], ["blendCreationDate", "Blend created"], ["brewingDate", "Tea brewed"],
  ];
  teaWorkflows.forEach((workflow) => workflowDates.forEach(([field, label]) => {
    const date = dateKey(workflow[field]);
    if (date) events.push({ id:`workflow-${workflow.id}-${field}`, date, title:label, type:"Garden to Cup", plantName:workflow.plantId ? plantName(workflow.plantId) : "" });
  }));
  return events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export { dateKey as toCalendarDateKey };

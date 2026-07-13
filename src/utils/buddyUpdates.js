const normalize = (value = "") => String(value).toLocaleLowerCase();
const startOfLocalDay = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export function selectBuddyEstateUpdates({ plants = [], journalEntries = [], photos = [] }, now = new Date()) {
  const today = startOfLocalDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const careEntries = journalEntries.filter((entry) => entry.careEvent);
  const dueToday = careEntries.filter((entry) => {
    if (!entry.nextDueDate) return false;
    const due = new Date(`${entry.nextDueDate}T12:00:00`);
    return due >= today && due < tomorrow;
  });
  const overdue = careEntries.filter((entry) => {
    if (!entry.nextDueDate) return false;
    return new Date(`${entry.nextDueDate}T12:00:00`) < today;
  });
  const attention = plants.filter((plant) => Number(plant.health ?? 100) < 85);
  const flowering = plants.filter((plant) => /flower|bloom/i.test(plant.status || ""));
  const harvestReady = plants.filter((plant) => /producing|fruiting|harvest ready|ready to harvest/i.test(plant.status || ""));
  const recentEntries = [...journalEntries].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const plantName = (plantId) => plants.find((plant) => plant.id === plantId)?.name;
  const updates = [];

  if (overdue.length) {
    const named = plantName(overdue[0].plantId);
    updates.push({ id:"overdue-care", urgent:true, text:named ? `${named} has overdue ${normalize(overdue[0].type) || "care"}.` : `${overdue.length} care ${overdue.length === 1 ? "task is" : "tasks are"} overdue.` });
  }
  if (dueToday.length) updates.push({ id:"due-today", urgent:true, text:`${dueToday.length} care ${dueToday.length === 1 ? "task is" : "tasks are"} due today.` });
  if (attention.length) updates.push({ id:"attention", urgent:true, text:`${attention[0].name} needs a little attention.` });
  if (flowering.length) updates.push({ id:"flowering", text:`${flowering[0].name} is flowering.` });
  if (harvestReady.length) updates.push({ id:"harvest", text:`${harvestReady[0].name} is marked ${normalize(harvestReady[0].status)}.` });
  if (recentEntries.length) {
    const latest = recentEntries[0];
    const name = plantName(latest.plantId);
    updates.push({ id:"journal", text:name ? `The latest garden note is about ${name}.` : "A new entry is waiting in the garden journal." });
  }
  if (!photos.length && plants.length) updates.push({ id:"photos", text:"The estate photo collection is ready for its first garden memory." });

  return { updates, dueToday, overdue, attention, flowering, harvestReady, recentEntries };
}

export function buildBuddyJournal(garden, now = new Date()) {
  const selected = selectBuddyEstateUpdates(garden, now);
  const month = now.toLocaleDateString(undefined, { month:"long" });
  const seasonWords = now.getMonth() <= 1 || now.getMonth() === 11
    ? ["winter"] : now.getMonth() <= 4 ? ["spring"] : now.getMonth() <= 7 ? ["summer"] : ["fall", "autumn"];
  const seasonalPlants = garden.plants.filter((plant) => seasonWords.some((word) => normalize(plant.harvest).includes(word)));

  return {
    estateUpdate: selected.updates.slice(0, 1).map((item) => item.text),
    highlights: [
      ...selected.flowering.map((plant) => `${plant.name} — ${plant.status}`),
      ...selected.harvestReady.map((plant) => `${plant.name} — ${plant.status}`),
      ...selected.recentEntries.slice(0, 2).map((entry) => `${entry.type || "Journal entry"}${entry.plantId ? ` — ${garden.plants.find((plant) => plant.id === entry.plantId)?.name || "Plant"}` : ""}`),
    ],
    tasks: [
      ...selected.overdue.map((entry) => `${garden.plants.find((plant) => plant.id === entry.plantId)?.name || "Garden plant"}: ${entry.type || "care"} overdue`),
      ...selected.dueToday.map((entry) => `${garden.plants.find((plant) => plant.id === entry.plantId)?.name || "Garden plant"}: ${entry.type || "care"} due today`),
      ...selected.attention.map((plant) => `Inspect ${plant.name} — health ${plant.health}%`),
    ],
    seasonalNotes: seasonalPlants.map((plant) => `${plant.name}: stored harvest season is ${plant.harvest}`).slice(0, 6),
    tips: selected.dueToday.length || selected.overdue.length
      ? ["Open the plant profile to record completed care and schedule the next due date."]
      : selected.attention.length
        ? ["Review the plant’s recent care history before recording a treatment."]
        : [],
    month,
  };
}

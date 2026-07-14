const normalize = (value = "") => String(value).toLocaleLowerCase();
const startOfLocalDay = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export function selectBuddyEstateUpdates({ plants = [], journalEntries = [], photos = [], inventoryItems = [], plantDiagnoses = [] }, now = new Date()) {
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
  const lowInventory = inventoryItems.filter((item) => item.status === "Low" || item.status === "Out" || (item.quantity !== "" && item.lowThreshold !== "" && Number(item.quantity) <= Number(item.lowThreshold)));
  const recentEntries = [...journalEntries].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const plantName = (plantId) => plants.find((plant) => plant.id === plantId)?.name;
  const updates = [];
  const activeDiagnoses = plantDiagnoses.filter((diagnosis) => diagnosis.status !== "Resolved");
  const healthAlerts = activeDiagnoses.map((diagnosis) => {
    const plant = plants.find((item) => item.id === diagnosis.plantId);
    return { diagnosisId:diagnosis.id, plantId:diagnosis.plantId, text:`${plant?.name || diagnosis.deletedPlantName || "A garden plant"} has a saved ${normalize(diagnosis.workingDiagnosis) || "health issue"} case marked ${diagnosis.status || "Unconfirmed"}.` };
  });
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  const followUpTomorrow = activeDiagnoses.find((diagnosis) => {
    if (!diagnosis.followUpDate) return false;
    const due = new Date(`${diagnosis.followUpDate}T12:00:00`);
    return due >= tomorrow && due < dayAfterTomorrow;
  });

  if (overdue.length) {
    const named = plantName(overdue[0].plantId);
    updates.push({ id:"overdue-care", urgent:true, text:named ? `${named} has overdue ${normalize(overdue[0].type) || "care"}.` : `${overdue.length} care ${overdue.length === 1 ? "task is" : "tasks are"} overdue.` });
  }
  if (dueToday.length) updates.push({ id:"due-today", urgent:true, text:`${dueToday.length} care ${dueToday.length === 1 ? "task is" : "tasks are"} due today.` });
  if (followUpTomorrow) {
    const plant = plantName(followUpTomorrow.plantId);
    updates.push({ id:`health-follow-up-${followUpTomorrow.id}`, urgent:true, diagnosisId:followUpTomorrow.id, text:`${plant || "A plant"} has a health follow-up due tomorrow.` });
  } else if (healthAlerts.length) {
    updates.push({ id:"plant-health", urgent:true, diagnosisId:healthAlerts[0].diagnosisId, text:`${healthAlerts.length} ${healthAlerts.length === 1 ? "plant is" : "plants are"} being monitored in the Plant Health Center.` });
  }
  if (attention.length) updates.push({ id:"attention", urgent:true, text:`${attention[0].name} needs a little attention.` });
  if (lowInventory.length) updates.push({ id:"inventory", urgent:true, text:`${lowInventory[0].name} is marked ${normalize(lowInventory[0].status) || "low"} in estate inventory.` });
  if (flowering.length) updates.push({ id:"flowering", text:`${flowering[0].name} is flowering.` });
  if (harvestReady.length) updates.push({ id:"harvest", text:`${harvestReady[0].name} is marked ${normalize(harvestReady[0].status)}.` });
  if (recentEntries.length) {
    const latest = recentEntries[0];
    const name = plantName(latest.plantId);
    updates.push({ id:"journal", text:name ? `The latest garden note is about ${name}.` : "A new entry is waiting in the garden journal." });
  }
  if (!photos.length && plants.length) updates.push({ id:"photos", text:"The estate photo collection is ready for its first garden memory." });

  return { updates, dueToday, overdue, attention, flowering, harvestReady, recentEntries, lowInventory, healthAlerts };
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
      ...selected.lowInventory.map((item) => `Inventory: ${item.name} — ${item.status}`),
    ],
    seasonalNotes: seasonalPlants.map((plant) => `${plant.name}: stored harvest season is ${plant.harvest}`).slice(0, 6),
    tips: selected.dueToday.length || selected.overdue.length
      ? ["Open the plant profile to record completed care and schedule the next due date."]
      : selected.healthAlerts.length
        ? ["Open the saved Plant Health Center case before recording a new treatment."]
      : selected.attention.length
        ? ["Review the plant’s recent care history before recording a treatment."]
        : [],
    month,
    healthAlerts:selected.healthAlerts,
  };
}

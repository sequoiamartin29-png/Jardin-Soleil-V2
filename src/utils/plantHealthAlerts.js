const resolvedStatuses = new Set(["Resolved", "Archived"]);
const severityOrder = { Critical:0, High:1, Moderate:2, Low:3 };

const clean = (value) => String(value || "").trim();
const dateValue = (value) => {
  const parsed = new Date(value || 0).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};
const isDue = (value, now) => {
  if (!value) return false;
  const due = new Date(`${String(value).slice(0, 10)}T23:59:59`).getTime();
  return Number.isFinite(due) && due <= now.getTime();
};

const caseSeverity = (diagnosis, plant, overdue) => {
  const explicit = clean(diagnosis.alertSeverity || diagnosis.severity);
  if (severityOrder[explicit] !== undefined) return explicit;
  const health = Number(plant?.health);
  const plantStatus = `${plant?.healthStatus || ""} ${plant?.status || ""}`.toLocaleLowerCase();
  if (plantStatus.includes("critical") || (Number.isFinite(health) && health <= 40)) return "Critical";
  if (overdue || diagnosis.status === "Recurring" || plantStatus.includes("poor") || (Number.isFinite(health) && health <= 65)) return "High";
  if (diagnosis.status === "Improving") return "Low";
  return "Moderate";
};

const caseMessage = (diagnosis, overdue) => {
  if (overdue) return `Follow-up was due ${new Date(`${diagnosis.followUpDate}T12:00:00`).toLocaleDateString()}.`;
  if (diagnosis.symptoms?.length) return diagnosis.symptoms.slice(0, 3).join(", ");
  return clean(diagnosis.notes) || clean(diagnosis.workingDiagnosis) || "An active plant-health case needs review.";
};

const plantSeverity = (plant) => {
  const health = Number(plant.health);
  const status = `${plant.healthStatus || ""} ${plant.status || ""}`.toLocaleLowerCase();
  if (status.includes("critical") || (Number.isFinite(health) && health <= 40)) return "Critical";
  return "High";
};

const plantNeedsAttention = (plant) => {
  if (!plant || plant.archived) return false;
  const health = Number(plant.health);
  const status = `${plant.healthStatus || ""} ${plant.status || ""}`.toLocaleLowerCase();
  return status.includes("critical") || status.includes("poor") || (Number.isFinite(health) && health <= 65);
};

export const isActiveHealthCase = (diagnosis) => (
  Boolean(diagnosis?.id) && !resolvedStatuses.has(diagnosis.status)
);

export function buildPlantHealthAlerts({
  plantDiagnoses = [],
  plants = [],
  photos = [],
  now = new Date(),
} = {}) {
  const plantsById = new Map(plants.map((plant) => [plant.id, plant]));
  const photosById = new Map(photos.map((photo) => [photo.id, photo]));
  const firstPhotoByPlant = new Map();
  photos.forEach((photo) => {
    if (photo.plantId && !firstPhotoByPlant.has(photo.plantId)) firstPhotoByPlant.set(photo.plantId, photo);
  });
  const plantsWithActiveCases = new Set();

  const caseAlerts = plantDiagnoses.filter(isActiveHealthCase).map((diagnosis) => {
    const plant = plantsById.get(diagnosis.plantId);
    const overdue = isDue(diagnosis.followUpDate, now);
    const linkedPhoto = (diagnosis.photoIds || []).map((id) => photosById.get(id)).find(Boolean)
      || firstPhotoByPlant.get(diagnosis.plantId);
    const acknowledgedAt = diagnosis.alertReviewedAt || diagnosis.acknowledgedAt || null;
    if (diagnosis.plantId) plantsWithActiveCases.add(diagnosis.plantId);
    return {
      id:`plant-health-case:${diagnosis.id}`,
      type:"plant-health",
      source:"health-case",
      plantId:diagnosis.plantId || "",
      healthCaseId:diagnosis.id,
      title:clean(diagnosis.workingDiagnosis) || "Unconfirmed health concern",
      message:caseMessage(diagnosis, overdue),
      severity:caseSeverity(diagnosis, plant, overdue),
      status:diagnosis.status || "Unconfirmed",
      createdAt:diagnosis.createdAt || diagnosis.date || now.toISOString(),
      acknowledgedAt,
      unread:!acknowledgedAt,
      overdue,
      plantName:plant?.nickname || plant?.name || diagnosis.deletedPlantName || "Unavailable plant",
      plantMissing:!plant,
      thumbnail:linkedPhoto?.url || linkedPhoto?.src || "",
    };
  });

  const plantAlerts = plants
    .filter((plant) => plantNeedsAttention(plant) && !plantsWithActiveCases.has(plant.id))
    .map((plant) => {
      const acknowledgedAt = plant.healthAlertReviewedAt || null;
      const health = Number(plant.health);
      const linkedPhoto = firstPhotoByPlant.get(plant.id);
      return {
        id:`plant-health-plant:${plant.id}`,
        type:"plant-health",
        source:"plant-record",
        plantId:plant.id,
        healthCaseId:null,
        title:"Plant health needs attention",
        message:Number.isFinite(health) ? `Recorded plant health is ${health}%.` : "The plant is marked Critical or Poor.",
        severity:plantSeverity(plant),
        status:"Needs Attention",
        createdAt:plant.healthUpdatedAt || plant.updatedAt || plant.createdAt || now.toISOString(),
        acknowledgedAt,
        unread:!acknowledgedAt,
        overdue:false,
        plantName:plant.nickname || plant.name || "Garden plant",
        plantMissing:false,
        thumbnail:linkedPhoto?.url || linkedPhoto?.src || "",
      };
    });

  return [...caseAlerts, ...plantAlerts].sort((left, right) => (
    Number(left.unread) === Number(right.unread)
      ? (severityOrder[left.severity] ?? 9) - (severityOrder[right.severity] ?? 9)
        || dateValue(right.createdAt) - dateValue(left.createdAt)
      : Number(right.unread) - Number(left.unread)
  ));
}

export const unreadPlantHealthAlerts = (alerts = []) => alerts.filter((alert) => alert.unread);

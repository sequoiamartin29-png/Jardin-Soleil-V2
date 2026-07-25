import assert from "node:assert/strict";
import {
  buildPlantHealthAlerts,
  unreadPlantHealthAlerts,
} from "../src/utils/plantHealthAlerts.js";

const now = new Date("2026-07-24T12:00:00.000Z");
const plants = [
  { id:"rose", name:"Rose", health:82, createdAt:"2026-07-01T12:00:00.000Z" },
  { id:"mint", name:"Mint", health:35, createdAt:"2026-07-02T12:00:00.000Z" },
];
const cases = [
  {
    id:"rose-case",
    plantId:"rose",
    workingDiagnosis:"Leaf spot",
    symptoms:["brown spots"],
    status:"Monitoring",
    followUpDate:"2026-07-20",
    createdAt:"2026-07-10T12:00:00.000Z",
  },
];

const alerts = buildPlantHealthAlerts({ plantDiagnoses:cases, plants, now });
assert.equal(alerts.length, 2, "One case alert and one low-health plant alert should be derived.");
assert.equal(new Set(alerts.map((alert) => alert.id)).size, alerts.length, "Derived alerts must not duplicate.");
assert.deepEqual(
  Object.keys(alerts[0]).filter((key) => ["id", "type", "plantId", "healthCaseId", "title", "message", "severity", "status", "createdAt", "acknowledgedAt", "unread"].includes(key)).sort(),
  ["acknowledgedAt", "createdAt", "healthCaseId", "id", "message", "plantId", "severity", "status", "title", "type", "unread"],
);
assert.equal(alerts.find((alert) => alert.healthCaseId === "rose-case").overdue, true);
assert.equal(unreadPlantHealthAlerts(alerts).length, 2);

const reviewed = buildPlantHealthAlerts({
  plantDiagnoses:[{ ...cases[0], alertReviewedAt:"2026-07-24T11:00:00.000Z" }],
  plants,
  now,
});
assert.equal(unreadPlantHealthAlerts(reviewed).length, 1, "Reviewed cases stay active but leave the unread badge count.");
assert.equal(reviewed.find((alert) => alert.healthCaseId === "rose-case").unread, false);

const resolved = buildPlantHealthAlerts({
  plantDiagnoses:[{ ...cases[0], status:"Resolved" }],
  plants,
  now,
});
assert.equal(resolved.some((alert) => alert.healthCaseId === "rose-case"), false, "Resolved cases must leave the attention list.");

const missingPlant = buildPlantHealthAlerts({
  plantDiagnoses:[{ ...cases[0], id:"missing-case", plantId:"deleted-plant", deletedPlantName:"Deleted Rose" }],
  plants,
  now,
});
const missingAlert = missingPlant.find((alert) => alert.healthCaseId === "missing-case");
assert.equal(missingAlert.plantMissing, true);
assert.equal(missingAlert.plantName, "Deleted Rose");

const repeated = buildPlantHealthAlerts({ plantDiagnoses:cases, plants, now });
assert.deepEqual(repeated.map((alert) => alert.id), alerts.map((alert) => alert.id), "Alert IDs must remain stable across renders.");

console.log("Plant Health alert derivation verification passed.");

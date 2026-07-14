import React, { useMemo, useState } from "react";
import BotanicalIcon from "../icons/BotanicalIcon";
import HealthStatusSeal from "./HealthStatusSeal";

const activeStatuses = new Set(["Monitoring", "Treating", "Improving", "Recurring", "Unconfirmed"]);

export default function EstateHealthReview({ plants, diagnoses, onOpen, onStartDiagnosis }) {
  const [plantId, setPlantId] = useState("All");
  const [zone, setZone] = useState("All");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [diagnosisType, setDiagnosisType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const plantFor = (id) => plants.find((plant) => plant.id === id);
  const zones = [...new Set(plants.map((plant) => plant.gardenZone || plant.location).filter(Boolean))].sort();
  const active = diagnoses.filter((item) => activeStatuses.has(item.status));
  const unresolved = diagnoses.filter((item) => item.status !== "Resolved");
  const improving = diagnoses.filter((item) => item.status === "Improving");
  const resolved = diagnoses.filter((item) => item.status === "Resolved");
  const repeated = Object.entries(diagnoses.reduce((map, item) => ({ ...map, [item.workingDiagnosis]:(map[item.workingDiagnosis] || 0) + 1 }), {})).filter(([, count]) => count > 1);
  const zoneCounts = unresolved.reduce((map, item) => { const plant = plantFor(item.plantId); const name = plant?.gardenZone || plant?.location || "Unassigned"; map[name] = (map[name] || 0) + 1; return map; }, {});
  const highestZone = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1])[0];
  const healthy = plants.filter((plant) => Number(plant.health ?? 100) >= 85 && !active.some((item) => item.plantId === plant.id));
  const needsAttention = plants.filter((plant) => Number(plant.health ?? 100) < 85 || diagnoses.some((item) => item.plantId === plant.id && ["Recurring", "Unconfirmed"].includes(item.status)));

  const visible = useMemo(() => diagnoses.filter((item) => {
    const plant = plantFor(item.plantId);
    const itemCategory = item.rankedPossibilities?.[0]?.category || "Unconfirmed";
    return (plantId === "All" || item.plantId === plantId)
      && (zone === "All" || (plant?.gardenZone || plant?.location || "Unassigned") === zone)
      && (status === "All" || item.status === status)
      && (category === "All" || itemCategory === category)
      && (!diagnosisType.trim() || item.workingDiagnosis.toLocaleLowerCase().includes(diagnosisType.trim().toLocaleLowerCase()))
      && (!dateFrom || new Date(item.createdAt) >= new Date(`${dateFrom}T00:00:00`));
  }), [diagnoses, plantId, zone, status, category, diagnosisType, dateFrom, plants]);

  return (
    <div className="js-estate-health-review">
      <section className="js-estate-health-review__states" aria-label="Estate plant health status">
        <article><span>Healthy</span><strong>{healthy.length}</strong><p>No active case and health at least 85%</p></article>
        <article><span>Monitoring</span><strong>{diagnoses.filter((item) => item.status === "Monitoring").length}</strong><p>Saved observation cases</p></article>
        <article><span>Treating</span><strong>{diagnoses.filter((item) => item.status === "Treating").length}</strong><p>Active treatment records</p></article>
        <article><span>Needs Attention</span><strong>{needsAttention.length}</strong><p>Low health or unconfirmed cases</p></article>
        <article><span>Resolved</span><strong>{resolved.length}</strong><p>Completed case files</p></article>
      </section>
      <section className="js-estate-health-review__summary">
        <article><span>Active diagnoses</span><strong>{active.length}</strong></article><article><span>Unresolved issues</span><strong>{unresolved.length}</strong></article><article><span>Plants improving</span><strong>{improving.length}</strong></article><article><span>Repeated problems</span><strong>{repeated.length}</strong></article><article><span>Most affected zone</span><strong>{highestZone ? `${highestZone[0]} (${highestZone[1]})` : "None"}</strong></article>
      </section>
      <section className="js-estate-health-review__filters" aria-label="Filter plant diagnoses">
        <label>Plant<select value={plantId} onChange={(event) => setPlantId(event.target.value)}><option>All</option>{plants.map((plant) => <option value={plant.id} key={plant.id}>{plant.name}</option>)}</select></label>
        <label>Garden zone<select value={zone} onChange={(event) => setZone(event.target.value)}><option>All</option>{zones.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option>{["Monitoring", "Treating", "Improving", "Resolved", "Recurring", "Unconfirmed"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Type<select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option><option>Disease</option><option>Pest</option><option>Environmental stress</option><option>Unconfirmed</option></select></label>
        <label>Diagnosis search<input value={diagnosisType} onChange={(event) => setDiagnosisType(event.target.value)} placeholder="e.g. aphids or root rot" /></label>
        <label>From date<input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label>
      </section>
      <section className="js-estate-health-review__records">
        <header><div><p>Pressed case files</p><h2>Estate diagnoses</h2></div><button className="js-health-primary" type="button" onClick={onStartDiagnosis}>Start diagnosis</button></header>
        {visible.length ? visible.map((item) => { const plant = plantFor(item.plantId); return <article key={item.id}><BotanicalIcon plant={plant} size="md" decorative /><div><p>{new Date(item.createdAt).toLocaleDateString()} · {item.rankedPossibilities?.[0]?.category || "Unconfirmed"}</p><h3>{item.workingDiagnosis}</h3><span>{plant?.name || item.deletedPlantName || "Plant record unavailable"}</span></div><HealthStatusSeal status={item.status} /><button type="button" onClick={() => onOpen(item.id)}>Open case file</button></article>; }) : <div className="js-health-empty"><h3>No case files match these filters.</h3><p>Begin a diagnosis or adjust the filters to review another part of the estate.</p></div>}
      </section>
    </div>
  );
}


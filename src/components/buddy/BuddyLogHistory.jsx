import React from "react";
import { summarizeBuddyAction } from "../../utils/buildBulkCareEvents";

export default function BuddyLogHistory({ records, plants, onUndo, onEdit }) {
  return <section className="js-buddy-history" aria-labelledby="buddy-history-title">
    <header><p>Estate archive</p><h2 id="buddy-history-title">Buddy’s Recent Debriefs</h2></header>
    {records.length ? <div>{records.slice(0, 8).map((record) => <article key={record.id} className={record.status === "undone" ? "is-undone" : ""}>
      <div><time>{new Date(record.eventTimestamp || record.createdAt).toLocaleString()}</time><span>{record.status === "undone" ? "Undone" : `${record.affectedPlantIds?.length || 0} linked plants`}</span></div>
      <blockquote>“{record.originalText}”</blockquote>
      <ul>{record.confirmedActions?.map((action) => <li key={action.id || `${record.id}-${action.type}`}>{summarizeBuddyAction(action, plants)}</li>)}</ul>
      {record.status !== "undone" && <footer><button className="js-estate-button" type="button" onClick={() => onEdit(record)}>Edit and replace</button><button className="js-estate-button is-danger" type="button" onClick={() => onUndo(record.id)}>Undo</button></footer>}
    </article>)}</div> : <p className="js-estate-empty">No Buddy garden-day debriefs have been saved yet.</p>}
  </section>;
}


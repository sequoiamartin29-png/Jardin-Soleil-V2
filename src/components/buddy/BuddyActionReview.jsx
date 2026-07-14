import React from "react";
import { summarizeBuddyAction } from "../../utils/buildBulkCareEvents";
import BuddyClarification from "./BuddyClarification";

export default function BuddyActionReview({ proposal, plants, selectedTaskIds, onToggleTask, onChangeAction, onRemoveAction }) {
  return <div className="js-buddy-review" aria-live="polite">
    <header><p>Buddy understood</p><h2>{proposal.actions.length} proposed {proposal.actions.length === 1 ? "action" : "actions"}</h2><span>Review every detail. Nothing below has been saved yet.</span></header>
    <ol className="js-buddy-review__list">
      {proposal.actions.map((action, index) => <li key={action.id} className={action.needsClarification ? "needs-clarification" : ""}>
        <article>
          <div className="js-buddy-review__heading"><span>{index + 1}</span><div><h3>{action.label}</h3><p>{summarizeBuddyAction(action, plants)}</p></div><button className="js-estate-button is-danger" type="button" onClick={() => onRemoveAction(action.id)}>Remove Action</button></div>
          <BuddyClarification action={action} onResolve={(option) => onChangeAction(action.id, { ...option, needsClarification:false, unresolvedTerms:[] })} />
          {action.warnings?.map((warning) => <p className="js-buddy-review__warning" key={warning}>{warning}</p>)}
          <div className="js-buddy-review__facts"><span><b>Affected:</b> {action.targetIds?.length || 0} active plants</span><span><b>Method:</b> {action.method || "Not specified"}</span><span><b>Amount:</b> {action.amount || "Not specified"}</span><span><b>Status:</b> {action.completion || "Completed"}</span></div>
          <details className="js-buddy-review__editor">
            <summary>Edit details or change affected plants</summary>
            <div className="js-buddy-review__fields">
              <label>Method<input value={action.method || ""} onChange={(event) => onChangeAction(action.id, { method:event.target.value })} placeholder="Hose, watering can, by hand…" /></label>
              <label>Amount<input value={action.amount || ""} onChange={(event) => onChangeAction(action.id, { amount:event.target.value })} placeholder="Lightly, deeply, 2 cups…" /></label>
              <label>Completion<select value={action.completion || "completed"} onChange={(event) => onChangeAction(action.id, { completion:event.target.value })}><option value="completed">Completed</option><option value="partially completed">Partially completed</option><option value="skipped">Skipped</option></select></label>
              <label>Next due date<input type="date" value={action.nextDueDate || ""} onChange={(event) => onChangeAction(action.id, { nextDueDate:event.target.value })} /></label>
              <label className="is-wide">Action notes<textarea rows="2" value={action.notes || ""} onChange={(event) => onChangeAction(action.id, { notes:event.target.value })} /></label>
            </div>
            <fieldset className="js-buddy-review__plants"><legend>Affected active plants</legend><div>{plants.map((plant) => <label key={plant.id}><input type="checkbox" checked={action.targetIds?.includes(plant.id) || false} onChange={(event) => {
              const targetIds = event.target.checked ? [...new Set([...(action.targetIds || []), plant.id])] : (action.targetIds || []).filter((id) => id !== plant.id);
              onChangeAction(action.id, { targetIds, scopeType:"selected-plants", scopeLabel:targetIds.length === 1 ? plant.nickname || plant.name : "Selected plants", needsClarification:targetIds.length === 0 && !action.recordOnly, unresolvedTerms:targetIds.length ? [] : action.unresolvedTerms });
            }} /><span>{plant.nickname || plant.name}<small>{plant.nickname ? plant.name : plant.group || plant.category || "Estate plant"}</small></span></label>)}</div></fieldset>
          </details>
          {action.taskMatches?.length > 0 && <fieldset className="js-buddy-review__tasks"><legend>Related open tasks — choose whether to complete</legend>{action.taskMatches.map((task) => <label key={task.id}><input type="checkbox" checked={selectedTaskIds.includes(task.id)} onChange={() => onToggleTask(task.id)} /><span>This appears to complete “{task.title}.” Mark it complete?</span></label>)}</fieldset>}
        </article>
      </li>)}
    </ol>
  </div>;
}


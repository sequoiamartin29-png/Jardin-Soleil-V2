import React from "react";

export default function BuddyClarification({ action, onResolve }) {
  if (!action.needsClarification) return null;
  return <section className="js-buddy-clarification" aria-labelledby={`clarification-${action.id}`}>
    <span aria-hidden="true">?</span>
    <div>
      <h4 id={`clarification-${action.id}`}>Buddy needs one detail</h4>
      <p>{action.clarification || "Choose the saved plants this action should affect."}</p>
      {action.options?.length > 0 && <div className="js-buddy-clarification__choices">{action.options.map((option) => <button className="js-estate-button" type="button" key={option.id} onClick={() => onResolve(option)}>{option.label}</button>)}</div>}
      <small>You can also open “Change affected plants” below and select the exact records.</small>
    </div>
  </section>;
}


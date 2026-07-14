import React, { useMemo, useState } from "react";
import { buildIdentificationContext, summarizeIdentificationContext } from "../../utils/buildIdentificationContext";
import { buildPhotoFollowUpQuestions, mergePhotoFollowUp } from "../../utils/photoFollowUp";

const toggle = (items, item) => items.includes(item) ? items.filter((value) => value !== item) : [...items, item];

export default function PhotoFollowUp({ context, candidates, onComplete, onCancel }) {
  const questions = useMemo(() => buildPhotoFollowUpQuestions(candidates, context), [candidates, context]);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
  const inferredSummary = summarizeIdentificationContext(context);

  const change = (question, value) => {
    setMessage("");
    setAnswers((current) => ({
      ...current,
      [question.field]:question.multiple ? toggle(current[question.field] || [], value) : value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!Object.values(answers).some((value) => Array.isArray(value) ? value.length : value)) {
      setMessage("Choose at least one visible observation before refining the photo matches.");
      return;
    }
    onComplete(buildIdentificationContext(mergePhotoFollowUp(context, answers)));
  };

  return (
    <form className="js-finder-ledger js-finder-followup" onSubmit={submit} aria-labelledby="photo-followup-title">
      <header>
        <p>Focused specimen check</p>
        <h2 id="photo-followup-title">Guided Photo Follow-Up</h2>
        <span>Answer only the observations that help separate the current photo candidates.</span>
      </header>
      {inferredSummary && <aside className="js-finder-notice"><strong>Photo observations carried forward</strong><p>{inferredSummary}</p></aside>}
      <div className="js-finder-followup__questions">
        {!questions.length && <aside className="js-finder-notice" role="status">No additional structured trait question would separate these candidates. Return to the results and use each candidate’s “Inspect next” guidance or seek local expert confirmation.</aside>}
        {questions.map((question) => (
          <fieldset className="js-finder-choice" key={question.field}>
            <legend>{question.legend}</legend>
            <div>{question.values.map((value) => {
              const selected = question.multiple ? (answers[question.field] || []).includes(value) : answers[question.field] === value;
              return <label key={value} className={selected ? "is-selected" : ""}><input type={question.multiple ? "checkbox" : "radio"} name={question.field} checked={selected} onChange={() => change(question, value)} /><span>{value}</span></label>;
            })}</div>
          </fieldset>
        ))}
      </div>
      {message && <p className="js-finder-validation" role="alert">{message}</p>}
      <div className="js-finder-actions">
        <button type="button" className="is-quiet" onClick={onCancel}>Back to photo results</button>
        <button type="submit" className="is-primary" disabled={!questions.length}>Refine Matches</button>
      </div>
    </form>
  );
}

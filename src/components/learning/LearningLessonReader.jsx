import React, { useEffect, useMemo, useRef, useState } from "react";

function ReviewQuestion({ question, value, onAnswer }) {
  const hasAnswer = String(value || "").trim().length > 0;
  const isReflection = question.type === "reflection";
  const isCorrect = isReflection ? hasAnswer : value === question.answer;

  return (
    <fieldset className="js-learning-reader__question">
      <legend>{question.prompt}</legend>
      {isReflection ? (
        <textarea
          rows="4"
          value={value || ""}
          onChange={(event) => onAnswer(event.target.value, false)}
          onBlur={(event) => onAnswer(event.target.value, true)}
          placeholder="Write a short garden reflection…"
          aria-label={`Reflection: ${question.prompt}`}
        />
      ) : (
        <div className="js-learning-reader__options">
          {question.options.map((option) => (
            <label key={option}>
              <input type="radio" name={question.id} value={option} checked={value === option} onChange={() => onAnswer(option, true)} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
      {hasAnswer && (
        <div className={`js-learning-reader__feedback${isCorrect ? " is-correct" : ""}`} role="status" aria-live="polite">
          <strong>{isReflection ? "Reflection saved" : isCorrect ? "Nicely observed" : "Take another look"}</strong>
          <p>{question.explanation}</p>
          {!isReflection && !isCorrect && <button type="button" onClick={() => onAnswer("", true)}>Try again</button>}
        </div>
      )}
    </fieldset>
  );
}

export default function LearningLessonReader({ lesson, subject, subjectLessons, progress, onBack, onOpenLesson, onToggleFavorite, onSetCompletion, onSaveReviewAnswer, onNavigate }) {
  const titleRef = useRef(null);
  const completionGateRef = useRef(null);
  const [contentReached, setContentReached] = useState(false);
  const [answers, setAnswers] = useState({});
  const [completionAnnouncement, setCompletionAnnouncement] = useState("");
  const lessonIndex = subjectLessons.findIndex((item) => item.id === lesson?.id);
  const previous = lessonIndex > 0 ? subjectLessons[lessonIndex - 1] : null;
  const next = lessonIndex >= 0 && lessonIndex < subjectLessons.length - 1 ? subjectLessons[lessonIndex + 1] : null;
  const isFavorite = Boolean(lesson && progress.favoriteLessonIds.includes(lesson.id));
  const isComplete = Boolean(lesson && progress.completedLessonIds.includes(lesson.id));

  useEffect(() => {
    if (!lesson) return;
    setAnswers(progress.reviewAnswers[lesson.id] || {});
    setContentReached(false);
    setCompletionAnnouncement("");
    window.requestAnimationFrame(() => titleRef.current?.focus());
  }, [lesson?.id]);

  useEffect(() => {
    if (!completionGateRef.current || contentReached) return undefined;
    if (!("IntersectionObserver" in window)) {
      setContentReached(true);
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setContentReached(true);
    }, { threshold:0.15 });
    observer.observe(completionGateRef.current);
    return () => observer.disconnect();
  }, [contentReached, lesson?.id]);

  const answeredCount = useMemo(() => Object.values(answers).filter((value) => String(value || "").trim()).length, [answers]);

  if (!lesson) return <p className="js-learning__empty" role="status">This lesson could not be found.</p>;

  const answerQuestion = (questionId, value, persist) => {
    setAnswers((current) => ({ ...current, [questionId]:value }));
    if (persist) onSaveReviewAnswer(lesson.id, questionId, value);
    if (String(value || "").trim()) setContentReached(true);
  };

  const completeLesson = () => {
    onSetCompletion(lesson.id, true);
    setCompletionAnnouncement(`${lesson.title} marked complete. ${lesson.completionMessage}`);
  };

  return (
    <article className="js-learning-reader" aria-labelledby="learning-lesson-title">
      <nav className="js-learning-reader__breadcrumb" aria-label="Lesson breadcrumb">
        <button type="button" onClick={onBack}>Learning Center</button><span aria-hidden="true">›</span><button type="button" onClick={onBack}>{subject?.title || "Subject"}</button><span aria-hidden="true">›</span><span>{lesson.title}</span>
      </nav>
      <header className="js-learning-reader__header">
        <div>
          <p>Lesson {lessonIndex + 1} of {subjectLessons.length}</p>
          <h2 id="learning-lesson-title" ref={titleRef} tabIndex="-1">{lesson.title}</h2>
          <span>{lesson.subtitle}</span>
          <dl><div><dt>Reading time</dt><dd>{lesson.estimatedMinutes} minutes</dd></div><div><dt>Difficulty</dt><dd>{lesson.difficulty}</dd></div><div><dt>Review</dt><dd>{answeredCount}/3 answered</dd></div></dl>
        </div>
        <button className="js-learning-reader__favorite" type="button" aria-label={`${isFavorite ? "Remove" : "Add"} ${lesson.title} ${isFavorite ? "from" : "to"} favorites`} aria-pressed={isFavorite} onClick={() => onToggleFavorite(lesson.id)}>{isFavorite ? "♥ Favorite" : "♡ Add Favorite"}</button>
      </header>

      <aside className="js-learning-reader__buddy"><span aria-hidden="true">🐾</span><div><strong>Buddy says</strong><p>Let’s take a closer look at how this part of the garden works.</p></div></aside>
      <p className="js-learning-reader__introduction">{lesson.introduction}</p>

      <div className="js-learning-reader__sections">
        {lesson.sections.map((section, index) => (
          <section key={section.id} aria-labelledby={`${lesson.id}-${section.id}`}>
            <span className="js-learning-reader__section-number">{String(index + 1).padStart(2, "0")}</span>
            <h3 id={`${lesson.id}-${section.id}`}>{section.heading}</h3>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <aside className="js-learning-reader__key-points"><strong>Key points</strong><ul>{section.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul></aside>
          </section>
        ))}
      </div>

      <section className="js-learning-reader__activity" aria-labelledby={`${lesson.id}-activity`}>
        <div><span aria-hidden="true">✦</span><div><p>Garden activity</p><h3 id={`${lesson.id}-activity`}>{lesson.activity.title}</h3></div></div>
        <p>{lesson.activity.introduction}</p>
        <ul>{lesson.activity.promptItems.map((item) => <li key={item}>{item}</li>)}</ul>
        <aside><span aria-hidden="true">🐾</span><p>“I’ll wait here while you observe your garden zone.”</p></aside>
      </section>

      <section ref={completionGateRef} className="js-learning-reader__review" aria-labelledby={`${lesson.id}-review`}>
        <header><p>Gentle review</p><h3 id={`${lesson.id}-review`}>Gather what you noticed</h3><span>There is no perfect-score requirement. Explore, reconsider, and try again whenever you wish.</span></header>
        {lesson.reviewQuestions.map((question) => <ReviewQuestion key={question.id} question={question} value={answers[question.id] || ""} onAnswer={(value, persist) => answerQuestion(question.id, value, persist)} />)}
      </section>

      {lesson.relatedPages.length > 0 && (
        <nav className="js-learning-reader__related" aria-label="Related estate pages"><strong>Continue in the estate</strong><div>{lesson.relatedPages.map((link) => <button type="button" key={link.page} onClick={() => onNavigate?.(link.page)}>{link.label}</button>)}</div></nav>
      )}

      <section className="js-learning-reader__completion" aria-label="Lesson completion">
        <div><span aria-hidden="true">❦</span><div><strong>{isComplete ? "Lesson completed" : contentReached ? "Ready when you are" : "Continue through the lesson"}</strong><p>{isComplete ? lesson.completionMessage : "Completion marks this lesson only and updates its subject progress."}</p></div></div>
        <button type="button" disabled={!contentReached || isComplete} aria-describedby="learning-completion-state" onClick={completeLesson}>{isComplete ? "✓ Lesson Complete" : "Complete Lesson"}</button>
        <span id="learning-completion-state" className="js-learning__sr-only" aria-live="polite">{completionAnnouncement}</span>
        {isComplete && <details><summary>Lesson options</summary><button type="button" onClick={() => { onSetCompletion(lesson.id, false); setCompletionAnnouncement(`${lesson.title} marked incomplete.`); }}>Mark this lesson incomplete</button></details>}
      </section>

      <nav className="js-learning-reader__navigation" aria-label="Lesson navigation">
        <button type="button" disabled={!previous} onClick={() => previous && onOpenLesson(previous.id)}><span>Previous lesson</span><strong>{previous?.title || "Beginning of subject"}</strong></button>
        <button type="button" onClick={onBack}><span>Return to</span><strong>{subject?.title || "Subject"}</strong></button>
        <button type="button" disabled={!next} onClick={() => next && onOpenLesson(next.id)}><span>Next lesson</span><strong>{next?.title || "End of subject"}</strong></button>
      </nav>
    </article>
  );
}

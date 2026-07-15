import React from "react";

export default function LearningSubject({ subject, lessons, progress, onOpenLesson, onToggleFavorite }) {
  if (!subject) return <p className="js-learning__empty" role="status">This learning subject could not be found.</p>;
  const completed = new Set(progress.completedLessonIds);
  const favorites = new Set(progress.favoriteLessonIds);
  const completedCount = lessons.filter((lesson) => completed.has(lesson.id)).length;
  const percentage = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="js-learning__subject">
      <header className="js-learning__panel-heading">
        <div>
          <p>{subject.group}</p>
          <h2>{subject.title}</h2>
          <span>{subject.description}</span>
        </div>
        <strong>{completedCount} of {lessons.length} lessons complete</strong>
      </header>
      <div className="js-learning__progress">
        <div><span>Subject progress</span><strong>{percentage}%</strong></div>
        <progress value={completedCount} max={Math.max(1, lessons.length)} aria-label={`${subject.title}: ${completedCount} of ${lessons.length} lessons complete`} />
      </div>

      {lessons.length ? (
        <ol className="js-learning__lessons">
          {lessons.map((lesson, index) => {
            const isComplete = completed.has(lesson.id);
            const isFavorite = favorites.has(lesson.id);
            return (
              <li key={lesson.id}>
                <article className={`js-learning__lesson-card${isComplete ? " is-complete" : ""}`}>
                  <button className="js-learning__lesson-open" type="button" onClick={() => onOpenLesson(lesson.id)} aria-label={`Open lesson ${index + 1}: ${lesson.title}`}>
                    <span className="js-learning__lesson-number">Lesson {index + 1}</span>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.summary}</p>
                    <span className="js-learning__lesson-meta"><span>{lesson.estimatedMinutes} min</span><span>{lesson.difficulty}</span></span>
                  </button>
                  <footer>
                    <span className="js-learning__status">{isComplete ? "✓ Completed" : "Not completed"}</span>
                    <button type="button" aria-label={`${isFavorite ? "Remove" : "Add"} ${lesson.title} ${isFavorite ? "from" : "to"} favorites`} aria-pressed={isFavorite} onClick={() => onToggleFavorite(lesson.id)}>{isFavorite ? "♥ Saved" : "♡ Save"}</button>
                  </footer>
                </article>
              </li>
            );
          })}
        </ol>
      ) : <p className="js-learning__empty" role="status">No lessons are available in this subject yet.</p>}
    </div>
  );
}

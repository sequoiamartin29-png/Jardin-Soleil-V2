import React from "react";

export default function LearningSubject({ subject, lessons, progress, onOpenLesson, onBrowseSubjects }) {
  if (!subject) {
    return (
      <div className="js-learning__empty" role="status">
        <strong>Subject not found</strong>
        <p>This learning subject is not available. Return to Garden Foundations to keep learning.</p>
        <button type="button" onClick={onBrowseSubjects}>Browse Garden Foundations</button>
      </div>
    );
  }
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
                    <span className={`js-learning__status${isComplete ? " is-complete" : ""}`}>{isComplete ? "✓ Completed" : "Not completed"}</span>
                    <span className={`js-learning__status${isFavorite ? " is-favorite" : ""}`}>{isFavorite ? "♥ Favorite" : "Not a favorite"}</span>
                  </footer>
                </article>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="js-learning__empty" role="status">
          <strong>No lessons found</strong>
          <p>This subject does not have any available lessons. Choose another subject to continue learning.</p>
          <button type="button" onClick={onBrowseSubjects}>Browse Garden Foundations</button>
        </div>
      )}
    </div>
  );
}

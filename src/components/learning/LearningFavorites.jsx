import React from "react";
import { getLearningSubject } from "../../data/learningCenterLessons";

export default function LearningFavorites({ lessons, progress, onOpenLesson }) {
  const completed = new Set(progress.completedLessonIds);
  const favoriteLessons = lessons.filter((lesson) => progress.favoriteLessonIds.includes(lesson.id));

  return (
    <section className="js-learning__favorites" aria-labelledby="learning-favorites-title">
      <header className="js-learning__panel-heading">
        <div><p>Your saved library</p><h2 id="learning-favorites-title">Favorite Lessons</h2><span>Return to botanical studies you would like to revisit.</span></div>
        <strong>{favoriteLessons.length} saved</strong>
      </header>
      {favoriteLessons.length ? (
        <ul>
          {favoriteLessons.map((lesson) => (
            <li key={lesson.id}>
              <div><span>{getLearningSubject(lesson.subjectId)?.title || "Learning Center"}</span><h3>{lesson.title}</h3><p>{lesson.estimatedMinutes} min · {lesson.difficulty} · {completed.has(lesson.id) ? "Completed" : "Not completed"}</p></div>
              <button type="button" onClick={() => onOpenLesson(lesson.id, lesson.subjectId)}>Open Lesson</button>
            </li>
          ))}
        </ul>
      ) : <p className="js-learning__empty">You haven’t saved any lessons yet. Select the heart on a lesson you’d like to revisit.</p>}
    </section>
  );
}

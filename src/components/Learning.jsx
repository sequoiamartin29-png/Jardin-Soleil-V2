import React, { useMemo, useState } from "react";
import BotanicalIcon from "./icons/BotanicalIcon";
import {
  getLearningLesson,
  getLearningSubject,
  getLessonsForSubject,
  learningCenterLessons,
  learningCenterSubjects,
} from "../data/learningCenterLessons";
import {
  readLearningProgress,
  saveLearningReviewAnswer,
  setLearningCompletion,
  toggleLearningFavorite,
  updateLearningProgress,
} from "../utils/learningCenterProgress";
import LearningSubject from "./learning/LearningSubject";
import LearningFavorites from "./learning/LearningFavorites";
import LearningLessonReader from "./learning/LearningLessonReader";
import "./Learning.css";

const subjectIcons = { sun:"☀", plant:"🌿", apple:"🍎", herb:"❦", vegetable:"🥕", book:"📖" };

export default function Learning({ onNavigate }) {
  const [progress, setProgress] = useState(() => readLearningProgress());
  const initialLesson = getLearningLesson(progress.lastLessonId);
  const [activeSubjectId, setActiveSubjectId] = useState(initialLesson?.subjectId || "garden-foundations");
  const [lessonContextSubjectId, setLessonContextSubjectId] = useState(initialLesson?.subjectId || "garden-foundations");
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [view, setView] = useState("library");

  const activeSubject = getLearningSubject(activeSubjectId);
  const activeLessons = useMemo(() => getLessonsForSubject(activeSubjectId), [activeSubjectId]);
  const selectedLesson = getLearningLesson(selectedLessonId);
  const lessonSubject = getLearningSubject(lessonContextSubjectId) || getLearningSubject(selectedLesson?.subjectId);
  const lessonSequence = useMemo(() => getLessonsForSubject(lessonSubject?.id), [lessonSubject?.id]);
  const lastLesson = getLearningLesson(progress.lastLessonId);

  const chooseSubject = (subjectId) => {
    setActiveSubjectId(subjectId);
    setSelectedLessonId(null);
    setView("library");
  };

  const openLesson = (lessonId, contextSubjectId = null) => {
    const lesson = getLearningLesson(lessonId);
    setSelectedLessonId(lessonId);
    setLessonContextSubjectId(contextSubjectId || lesson?.subjectId || activeSubjectId);
    setView("lesson");
    if (lesson) setProgress((current) => updateLearningProgress(current, { lastLessonId:lesson.id }));
  };

  const toggleFavorite = (lessonId) => setProgress((current) => toggleLearningFavorite(current, lessonId));
  const setCompletion = (lessonId, complete) => setProgress((current) => setLearningCompletion(current, lessonId, complete));
  const saveReview = (lessonId, questionId, answer) => setProgress((current) => saveLearningReviewAnswer(current, lessonId, questionId, answer));

  const showLibrary = () => {
    setSelectedLessonId(null);
    setView("library");
  };

  return (
    <section className="js-learning" aria-labelledby="learning-title">
      <header className="js-learning__hero">
        <div>
          <p>Jardin Soleil · Botanical Education</p>
          <h1 id="learning-title">Learning Center</h1>
          <span>Grow practical horticultural knowledge alongside the estate.</span>
        </div>
        <div className="js-learning__hero-actions">
          <button type="button" aria-current={view === "library" ? "page" : undefined} onClick={showLibrary}>Lesson Library</button>
          <button type="button" aria-current={view === "favorites" ? "page" : undefined} onClick={() => { setSelectedLessonId(null); setView("favorites"); }}>Favorites <span>{progress.favoriteLessonIds.length}</span></button>
        </div>
        {lastLesson && view !== "lesson" && (
          <button className="js-learning__continue" type="button" onClick={() => openLesson(lastLesson.id, lastLesson.subjectId)}>
            <span>Continue learning</span><strong>{lastLesson.title}</strong><small>{lastLesson.estimatedMinutes} min · {progress.completedLessonIds.includes(lastLesson.id) ? "Completed" : "In progress"}</small>
          </button>
        )}
      </header>

      {view === "lesson" ? (
        <LearningLessonReader
          lesson={selectedLesson}
          subject={lessonSubject}
          subjectLessons={lessonSequence}
          progress={progress}
          onBack={() => { setActiveSubjectId(lessonSubject?.id || "garden-foundations"); showLibrary(); }}
          onOpenLesson={(lessonId) => openLesson(lessonId, lessonSubject?.id)}
          onToggleFavorite={toggleFavorite}
          onSetCompletion={setCompletion}
          onSaveReviewAnswer={saveReview}
          onNavigate={onNavigate}
        />
      ) : (
        <>
          <div className="js-learning__layout">
            <nav className="js-learning__sections" aria-label="Botanical learning subjects">
              <h2>Botanical Learning</h2>
              {learningCenterSubjects.map((subject, index) => (
                <React.Fragment key={subject.id}>
                  {(index === 0 || learningCenterSubjects[index - 1].group !== subject.group) && <p>{subject.group}</p>}
                  <button type="button" aria-current={view === "library" && activeSubjectId === subject.id ? "page" : undefined} onClick={() => chooseSubject(subject.id)}>
                    <span aria-hidden="true">{subjectIcons[subject.icon] || "❦"}</span>{subject.title}
                  </button>
                </React.Fragment>
              ))}
              <button className="js-learning__favorites-tab" type="button" aria-current={view === "favorites" ? "page" : undefined} onClick={() => setView("favorites")}><span aria-hidden="true">♡</span>Favorites</button>
            </nav>

            <div className="js-learning__panel" id="learning-section-panel">
              {view === "favorites" ? (
                <LearningFavorites lessons={learningCenterLessons} progress={progress} onOpenLesson={(lessonId) => openLesson(lessonId, getLearningLesson(lessonId)?.subjectId)} />
              ) : (
                <LearningSubject subject={activeSubject} lessons={activeLessons} progress={progress} onOpenLesson={(lessonId) => openLesson(lessonId, activeSubjectId)} onToggleFavorite={toggleFavorite} />
              )}
            </div>
          </div>

          <section className="js-learning__feature js-learning__feature--tea" aria-labelledby="tea-feature-title">
            <BotanicalIcon type="tea" size="xl" decorative />
            <div><p>Dedicated collection</p><h2 id="tea-feature-title">Tea Apothecary</h2><span>Explore blend libraries, herbal ingredients, seasonal recipes, and the journey from garden to cup.</span></div>
            <button type="button" onClick={() => onNavigate?.("Tea Apothecary")}>Enter Tea Apothecary</button>
          </section>

          <section className="js-learning__games" aria-labelledby="games-title">
            <div className="js-learning__section-title"><p>Interactive study</p><h2 id="games-title">Botanical Games</h2></div>
            <div>
              <article><span aria-hidden="true">🔎</span><h3>Word Search</h3><p>Play verified horticulture word-search puzzles at four difficulty levels.</p><button type="button" onClick={() => onNavigate?.("Word Search")}>Play Word Search</button></article>
              <article><span aria-hidden="true">🌿</span><h3>Garden Match</h3><p>Pair collectible botanical cards from the orchard, gardens, and estate journal.</p><button type="button" onClick={() => onNavigate?.("Garden Match")}>Play Garden Match</button></article>
              <article><span aria-hidden="true">🏆</span><h3>Garden Challenges</h3><p>Complete daily and seasonal gardening challenges.</p><button type="button" onClick={() => onNavigate?.("Garden Challenges")}>Open Challenges</button></article>
            </div>
          </section>
        </>
      )}
    </section>
  );
}

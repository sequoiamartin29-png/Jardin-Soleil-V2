import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dataSource = await readFile(new URL("src/data/learningCenterLessons.js", root), "utf8");
const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(dataSource)}`;
const data = await import(dataUrl);

const progressSource = await readFile(new URL("src/utils/learningCenterProgress.js", root), "utf8");
const loadableProgressSource = progressSource.replace(
  '"../data/learningCenterLessons.js"',
  JSON.stringify(dataUrl),
);
const progress = await import(`data:text/javascript;charset=utf-8,${encodeURIComponent(loadableProgressSource)}`);
const subjectSource = await readFile(new URL("src/components/learning/LearningSubject.jsx", root), "utf8");
const favoritesSource = await readFile(new URL("src/components/learning/LearningFavorites.jsx", root), "utf8");
const readerSource = await readFile(new URL("src/components/learning/LearningLessonReader.jsx", root), "utf8");

const expectedSubjects = {
  "garden-foundations":[
    "Understanding Your Garden",
    "Sunlight and Garden Exposure",
    "Soil Basics",
    "Watering with Intention",
    "Seasonal Garden Planning",
  ],
  "plant-knowledge":[
    "Reading a Plant Profile",
    "Botanical Names Made Simple",
    "Plant Families and Relationships",
    "Recognizing Leaves, Flowers, and Growth Habits",
    "Safe Plant Identification",
  ],
};

assert.equal(data.learningCenterLessons.length, 10, "The Learning Center should contain ten canonical lessons.");
assert.equal(
  new Set(data.learningCenterLessons.map((lesson) => lesson.id)).size,
  data.learningCenterLessons.length,
  "Lesson IDs must be unique.",
);

for (const [subjectId, titles] of Object.entries(expectedSubjects)) {
  const subject = data.getLearningSubject(subjectId);
  const lessons = data.getLessonsForSubject(subjectId);
  assert.ok(subject, `Missing subject: ${subjectId}`);
  assert.ok(subject.title && subject.description, `${subjectId} needs a title and description.`);
  assert.deepEqual(lessons.map((lesson) => lesson.title), titles, `${subject.title} lesson order is incorrect.`);
}

for (const lesson of data.learningCenterLessons) {
  assert.ok(data.getLearningSubject(lesson.subjectId), `${lesson.title} references an invalid subject.`);
  assert.ok(lesson.title && lesson.introduction, `${lesson.id} needs a title and introduction.`);
  assert.ok(Number(lesson.estimatedMinutes) > 0, `${lesson.title} needs an estimated reading time.`);
  assert.ok(lesson.difficulty, `${lesson.title} needs a difficulty.`);
  assert.ok(lesson.sections.length >= 3, `${lesson.title} needs at least three instructional sections.`);
  lesson.sections.forEach((section) => {
    assert.ok(section.heading && section.paragraphs.length, `${lesson.title} contains an empty section.`);
    assert.ok(section.keyPoints.length, `${lesson.title} contains a section without key points.`);
  });
  assert.ok(lesson.activity?.title && lesson.activity?.promptItems?.length, `${lesson.title} needs an activity.`);
  assert.equal(lesson.reviewQuestions.length, 3, `${lesson.title} needs exactly three review questions.`);
}

assert.ok(subjectSource.includes("Subject not found"), "The subject view needs an invalid-subject state.");
assert.ok(subjectSource.includes("No lessons found"), "The subject view needs a no-lessons state.");
assert.ok(favoritesSource.includes("No favorite lessons yet"), "The Favorites view needs an empty state.");
assert.ok(readerSource.includes("Lesson not found"), "The reader needs an invalid-lesson state.");
assert.ok(!subjectSource.includes("onToggleFavorite"), "Favorite actions should not render before a valid lesson is open.");
assert.ok(
  readerSource.indexOf("if (!lesson)") < readerSource.indexOf("js-learning-reader__favorite"),
  "The invalid-lesson guard must run before lesson controls render.",
);

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }
}

const storage = new MemoryStorage();
const firstLessonId = data.learningCenterLessons[0].id;
const secondLessonId = data.learningCenterLessons[1].id;
let savedProgress = progress.readLearningProgress(storage);

savedProgress = progress.toggleLearningFavorite(savedProgress, firstLessonId, storage);
savedProgress = progress.setLearningCompletion(savedProgress, secondLessonId, true, storage);
savedProgress = progress.saveLearningReviewAnswer(
  savedProgress,
  firstLessonId,
  data.learningCenterLessons[0].reviewQuestions[0].id,
  data.learningCenterLessons[0].reviewQuestions[0].answer,
  storage,
);

const reloadedProgress = progress.readLearningProgress(storage);
assert.deepEqual(reloadedProgress.favoriteLessonIds, [firstLessonId], "Favorite state should affect only the current lesson.");
assert.deepEqual(reloadedProgress.completedLessonIds, [secondLessonId], "Completion state should affect only the current lesson.");
assert.equal(
  reloadedProgress.reviewAnswers[firstLessonId][data.learningCenterLessons[0].reviewQuestions[0].id],
  data.learningCenterLessons[0].reviewQuestions[0].answer,
  "Review answers should persist.",
);
assert.ok(storage.getItem(progress.LEARNING_CENTER_PROGRESS_KEY), "Learning progress should be written to its persistence key.");

console.log("Learning Center verification passed: 2 subjects, 10 lessons, complete lesson content, and persistent per-lesson progress.");

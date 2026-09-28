import { LessonPlan, TestQuiz, LearningMaterial } from '../types';

const STORAGE_KEYS = {
  LESSON: 'teachercopilot_last_lesson_v1',
  TEST: 'teachercopilot_last_test_v1',
  MATERIAL: 'teachercopilot_last_material_v1',
  ACTIVE_TAB: 'teachercopilot_active_tab',
};

export function saveLastLesson(lesson: LessonPlan | null) {
  try {
    if (lesson) {
      localStorage.setItem(STORAGE_KEYS.LESSON, JSON.stringify(lesson));
    } else {
      localStorage.removeItem(STORAGE_KEYS.LESSON);
    }
  } catch (e) {
    console.warn('LocalStorage save error', e);
  }
}

export function loadLastLesson(): LessonPlan | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LESSON);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveLastTest(test: TestQuiz | null) {
  try {
    if (test) {
      localStorage.setItem(STORAGE_KEYS.TEST, JSON.stringify(test));
    } else {
      localStorage.removeItem(STORAGE_KEYS.TEST);
    }
  } catch (e) {
    console.warn('LocalStorage save error', e);
  }
}

export function loadLastTest(): TestQuiz | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEST);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveLastMaterial(material: LearningMaterial | null) {
  try {
    if (material) {
      localStorage.setItem(STORAGE_KEYS.MATERIAL, JSON.stringify(material));
    } else {
      localStorage.removeItem(STORAGE_KEYS.MATERIAL);
    }
  } catch (e) {
    console.warn('LocalStorage save error', e);
  }
}

export function loadLastMaterial(): LearningMaterial | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MATERIAL);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

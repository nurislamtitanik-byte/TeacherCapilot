export type LessonStage = {
  time: string;
  title: string;
  teacherActivity: string;
  studentActivity: string;
  materials: string;
};

export type LessonExercise = {
  title: string;
  instruction: string;
  content: string;
};

export type LessonPlan = {
  title: string;
  subject: string;
  grade: string;
  topic: string;
  duration: string;
  level: string;
  objective: string;
  expectedResults: string[];
  materials: string[];
  stages: LessonStage[];
  explanation: string;
  exercises: LessonExercise[];
  assessment: string;
  homework: string;
  createdAt?: string;
};

export type TestQuestion = {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
};

export type TestQuiz = {
  subject: string;
  grade: string;
  topic: string;
  level: string;
  testType: string;
  questions: TestQuestion[];
  createdAt?: string;
};

export type MaterialExample = {
  title: string;
  example: string;
  note?: string;
};

export type MaterialExercise = {
  task: string;
  solution?: string;
};

export type LearningMaterial = {
  subject: string;
  grade: string;
  topic: string;
  level: string;
  materialType: string;
  explanation: string;
  examples: MaterialExample[];
  exercises: MaterialExercise[];
  importantPoints: string[];
  reinforcement: string;
  homework: string;
  createdAt?: string;
};

export type GenerateRequest =
  | {
      type: 'lesson';
      subject: string;
      grade: string;
      topic: string;
      duration: string;
      level: string;
      additionalRequirements?: string;
    }
  | {
      type: 'test';
      subject: string;
      grade: string;
      topic: string;
      questionCount: number;
      level: string;
      testType: string;
    }
  | {
      type: 'material';
      subject: string;
      grade: string;
      topic: string;
      level: string;
      materialType: string;
    }
  | {
      type: 'regenerate_section';
      subject: string;
      grade: string;
      topic: string;
      level: string;
      materialType: string;
      section: 'explanation' | 'examples' | 'exercises' | 'importantPoints' | 'reinforcement' | 'homework';
    };

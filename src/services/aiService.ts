import { LessonPlan, TestQuiz, LearningMaterial, GenerateRequest } from '../types';

export class AiServiceError extends Error {
  isConfigError: boolean;
  constructor(message: string, isConfigError = false) {
    super(message);
    this.name = 'AiServiceError';
    this.isConfigError = isConfigError;
  }
}

async function sendAiRequest<T>(payload: GenerateRequest): Promise<T> {
  let response: Response;
  try {
    response = await fetch('/.netlify/functions/ai-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AiServiceError('AI bilan bog‘lanishda xatolik yuz berdi. Iltimos, internet aloqasini tekshirib qayta urinib ko‘ring.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || !data) {
    const errorMsg = data?.error || 'AI bilan bog‘lanishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.';
    const isConfig = response.status === 503 || errorMsg.includes('GROQ_API_KEY') || errorMsg.includes('sozlanmagan');
    throw new AiServiceError(errorMsg, isConfig);
  }

  return data as T;
}

export async function generateLessonPlan(params: {
  subject: string;
  grade: string;
  topic: string;
  duration: string;
  level: string;
  additionalRequirements?: string;
}): Promise<LessonPlan> {
  const result = await sendAiRequest<LessonPlan>({
    type: 'lesson',
    ...params,
  });

  return {
    ...result,
    subject: params.subject,
    grade: params.grade,
    topic: params.topic,
    duration: params.duration,
    level: params.level,
    createdAt: new Date().toISOString(),
  };
}

export async function generateTestQuiz(params: {
  subject: string;
  grade: string;
  topic: string;
  questionCount: number;
  level: string;
  testType: string;
}): Promise<TestQuiz> {
  const result = await sendAiRequest<{ questions: any[] }>({
    type: 'test',
    ...params,
  });

  const formattedQuestions = (result.questions || []).map((q, idx) => ({
    id: q.id || `q_${Date.now()}_${idx}`,
    question: q.question || '',
    options: {
      A: q.options?.A || '',
      B: q.options?.B || '',
      C: q.options?.C || '',
      D: q.options?.D || '',
    },
    correctAnswer: (['A', 'B', 'C', 'D'].includes(q.correctAnswer) ? q.correctAnswer : 'A') as 'A' | 'B' | 'C' | 'D',
    explanation: q.explanation || '',
  }));

  return {
    subject: params.subject,
    grade: params.grade,
    topic: params.topic,
    level: params.level,
    testType: params.testType,
    questions: formattedQuestions,
    createdAt: new Date().toISOString(),
  };
}

export async function generateMaterial(params: {
  subject: string;
  grade: string;
  topic: string;
  level: string;
  materialType: string;
}): Promise<LearningMaterial> {
  const result = await sendAiRequest<LearningMaterial>({
    type: 'material',
    ...params,
  });

  return {
    ...result,
    subject: params.subject,
    grade: params.grade,
    topic: params.topic,
    level: params.level,
    materialType: params.materialType,
    createdAt: new Date().toISOString(),
  };
}

export async function regenerateSection(params: {
  subject: string;
  grade: string;
  topic: string;
  level: string;
  materialType: string;
  section: 'explanation' | 'examples' | 'exercises' | 'importantPoints' | 'reinforcement' | 'homework';
}): Promise<any> {
  const result = await sendAiRequest<{ section: string; content: any }>({
    type: 'regenerate_section',
    ...params,
  });
  return result.content;
}

import { useState, useEffect } from 'react';
import {
  ClipboardList,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  FileDown,
  Printer,
  Plus,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Eye,
  EyeOff,
  SlidersHorizontal,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';
import { TestQuiz, TestQuestion } from '../types';
import { generateTestQuiz, AiServiceError } from '../services/aiService';
import { saveLastTest, loadLastTest } from '../utils/storage';
import { downloadTestPdf } from '../utils/pdfGenerator';
import { AiLoadingState } from './AiLoadingState';
import {
  SUBJECT_OPTIONS,
  GRADES,
  LEVELS,
  TEST_COUNTS,
  TEST_TYPES,
  SUBJECT_TOPIC_SUGGESTIONS,
} from '../constants';

interface TestQuizViewProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function TestQuizView({ onShowToast }: TestQuizViewProps) {
  // Form states
  const [selectedSubject, setSelectedSubject] = useState('Ingliz tili');
  const [customSubject, setCustomSubject] = useState('');
  const [grade, setGrade] = useState('7-sinf');
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [level, setLevel] = useState('O‘rta');
  const [testType, setTestType] = useState('Multiple Choice');

  // Test data & states
  const [quiz, setQuiz] = useState<TestQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Export & View options: 'questions_only' vs 'with_answers'
  const [exportMode, setExportMode] = useState<'questions_only' | 'with_answers'>('questions_only');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadLastTest();
    if (saved) {
      setQuiz(saved);
      if (saved.subject) {
        if (SUBJECT_OPTIONS.includes(saved.subject)) {
          setSelectedSubject(saved.subject);
        } else {
          setSelectedSubject('Boshqa fan...');
          setCustomSubject(saved.subject);
        }
      }
      if (saved.grade) setGrade(saved.grade);
      if (saved.topic) setTopic(saved.topic);
      if (saved.level) setLevel(saved.level);
      if (saved.testType) setTestType(saved.testType);
      if (saved.questions?.length) setQuestionCount(saved.questions.length);
    }
  }, []);

  const effectiveSubject = selectedSubject === 'Boshqa fan...' ? customSubject.trim() || 'Umumiy fan' : selectedSubject;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      onShowToast('Iltimos, test mavzusini kiriting.', 'error');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await generateTestQuiz({
        subject: effectiveSubject,
        grade,
        topic: topic.trim(),
        questionCount,
        level,
        testType,
      });

      setQuiz(result);
      saveLastTest(result);
      onShowToast(`${result.questions.length} ta test savoli tayyorlandi`, 'success');
    } catch (err: any) {
      const msg = err instanceof AiServiceError ? err.message : 'AI bilan bog‘lanishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.';
      setErrorMsg(msg);
      onShowToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit question helpers
  const handleUpdateQuestionText = (index: number, text: string) => {
    if (!quiz) return;
    const updated = [...quiz.questions];
    updated[index].question = text;
    const newQuiz = { ...quiz, questions: updated };
    setQuiz(newQuiz);
    saveLastTest(newQuiz);
  };

  const handleUpdateOption = (index: number, optionKey: 'A' | 'B' | 'C' | 'D', value: string) => {
    if (!quiz) return;
    const updated = [...quiz.questions];
    updated[index].options[optionKey] = value;
    const newQuiz = { ...quiz, questions: updated };
    setQuiz(newQuiz);
    saveLastTest(newQuiz);
  };

  const handleUpdateCorrectAnswer = (index: number, answer: 'A' | 'B' | 'C' | 'D') => {
    if (!quiz) return;
    const updated = [...quiz.questions];
    updated[index].correctAnswer = answer;
    const newQuiz = { ...quiz, questions: updated };
    setQuiz(newQuiz);
    saveLastTest(newQuiz);
    onShowToast(`To‘g‘ri javob o‘zgartirildi: ${answer}`, 'info');
  };

  const handleDeleteQuestion = (index: number) => {
    if (!quiz) return;
    if (quiz.questions.length <= 1) {
      onShowToast('Kamida 1 ta savol qolishi kerak.', 'error');
      return;
    }
    const updated = quiz.questions.filter((_, idx) => idx !== index);
    const newQuiz = { ...quiz, questions: updated };
    setQuiz(newQuiz);
    saveLastTest(newQuiz);
    onShowToast('Savol o‘chirildi', 'info');
  };

  const handleAddQuestion = () => {
    if (!quiz) return;
    const newQ: TestQuestion = {
      id: `q_${Date.now()}`,
      question: 'Yangi savol matnini bu yerga yozing...',
      options: {
        A: 'Variant A',
        B: 'Variant B',
        C: 'Variant C',
        D: 'Variant D',
      },
      correctAnswer: 'A',
      explanation: 'Ushbu savol uchun izoh',
    };
    const newQuiz = { ...quiz, questions: [...quiz.questions, newQ] };
    setQuiz(newQuiz);
    saveLastTest(newQuiz);
    onShowToast('Yangi savol qo‘shildi', 'success');
  };

  const handleCopy = async () => {
    if (!quiz) return;

    const includeAns = exportMode === 'with_answers';

    let text = `=== TEACHERCOPILOT UZ: NAZORAT TESTI ===\nFAN: ${quiz.subject}\nSINF: ${quiz.grade}\nMAVZU: ${quiz.topic}\nDARAJA: ${quiz.level}\nSAVOLLAR SONI: ${quiz.questions.length}\n\n`;

    quiz.questions.forEach((q, i) => {
      text += `${i + 1}. ${q.question}\n`;
      text += `A) ${q.options.A}\n`;
      text += `B) ${q.options.B}\n`;
      text += `C) ${q.options.C}\n`;
      text += `D) ${q.options.D}\n`;
      if (includeAns) {
        text += `To‘g‘ri javob: ${q.correctAnswer}\n`;
        if (q.explanation) text += `Izoh: ${q.explanation}\n`;
      }
      text += '\n';
    });

    if (includeAns) {
      text += `\n--- JAVOBLAR KALITI ---\n`;
      text += quiz.questions.map((q, i) => `${i + 1}-${q.correctAnswer}`).join(', ');
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      onShowToast('Nusxalandi', 'success');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      onShowToast('Nusxalashda xatolik yuz berdi.', 'error');
    }
  };

  const handleDownloadPdf = () => {
    if (!quiz) return;
    try {
      downloadTestPdf(quiz, { includeAnswers: exportMode === 'with_answers' });
      onShowToast('Test PDF muvaffaqiyatli yuklab olindi.', 'success');
    } catch (e) {
      console.error(e);
      onShowToast('PDF yaratishda xatolik bo‘ldi.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const topicSuggestions = SUBJECT_TOPIC_SUGGESTIONS[selectedSubject] || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Test yaratish
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Avtomatik test savollari, javob variantlari va tayyor PDF varaqlar
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Test parametrlarini belgilang</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Turli qiyinlik darajalari</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Fan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Fan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none appearance-none cursor-pointer"
              >
                {SUBJECT_OPTIONS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {selectedSubject === 'Boshqa fan...' && (
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Fan nomini yozing..."
                className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            )}
          </div>

          {/* Sinf */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sinf <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none appearance-none cursor-pointer"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Testlar soni */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Testlar soni
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {TEST_COUNTS.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    questionCount === cnt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mavzu */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>
              Mavzu <span className="text-rose-500">*</span>
            </span>
            {topicSuggestions.length > 0 && (
              <span className="text-[11px] font-normal text-slate-400">
                Namunaviy takliflar:
              </span>
            )}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Masalan: Present Simple, Kvadrat tenglamalar, Birlashgan Millatlar Tashkiloti..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
          />

          {topicSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topicSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setTopic(sug)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-xs text-slate-600 transition-colors cursor-pointer border border-slate-200/70"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Daraja & Test turi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daraja
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    level === lvl
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Test turi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {TEST_TYPES.map((tType) => (
                <button
                  key={tType}
                  type="button"
                  onClick={() => setTestType(tType)}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    testType === tType
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tType}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Test yaratish</span>
          </button>
        </div>
      </div>

      {/* Loading state experience */}
      {isLoading && (
        <AiLoadingState
          title="AI test savollarini yaratmoqda..."
          steps={[
            `${questionCount} ta savol va variantlar tuzilmoqda`,
            'Takroriy savollar tekshirilmoqda',
            'To‘g‘ri javoblar kaliti shakllantirilmoqda',
          ]}
        />
      )}

      {/* Error */}
      {errorMsg && !isLoading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-900 space-y-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            <h4 className="font-bold text-sm sm:text-base">{errorMsg}</h4>
          </div>
          <div>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Qayta urinish
            </button>
          </div>
        </div>
      )}

      {/* Test Editor & Output */}
      {quiz && !isLoading && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
          {/* Action Toolbar */}
          <div className="bg-slate-50/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-md">
                {quiz.subject} • {quiz.grade}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {quiz.topic} ({quiz.questions.length} ta savol)
              </h2>
            </div>

            {/* Mode selection: Test only vs Test + answers */}
            <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setExportMode('questions_only')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  exportMode === 'questions_only'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Test (Faqat savollar)</span>
              </button>
              <button
                type="button"
                onClick={() => setExportMode('with_answers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  exportMode === 'with_answers'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Test + javoblar</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Savol qo‘shish</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-blue-700 font-bold">Nusxalandi</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Nusxalash</span>
                  </>
                )}
              </button>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Qayta yaratish"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Qayta yaratish</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>PDF yuklab olish</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Chop etish</span>
              </button>
            </div>
          </div>

          {/* Test Questions Editor List */}
          <div className="p-6 sm:p-8 space-y-6">
            {quiz.questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-4"
              >
                {/* Question title & Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-xs shrink-0 mt-1">
                      {idx + 1}
                    </span>
                    <div className="flex-1 space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Savol matni (tahrirlash mumkin):
                      </label>
                      <textarea
                        rows={2}
                        value={q.question}
                        onChange={(e) => handleUpdateQuestionText(idx, e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(idx)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Savolni o‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 4 Options: A, B, C, D */}
                <div className="space-y-2 pt-1 pl-10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Variantlar (To‘g‘ri javobni tanlash uchun harf ustiga bosing):
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const isCorrect = q.correctAnswer === optKey;
                      const showHighlight = exportMode === 'with_answers' && isCorrect;

                      return (
                        <div
                          key={optKey}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                            showHighlight
                              ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleUpdateCorrectAnswer(idx, optKey)}
                            className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                              isCorrect
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                            title="To‘g‘ri javob sifatida belgilash"
                          >
                            {optKey}
                          </button>

                          <input
                            type="text"
                            value={q.options[optKey]}
                            onChange={(e) => handleUpdateOption(idx, optKey, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs sm:text-sm text-slate-800 bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded focus:bg-white focus:outline-none"
                          />

                          {isCorrect && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded shrink-0">
                              To‘g‘ri
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="pl-10 pt-1">
                    <div className="text-xs text-slate-600 bg-white/80 p-3 rounded-xl border border-slate-200/60 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800">Izoh: </span>
                        <span>{q.explanation}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Bottom Add Question Button */}
            <div className="pt-2 text-center">
              <button
                onClick={handleAddQuestion}
                className="px-6 py-3 rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 text-blue-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi savol qo‘shish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

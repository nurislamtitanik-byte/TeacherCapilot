import { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  FileDown,
  Printer,
  Pencil,
  Save,
  AlertTriangle,
  Clock,
  Target,
  GraduationCap,
  ChevronDown,
  Plus,
  Trash2,
  FileText,
  ListOrdered,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { LessonPlan, LessonStage, LessonExercise } from '../types';
import { generateLessonPlan, AiServiceError } from '../services/aiService';
import { saveLastLesson, loadLastLesson } from '../utils/storage';
import { downloadLessonPlanPdf } from '../utils/pdfGenerator';
import { AiLoadingState } from './AiLoadingState';
import {
  SUBJECT_OPTIONS,
  GRADES,
  DURATIONS,
  LEVELS,
  SUBJECT_TOPIC_SUGGESTIONS,
} from '../constants';

interface LessonPlanViewProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function LessonPlanView({ onShowToast }: LessonPlanViewProps) {
  // Form states
  const [selectedSubject, setSelectedSubject] = useState('Ingliz tili');
  const [customSubject, setCustomSubject] = useState('');
  const [grade, setGrade] = useState('7-sinf');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('45 daqiqa');
  const [level, setLevel] = useState('O‘rta');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  // Results & status states
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable draft state when in edit mode
  const [editDraft, setEditDraft] = useState<LessonPlan | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadLastLesson();
    if (saved) {
      setLessonPlan(saved);
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
      if (saved.duration) setDuration(saved.duration);
      if (saved.level) setLevel(saved.level);
    }
  }, []);

  const effectiveSubject = selectedSubject === 'Boshqa fan...' ? customSubject.trim() || 'Umumiy fan' : selectedSubject;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      onShowToast('Iltimos, dars mavzusini kiriting.', 'error');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setIsEditing(false);

    try {
      const result = await generateLessonPlan({
        subject: effectiveSubject,
        grade,
        topic: topic.trim(),
        duration,
        level,
        additionalRequirements: additionalRequirements.trim(),
      });

      setLessonPlan(result);
      setEditDraft(result);
      saveLastLesson(result);
      onShowToast('Dars rejasi muvaffaqiyatli yaratildi', 'success');
    } catch (err: any) {
      const msg = err instanceof AiServiceError ? err.message : 'AI bilan bog‘lanishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.';
      setErrorMsg(msg);
      onShowToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!lessonPlan) return;

    const stagesText = (lessonPlan.stages || [])
      .map(
        (s, i) =>
          `[${s.time}] ${i + 1}-bosqich: ${s.title}\n- O'qituvchi faoliyati: ${s.teacherActivity}\n- O'quvchi faoliyati: ${s.studentActivity}\n- Vositalar: ${s.materials}`
      )
      .join('\n\n');

    const exercisesText = (lessonPlan.exercises || [])
      .map((ex, i) => `${i + 1}. ${ex.title}\nKo'rsatma: ${ex.instruction}\nTopshiriq: ${ex.content}`)
      .join('\n\n');

    const fullText = `=== TEACHERCOPILOT UZ: DARS ISHLANMASI ===
FAN: ${lessonPlan.subject}
SINF: ${lessonPlan.grade}
MAVZU: ${lessonPlan.title || lessonPlan.topic}
DAVOMIYLIGI: ${lessonPlan.duration}
DARAJA: ${lessonPlan.level}

1. DARSNING MAQSADI:
${lessonPlan.objective}

2. KUTILAYOTGAN NATIJALAR:
${(lessonPlan.expectedResults || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}

3. KERAKLI JIHOZLAR:
${(lessonPlan.materials || []).join(', ')}

4. DARS BOSQICHLARI:
${stagesText}

5. MAVZUNI TUSHUNTIRISH:
${lessonPlan.explanation}

6. AMALIY MASHQLAR:
${exercisesText}

7. BAHOLASH:
${lessonPlan.assessment}

8. UYGA VAZIFA:
${lessonPlan.homework}
`;

    try {
      await navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      onShowToast('Nusxalandi', 'success');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      onShowToast('Matnni nusxalashda xatolik bo‘ldi.', 'error');
    }
  };

  const handleDownloadPdf = () => {
    if (!lessonPlan) return;
    try {
      downloadLessonPlanPdf(lessonPlan);
      onShowToast('PDF muvaffaqiyatli yuklab olindi.', 'success');
    } catch (e) {
      console.error(e);
      onShowToast('PDF yaratishda xatolik yuz berdi.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStartEdit = () => {
    if (!lessonPlan) return;
    setEditDraft(JSON.parse(JSON.stringify(lessonPlan)));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editDraft) return;
    setLessonPlan(editDraft);
    saveLastLesson(editDraft);
    setIsEditing(false);
    onShowToast('O‘zgarishlar saqlandi', 'success');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditDraft(lessonPlan);
  };

  const topicSuggestions = SUBJECT_TOPIC_SUGGESTIONS[selectedSubject] || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dars yaratish
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              AI yordamida to‘liq va professional dars rejasini tayyorlang
            </p>
          </div>
        </div>
      </div>

      {/* Generation Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Dars parametrlarini belgilang</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">DTS talablariga mos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Fan (Subject) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Fan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none appearance-none cursor-pointer"
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
                className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            )}
          </div>

          {/* Sinf (Grade) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sinf <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none appearance-none cursor-pointer"
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

          {/* Dars davomiyligi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Dars davomiyligi
            </label>
            <div className="relative">
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none appearance-none cursor-pointer"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Mavzu (Topic) with quick suggestions */}
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
            placeholder="Masalan: Present Simple, Kvadrat tenglamalar, Nyuton qonunlari..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
          />

          {/* Suggestion pills */}
          {topicSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topicSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setTopic(sug)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-xs text-slate-600 transition-colors cursor-pointer border border-slate-200/70"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Level and Additional Requirements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              O‘quvchilar darajasi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    level === lvl
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
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
              Qo‘shimcha talablar (ixtiyoriy)
            </label>
            <textarea
              rows={2}
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              placeholder="Masalan: Interaktiv o‘yin qo‘shilsin, guruhlarda ishlash metodikasi bo‘lsin..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Darsni yaratish</span>
          </button>
        </div>
      </div>

      {/* Loading state experience */}
      {isLoading && (
        <AiLoadingState
          title="AI dars rejasini tayyorlamoqda..."
          steps={[
            'Mavzu tahlil qilinmoqda',
            'Dars strukturasi yaratilmoqda',
            'Mashqlar tayyorlanmoqda',
          ]}
        />
      )}

      {/* Error state */}
      {errorMsg && !isLoading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-900 space-y-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
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

      {/* Generated Result Output */}
      {lessonPlan && !isLoading && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
          {/* Action Toolbar */}
          <div className="bg-slate-50/90 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2.5 py-1 rounded-md">
                {lessonPlan.subject} • {lessonPlan.grade}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {lessonPlan.title || `${lessonPlan.topic} dars rejasi`}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Saqlash</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tahrirlash</span>
                </button>
              )}

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Nusxalandi</span>
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
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-600" />
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

          {/* Lesson Content Sections */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Meta badges */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                Vaqt: {lessonPlan.duration}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5">
                <GraduationCap className="w-3 h-3 text-slate-400" />
                Daraja: {lessonPlan.level}
              </span>
            </div>

            {/* 1. Dars maqsadi */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                1. Dars maqsadi
              </h3>
              {isEditing && editDraft ? (
                <textarea
                  rows={3}
                  value={editDraft.objective}
                  onChange={(e) => setEditDraft({ ...editDraft, objective: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              ) : (
                <div className="bg-slate-50/70 p-4 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                  {lessonPlan.objective}
                </div>
              )}
            </section>

            {/* 2. Kutilayotgan natijalar */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                2. Kutilayotgan natijalar
              </h3>
              {isEditing && editDraft ? (
                <div className="space-y-2">
                  {(editDraft.expectedResults || []).map((res, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={res}
                        onChange={(e) => {
                          const updated = [...editDraft.expectedResults];
                          updated[i] = e.target.value;
                          setEditDraft({ ...editDraft, expectedResults: updated });
                        }}
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300"
                      />
                      <button
                        onClick={() => {
                          const updated = editDraft.expectedResults.filter((_, idx) => idx !== i);
                          setEditDraft({ ...editDraft, expectedResults: updated });
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setEditDraft({
                        ...editDraft,
                        expectedResults: [...(editDraft.expectedResults || []), 'Yangi kutilayotgan natija...'],
                      });
                    }}
                    className="text-xs font-bold text-indigo-700 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Natija qo‘shish
                  </button>
                </div>
              ) : (
                <ul className="space-y-2 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  {(lessonPlan.expectedResults || []).map((res, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* 3. Kerakli jihozlar */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                3. Kerakli jihozlar
              </h3>
              {isEditing && editDraft ? (
                <input
                  type="text"
                  value={(editDraft.materials || []).join(', ')}
                  onChange={(e) =>
                    setEditDraft({
                      ...editDraft,
                      materials: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  placeholder="Vergul bilan ajratib yozing..."
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(lessonPlan.materials || []).map((mat, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700 flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3 text-indigo-600" />
                      <span>{mat}</span>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* 4. Dars bosqichlari */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                4. Dars bosqichlari va vaqt taqsimoti
              </h3>

              {isEditing && editDraft ? (
                <div className="space-y-4">
                  {(editDraft.stages || []).map((stage, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-300 bg-slate-50 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={stage.time}
                          placeholder="Vaqt"
                          onChange={(e) => {
                            const updated = [...editDraft.stages];
                            updated[idx].time = e.target.value;
                            setEditDraft({ ...editDraft, stages: updated });
                          }}
                          className="w-28 px-2.5 py-1.5 rounded-lg border text-xs"
                        />
                        <input
                          type="text"
                          value={stage.title}
                          placeholder="Bosqich nomi"
                          onChange={(e) => {
                            const updated = [...editDraft.stages];
                            updated[idx].title = e.target.value;
                            setEditDraft({ ...editDraft, stages: updated });
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold"
                        />
                        <button
                          onClick={() => {
                            const updated = editDraft.stages.filter((_, i) => i !== idx);
                            setEditDraft({ ...editDraft, stages: updated });
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={stage.teacherActivity}
                        placeholder="O‘qituvchi faoliyati"
                        onChange={(e) => {
                          const updated = [...editDraft.stages];
                          updated[idx].teacherActivity = e.target.value;
                          setEditDraft({ ...editDraft, stages: updated });
                        }}
                        className="w-full p-2 text-xs rounded-lg border"
                      />
                      <textarea
                        rows={2}
                        value={stage.studentActivity}
                        placeholder="O‘quvchi faoliyati"
                        onChange={(e) => {
                          const updated = [...editDraft.stages];
                          updated[idx].studentActivity = e.target.value;
                          setEditDraft({ ...editDraft, stages: updated });
                        }}
                        className="w-full p-2 text-xs rounded-lg border"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newStage: LessonStage = {
                        time: '5 daqiqa',
                        title: 'Yangi bosqich',
                        teacherActivity: '',
                        studentActivity: '',
                        materials: '',
                      };
                      setEditDraft({ ...editDraft, stages: [...(editDraft.stages || []), newStage] });
                    }}
                    className="text-xs font-bold text-indigo-700 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Yangi bosqich qo‘shish
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4 w-28">Vaqt</th>
                        <th className="py-3 px-4 w-44">Bosqich</th>
                        <th className="py-3 px-4">O‘qituvchi faoliyati</th>
                        <th className="py-3 px-4">O‘quvchi faoliyati</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(lessonPlan.stages || []).map((stage, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-semibold text-indigo-700">
                            {stage.time}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {stage.title}
                          </td>
                          <td className="py-3 px-4 text-slate-600 leading-relaxed">
                            {stage.teacherActivity}
                          </td>
                          <td className="py-3 px-4 text-slate-600 leading-relaxed">
                            {stage.studentActivity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* 5. Mavzuni tushuntirish */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                5. Mavzuni tushuntirish
              </h3>
              {isEditing && editDraft ? (
                <textarea
                  rows={6}
                  value={editDraft.explanation}
                  onChange={(e) => setEditDraft({ ...editDraft, explanation: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              ) : (
                <div className="bg-slate-50/70 p-5 rounded-2xl text-slate-800 text-sm leading-relaxed border border-slate-100 whitespace-pre-line">
                  {lessonPlan.explanation}
                </div>
              )}
            </section>

            {/* 6. Amaliy mashqlar */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                6. Amaliy mashqlar
              </h3>
              {isEditing && editDraft ? (
                <div className="space-y-3">
                  {(editDraft.exercises || []).map((ex, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-300 bg-slate-50 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ex.title}
                          placeholder="Mashq nomi"
                          onChange={(e) => {
                            const updated = [...editDraft.exercises];
                            updated[idx].title = e.target.value;
                            setEditDraft({ ...editDraft, exercises: updated });
                          }}
                          className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border"
                        />
                        <button
                          onClick={() => {
                            const updated = editDraft.exercises.filter((_, i) => i !== idx);
                            setEditDraft({ ...editDraft, exercises: updated });
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={ex.instruction}
                        placeholder="Ko‘rsatma"
                        onChange={(e) => {
                          const updated = [...editDraft.exercises];
                          updated[idx].instruction = e.target.value;
                          setEditDraft({ ...editDraft, exercises: updated });
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border"
                      />
                      <textarea
                        rows={2}
                        value={ex.content}
                        placeholder="Mashq matni"
                        onChange={(e) => {
                          const updated = [...editDraft.exercises];
                          updated[idx].content = e.target.value;
                          setEditDraft({ ...editDraft, exercises: updated });
                        }}
                        className="w-full p-2 text-xs rounded-lg border"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newEx: LessonExercise = {
                        title: 'Yangi mashq',
                        instruction: 'Topshiriq sharti',
                        content: '',
                      };
                      setEditDraft({ ...editDraft, exercises: [...(editDraft.exercises || []), newEx] });
                    }}
                    className="text-xs font-bold text-indigo-700 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Mashq qo‘shish
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {(lessonPlan.exercises || []).map((ex, i) => (
                    <div key={i} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {ex.title || `Mashq ${i + 1}`}
                      </h4>
                      {ex.instruction && (
                        <p className="text-xs font-medium text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg inline-block">
                          Shart: {ex.instruction}
                        </p>
                      )}
                      <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed pt-1">
                        {ex.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 7 & 8: Baholash & Uyga vazifa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <section className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                  7. Baholash
                </h3>
                {isEditing && editDraft ? (
                  <textarea
                    rows={3}
                    value={editDraft.assessment}
                    onChange={(e) => setEditDraft({ ...editDraft, assessment: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                ) : (
                  <div className="bg-slate-50/70 p-4 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                    {lessonPlan.assessment}
                  </div>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                  8. Uyga vazifa
                </h3>
                {isEditing && editDraft ? (
                  <textarea
                    rows={3}
                    value={editDraft.homework}
                    onChange={(e) => setEditDraft({ ...editDraft, homework: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                ) : (
                  <div className="bg-slate-50/70 p-4 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                    {lessonPlan.homework}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

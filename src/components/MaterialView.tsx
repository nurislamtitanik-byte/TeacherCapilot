import { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  FileDown,
  Printer,
  Pencil,
  Save,
  AlertTriangle,
  ChevronDown,
  Plus,
  Trash2,
  Lightbulb,
  FileText,
  Brain,
  HelpCircle,
  Home,
  SlidersHorizontal,
} from 'lucide-react';
import { LearningMaterial, MaterialExample, MaterialExercise } from '../types';
import { generateMaterial, regenerateSection, AiServiceError } from '../services/aiService';
import { saveLastMaterial, loadLastMaterial } from '../utils/storage';
import { downloadMaterialPdf } from '../utils/pdfGenerator';
import { AiLoadingState } from './AiLoadingState';
import {
  SUBJECT_OPTIONS,
  GRADES,
  LEVELS,
  MATERIAL_TYPES,
  SUBJECT_TOPIC_SUGGESTIONS,
} from '../constants';

interface MaterialViewProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function MaterialView({ onShowToast }: MaterialViewProps) {
  // Form states
  const [selectedSubject, setSelectedSubject] = useState('Ingliz tili');
  const [customSubject, setCustomSubject] = useState('');
  const [grade, setGrade] = useState('7-sinf');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('O‘rta');
  const [materialType, setMaterialType] = useState('Dars materiali');

  // Result & UI states
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit draft
  const [editDraft, setEditDraft] = useState<LearningMaterial | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadLastMaterial();
    if (saved) {
      setMaterial(saved);
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
      if (saved.materialType) setMaterialType(saved.materialType);
    }
  }, []);

  const effectiveSubject = selectedSubject === 'Boshqa fan...' ? customSubject.trim() || 'Umumiy fan' : selectedSubject;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      onShowToast('Iltimos, material mavzusini kiriting.', 'error');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setIsEditing(false);

    try {
      const result = await generateMaterial({
        subject: effectiveSubject,
        grade,
        topic: topic.trim(),
        level,
        materialType,
      });

      setMaterial(result);
      setEditDraft(result);
      saveLastMaterial(result);
      onShowToast('O‘quv materiali tayyorlandi', 'success');
    } catch (err: any) {
      const msg = err instanceof AiServiceError ? err.message : 'AI bilan bog‘lanishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.';
      setErrorMsg(msg);
      onShowToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSpecificSection = async (
    sectionKey: 'explanation' | 'examples' | 'exercises' | 'importantPoints' | 'reinforcement' | 'homework'
  ) => {
    if (!material) return;
    setRegeneratingSection(sectionKey);

    try {
      const newContent = await regenerateSection({
        subject: material.subject,
        grade: material.grade,
        topic: material.topic,
        level: material.level,
        materialType: material.materialType,
        section: sectionKey,
      });

      const updated = { ...material, [sectionKey]: newContent };
      setMaterial(updated);
      setEditDraft(updated);
      saveLastMaterial(updated);
      onShowToast('Bo‘lim qayta yaratildi', 'success');
    } catch {
      onShowToast('Bo‘limni qayta yaratishda xatolik yuz berdi.', 'error');
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleCopy = async () => {
    if (!material) return;

    const examplesText = (material.examples || [])
      .map((ex, i) => `${i + 1}. ${ex.title}: ${ex.example}${ex.note ? ` (${ex.note})` : ''}`)
      .join('\n');

    const exercisesText = (material.exercises || [])
      .map((ex, i) => `Topshiriq ${i + 1}: ${ex.task}${ex.solution ? `\nKalit: ${ex.solution}` : ''}`)
      .join('\n\n');

    const importantText = (material.importantPoints || []).map((pt) => `• ${pt}`).join('\n');

    const fullText = `=== TEACHERCOPILOT UZ: O‘QUV MATERIALI ===
FAN: ${material.subject}
SINF: ${material.grade}
MAVZU: ${material.topic}
TURI: ${material.materialType}
DARAJA: ${material.level}

1. QISQA TUSHUNTIRISH:
${material.explanation}

2. MISOLLAR:
${examplesText}

3. MASHQLAR:
${exercisesText}

4. ESDA SAQLANG:
${importantText}

5. MUSTAHKAMLASH:
${material.reinforcement}

6. UYGA VAZIFA:
${material.homework}
`;

    try {
      await navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      onShowToast('Nusxalandi', 'success');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      onShowToast('Nusxalashda xatolik yuz berdi.', 'error');
    }
  };

  const handleDownloadPdf = () => {
    if (!material) return;
    try {
      downloadMaterialPdf(material);
      onShowToast('Material PDF muvaffaqiyatli yuklab olindi.', 'success');
    } catch (e) {
      console.error(e);
      onShowToast('PDF yaratishda xatolik yuz berdi.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStartEdit = () => {
    if (!material) return;
    setEditDraft(JSON.parse(JSON.stringify(material)));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editDraft) return;
    setMaterial(editDraft);
    saveLastMaterial(editDraft);
    setIsEditing(false);
    onShowToast('O‘zgarishlar saqlandi', 'success');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditDraft(material);
  };

  const topicSuggestions = SUBJECT_TOPIC_SUGGESTIONS[selectedSubject] || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Material yaratish
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Mavzu bo‘yicha tarqatma konspekt, amaliy misollar va mashqlar to‘plami
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-violet-600" />
            <span>Material parametrlarini belgilang</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Tarqatma konspekt & amaliyot</span>
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-violet-500 focus:bg-white focus:outline-none appearance-none cursor-pointer"
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
                className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-violet-500 focus:bg-white focus:outline-none appearance-none cursor-pointer"
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

          {/* Material turi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Material turi
            </label>
            <div className="relative">
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-violet-500 focus:bg-white focus:outline-none appearance-none cursor-pointer"
              >
                {MATERIAL_TYPES.map((mt) => (
                  <option key={mt} value={mt}>
                    {mt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
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
            placeholder="Masalan: Past Continuous, Kislotalar va asoslar, Amir Temur..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-violet-500 focus:bg-white focus:outline-none transition-all"
          />

          {topicSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topicSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setTopic(sug)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-xs text-slate-600 transition-colors cursor-pointer border border-slate-200/70"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Daraja */}
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
                className={`py-2 px-3 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  level === lvl
                    ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-violet-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Material yaratish</span>
          </button>
        </div>
      </div>

      {/* Loading state experience */}
      {isLoading && (
        <AiLoadingState
          title="AI materialni tayyorlamoqda..."
          steps={[
            'Mavzu tushuntirishi bayon qilinmoqda',
            'Amaliy misollar va mashqlar tanlanmoqda',
            'Esda saqlash qoidalari shakllantirilmoqda',
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

      {/* Material Output and Editor */}
      {material && !isLoading && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
          {/* Action Toolbar */}
          <div className="bg-slate-50/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-800 bg-violet-100/80 px-2.5 py-1 rounded-md">
                {material.subject} • {material.grade}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {material.topic} ({material.materialType})
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
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
                    <Check className="w-3.5 h-3.5 text-violet-600" />
                    <span className="text-violet-700 font-bold">Nusxalandi</span>
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
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-violet-600" />
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

          {/* Sections List */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* 1. Qisqa tushuntirish */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider border-l-4 border-violet-600 pl-3">
                  <BookOpen className="w-4 h-4 text-violet-600" />
                  <span>1. Qisqa tushuntirish</span>
                </h3>
                <button
                  onClick={() => handleRegenerateSpecificSection('explanation')}
                  disabled={regeneratingSection === 'explanation'}
                  className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1 p-1 hover:bg-violet-50 rounded-lg cursor-pointer"
                  title="Faqat shu bo‘limni yangilash"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'explanation' ? 'animate-spin' : ''}`} />
                  <span>Qayta yaratish</span>
                </button>
              </div>

              {isEditing && editDraft ? (
                <textarea
                  rows={4}
                  value={editDraft.explanation}
                  onChange={(e) => setEditDraft({ ...editDraft, explanation: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              ) : (
                <div className="bg-slate-50/80 p-5 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-100 whitespace-pre-line">
                  {material.explanation}
                </div>
              )}
            </div>

            {/* 2. Misollar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider border-l-4 border-violet-600 pl-3">
                  <Lightbulb className="w-4 h-4 text-violet-600" />
                  <span>2. Misollar</span>
                </h3>
                <button
                  onClick={() => handleRegenerateSpecificSection('examples')}
                  disabled={regeneratingSection === 'examples'}
                  className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1 p-1 hover:bg-violet-50 rounded-lg cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'examples' ? 'animate-spin' : ''}`} />
                  <span>Qayta yaratish</span>
                </button>
              </div>

              {isEditing && editDraft ? (
                <div className="space-y-3">
                  {(editDraft.examples || []).map((ex, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ex.title}
                          placeholder="Misol nomi"
                          onChange={(e) => {
                            const updated = [...editDraft.examples];
                            updated[idx].title = e.target.value;
                            setEditDraft({ ...editDraft, examples: updated });
                          }}
                          className="w-1/3 px-3 py-1.5 text-xs font-bold rounded-lg border"
                        />
                        <button
                          onClick={() => {
                            const updated = editDraft.examples.filter((_, i) => i !== idx);
                            setEditDraft({ ...editDraft, examples: updated });
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={ex.example}
                        placeholder="Misol matni"
                        onChange={(e) => {
                          const updated = [...editDraft.examples];
                          updated[idx].example = e.target.value;
                          setEditDraft({ ...editDraft, examples: updated });
                        }}
                        className="w-full p-2 text-xs rounded-lg border"
                      />
                      <input
                        type="text"
                        value={ex.note || ''}
                        placeholder="Izoh yoki qoida"
                        onChange={(e) => {
                          const updated = [...editDraft.examples];
                          updated[idx].note = e.target.value;
                          setEditDraft({ ...editDraft, examples: updated });
                        }}
                        className="w-full px-3 py-1 text-xs rounded-lg border"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newEx: MaterialExample = {
                        title: 'Yangi misol',
                        example: '',
                        note: '',
                      };
                      setEditDraft({ ...editDraft, examples: [...(editDraft.examples || []), newEx] });
                    }}
                    className="text-xs font-bold text-violet-700 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Misol qo‘shish
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(material.examples || []).map((ex, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                    >
                      <h4 className="font-bold text-slate-900 text-sm">
                        {ex.title || `Misol ${i + 1}`}
                      </h4>
                      <p className="text-slate-800 text-sm font-mono bg-white p-2.5 rounded-xl border border-slate-200">
                        {ex.example}
                      </p>
                      {ex.note && (
                        <p className="text-xs text-slate-500 italic pt-1">
                          Izoh: {ex.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Mashqlar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider border-l-4 border-violet-600 pl-3">
                  <FileText className="w-4 h-4 text-violet-600" />
                  <span>3. Mashqlar</span>
                </h3>
                <button
                  onClick={() => handleRegenerateSpecificSection('exercises')}
                  disabled={regeneratingSection === 'exercises'}
                  className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1 p-1 hover:bg-violet-50 rounded-lg cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'exercises' ? 'animate-spin' : ''}`} />
                  <span>Qayta yaratish</span>
                </button>
              </div>

              {isEditing && editDraft ? (
                <div className="space-y-3">
                  {(editDraft.exercises || []).map((ex, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Topshiriq {idx + 1}</span>
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
                      <textarea
                        rows={2}
                        value={ex.task}
                        placeholder="Topshiriq sharti"
                        onChange={(e) => {
                          const updated = [...editDraft.exercises];
                          updated[idx].task = e.target.value;
                          setEditDraft({ ...editDraft, exercises: updated });
                        }}
                        className="w-full p-2 text-xs rounded-lg border"
                      />
                      <input
                        type="text"
                        value={ex.solution || ''}
                        placeholder="Yechim yoki kalit"
                        onChange={(e) => {
                          const updated = [...editDraft.exercises];
                          updated[idx].solution = e.target.value;
                          setEditDraft({ ...editDraft, exercises: updated });
                        }}
                        className="w-full px-3 py-1 text-xs rounded-lg border"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newEx: MaterialExercise = { task: 'Yangi topshiriq', solution: '' };
                      setEditDraft({ ...editDraft, exercises: [...(editDraft.exercises || []), newEx] });
                    }}
                    className="text-xs font-bold text-violet-700 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Topshiriq qo‘shish
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(material.exercises || []).map((ex, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-700">
                        Topshiriq {i + 1}
                      </span>
                      <p className="text-sm text-slate-800 leading-relaxed font-medium">
                        {ex.task}
                      </p>
                      {ex.solution && (
                        <p className="text-xs text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-100 inline-block">
                          <span className="font-semibold">Kalit/yechim: </span> {ex.solution}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Esda saqlang */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider border-l-4 border-violet-600 pl-3">
                  <Brain className="w-4 h-4 text-violet-600" />
                  <span>4. Esda saqlang</span>
                </h3>
                <button
                  onClick={() => handleRegenerateSpecificSection('importantPoints')}
                  disabled={regeneratingSection === 'importantPoints'}
                  className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1 p-1 hover:bg-violet-50 rounded-lg cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'importantPoints' ? 'animate-spin' : ''}`} />
                  <span>Qayta yaratish</span>
                </button>
              </div>

              {isEditing && editDraft ? (
                <div className="space-y-2">
                  {(editDraft.importantPoints || []).map((pt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={pt}
                        onChange={(e) => {
                          const updated = [...editDraft.importantPoints];
                          updated[i] = e.target.value;
                          setEditDraft({ ...editDraft, importantPoints: updated });
                        }}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300"
                      />
                      <button
                        onClick={() => {
                          const updated = editDraft.importantPoints.filter((_, idx) => idx !== i);
                          setEditDraft({ ...editDraft, importantPoints: updated });
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setEditDraft({
                        ...editDraft,
                        importantPoints: [...(editDraft.importantPoints || []), 'Yangi qoida'],
                      });
                    }}
                    className="text-xs font-bold text-violet-700 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Qoida qo‘shish
                  </button>
                </div>
              ) : (
                <div className="bg-violet-50/70 p-5 rounded-2xl border border-violet-100 space-y-2">
                  {(material.importantPoints || []).map((point, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-violet-950 font-medium">
                      <span className="text-violet-600 font-bold shrink-0 mt-0.5">•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5 & 6. Mustahkamlash & Uyga vazifa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider border-l-4 border-violet-600 pl-3">
                    <HelpCircle className="w-4 h-4 text-violet-600" />
                    <span>5. Mustahkamlash</span>
                  </h3>
                  <button
                    onClick={() => handleRegenerateSpecificSection('reinforcement')}
                    disabled={regeneratingSection === 'reinforcement'}
                    className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1 p-1 hover:bg-violet-50 rounded-lg cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'reinforcement' ? 'animate-spin' : ''}`} />
                    <span>Qayta</span>
                  </button>
                </div>

                {isEditing && editDraft ? (
                  <textarea
                    rows={4}
                    value={editDraft.reinforcement}
                    onChange={(e) => setEditDraft({ ...editDraft, reinforcement: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                ) : (
                  <div className="bg-slate-50/80 p-4 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                    {material.reinforcement}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider border-l-4 border-violet-600 pl-3">
                    <Home className="w-4 h-4 text-violet-600" />
                    <span>6. Uyga vazifa</span>
                  </h3>
                  <button
                    onClick={() => handleRegenerateSpecificSection('homework')}
                    disabled={regeneratingSection === 'homework'}
                    className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1 p-1 hover:bg-violet-50 rounded-lg cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'homework' ? 'animate-spin' : ''}`} />
                    <span>Qayta</span>
                  </button>
                </div>

                {isEditing && editDraft ? (
                  <textarea
                    rows={4}
                    value={editDraft.homework}
                    onChange={(e) => setEditDraft({ ...editDraft, homework: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                ) : (
                  <div className="bg-slate-50/80 p-4 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                    {material.homework}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import {
  BookOpenCheck,
  ClipboardList,
  BookOpen,
  ArrowRight,
  Clock,
  ShieldCheck,
  Printer,
  Sparkles,
  Brain,
  SlidersHorizontal,
  FileCheck2,
  Check,
  Layers,
  ChevronRight,
  Award,
  BookMarked,
  FileText,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface HomePageProps {
  onNavigate: (tab: NavTab) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const scrollToHowItWorks = () => {
    const el = document.getElementById('qanday-ishlaydi');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-20 sm:space-y-28 pb-24">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-indigo-700 text-xs sm:text-sm font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>O‘zbekiston o‘qituvchilari uchun AI yordamchi</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Darsga tayyorgarlikni{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 bg-clip-text text-transparent">
                AI bilan osonlashtiring
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              TeacherCopilot UZ — dars rejasi, test va o‘quv materiallarini tez va professional tayyorlashga yordam beruvchi AI yordamchi.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => onNavigate('lesson')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer group"
              >
                <BookOpenCheck className="w-4 h-4" />
                <span>Dars yaratish</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-300 shadow-xs transition-colors cursor-pointer"
              >
                Qanday ishlaydi?
              </button>
            </div>

            {/* Value Indicators */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 sm:gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>45 daqiqalik dars 2 daqiqada</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>DTS talablariga mos</span>
              </div>
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>A4 formatda PDF eksport</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Quality Educational AI Workspace Showcase Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Ambient Glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-blue-500/20 to-purple-500/20 blur-xl opacity-70"></div>

              {/* Main Laptop / Platform Dashboard Container */}
              <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
                {/* Browser top-bar chrome */}
                <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 bg-white px-3 py-0.5 rounded-md border border-slate-200/60">
                    teachercopilot.uz/app
                  </div>
                  <div className="w-4"></div>
                </div>

                {/* Dashboard Inner Canvas */}
                <div className="p-5 sm:p-6 bg-slate-50/60 space-y-4">
                  {/* Subject Header */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        EN
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Ingliz tili • 7-sinf</div>
                        <div className="text-[10px] text-slate-500">Mavzu: Present Simple Tense</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      DTS Standart
                    </span>
                  </div>

                  {/* Document preview snippet */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2.5 text-left shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Dars Maqsadi & Natijalar</span>
                      </div>
                      <span className="text-[10px] text-slate-400">45 daqiqa</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      O‘quvchilar kundalik odatiy harakatlarni Present Simple zamonida ifodalashni va amaliy mashqlarda to‘g‘ri qo‘llashni o‘rganadilar.
                    </p>
                    {/* Step pills */}
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">1. Tashkiliy qism</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">2. Yangi mavzu</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">3. Mashqlar</span>
                    </div>
                  </div>

                  {/* Interactive Status Indicator */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>AI modeli tayyor</span>
                    </div>
                    <span className="font-semibold text-indigo-600">A4 PDF eksport</span>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: Top Right */}
              <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-lg flex items-center gap-2 animate-bounce-slow">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900">AI Yordamchi</div>
                  <div className="text-[9px] text-slate-500">Metodik tahlil</div>
                </div>
              </div>

              {/* Floating Badge 2: Bottom Left */}
              <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-lg flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900">10 ta test savoli</div>
                  <div className="text-[9px] text-slate-500">Javoblar kaliti bilan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE MAIN FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
            Asosiy Imkoniyatlar
          </h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            O‘qituvchi uchun 3 ta qudratli modul
          </h3>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Har bir modul dars jarayonini tezkor va sifatli tashkil etish uchun maxsus ishlab chiqilgan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1: Dars yaratish */}
          <div
            onClick={() => onNavigate('lesson')}
            className="group relative bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">
                <BookOpenCheck className="w-6 h-6" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-2">
                Dars Ishlanmasi
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2.5">
                Dars yaratish
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Bir necha parametr orqali to‘liq dars rejasini yarating. Maqsad, vaqt taqsimoti va amaliy mashqlar.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
              <span>Boshlash</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Feature 2: Test yaratish */}
          <div
            onClick={() => onNavigate('test')}
            className="group relative bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-2">
                Nazorat Savollari
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2.5">
                Test yaratish
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                AI yordamida turli darajadagi test savollarini yarating. Tahrirlash, javoblar kaliti va PDF chop etish.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-blue-600 group-hover:text-blue-700">
              <span>Boshlash</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Feature 3: Material yaratish */}
          <div
            onClick={() => onNavigate('material')}
            className="group relative bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100/80 flex items-center justify-center text-violet-600 mb-6 group-hover:scale-105 group-hover:bg-violet-600 group-hover:text-white transition-all duration-200">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-violet-600 mb-2">
                Tarqatma Konspekt
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2.5">
                Material yaratish
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Mavzu asosida tushuntirish, misollar va mashqlar tayyorlang. Qisqa konspekt va esda saqlash qoidalari.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-violet-600 group-hover:text-violet-700">
              <span>Boshlash</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURE VISUAL STEPS ("AI qanday yordam beradi?") */}
      <section id="qanday-ishlaydi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Jarayon
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
              AI qanday yordam beradi?
            </h3>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Uch oddiy bosqichda dars rejasidan tortib A4 formatdagi tayyor hujjatgacha ega bo‘ling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Step 01 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800">
                  01
                </span>
                <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold text-white">Ma'lumotlarni kiriting</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Fan, sinf, mavzu va o‘quvchilar bilim darajasini belgilang. Tizim sizga mos tavsiyalarni taklif etadi.
              </p>
            </div>

            {/* Step 02 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800">
                  02
                </span>
                <Brain className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold text-white">AI tahlil qiladi</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Davlat Ta'lim Standartlari asosida dars maqsadi, vaqt taqsimoti, savollar va amaliy topshiriqlar tuziladi.
              </p>
            </div>

            {/* Step 03 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800">
                  03
                </span>
                <FileCheck2 className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold text-white">Tayyor natijani oling</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Natijani xohlagancha tahrirlang, nusxalang yoki bir tugma bilan professional A4 PDF holida chop eting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT PREVIEW MOCKUP SECTION ("TeacherCopilot qanday ko‘rinadi?") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
            Platforma interfeysi
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            TeacherCopilot qanday ko‘rinadi?
          </h3>
          <p className="mt-2 text-slate-600 text-sm">
            Qulay, tushunarli va pedagog ehtiyojlariga moslashtirilgan zamonaviy ish muhiti.
          </p>
        </div>

        {/* Realistic Dashboard Mockup */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="bg-slate-100/90 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="ml-3 text-xs font-semibold text-slate-600">
                TeacherCopilot UZ — Dars yaratish
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
              <span>Fan: Ingliz tili</span>
              <span>•</span>
              <span>Sinf: 7-sinf</span>
              <span>•</span>
              <span className="font-semibold text-slate-800">Mavzu: Present Simple</span>
            </div>
          </div>

          {/* Form & Document Split Preview */}
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50/50">
            {/* Left Mockup Controls */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Parametrlar
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 font-medium">Fan</label>
                  <div className="mt-1 px-3 py-2 rounded-xl bg-slate-100 font-semibold text-slate-800">
                    Ingliz tili
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 font-medium">Sinf</label>
                  <div className="mt-1 px-3 py-2 rounded-xl bg-slate-100 font-semibold text-slate-800">
                    7-sinf
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 font-medium">Mavzu</label>
                  <div className="mt-1 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200/70 font-semibold text-indigo-900">
                    Present Simple Tense
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigate('lesson')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Darsni yaratish</span>
              </button>
            </div>

            {/* Right Mockup Document View */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    Dars Ishlanmasi
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    Present Simple — 7-sinf
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                    PDF Eksport
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">
                    1. Dars maqsadi
                  </span>
                  O‘quvchilarda odatiy harakatlar haqida gapirish ko‘nikmasini rivojlantirish va grammatik qoidalarni tushunish.
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">
                    2. Dars bosqichlari (45 daqiqa)
                  </span>
                  Tashkiliy qism (5 daq) → Qoidalar tushuntirishi (15 daq) → Amaliy mashqlar (15 daq) → Baholash (10 daq).
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

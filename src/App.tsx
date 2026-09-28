import { useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { LessonPlanView } from './components/LessonPlanView';
import { TestQuizView } from './components/TestQuizView';
import { MaterialView } from './components/MaterialView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { BrandLogo } from './components/BrandLogo';
import { BookOpenCheck, ClipboardList, BookOpen, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 pt-6 sm:pt-10">
        {activeTab === 'home' && <HomePage onNavigate={setActiveTab} />}
        {activeTab === 'lesson' && <LessonPlanView onShowToast={handleShowToast} />}
        {activeTab === 'test' && <TestQuizView onShowToast={handleShowToast} />}
        {activeTab === 'material' && <MaterialView onShowToast={handleShowToast} />}
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-100">
            {/* Brand column */}
            <div className="md:col-span-6 space-y-3">
              <BrandLogo size="md" />
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                O‘zbekiston o‘qituvchilari uchun dars ishlanmasi, nazorat testlari va tarqatma materiallarni zamonaviy pedagogik mezonlar asosida tezkor tayyorlash platformasi.
              </p>
            </div>

            {/* Navigation Links */}
            <div className="md:col-span-6 flex flex-wrap gap-x-12 gap-y-4 md:justify-end items-start text-xs font-semibold text-slate-600">
              <button
                onClick={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Bosh sahifa
              </button>
              <button
                onClick={() => {
                  setActiveTab('lesson');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Dars yaratish
              </button>
              <button
                onClick={() => {
                  setActiveTab('test');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Test yaratish
              </button>
              <button
                onClick={() => {
                  setActiveTab('material');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Material yaratish
              </button>
            </div>
          </div>

          {/* Sub-footer copyright & standards */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              &copy; {new Date().getFullYear()} TeacherCopilot UZ. Barcha huquqlar himoyalangan.
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Davlat Ta'lim Standartlariga mos</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

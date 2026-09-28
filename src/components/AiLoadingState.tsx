import { useEffect, useState } from 'react';
import { Brain, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface AiLoadingStateProps {
  title: string;
  steps: string[];
}

export function AiLoadingState({ title, steps }: AiLoadingStateProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-indigo-200/80 shadow-md text-center space-y-6 max-w-xl mx-auto">
      {/* Animated AI Core Icon */}
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-md animate-pulse"></div>
        <div className="relative w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
          <Brain className="w-8 h-8 animate-pulse text-indigo-600" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-indigo-100 flex items-center justify-center shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500">
          Iltimos kuting, sun'iy intellekt pedagogik talablarga mos ma'lumotlarni shakllantirmoqda.
        </p>
      </div>

      {/* Stepping Indicator */}
      <div className="space-y-2.5 max-w-sm mx-auto text-left pt-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs transition-all duration-300 ${
                isCurrent
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-semibold shadow-xs'
                  : isDone
                  ? 'bg-slate-50/70 border-slate-200/80 text-slate-700 font-medium'
                  : 'bg-transparent border-transparent text-slate-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0"></div>
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

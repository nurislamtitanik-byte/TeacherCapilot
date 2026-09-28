interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function BrandLogo({ className = '', size = 'md', showSubtitle = true }: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Precision Geometric Logo Mark: Open Knowledge Book + AI Copilot Beacon */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 flex items-center justify-center shadow-sm shadow-indigo-500/25 shrink-0 transition-transform duration-200 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
        >
          {/* Stylized Book Wings */}
          <path
            d="M5 7.5C5 6.67 5.67 6 6.5 6H12.5C13.33 6 14 6.67 14 7.5V20.5C14 21.05 13.55 21.5 13 21.5H6.5C5.67 21.5 5 20.83 5 20V7.5Z"
            fill="currentColor"
            fillOpacity="0.88"
          />
          <path
            d="M14 7.5C14 6.67 14.67 6 15.5 6H21.5C22.33 6 23 6.67 23 7.5V20C23 20.83 22.33 21.5 21.5 21.5H15C14.45 21.5 14 21.05 14 20.5V7.5Z"
            fill="currentColor"
            fillOpacity="0.7"
          />
          {/* AI Spark Central Core */}
          <path
            d="M14 3.5L15.2 6.3L18 7.5L15.2 8.7L14 11.5L12.8 8.7L10 7.5L12.8 6.3L14 3.5Z"
            fill="#FFFFFF"
          />
          {/* Lower spine foundation */}
          <path
            d="M8 12.5H11M8 15.5H11M17 12.5H20M17 15.5H20"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />
        </svg>
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-bold tracking-tight text-slate-900 ${textSizes[size]}`}>
            TeacherCopilot
          </span>
          <span className="font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] uppercase tracking-wide">
            UZ
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] font-medium text-slate-500 tracking-normal mt-0.5">
            O‘qituvchilar uchun AI yordamchi
          </span>
        )}
      </div>
    </div>
  );
}

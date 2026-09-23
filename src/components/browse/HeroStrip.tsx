import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, ChevronRight } from 'lucide-react';

interface HeroStripProps {
  onLearnMore?: () => void;
}

export const HeroStrip: React.FC<HeroStripProps> = ({ onLearnMore }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('safenest_hero_collapsed') === 'true';
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('safenest_hero_collapsed', 'true');
  };

  const handleRestore = () => {
    setIsDismissed(false);
    localStorage.removeItem('safenest_hero_collapsed');
  };

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between py-1.5 px-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">Every photo verified by our team · SafeNest Uganda</span>
        </div>
        <button
          onClick={handleRestore}
          className="text-[11px] text-emerald-400 hover:text-emerald-200 underline shrink-0 min-h-[36px] flex items-center px-2"
        >
          Show banner
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 text-white shadow-md relative overflow-hidden mb-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* High-contrast, single-line badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/90 text-emerald-300 text-xs font-bold border border-emerald-500/50 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Every photo verified by our team</span>
          </div>

          <span className="text-slate-300 text-xs sm:text-sm font-medium">
            Find verified rentals across Kampala & Entebbe.
          </span>

          <span className="text-slate-400 text-xs hidden md:inline">
            Tenancy agreements stored securely, always accessible.
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onLearnMore && (
            <button
              onClick={onLearnMore}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors min-h-[44px]"
            >
              <span>Learn More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Dismiss banner"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

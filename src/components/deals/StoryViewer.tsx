import React, { useState, useEffect, useRef } from 'react';
import { Deal } from '../../types';
import { X, MessageCircle, Phone, Share2, Flame, MapPin, ShieldCheck, Play, Pause } from 'lucide-react';
import { ShareModal } from '../common/ShareModal';

interface StoryViewerProps {
  deal: Deal;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  deals?: Deal[];
  currentIndex?: number;
}

const STORY_DURATION = 8000; // 8 seconds

export const StoryViewer: React.FC<StoryViewerProps> = ({
  deal,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  deals,
  currentIndex,
}) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stillPaused, setStillPaused] = useState(false);
  const [sharingDeal, setSharingDeal] = useState<Deal | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const pausedAtRef = useRef<number>(0);
  const pausedTimestampRef = useRef<number | null>(null);
  const rafRef = useRef<number>();

  const pressStartTimeRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);

  // Setup deals list context
  const dealsList = deals || [deal];
  const currentIdx = currentIndex !== undefined ? currentIndex : 0;
  const totalDeals = dealsList.length;

  const activeDeal = dealsList[currentIdx] || deal;

  // Auto-advance logic using requestAnimationFrame
  useEffect(() => {
    // Reset progress whenever current deal changes
    setProgress(0);
    startTimeRef.current = Date.now();
    pausedAtRef.current = 0;
    setIsPaused(false);
    setStillPaused(false);
  }, [activeDeal.id, currentIdx]);

  useEffect(() => {
    function animate() {
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min(elapsed / STORY_DURATION, 1);
        setProgress(pct);

        if (pct >= 1) {
          if (hasNext) {
            onNext();
          } else {
            onClose();
          }
          return;
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused, currentIdx, hasNext, onNext, onClose]);

  // Handle manual pause & resume
  const handlePause = () => {
    if (isPaused) return;
    pausedAtRef.current = Date.now() - startTimeRef.current;
    pausedTimestampRef.current = Date.now();
    setIsPaused(true);
  };

  const handleResume = () => {
    startTimeRef.current = Date.now() - pausedAtRef.current;
    setIsPaused(false);
    setStillPaused(false);
    pausedTimestampRef.current = null;
  };

  // Monitor inactive app/background state
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handlePause();
      } else {
        handleResume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPaused]);

  // Monitor "Still paused" > 15 seconds edgecase
  useEffect(() => {
    if (!isPaused) {
      setStillPaused(false);
      return;
    }

    const checkInterval = setInterval(() => {
      if (pausedTimestampRef.current && Date.now() - pausedTimestampRef.current > 15000) {
        setStillPaused(true);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [isPaused]);

  // Handle Touch Actions
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [role="button"]')) return;

    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchEndRef.current = null;
    pressStartTimeRef.current = Date.now();

    handlePause();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchEndRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [role="button"]')) return;

    handleResume();

    if (!touchStartRef.current) return;

    const start = touchStartRef.current;
    const end = touchEndRef.current;

    if (end) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;

      // Vertical Swiping
      if (Math.abs(dy) > Math.abs(dx)) {
        if (dy > 100) {
          // Swipe Down -> Close Story
          onClose();
          return;
        } else if (dy < -100) {
          // Swipe Up -> Next Story
          if (hasNext) onNext();
          else onClose();
          return;
        }
      } else {
        // Horizontal Swiping
        if (Math.abs(dx) > 100) {
          if (dx < 0) {
            // Swipe Left -> Previous Story (matching tap left constraint)
            if (hasPrev) onPrev();
            return;
          } else {
            // Swipe Right -> Next Story (matching tap right constraint)
            if (hasNext) onNext();
            else onClose();
            return;
          }
        }
      }
    }

    // Tap Gesture Detection (< 300ms, no big moves)
    const duration = Date.now() - pressStartTimeRef.current;
    if (duration < 300) {
      const percentage = start.x / window.innerWidth;
      if (percentage < 0.25) {
        if (hasPrev) onPrev();
      } else if (percentage > 0.75) {
        if (hasNext) onNext();
        else onClose();
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  // Handle Desktop Mouse Events
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [role="button"]')) return;

    pressStartTimeRef.current = Date.now();
    touchStartRef.current = { x: e.clientX, y: e.clientY };
    handlePause();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [role="button"]')) return;

    handleResume();

    if (!touchStartRef.current) return;
    const start = touchStartRef.current;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    // Emulate Drag / Swipe with mouse
    if (Math.abs(dy) > Math.abs(dx)) {
      if (dy > 100) {
        onClose();
        touchStartRef.current = null;
        return;
      } else if (dy < -100) {
        if (hasNext) onNext();
        else onClose();
        touchStartRef.current = null;
        return;
      }
    } else {
      if (Math.abs(dx) > 100) {
        if (dx < 0) {
          // Drag Left -> Previous Story
          if (hasPrev) onPrev();
          touchStartRef.current = null;
          return;
        } else {
          // Drag Right -> Next Story
          if (hasNext) onNext();
          else onClose();
          touchStartRef.current = null;
          return;
        }
      }
    }

    // Quick Mouse Tap
    const duration = Date.now() - pressStartTimeRef.current;
    if (duration < 300) {
      const percentage = e.clientX / window.innerWidth;
      if (percentage < 0.25) {
        if (hasPrev) onPrev();
      } else if (percentage > 0.75) {
        if (hasNext) onNext();
        else onClose();
      }
    }

    touchStartRef.current = null;
  };

  const getDaysLeft = (expiresAtStr: string) => {
    const diffTime = new Date(expiresAtStr).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : 'Expiring soon';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col h-full w-full select-none overflow-hidden touch-none">
      {/* Interactive Canvas */}
      <div
        className="absolute inset-0 z-0 bg-slate-900 flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={activeDeal.photos?.[0]}
          alt={activeDeal.title}
          className="w-full h-full object-cover opacity-90"
          draggable={false}
        />
        {/* Ambient Overlays */}
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/80 via-black/45 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

        {/* Center Indicators (Pause Overlay Feedback) */}
        {isPaused && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/65 backdrop-blur-md p-4 rounded-full text-white pointer-events-none animate-scale-up shadow-2xl border border-white/10">
            <Pause className="w-8 h-8 fill-white" />
          </div>
        )}

        {/* "Still paused" hint indicator */}
        {stillPaused && (
          <div className="absolute top-[18%] left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-black px-4 py-2 rounded-full shadow-2xl animate-bounce tracking-wide">
            ⏸️ STILL PAUSED
          </div>
        )}
      </div>

      {/* PROGRESS SEGMENTS (One segment per deal in the stories deck) */}
      <div className="relative z-10 pt-8 px-4 flex gap-1 bg-transparent">
        {Array.from({ length: totalDeals }).map((_, idx) => {
          let widthPct = 0;
          if (idx < currentIdx) {
            widthPct = 100;
          } else if (idx === currentIdx) {
            widthPct = progress * 100;
          } else {
            widthPct = 0;
          }

          return (
            <div key={idx} className="h-1 bg-white/20 rounded-full flex-1 overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: `${widthPct}%`,
                  transition: idx === currentIdx ? 'none' : 'width 0.2s ease-out',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* HEADER BAR */}
      <div className="relative z-10 px-4 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-red-600 px-2.5 py-1 rounded-full border border-red-500 animate-pulse shadow-xs">
            <Flame className="w-4 h-4 text-white fill-white" />
            <span className="text-[10px] font-black tracking-widest text-white uppercase">SafeNest 🔥 HOT DEAL</span>
          </div>
          <span className="text-white/60 text-[10px] font-bold">
            {currentIdx + 1} of {totalDeals}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Share button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePause();
              setSharingDeal(activeDeal);
            }}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
            title="Share Deal"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
            title="Close Stories"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 pointer-events-none" />

      {/* INFO OVERLAY BOTTOM DRAWER */}
      <div className="relative z-10 px-5 pb-8 space-y-4">
        {/* Deal details */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {activeDeal.isFeatured && (
              <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                FEATURED
              </span>
            )}
            <span className="text-white/85 text-xs font-extrabold bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-md">
              Seller: {activeDeal.sellerName || 'Neighbor'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight drop-shadow-md">
            {activeDeal.title}
          </h2>
          <p className="text-xs text-white/80 line-clamp-2 leading-relaxed font-semibold">
            {activeDeal.description}
          </p>
        </div>

        {/* Pricing, Condition, & Metrics info board */}
        <div className="border-t border-white/15 pt-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              {activeDeal.originalPrice && (
                <span className="text-xs text-white/50 line-through block font-bold">
                  UGX {activeDeal.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                UGX {activeDeal.price.toLocaleString()}
              </span>
            </div>
            <span className="text-xs font-black text-white uppercase bg-white/15 border border-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md shrink-0">
              {activeDeal.condition}
            </span>
          </div>

          {/* Core attributes list */}
          <div className="grid grid-cols-3 gap-2 text-white/90 font-bold text-[11px] bg-black/30 p-2.5 rounded-2xl border border-white/5 backdrop-blur-xs">
            <div className="flex items-center gap-1.5 justify-center">
              <span>⏰</span>
              <span>{getDaysLeft(activeDeal.expiresAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center border-x border-white/10 px-1 truncate">
              <span>📍</span>
              <span className="truncate">{activeDeal.area}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center truncate">
              <span>📝</span>
              <span className="truncate">{activeDeal.condition}</span>
            </div>
          </div>
        </div>

        {/* Core CTA actions grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Message Seller */}
          <a
            href={`https://wa.me/${activeDeal.contactPhone.replace(/[^0-9]/g, '')}?text=Hi! I am interested in your hot deal: ${encodeURIComponent(activeDeal.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 cursor-pointer text-center"
          >
            <MessageCircle className="w-4 h-4 fill-slate-900" />
            <span>💬 Message Seller</span>
          </a>

          {/* Call seller */}
          <a
            href={`tel:${activeDeal.contactPhone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 cursor-pointer text-center border border-emerald-500"
          >
            <Phone className="w-4 h-4 fill-white" />
            <span>📞 Call Now</span>
          </a>
        </div>

        {/* Interaction helper hints */}
        <div className="text-center text-[10px] text-white/55 font-extrabold tracking-wide pt-1.5 pointer-events-none">
          👆 Hold to pause · Swipe up for next deal
        </div>
      </div>

      {sharingDeal && (
        <ShareModal
          title={sharingDeal.title}
          text={`🔥 ${sharingDeal.title}\n📍 ${sharingDeal.area}, ${sharingDeal.city}\n💰 UGX ${sharingDeal.price.toLocaleString()}`}
          url={`${window.location.origin}/d/${sharingDeal.id}`}
          imageUrl={sharingDeal.photos?.[0]}
          onClose={() => {
            setSharingDeal(null);
            handleResume();
          }}
        />
      )}
    </div>
  );
};

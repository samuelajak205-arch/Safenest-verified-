import React, { useState } from 'react';
import { useSafeNestStore } from '../../lib/store';
import { Flame, Clock, ChevronRight } from 'lucide-react';
import { Deal } from '../../types';
import { StoryViewer } from './StoryViewer'; // We will create this

interface HotDealsRowProps {
  onViewAll?: () => void;
}

export const HotDealsRow: React.FC<HotDealsRowProps> = ({ onViewAll }) => {
  const store = useSafeNestStore();
  const [selectedDealIndex, setSelectedDealIndex] = useState<number | null>(null);

  // Filter active deals
  const activeDeals = store.deals.filter(d => d.status === 'active' && new Date(d.expiresAt) > new Date());

  if (activeDeals.length === 0) return null;

  const getRingColor = (deal: Deal) => {
    const hasViewed = store.hasViewedDeal(deal.id);
    const expiresAt = new Date(deal.expiresAt).getTime();
    const now = Date.now();
    const hoursLeft = (expiresAt - now) / 3600000;

    if (hasViewed) return 'border-slate-300';
    if (hoursLeft < 1) return 'border-red-500';
    if (hoursLeft < 24) return 'border-amber-500';
    return 'border-emerald-500';
  };

  const handleOpenDeal = (index: number) => {
    setSelectedDealIndex(index);
    store.markDealViewed(activeDeals[index].id);
  };

  const handleNextDeal = () => {
    if (selectedDealIndex !== null && selectedDealIndex < activeDeals.length - 1) {
      const nextIndex = selectedDealIndex + 1;
      setSelectedDealIndex(nextIndex);
      store.markDealViewed(activeDeals[nextIndex].id);
    } else {
      setSelectedDealIndex(null);
    }
  };

  const handlePrevDeal = () => {
    if (selectedDealIndex !== null && selectedDealIndex > 0) {
      const prevIndex = selectedDealIndex - 1;
      setSelectedDealIndex(prevIndex);
      store.markDealViewed(activeDeals[prevIndex].id);
    } else {
      setSelectedDealIndex(null);
    }
  };

  return (
    <>
      <div className="py-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            Hot Deals
          </h3>
          <button 
            onClick={onViewAll}
            className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar px-1">
          {activeDeals.map((deal, index) => {
            const ringColor = getRingColor(deal);
            return (
              <button
                key={deal.id}
                onClick={() => handleOpenDeal(index)}
                className="flex flex-col items-center gap-1.5 shrink-0 w-[72px]"
              >
                <div className={`w-16 h-16 rounded-full p-[3px] border-2 ${ringColor} bg-white shrink-0 relative transition-transform active:scale-95`}>
                  <img
                    src={deal.photos[0]}
                    alt={deal.title}
                    className="w-full h-full rounded-full object-cover"
                  />
                  {deal.isFeatured && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full shadow-xs border border-white">
                      <Flame className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium text-slate-700 truncate w-full text-center">
                  {deal.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDealIndex !== null && (
        <StoryViewer
          deal={activeDeals[selectedDealIndex]}
          deals={activeDeals}
          currentIndex={selectedDealIndex}
          onClose={() => setSelectedDealIndex(null)}
          onNext={handleNextDeal}
          onPrev={handlePrevDeal}
          hasNext={selectedDealIndex < activeDeals.length - 1}
          hasPrev={selectedDealIndex > 0}
        />
      )}
    </>
  );
};

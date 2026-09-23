import React, { useState } from 'react';
import {
  Plus,
  Search,
  Building,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Filter,
  X,
  UserCheck,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { Property } from '../../types';

interface AdminPropertiesViewProps {
  onUploadProperty: () => void;
  onSelectProperty: (property: Property) => void;
}

export const AdminPropertiesView: React.FC<AdminPropertiesViewProps> = ({
  onUploadProperty,
  onSelectProperty,
}) => {
  const store = useSafeNestStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'published' | 'pending' | 'draft'>('all');

  const filteredProperties = store.properties.filter((prop) => {
    // Filter chip
    if (activeFilter === 'published' && prop.status !== 'published') return false;
    if (activeFilter === 'pending' && prop.status !== 'pending') return false;
    if (activeFilter === 'draft' && prop.status !== 'draft') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = prop.title.toLowerCase().includes(q);
      const matchAddr = prop.address.toLowerCase().includes(q);
      const matchLandlord = prop.landlordName?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchAddr && !matchLandlord) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4 pb-28 relative">
      {/* 1. Header with "+" Button Top Right */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900">All Properties</h1>
          <p className="text-xs text-slate-500">
            {store.properties.length} platform listings managed by SafeNest Admin
          </p>
        </div>

        <button
          onClick={onUploadProperty}
          className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xs min-h-[44px] min-w-[44px] transition-colors"
          aria-label="Upload New Property"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Search Bar at Top */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, location, or landlord..."
          className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 shadow-xs min-h-[44px]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. Filter Chips: All, Published, Pending, Draft */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'All', count: store.properties.length },
          { id: 'published', label: 'Published', count: store.properties.filter((p) => p.status === 'published').length },
          { id: 'pending', label: 'Pending', count: store.properties.filter((p) => p.status === 'pending').length },
          { id: 'draft', label: 'Draft', count: store.properties.filter((p) => p.status === 'draft').length },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setActiveFilter(chip.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-h-[38px] flex items-center gap-1.5 transition-colors ${
              activeFilter === chip.id
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{chip.label}</span>
            <span className="text-[10px] opacity-75">({chip.count})</span>
          </button>
        ))}
      </div>

      {/* 4. Property Cards List */}
      <div className="space-y-3">
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
            <Building className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">No properties match your filter</h4>
          </div>
        ) : (
          filteredProperties.map((prop) => {
            const mainImg = prop.images[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';

            // Status Badge: Published (green), Pending (yellow/orange), Draft (grey)
            const statusBadgeColor =
              prop.status === 'published'
                ? 'bg-emerald-100 text-emerald-800'
                : prop.status === 'pending'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-700';

            return (
              <div
                key={prop.id}
                onClick={() => onSelectProperty(prop)}
                className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center justify-between gap-3 min-h-[84px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={mainImg}
                    alt={prop.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                    referrerPolicy="no-referrer"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${statusBadgeColor}`}>
                        {prop.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        UGX {prop.rentAmount.toLocaleString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-slate-900 truncate mt-0.5">
                      {prop.title}
                    </h3>

                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{prop.address}, {prop.city}</span>
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                      <span>Landlord: <strong>{prop.landlordName || 'Unassigned'}</strong></span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </div>
            );
          })
        )}
      </div>

      {/* 5. Floating "+" Button Bottom Right (green) */}
      <button
        onClick={onUploadProperty}
        className="fixed bottom-20 right-4 sm:right-6 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-xl flex items-center justify-center transition-all z-30"
        aria-label="Upload New Property"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};

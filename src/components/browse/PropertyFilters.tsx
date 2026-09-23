import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  Building,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { PropertyType } from '../../types';

export interface FilterState {
  searchQuery: string;
  city: string;
  propertyTypes: PropertyType[];
  minPrice: number;
  maxPrice: number;
  bedrooms: number | 'any';
  bathrooms: number | 'any';
  amenities: string[];
  furnished: 'any' | 'yes' | 'no' | 'partial';
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

interface PropertyFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalResults: number;
}

const AVAILABLE_AMENITIES = [
  'High-speed Fiber WiFi',
  'Standby Generator & Solar Inverter',
  '24/7 Security & CCTV',
  'NWSC Water + 10,000L Reserve Tank',
  'Swimming Pool',
  'Gym & Fitness Studio',
  'Landscaped Garden',
  'Balcony with Ridge View',
  'Dedicated Paved Parking',
  'Air Conditioning',
];

const CITIES = ['All', 'Kampala', 'Entebbe', 'Jinja', 'Wakiso'];

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  onChange,
  totalResults,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount =
    (filters.city !== 'All' ? 1 : 0) +
    filters.propertyTypes.length +
    (filters.maxPrice < 10000000 ? 1 : 0) +
    (filters.bedrooms !== 'any' ? 1 : 0) +
    (filters.bathrooms !== 'any' ? 1 : 0) +
    filters.amenities.length +
    (filters.furnished !== 'any' ? 1 : 0);

  const handleClearAll = () => {
    onChange({
      searchQuery: '',
      city: 'All',
      propertyTypes: [],
      minPrice: 0,
      maxPrice: 10000000,
      bedrooms: 'any',
      bathrooms: 'any',
      amenities: [],
      furnished: 'any',
      sortBy: 'newest',
    });
  };

  const togglePropertyType = (type: PropertyType) => {
    const exists = filters.propertyTypes.includes(type);
    const updated = exists
      ? filters.propertyTypes.filter((t) => t !== type)
      : [...filters.propertyTypes, type];
    onChange({ ...filters, propertyTypes: updated });
  };

  const toggleAmenity = (amenity: string) => {
    const exists = filters.amenities.includes(amenity);
    const updated = exists
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ ...filters, amenities: updated });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs mb-5">
      {/* Top Search Bar & Action Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input with 44px height & non-truncating placeholder */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Kololo, Ntinda, Entebbe, or budget..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 h-11 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors truncate"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Trigger & Sort with 44px touch target */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 h-11 rounded-xl text-xs font-semibold border transition-all min-h-[44px] ${
              isOpen || activeFilterCount > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            aria-label={`Open filters panel. ${activeFilterCount} active filters.`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            className="px-3 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 min-h-[44px]"
            aria-label="Sort listings"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Location Chips Row: Horizontal Scroll Container with Scroll-Snap */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory py-1 px-0.5 -mx-0.5 scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 hidden sm:inline">
          Location:
        </span>
        {CITIES.map((city) => {
          const isSelected = filters.city === city;
          return (
            <button
              key={city}
              onClick={() => onChange({ ...filters, city })}
              className={`shrink-0 snap-start px-4 h-11 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center min-h-[44px] min-w-[44px] ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-xs font-bold ring-2 ring-emerald-600/30'
                  : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-transparent'
              }`}
              aria-pressed={isSelected}
            >
              {city === 'All' ? 'All Locations' : city}
            </button>
          );
        })}
      </div>

      {/* Expanded Advanced Filters Panel */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Property Types */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Property Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['apartment', 'villa', 'house', 'studio', 'commercial'] as PropertyType[]).map(
                  (type) => {
                    const isSelected = filters.propertyTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => togglePropertyType(type)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Max Rent / Month</label>
                <span className="text-xs font-bold text-emerald-700">
                  {filters.maxPrice >= 10000000
                    ? 'USh 10M+'
                    : `USh ${(filters.maxPrice / 1000000).toFixed(1)}M`}
                </span>
              </div>
              <input
                type="range"
                min="500000"
                max="10000000"
                step="250000"
                value={filters.maxPrice}
                onChange={(e) => onChange({ ...filters, maxPrice: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>USh 500k</span>
                <span>USh 5M</span>
                <span>USh 10M+</span>
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Bedrooms</label>
              <div className="flex items-center gap-1">
                {['any', 1, 2, 3, 4].map((b) => (
                  <button
                    key={b}
                    onClick={() => onChange({ ...filters, bedrooms: b as any })}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                      filters.bedrooms === b
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {b === 'any' ? 'Any' : `${b}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Furnished Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Furnishing</label>
              <div className="flex items-center gap-1">
                {[
                  { id: 'any', label: 'Any' },
                  { id: 'yes', label: 'Furnished' },
                  { id: 'partial', label: 'Semi' },
                  { id: 'no', label: 'Unfurn.' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChange({ ...filters, furnished: item.id as any })}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                      filters.furnished === item.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Amenities Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Key Ugandan Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const isSelected = filters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-emerald-700" />}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset Action */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Showing <strong className="text-slate-800">{totalResults}</strong> matching verified properties
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset all filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

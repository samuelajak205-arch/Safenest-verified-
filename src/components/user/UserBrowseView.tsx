import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ShieldCheck,
  ChevronRight,
  Flame,
  Heart,
  Bed,
  Bath,
  MapPin,
  CheckCircle2,
  X,
  Share2,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { Property } from '../../types';
import { getOptimizedImage } from '../../lib/imageUtils';
import { ShareModal } from '../common/ShareModal';
import { HotDealsRow } from '../deals/HotDealsRow';

interface UserBrowseViewProps {
  onSelectProperty: (property: Property) => void;
  onOpenLeases: () => void;
  onNavigateToDeals?: () => void;
}

const LOCATION_CHIPS = ['All Locations', 'Kampala', 'Entebbe', 'Jinja', 'Wakiso'];

export const UserBrowseView: React.FC<UserBrowseViewProps> = ({ onSelectProperty, onOpenLeases, onNavigateToDeals }) => {
  const store = useSafeNestStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sharingProperty, setSharingProperty] = useState<Property | null>(null);

  // FIX 10: Simulate network delay to show skeletons
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter criteria
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [maxRentFilter, setMaxRentFilter] = useState<number>(10000000);
  const [bedroomsFilter, setBedroomsFilter] = useState<string>('any');

  // Filter properties
  const filteredProperties = store.properties
    .filter((prop) => {
      // Must be published for user browse
      if (prop.status !== 'published') return false;

      // Location chip
      if (selectedLocation !== 'All Locations') {
        const matchesCity = prop.city.toLowerCase() === selectedLocation.toLowerCase();
        const matchesNeigh = prop.neighborhood.toLowerCase().includes(selectedLocation.toLowerCase());
        const matchesAddr = prop.address.toLowerCase().includes(selectedLocation.toLowerCase());
        if (!matchesCity && !matchesNeigh && !matchesAddr) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = prop.title.toLowerCase().includes(q);
        const matchAddress = prop.address.toLowerCase().includes(q);
        const matchNeigh = prop.neighborhood.toLowerCase().includes(q);
        const matchCity = prop.city.toLowerCase().includes(q);
        if (!matchTitle && !matchAddress && !matchNeigh && !matchCity) return false;
      }

      // Property type
      if (propertyTypeFilter !== 'all' && prop.propertyType !== propertyTypeFilter) {
        return false;
      }

      // Max rent
      if (prop.rentAmount > maxRentFilter) {
        return false;
      }

      // Bedrooms
      if (bedroomsFilter !== 'any' && prop.bedrooms < parseInt(bedroomsFilter, 10)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.rentAmount - b.rentAmount;
      if (sortBy === 'price_desc') return b.rentAmount - a.rentAmount;
      if (sortBy === 'popular') return b.viewsCount - a.viewsCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-4 pb-28">
      {/* 1. Navy Blue Banner Card (#0F172A) */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2">
          {/* Green Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-fit text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Every photo verified by our team</span>
          </div>

          {/* Text */}
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
            Find verified rentals across Kampala & Entebbe.
          </h2>

          {/* Learn More Link */}
          <button
            onClick={() => setShowLearnMoreModal(true)}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 w-fit mt-1 min-h-[36px]"
          >
            <span>Learn More</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Kololo, Ntinda, Entebbe, or..."
          className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-xs min-h-[44px]"
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

      {/* 3. Row: Filters Button | Sort Dropdown */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setShowFiltersModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-medium text-slate-700 shadow-xs min-h-[44px] transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Filters</span>
          {(propertyTypeFilter !== 'all' || bedroomsFilter !== 'any' || maxRentFilter < 10000000) && (
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          )}
        </button>

        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-xs min-h-[44px]">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-500 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent border-0 text-xs font-semibold text-slate-800 focus:ring-0 focus:outline-hidden py-1 cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* 4. Location Chips (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {LOCATION_CHIPS.map((loc) => {
          const isActive = selectedLocation === loc;
          return (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[40px] ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {loc}
            </button>
          );
        })}
      </div>

      <HotDealsRow onViewAll={onNavigateToDeals} />

      {/* 5. Property Cards (Vertical List) */}
      <div className="space-y-4 pt-1">
        {isLoading ? (
          /* FIX 10: Skeleton Loaders */
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
              <div className="w-full aspect-16/10 bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="flex gap-4 pt-2">
                  <div className="h-3 bg-slate-200 rounded w-12" />
                  <div className="h-3 bg-slate-200 rounded w-12" />
                  <div className="h-3 bg-slate-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-3">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No properties found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              No verified listings match your current filters. Try selecting "All Locations" or clearing search terms.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLocation('All Locations');
                setPropertyTypeFilter('all');
                setMaxRentFilter(10000000);
                setBedroomsFilter('any');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl min-h-[40px]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredProperties.map((property) => {
            const isFav = store.favorites.includes(property.id);
            // FIX 1: Use optimized thumbnail image (400px wide)
            const mainImage = getOptimizedImage(property.images[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 400);

            return (
              <div
                key={property.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Large image at top */}
                <div className="relative aspect-16/10 w-full bg-slate-100 overflow-hidden group">
                  <img
                    src={mainImage}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                    {/* House/Type (dark navy) */}
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-white backdrop-blur-xs">
                      {property.propertyType}
                    </span>

                    {/* Featured (orange #F59E0B) */}
                    {property.isFeatured && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                        <Flame className="w-3 h-3" />
                        Featured
                      </span>
                    )}

                    {/* Verified (green #059669) */}
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  </div>

                  {/* Heart Icon top right */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        store.toggleFavorite(property.id);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-transform active:scale-90 ${
                        isFav
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-900/60 text-white hover:bg-slate-900/80'
                      }`}
                      aria-label={isFav ? 'Remove from saved' : 'Save property'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const hasActiveInspection = store.inspectionBookings.some(
                          (b) => b.propertyId === property.id && b.userId === store.currentUser.id && b.status === 'confirmed'
                        );
                        const locationText = hasActiveInspection ? property.address : `${property.neighborhood}, ${property.city}`;
                        const text = `🏠 ${property.title}\n📍 ${locationText}\n💰 UGX ${property.rentAmount?.toLocaleString()}/month`;
                        const url = `${window.location.origin}/p/${property.id}`;
                        
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: property.title,
                              text,
                              url
                            });
                          } catch (err) {
                            if (err.name !== 'AbortError') {
                              console.error('Share failed', err);
                            }
                          }
                        } else {
                          setSharingProperty(property);
                        }
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-transform active:scale-90 bg-slate-900/60 text-white hover:bg-slate-900/80"
                      aria-label="Share property"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price Tag pill overlay */}
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white font-bold text-xs shadow-xs">
                    UGX {property.rentAmount?.toLocaleString() || '0'}
                    <span className="text-[10px] font-normal text-slate-300">/mo</span>
                  </div>
                </div>

                {/* Below Image: Title, Address, Price, Specs */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1 leading-snug">
                      {property.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{property.address}, {property.city}</span>
                    </p>
                  </div>

                  {/* Specs (Beds / Baths / Furnished) */}
                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-0.5 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="font-semibold text-slate-800">{property.bedrooms}</strong> Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="font-semibold text-slate-800">{property.bathrooms}</strong> Baths
                    </span>
                    <span className="capitalize text-slate-500 text-[11px]">
                      {property.furnished === 'yes' ? 'Furnished' : 'Unfurnished'}
                    </span>
                  </div>

                  {/* "View Details" Button */}
                  <button
                    onClick={() => onSelectProperty(property)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors min-h-[44px] flex items-center justify-center gap-1.5"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Filter Properties</h3>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Property Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Property Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['all', 'apartment', 'house', 'villa', 'condo', 'studio'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setPropertyTypeFilter(t)}
                    className={`py-2 px-2.5 text-xs rounded-xl capitalize font-medium transition-colors min-h-[40px] ${
                      propertyTypeFilter === t
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Minimum Bedrooms</label>
              <div className="grid grid-cols-4 gap-2">
                {['any', '1', '2', '3'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBedroomsFilter(b)}
                    className={`py-2 px-2 text-xs rounded-xl font-medium transition-colors min-h-[40px] ${
                      bedroomsFilter === b
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {b === 'any' ? 'Any' : `${b}+ Beds`}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Rent */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Max Rent (Monthly)</span>
                <span className="font-bold text-emerald-600">
                  UGX {maxRentFilter?.toLocaleString() || '0'}
                </span>
              </div>
              <input
                type="range"
                min={500000}
                max={10000000}
                step={250000}
                value={maxRentFilter}
                onChange={(e) => setMaxRentFilter(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setPropertyTypeFilter('all');
                  setMaxRentFilter(10000000);
                  setBedroomsFilter('any');
                }}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold min-h-[44px]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Learn More Modal */}
      {showLearnMoreModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>SafeNest Verification Standard</span>
              </div>
              <button
                onClick={() => setShowLearnMoreModal(false)}
                className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <p>
                At <strong>SafeNest Uganda</strong>, fake listings and middleman fraud are eliminated. Every house published undergoes mandatory physical photo verification by our Kampala compliance team.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                <li>Physical location check and GPS coordinates</li>
                <li>Uganda National ID (NIN) verified landlords</li>
                <li>Digital lease agreements signed right in the app</li>
                <li>Direct communication with verified owners</li>
              </ul>
            </div>

            <button
              onClick={() => setShowLearnMoreModal(false)}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold min-h-[44px]"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {sharingProperty && (
        <ShareModal
          property={sharingProperty}
          text={(() => {
            const hasActiveInspection = store.inspectionBookings.some(
              (b) => b.propertyId === sharingProperty.id && b.userId === store.currentUser.id && b.status === 'confirmed'
            );
            const locationText = hasActiveInspection ? sharingProperty.address : `${sharingProperty.neighborhood}, ${sharingProperty.city}`;
            return `🏠 ${sharingProperty.title}\n📍 ${locationText}\n💰 UGX ${sharingProperty.rentAmount?.toLocaleString()}/month`;
          })()}
          onClose={() => setSharingProperty(null)}
        />
      )}
    </div>
  );
};

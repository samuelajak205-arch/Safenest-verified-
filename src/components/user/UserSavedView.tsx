import React from 'react';
import { Heart, MapPin, ChevronRight, Bed, Bath, Search } from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { Property } from '../../types';

interface UserSavedViewProps {
  onSelectProperty: (property: Property) => void;
  onBrowseRentals: () => void;
}

export const UserSavedView: React.FC<UserSavedViewProps> = ({ onSelectProperty, onBrowseRentals }) => {
  const store = useSafeNestStore();

  const savedProperties = store.properties.filter((p) => store.favorites.includes(p.id));

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900">Saved Properties</h1>
          <p className="text-xs text-slate-500">
            {savedProperties.length} {savedProperties.length === 1 ? 'home' : 'homes'} bookmarked for review
          </p>
        </div>
      </div>

      {savedProperties.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Heart className="w-7 h-7 text-rose-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">No saved properties yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Tap the heart icon on any property in Browse to keep track of verified rentals you love.
            </p>
          </div>
          <button
            onClick={onBrowseRentals}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs min-h-[44px]"
          >
            Explore Verified Rentals
          </button>
        </div>
      ) : (
        /* Grid of property cards (2 columns on mobile/tablet) */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedProperties.map((property) => {
            const mainImg = property.images[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';

            return (
              <div
                key={property.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="relative aspect-16/10 w-full bg-slate-100">
                  <img
                    src={mainImg}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  {/* Heart button to unsave */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      store.toggleFavorite(property.id);
                    }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
                    aria-label="Remove from saved"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>

                  <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-white text-[11px] font-bold">
                    UGX {property.rentAmount?.toLocaleString() || '0'}
                  </div>
                </div>

                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{property.neighborhood}, {property.city}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3 text-slate-400" />
                      {property.bedrooms} Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3 h-3 text-slate-400" />
                      {property.bathrooms} Baths
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectProperty(property)}
                    className="w-full py-2 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 rounded-xl text-xs font-semibold transition-colors min-h-[40px] flex items-center justify-center gap-1 mt-1"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

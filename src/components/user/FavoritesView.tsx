import React from 'react';
import { Heart, Building2, Search } from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { PropertyCard } from '../browse/PropertyCard';
import { Property } from '../../types';

interface FavoritesViewProps {
  onSelectProperty: (property: Property) => void;
  onBrowse: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  onSelectProperty,
  onBrowse,
}) => {
  const store = useSafeNestStore();
  const favoriteProperties = store.properties.filter((p) => store.favorites.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Saved Properties</h1>
            <p className="text-xs text-slate-500">
              {favoriteProperties.length} saved rental listings across Kampala and Uganda.
            </p>
          </div>
        </div>

        <button
          onClick={onBrowse}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Explore More Rentals
        </button>
      </div>

      {favoriteProperties.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Heart className="w-12 h-12 text-slate-200 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Saved Properties Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any rental listing to save it to your wishlist for easy comparison and booking.
          </p>
          <button
            onClick={onBrowse}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-500 inline-flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            Browse Verified Listings
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProperties.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      )}
    </div>
  );
};

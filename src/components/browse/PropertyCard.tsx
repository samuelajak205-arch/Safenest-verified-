import React from 'react';
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Heart,
  ShieldCheck,
  Camera,
  Flame,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Property } from '../../types';
import { useSafeNestStore } from '../../lib/store';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  showAdminStatus?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  showAdminStatus = false,
}) => {
  const store = useSafeNestStore();
  const isFavorite = store.favorites.includes(property.id);

  const formatCurrency = (amount: number, curr: 'UGX' | 'USD') => {
    if (curr === 'UGX') {
      return `USh ${amount.toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const mainImage =
    property.images.find((img) => img.isMain && img.status !== 'rejected') ||
    property.images.find((img) => img.status === 'approved') ||
    property.images[0];

  const approvedImagesCount = property.images.filter((img) => img.status === 'approved').length;
  const pendingImagesCount = property.images.filter((img) => img.status === 'pending').length;
  const rejectedImagesCount = property.images.filter((img) => img.status === 'rejected').length;

  return (
    <div
      onClick={() => onSelect(property)}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-16/10 w-full bg-slate-100 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
            <Camera className="w-8 h-8 opacity-40" />
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900/80 backdrop-blur-xs text-white capitalize shadow-xs">
              {property.propertyType}
            </span>
            {property.isFeatured && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-current" />
                Featured
              </span>
            )}
            {property.landlordVerified && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-emerald-600/90 text-white flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>

          {/* Favorite Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              store.toggleFavorite(property.id);
            }}
            className="pointer-events-auto p-2 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-red-500 hover:scale-110 shadow-sm transition-all"
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-700'}`}
            />
          </button>
        </div>

        {/* Photo count indicator */}
        <div className="absolute bottom-2.5 right-3 bg-slate-900/75 text-white text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
          <Camera className="w-3 h-3" />
          {property.images.length} photos
        </div>

        {/* Moderation Warning Status Bar if needed */}
        {showAdminStatus && (
          <div className="absolute bottom-2.5 left-3">
            {property.status === 'published' && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-600 text-white flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Published
              </span>
            )}
            {property.status === 'pending' && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500 text-slate-950 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Photo Review ({pendingImagesCount})
              </span>
            )}
            {property.status === 'pending_photos' && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-600 text-white flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {rejectedImagesCount} Photo Rejected
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Currency */}
          <div className="flex items-baseline justify-between mb-1.5">
            <div>
              <span className="text-xl font-extrabold text-emerald-800 tracking-tight">
                {formatCurrency(property.rentAmount, property.currency)}
              </span>
              <span className="text-xs font-medium text-slate-500"> / month</span>
            </div>
            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Dep: {formatCurrency(property.securityDeposit || property.rentAmount, property.currency)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              {property.neighborhood}, {property.city}
            </span>
          </div>
        </div>

        {/* Specs Pill Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1" title="Bedrooms">
            <Bed className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">{property.bedrooms}</span>
            <span className="text-slate-400">bd</span>
          </div>
          <div className="flex items-center gap-1" title="Bathrooms">
            <Bath className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">{property.bathrooms}</span>
            <span className="text-slate-400">ba</span>
          </div>
          {property.squareFeet && (
            <div className="flex items-center gap-1" title="Square Feet">
              <Maximize className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{property.squareFeet.toLocaleString()}</span>
              <span className="text-slate-400">sqft</span>
            </div>
          )}
          <div className="text-[11px] text-slate-400 capitalize">
            {property.furnished === 'yes' ? 'Furnished' : property.furnished === 'partial' ? 'Semi-Furn.' : 'Unfurnished'}
          </div>
        </div>
      </div>
    </div>
  );
};

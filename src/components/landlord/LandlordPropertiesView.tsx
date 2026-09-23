import React, { useState } from 'react';
import {
  Building,
  Info,
  Eye,
  Heart,
  MessageSquare,
  ChevronRight,
  Edit,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { Property } from '../../types';

interface LandlordPropertiesViewProps {
  onSelectProperty: (property: Property) => void;
}

export const LandlordPropertiesView: React.FC<LandlordPropertiesViewProps> = ({ onSelectProperty }) => {
  const store = useSafeNestStore();
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDescription, setEditDescription] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Properties assigned to this landlord
  const myProperties = store.properties.filter(
    (p) => p.landlordId === store.currentUser.id || p.landlordId === 'usr_landlord_001'
  );

  const handleOpenEdit = (prop: Property) => {
    setEditingProperty(prop);
    setEditPrice(prop.rentAmount);
    setEditDescription(prop.description);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    store.updateProperty(editingProperty.id, {
      rentAmount: editPrice,
      description: editDescription,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setEditingProperty(null);
    }, 1000);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* 1. Header: "My Properties" (No "+" button) */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900">My Properties</h1>
          <p className="text-xs text-slate-500">
            {myProperties.length} properties under your verified management
          </p>
        </div>
      </div>

      {/* 2. Info Banner: "Properties are assigned by SafeNest admin" */}
      <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-blue-800">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <p className="leading-snug">
          <strong>Notice:</strong> Properties are assigned by SafeNest admin following physical compliance checks. To request new property onboarding, contact platform operations.
        </p>
      </div>

      {/* 3. Property Cards List */}
      <div className="space-y-4">
        {myProperties.map((property) => {
          const mainImg = property.images[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';
          const isRented = property.status === 'rented';

          return (
            <div
              key={property.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Thumbnail */}
                  <img
                    src={mainImg}
                    alt={property.title}
                    className="w-full sm:w-28 h-24 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      {/* Status Badge: Published (green) / Rented (blue) */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isRented
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isRented ? 'Rented' : 'Published'}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        UGX {property.rentAmount.toLocaleString()} / mo
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {property.address}, {property.city}
                    </p>

                    {/* Stats: views, saves, inquiries */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{property.viewsCount || 45}</strong> views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{property.favoritesCount || 12}</strong> saves
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{property.inquiriesCount || 3}</strong> inquiries
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buttons: "View Details" | "Edit" (limited) */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onSelectProperty(property)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl min-h-[44px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(property)}
                    className="py-2.5 px-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl min-h-[44px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Limited Edit Modal */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Edit Listing (Landlord Controls)
              </h3>
              <button
                onClick={() => setEditingProperty(null)}
                className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess ? (
              <div className="py-8 text-center text-emerald-600 space-y-2">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <h4 className="font-bold text-sm">Listing Updated!</h4>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Monthly Rent (UGX)
                  </label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-400">
                    Adjusts public rental rate across the network.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Description Notes
                  </label>
                  <textarea
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                  Note: Address, bedroom count, and photo uploads are locked to prevent fraud. Contact SafeNest admin for structural modifications.
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingProperty(null)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl min-h-[44px]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

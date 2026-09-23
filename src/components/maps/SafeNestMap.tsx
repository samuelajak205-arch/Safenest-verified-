import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useSafeNestStore } from '../../lib/store';
import { Property, PropertyInspectionBooking } from '../../types';
import { MapPin, Info, ArrowRight } from 'lucide-react';

interface SafeNestMapProps {
  role: 'admin' | 'user' | 'landlord';
  selectedPropertyId?: string;
  onPropertyClick?: (propertyId: string) => void;
}

const MAP_STYLE_ID = 'DEMO_MAP_ID'; // Replace with a real Map ID from GCP for production

// Component to handle dynamic map panning
const MapUpdater: React.FC<{ selectedProperty?: Property; role: string; store: any }> = ({ selectedProperty, role, store }) => {
  const map = useMap();

  useEffect(() => {
    if (map && selectedProperty) {
      const visibility = getVisibilityForUser(store, selectedProperty, role);
      const lat = visibility.canSeeExact ? selectedProperty.exactLatitude : selectedProperty.neighborhoodLatitude;
      const lng = visibility.canSeeExact ? selectedProperty.exactLongitude : selectedProperty.neighborhoodLongitude;
      
      if (lat && lng) {
        map.panTo({ lat, lng });
        map.setZoom(visibility.canSeeExact ? 16 : 14);
      }
    }
  }, [map, selectedProperty, role, store]);

  return null;
};

// Helper to determine what a user can see
const getVisibilityForUser = (store: any, property: Property, role: string) => {
  if (role === 'super_admin' || role === 'admin' || (role === 'landlord' && property.landlordId === store.currentUser.id)) {
    return {
      canSeeExact: true,
      reason: 'Admin/Owner Access',
    };
  }

  // Check bookings for regular user
  const now = new Date().getTime();
  const bookings = store.inspectionBookings.filter((b: PropertyInspectionBooking) => b.userId === store.currentUser.id && b.propertyId === property.id);
  
  for (const b of bookings) {
    if (b.status === 'confirmed' && b.addressRevealed) {
      if (b.revealExpiresAt && new Date(b.revealExpiresAt).getTime() > now) {
        if (b.type === 'in_person') {
          return {
            canSeeExact: true,
            reason: `In-Person Inspection (Expires: ${new Date(b.revealExpiresAt).toLocaleString()})`,
            watermark: `Viewed by ${store.currentUser.fullName} · ${new Date().toLocaleString()}`
          };
        }
      }
    }
  }

  return {
    canSeeExact: false,
    reason: 'Public View'
  };
};

export const SafeNestMap: React.FC<SafeNestMapProps> = ({ role, selectedPropertyId, onPropertyClick }) => {
  const store = useSafeNestStore();
  const [apiKey, setApiKey] = useState<string | null>((import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || null);
  const [showKeyPrompt, setShowKeyPrompt] = useState(!apiKey);
  const [tempKey, setTempKey] = useState('');

  // Mocking the Map Provider to prompt for key if missing
  if (showKeyPrompt) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Google Maps Integration</h3>
        <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
          To view the map, please provide a Google Maps API Key or a Maps Demo Key.
        </p>
        <div className="flex items-center gap-2 max-w-sm mx-auto">
          <input
            type="text"
            placeholder="AIzaSy..."
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
          <button
            onClick={() => {
              if (tempKey.trim()) {
                setApiKey(tempKey.trim());
                setShowKeyPrompt(false);
              }
            }}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm"
          >
            Load Map
          </button>
        </div>
      </div>
    );
  }

  if (!apiKey) return null;

  const defaultCenter = { lat: 0.3475, lng: 32.5825 }; // Kampala center

  const selectedProperty = store.properties.find(p => p.id === selectedPropertyId);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-inner border border-slate-200/90">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={12}
          mapId={MAP_STYLE_ID}
          disableDefaultUI={true}
          gestureHandling="greedy"
        >
          <MapUpdater selectedProperty={selectedProperty} role={role} store={store} />
          
          {store.properties.map((prop) => {
            const visibility = getVisibilityForUser(store, prop, role);
            
            // If they can't see exact, use the neighborhood coords
            const lat = visibility.canSeeExact ? prop.exactLatitude : prop.neighborhoodLatitude;
            const lng = visibility.canSeeExact ? prop.exactLongitude : prop.neighborhoodLongitude;

            // Only render if coordinates exist
            if (!lat || !lng) return null;

            return (
              <AdvancedMarker
                key={prop.id}
                position={{ lat, lng }}
                onClick={() => onPropertyClick && onPropertyClick(prop.id)}
              >
                {visibility.canSeeExact ? (
                  // Exact Pin
                  <div className={`relative ${prop.id === selectedPropertyId ? 'scale-125 z-50' : 'scale-100 z-10'} transition-transform cursor-pointer`}>
                    <div className={`w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white
                      ${prop.status === 'published' ? 'bg-emerald-600' : 
                        prop.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}
                    `}>
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  // Neighborhood Circle Approximation
                  <div className={`relative ${prop.id === selectedPropertyId ? 'scale-110 z-50' : 'scale-100 z-10'} transition-transform cursor-pointer`}>
                    <div className="w-16 h-16 rounded-full bg-emerald-500/30 border-2 border-emerald-500/50 flex items-center justify-center backdrop-blur-sm">
                       <span className="text-[10px] font-bold text-emerald-900 bg-white/80 px-1.5 rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                         {prop.neighborhood}
                       </span>
                    </div>
                  </div>
                )}
              </AdvancedMarker>
            );
          })}

          {/* Watermark for Booked Viewers */}
          {store.properties.map(prop => {
             const vis = getVisibilityForUser(store, prop, role);
             if (vis.watermark && prop.id === selectedPropertyId) {
               return (
                 <div key={`wm_${prop.id}`} className="absolute top-4 left-4 z-50 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-emerald-200 shadow-sm pointer-events-none">
                    <p className="text-[10px] font-mono text-emerald-800 font-bold">{vis.watermark}</p>
                 </div>
               )
             }
             return null;
          })}
        </Map>
      </APIProvider>

      {/* Map Banner Overlay */}
      {role === 'user' && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-emerald-100 shadow-sm flex gap-2 items-start">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-700 font-medium">
            <strong>Location Privacy:</strong> Exact addresses are revealed only after booking an inspection to protect our verified landlords.
          </p>
        </div>
      )}
    </div>
  );
};

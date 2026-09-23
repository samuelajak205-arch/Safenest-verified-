import React, { useState } from 'react';
import { UserCheck, X, CheckCircle2, Building, ShieldCheck } from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';

interface AssignPropertyModalProps {
  onClose: () => void;
}

export const AssignPropertyModal: React.FC<AssignPropertyModalProps> = ({ onClose }) => {
  const store = useSafeNestStore();
  const [selectedPropertyId, setSelectedPropertyId] = useState(store.properties[0]?.id || '');
  const [selectedLandlordId, setSelectedLandlordId] = useState('usr_landlord_001');
  const [assigned, setAssigned] = useState(false);

  // Verified landlords available on the platform
  const landlords = [
    { id: 'usr_landlord_001', name: 'Grace Nakimera', phone: '+256 772 334 112', email: 'grace.nakimera@gmail.com' },
    { id: 'usr_applicant_001', name: 'Sarah Namubiru', phone: '+256 701 992 481', email: 'sarah.namubiru@ura.go.ug' },
    { id: 'usr_applicant_002', name: 'Eng. Patrick Kigozi', phone: '+256 752 884 100', email: 'p.kigozi@bukotoestates.ug' },
  ];

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const landlord = landlords.find((l) => l.id === selectedLandlordId);
    if (!landlord || !selectedPropertyId) return;

    store.assignPropertyToLandlord(selectedPropertyId, landlord.id, landlord.name);
    setAssigned(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Assign Property to Landlord</h3>
              <p className="text-[11px] text-slate-500">Platform owner administrative assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {assigned ? (
          <div className="py-8 text-center text-emerald-600 space-y-2">
            <CheckCircle2 className="w-12 h-12 mx-auto" />
            <h4 className="font-bold text-sm">Assignment Confirmed!</h4>
            <p className="text-xs text-slate-500">
              The property has been linked to the verified landlord's portal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleAssign} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Select Property
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 min-h-[44px]"
              >
                {store.properties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.title} ({prop.city}) — Currently: {prop.landlordName || 'Unassigned'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Select Verified Landlord
              </label>
              <div className="space-y-2">
                {landlords.map((landlord) => {
                  const isSelected = selectedLandlordId === landlord.id;
                  return (
                    <div
                      key={landlord.id}
                      onClick={() => setSelectedLandlordId(landlord.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                          {landlord.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-slate-900">{landlord.name}</h4>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <p className="text-[11px] text-slate-500">{landlord.phone}</p>
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl min-h-[44px] shadow-xs"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useSafeNestStore } from '../../lib/store';
import { Property } from '../../types';
import {
  Video,
  MapPin,
  CheckCircle2,
  Calendar as CalendarIcon,
  Phone,
  ShieldCheck,
  Upload,
  ArrowRight,
  Share2,
  Info,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { ShareModal } from '../common/ShareModal';

interface InspectionBookingFormProps {
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
}

export const InspectionBookingForm: React.FC<InspectionBookingFormProps> = ({ property, onClose, onSuccess }) => {
  const store = useSafeNestStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<'virtual' | 'in_person' | 'premium' | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Verification state for In-Person
  const [phoneCode, setPhoneCode] = useState('1234'); // Auto prefilled code for slick experience
  const [verificationSent, setVerificationSent] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const getPrice = (): number => {
    if (type === 'virtual') return property.inspectionPriceVirtual ?? 5000;
    if (type === 'premium') return property.inspectionPricePremium ?? 25000;
    return property.inspectionPriceInPerson ?? 15000;
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(11, 0, 0, 0);

  const formattedDate = tomorrow.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const handleBook = () => {
    if (!type) return;
    const price = getPrice();
    store.bookInspection(property.id, type, tomorrow.toISOString(), price, 'momo');
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 w-full max-w-md sm:rounded-3xl rounded-t-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 shrink-0">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Book Inspection</span>
            <h2 className="text-sm font-black text-slate-900 truncate max-w-[250px]">{property.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-0.5">
          {/* STEP 1: CHOOSE SERVICE TYPE */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-800">Select an Inspection Tour Type:</p>
              
              {/* Virtual Tour */}
              <div 
                onClick={() => setType('virtual')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-3 ${type === 'virtual' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200 bg-white'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${type === 'virtual' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Video className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-sm text-slate-900 flex justify-between items-center">
                    <span>Virtual Tour</span>
                    {type === 'virtual' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Live video walk-through guided by a SafeNest agent.</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 font-mono">
                    <span className="text-emerald-700 font-extrabold">UGX {(property.inspectionPriceVirtual ?? 5000).toLocaleString()}</span>
                    <span>·</span>
                    <span>30 MIN</span>
                  </div>
                </div>
              </div>

              {/* In Person Tour */}
              <div 
                onClick={() => setType('in_person')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-3 ${type === 'in_person' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200 bg-white'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${type === 'in_person' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-sm text-slate-900 flex justify-between items-center">
                    <span>In-Person Visit</span>
                    {type === 'in_person' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Unlock the exact coordinates and meet the agent at the site.</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-400 flex-wrap font-mono">
                    <span className="text-emerald-700 font-extrabold">UGX {(property.inspectionPriceInPerson ?? 15000).toLocaleString()}</span>
                    <span>·</span>
                    <span>45 MIN</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded font-sans">
                      <ShieldAlert className="w-3 h-3" /> NIN REQUIRED
                    </span>
                  </div>
                </div>
              </div>

              {/* Premium Tour (Optional) */}
              {property.inspectionPricePremium && (
                <div 
                  onClick={() => setType('premium')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-3 ${type === 'premium' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200 bg-white'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${type === 'premium' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-sm text-slate-900 flex justify-between items-center">
                      <span>Premium Guided Tour</span>
                      {type === 'premium' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Private extended showing, neighborhood briefing, and legal package details.</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-400 flex-wrap font-mono">
                      <span className="text-emerald-700 font-extrabold">UGX {property.inspectionPricePremium.toLocaleString()}</span>
                      <span>·</span>
                      <span>60 MIN</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded font-sans">
                        <ShieldAlert className="w-3 h-3" /> NIN REQUIRED
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Info Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>How Payment Works:</span>
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Pay the agent directly via <strong>Mobile Money</strong> or <strong>cash</strong>. SafeNest does not process payments and does not charge hidden fees.
                </p>
              </div>

              <button
                disabled={!type}
                onClick={() => setStep(2)}
                className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 mt-2 transition-colors ${type ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/10' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: CONFIRMATION & AGREEMENT */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Selected Tour</h3>
                <div className="flex gap-2.5 items-center">
                  <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                    {type === 'virtual' ? <Video className="w-4.5 h-4.5" /> : <MapPin className="w-4.5 h-4.5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 capitalize">{type?.replace('_', ' ')}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{property.title}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Scheduled Date</span>
                    <span className="font-extrabold text-slate-800">{formattedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Scheduled Time</span>
                    <span className="font-extrabold text-slate-800">11:00 AM EAT</span>
                  </div>
                </div>
              </div>

              {/* In-Person NIN Verification Info */}
              {(type === 'in_person' || type === 'premium') && (
                <div className="p-3.5 border border-slate-200 bg-amber-50/40 rounded-2xl space-y-2.5">
                  <div className="flex gap-1.5 text-amber-900 items-start">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold leading-none">Security Endorsement Verified</p>
                      <p className="text-[10px] text-slate-600 mt-1 leading-normal">
                        To protect verified hosts, you must complete your verification in the app before arriving.
                      </p>
                    </div>
                  </div>
                  
                  {/* Mock Upload/Verify */}
                  <div className="flex gap-2 text-[10px]">
                    <div className="flex-1 py-1 px-2 border border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-bold text-slate-700">NIN Uploaded</span>
                    </div>
                    <div className="flex-1 py-1 px-2 border border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-bold text-slate-700">Phone Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Direct Payment Instructions */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Amount to Pay</span>
                  <span className="text-sm font-black text-emerald-700">UGX {getPrice().toLocaleString()}</span>
                </div>

                <div className="pt-2.5 border-t border-slate-200 space-y-2">
                  <p className="text-[11px] font-bold text-slate-700">Pay the Agent directly via:</p>
                  <div className="grid grid-cols-1 gap-1.5 text-[10px] font-semibold text-slate-600 pl-1.5">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mobile Money: <strong>{property.landlordPhone || '+256 772 300 450'}</strong> ({property.landlordName})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>💵</span>
                      <span>Or Cash on Arrival</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agreement checkbox */}
              <label className="flex items-start gap-2.5 p-2.5 bg-emerald-50/40 rounded-xl cursor-pointer select-none border border-emerald-200/40">
                <input 
                  type="checkbox" 
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 shrink-0" 
                />
                <span className="text-[11px] text-slate-600 leading-normal font-medium">
                  I agree to pay <strong>UGX {getPrice().toLocaleString()}</strong> directly to the agent and will notify them in my dashboard when paid.
                </span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  disabled={!agreedTerms}
                  onClick={handleBook}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors ${agreedTerms ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/10' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <div>
                <h2 className="text-xl font-black text-slate-900">Inspection Scheduled!</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Your booking has been added to your dashboard. Pay the agent and mark it as "I've Paid".
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 mt-4 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="text-slate-900">{formattedDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Time</span>
                  <span className="text-slate-900">11:00 AM EAT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Amount Due</span>
                  <span className="text-emerald-700">UGX {getPrice().toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <button
                  onClick={() => {
                    const text = encodeURIComponent(`SafeNest Inspection: ${property.title}`);
                    const details = encodeURIComponent(`Inspection for ${property.title} in ${property.neighborhood}, ${property.city}.`);
                    const startStr = tomorrow.toISOString().replace(/-|:|\.\d\d\d/g, '');
                    tomorrow.setMinutes(30);
                    const endStr = tomorrow.toISOString().replace(/-|:|\.\d\d\d/g, '');
                    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startStr}/${endStr}&details=${details}`, '_blank');
                  }}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Add to Google Calendar
                </button>

                <button
                  onClick={async () => {
                    const text = `📅 Inspection Scheduled!\n🏠 ${property.title}\n📍 ${type === 'in_person' ? property.address : `${property.neighborhood}, ${property.city}`}\n⏰ ${formattedDate} at 11:00 AM EAT`;
                    const url = `${window.location.origin}/p/${property.id}`;
                    
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: `SafeNest Inspection Booking`,
                          text,
                          url
                        });
                      } catch (err) {
                        if (err.name !== 'AbortError') {
                          console.error('Share failed', err);
                        }
                      }
                    } else {
                      setShowShareModal(true);
                    }
                  }}
                  className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share with Family
                </button>
              </div>

              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 transition-colors text-white rounded-xl font-bold text-xs mt-2"
              >
                Go to Inspections Inbox
              </button>
            </div>
          )}

        </div>
      </div>
      {showShareModal && (
        <ShareModal
          title="SafeNest Inspection Booking"
          text={`📅 Inspection Scheduled!\n🏠 ${property.title}\n📍 ${type === 'in_person' ? property.address : `${property.neighborhood}, ${property.city}`}\n⏰ ${formattedDate} at 11:00 AM EAT`}
          url={`${window.location.origin}/p/${property.id}`}
          imageUrl={property.images?.[0]?.url}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Calendar,
  Clock,
  Users,
  Dog,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Send,
  Sparkles,
  ArrowRight,
  User,
  ExternalLink
} from 'lucide-react';
import { Property, RentalApplicationDoc, RentalApplication } from '../../types';
import { useSafeNestStore } from '../../lib/store';

interface RentalApplicationModalProps {
  property: Property;
  onClose: () => void;
  onSuccess: (appId: string) => void;
}

export const RentalApplicationModal: React.FC<RentalApplicationModalProps> = ({
  property,
  onClose,
  onSuccess,
}) => {
  const store = useSafeNestStore();
  const user = store.currentUser;

  // Calculate default move-in date (1st of next month)
  const getDefaultMoveInDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    const yyyy = nextMonth.getFullYear();
    const mm = String(nextMonth.getMonth() + 1).padStart(2, '0');
    const dd = String(nextMonth.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const defaultMoveInDate = getDefaultMoveInDate();

  // Find previous applications for Express Apply logic
  const previousApp = store.rentalApplications.find(
    (a) => a.tenantId === user.id || a.tenantEmail === user.email
  );

  // Modal Views: 'express_apply' | 'four_questions' | 'success' | 'profile_incomplete'
  const [currentView, setCurrentView] = useState<'express_apply' | 'four_questions' | 'success' | 'profile_incomplete'>(() => {
    // Check if profile is complete (Name, Phone, and either national ID/NIN or Admin role override)
    const isComplete = user.fullName && user.phone && (user.nationalId || user.nationalIdNumber || user.role === 'super_admin');
    if (!isComplete) {
      return 'profile_incomplete';
    }
    // If has previously applied, prompt with Express Apply
    if (previousApp) {
      return 'express_apply';
    }
    return 'four_questions';
  });

  // State for the 4 questions
  const [moveInDate, setMoveInDate] = useState<string>(defaultMoveInDate);
  const [duration, setDuration] = useState<6 | 12 | 24>(12);
  const [occupants, setOccupants] = useState<'just_me' | 'partner' | 'family'>('just_me');
  const [pets, setPets] = useState<'none' | 'cat' | 'dog'>('none');
  const [landlordNotes, setLandlordNotes] = useState<string>('');

  // Submitted Application state to render after success
  const [submittedAppId, setSubmittedAppId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Validation: Check for existing active application for the same property
  const alreadyApplied = store.rentalApplications.some(
    (a) => a.propertyId === property.id && (a.tenantId === user.id || a.tenantEmail === user.email)
  );

  const handleNavigateToEditProfile = () => {
    onClose();
    // Dispatch custom navigation event to trigger view switch in App.tsx
    window.dispatchEvent(new CustomEvent('safenest-navigate', { detail: 'profile-edit' }));
  };

  const handleNavigateToApplications = () => {
    onClose();
    window.dispatchEvent(new CustomEvent('safenest-navigate', { detail: 'tenant_applications' }));
  };

  const handleNavigateToBrowse = () => {
    onClose();
    window.dispatchEvent(new CustomEvent('safenest-navigate', { detail: 'browse' }));
  };

  const handleSubmit = (useSavedDefaults = false) => {
    if (alreadyApplied) {
      alert(`You have already submitted an active tenancy application for ${property.title}.`);
      return;
    }

    setIsSubmitting(true);

    // Resolve details for auto-attaching
    const finalMoveInDate = useSavedDefaults && previousApp ? (previousApp.preferences?.moveInDate || defaultMoveInDate) : moveInDate;
    const finalDuration = useSavedDefaults && previousApp ? (previousApp.preferences?.leaseDurationMonths || 12) : duration;
    const finalOccupants = useSavedDefaults && previousApp ? (previousApp.preferences?.occupantsCount === 1 ? 'just_me' : previousApp.preferences?.occupantsCount === 2 ? 'partner' : 'family') : occupants;
    const finalPets = useSavedDefaults && previousApp ? (previousApp.preferences?.hasPets ? 'dog' : 'none') : pets;
    const finalNotes = useSavedDefaults ? 'Submitted instantly via Express Apply' : landlordNotes;

    setTimeout(() => {
      // Package details following the exact database schema & required auto-attach rule
      const createdApp = store.submitRentalApplication({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImage: property.images[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        propertyAddress: property.address,
        propertyCity: property.city,
        rentAmount: property.rentAmount,
        tenantId: user.id,
        tenantName: user.fullName,
        tenantEmail: user.email,
        tenantPhone: user.phone || '+256 755 889 004',
        landlordId: property.landlordId,
        landlordName: property.landlordName,
        personalInfo: {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || '+256 755 889 004',
          dob: user.dateOfBirth || '1995-10-12',
          nationalIdNumber: user.nationalIdNumber || user.nationalId || 'CM92014728X4KA',
          currentAddress: 'Bukoto, Kampala',
          maritalStatus: 'Single',
          nextOfKinName: user.emergencyContactName || 'Dorothy Namukasa',
          nextOfKinPhone: user.emergencyContactPhone || '+256 772 889 001',
        },
        employmentInfo: {
          employmentStatus: (user.occupation?.toLowerCase() === 'student' ? 'student' : 'employed') as any,
          employerName: user.companyName || 'International Fintech',
          jobTitle: user.occupation || 'Software Engineer',
          monthlyIncome: user.budgetMax ? user.budgetMax * 3 : 8500000,
          durationYears: 3,
          officeAddress: 'Plot 69-71 Jinja Road, Kampala',
        },
        rentalHistory: {
          previousLandlordName: 'Sarah K.',
          previousLandlordPhone: '+256 700 123 456',
          previousAddress: 'Ntinda Apartments Block 2, Kampala',
          reasonForMoving: 'Seeking larger space closer to work and quiet neighborhood',
          lengthOfStayMonths: 24,
        },
        references: [
          {
            name: 'Dr. Arthur Ssekandi',
            phone: '+256 782 554 112',
            relationship: 'Professional Mentor',
            organization: 'Makerere University',
          },
        ],
        preferences: {
          moveInDate: finalMoveInDate,
          leaseDurationMonths: finalDuration as 6 | 12 | 24,
          occupantsCount: finalOccupants === 'just_me' ? 1 : finalOccupants === 'partner' ? 2 : 3,
          hasPets: finalPets !== 'none',
          petDetails: finalPets !== 'none' ? finalPets : '',
          vehicleCount: 1,
        },
        documents: [
          {
            id: 'doc_nin_auto',
            name: 'Uganda_NIN_Document.pdf',
            type: 'national_id',
            url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
            uploadedAt: new Date().toISOString(),
          },
          {
            id: 'doc_pay_auto',
            name: 'Recent_3_Months_Payslips.pdf',
            type: 'payslip',
            url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
            uploadedAt: new Date().toISOString(),
          },
        ],
        landlordNotes: finalNotes,
      });

      setSubmittedAppId(createdApp.id);
      setIsSubmitting(false);
      setCurrentView('success');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* HEADER SECTION */}
        <div className="px-5 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">Apply for Tenancy</h2>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{property.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-all"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* MAIN BODY SCROLLABLE VIEW */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-slate-800">

          {/* VIEW A: PROFILE INCOMPLETE CHECK */}
          {currentView === 'profile_incomplete' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Complete Your Profile First</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-normal px-4">
                  To keep SafeNest Kampala safe and secure, landlords require a verified phone number and active National ID (NIN) before you can submit applications.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-left text-xs space-y-1.5">
                <p className="font-bold text-slate-700">Missing checklist items:</p>
                <div className="space-y-1 text-slate-500">
                  {!user.fullName && <p className="flex items-center gap-2">❌ Full Name</p>}
                  {!user.phone && <p className="flex items-center gap-2">❌ Verified Phone Number</p>}
                  {!(user.nationalId || user.nationalIdNumber) && <p className="flex items-center gap-2">❌ Uganda National ID / NIN registration</p>}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNavigateToEditProfile}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-colors"
                >
                  Complete Profile & Verify
                </button>
              </div>
            </div>
          )}

          {/* VIEW B: EXPRESS APPLY (RETURNING USERS) */}
          {currentView === 'express_apply' && (
            <div className="space-y-5">
              {/* Trust Badge */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex gap-3 text-left">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    Verified Profile Active <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                  </h4>
                  <p className="text-[10.5px] text-emerald-850 mt-0.5 leading-normal">
                    SafeNest auto-attaches your verified Uganda National ID, income statement, and references from your secure credentials.
                  </p>
                </div>
              </div>

              {/* Express Info Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5 text-left">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    ⚡ Express Apply Active
                  </span>
                  <span className="text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Saves Time
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Submit with your previous verified preferences:
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-700">
                  <p className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Move-in: <strong className="text-slate-950">{defaultMoveInDate}</strong></span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Lease Term: <strong className="text-slate-950">{previousApp?.preferences?.leaseDurationMonths || 12} Months</strong></span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Occupants: <strong className="text-slate-950">{previousApp?.preferences?.occupantsCount === 1 ? 'Just you' : previousApp?.preferences?.occupantsCount === 2 ? 'Two people' : 'Family'}</strong></span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Dog className="w-4 h-4 text-slate-400" />
                    <span>Pets: <strong className="text-slate-950">{previousApp?.preferences?.hasPets ? 'Yes' : 'No'}</strong></span>
                  </p>
                </div>
              </div>

              {/* Duplicate apply checker */}
              {alreadyApplied ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-center space-y-2">
                  <p className="text-xs text-amber-800 font-medium">
                    ⚠️ You already have an active application submitted for this property.
                  </p>
                  <button
                    type="button"
                    onClick={handleNavigateToApplications}
                    className="text-xs font-bold text-amber-900 underline flex items-center justify-center gap-1 mx-auto"
                  >
                    View My Applications <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmit(true)}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Apply in 1 Tap'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentView('four_questions')}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all text-center"
                  >
                    Change Details
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW C: THE 4-QUESTION QUICK FORM */}
          {currentView === 'four_questions' && (
            <div className="space-y-5 text-left">
              
              {/* Header profile status banner */}
              <div className="flex items-center justify-between text-xs p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl font-bold text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Your profile is complete
                </span>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">
                  Verified
                </span>
              </div>

              <div className="space-y-4 pt-1">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Confirm your details:
                </h4>

                {/* 1. Move-In Date */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    📅 Move-in date
                  </label>
                  <input
                    type="date"
                    required
                    value={moveInDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Defaulted to the 1st of next month.</p>
                </div>

                {/* 2. Lease Duration Selector Buttons */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    ⏱️ How long?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 6, label: '6 mo' },
                      { val: 12, label: '12 mo' },
                      { val: 24, label: '24 mo' }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.val}
                        onClick={() => setDuration(item.val as any)}
                        className={`py-2.5 text-xs font-black rounded-xl border transition-all text-center ${
                          duration === item.val
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Occupants Selector Buttons */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    👥 Who's moving in?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'just_me', label: 'Just me' },
                      { val: 'partner', label: 'Partner' },
                      { val: 'family', label: 'Family' }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.val}
                        onClick={() => setOccupants(item.val as any)}
                        className={`py-2.5 text-xs font-black rounded-xl border transition-all text-center ${
                          occupants === item.val
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Pets Selector Buttons */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    🐕 Pets?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'none', label: 'No' },
                      { val: 'cat', label: 'Cat' },
                      { val: 'dog', label: 'Dog' }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.val}
                        onClick={() => setPets(item.val as any)}
                        className={`py-2.5 text-xs font-black rounded-xl border transition-all text-center ${
                          pets === item.val
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* OPTIONAL: Personal message with explicit [Skip] indicator */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      📝 Add optional notes to landlord
                    </label>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-bold uppercase">
                      Skip
                    </span>
                  </div>
                  <textarea
                    value={landlordNotes}
                    onChange={(e) => setLandlordNotes(e.target.value)}
                    placeholder="e.g. Any special requests, parking queries, etc."
                    rows={2}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* AUTO-ATTACH VISUAL PREVIEW BAR */}
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex items-start gap-2.5">
                <FileText className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-normal text-slate-500">
                  <strong className="text-slate-700 font-bold">Auto-attached profile bundle:</strong>
                  <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[10px] text-slate-400 mt-1 font-semibold">
                    <span>✓ NIN Photo</span>
                    <span>|</span>
                    <span>✓ Payslips (PDF)</span>
                    <span>|</span>
                    <span>✓ Employment Contract</span>
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              {alreadyApplied ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    ⚠️ You already submitted a tenancy application for this property.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(false)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          )}

          {/* VIEW D: SUCCESS TIMELINE SCREEN */}
          {currentView === 'success' && (
            <div className="space-y-6 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <div>
                <h4 className="text-base font-black text-slate-900">Application Submitted</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed px-2">
                  Your application for <strong className="text-slate-800">{property.title}</strong> has been sent to the landlord. You'll hear back within 24 hours.
                </p>
              </div>

              {/* Timeline with dots */}
              <div className="border-t border-b border-slate-100 py-4 text-left space-y-4">
                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  What happens next:
                </h5>

                <div className="space-y-3.5 pl-3 text-xs font-semibold">
                  {[
                    { step: '1', title: 'Landlord Reviews', desc: 'Grace Nakimera evaluates your verified dossier (24 hrs)', active: true },
                    { step: '2', title: 'Schedule Inspection', desc: 'Secure an in-person physical inspection date', active: false },
                    { step: '3', title: 'Sign digital Lease', desc: 'Draft lease and sign with secure contracts', active: false },
                    { step: '4', title: 'Move in!', desc: 'Collect verified keys and settle into Kololo', active: false },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="relative flex flex-col items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          item.active 
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {item.step}
                        </span>
                        {idx < 3 && <span className="w-0.5 h-full bg-slate-100 mt-1"></span>}
                      </div>
                      <div>
                        <p className={`text-xs ${item.active ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                          {item.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium leading-normal">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NAVIGATION FLOW ACTIONS */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleNavigateToApplications}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors"
                >
                  View My Applications
                </button>
                
                <button
                  type="button"
                  onClick={handleNavigateToBrowse}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Browse More Properties
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

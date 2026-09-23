import React, { useState, useEffect } from 'react';
import { useSafeNestStore } from '../../lib/store';
import { 
  ArrowLeft, 
  Camera, 
  CheckCircle2, 
  MapPin, 
  Smartphone, 
  Mail, 
  User, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  ShieldCheck, 
  Wallet, 
  X, 
  Info,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../../types';

interface EditProfileViewProps {
  onBack: () => void;
}

const NEIGHBORHOODS_OPTIONS = [
  'Kololo',
  'Ntinda',
  'Bugolobi',
  'Kisasi',
  'Nakasero',
  'Muyenga',
  'Kansanga',
  'Bukoto',
  'Naalya',
  'Makindye'
];

export const EditProfileView: React.FC<EditProfileViewProps> = ({ onBack }) => {
  const store = useSafeNestStore();
  const user = store.currentUser;

  // Form states
  const [fullName, setFullName] = useState(user.fullName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '');
  const [occupation, setOccupation] = useState(user.occupation || 'Employed');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');

  // Role-specific User (Tenant) states
  const [preferredNeighborhoods, setPreferredNeighborhoods] = useState<string[]>(user.preferredNeighborhoods || ['Kololo', 'Ntinda']);
  const [budgetMin, setBudgetMin] = useState<number>(user.budgetMin || 500000);
  const [budgetMax, setBudgetMax] = useState<number>(user.budgetMax || 2500000);
  const [emergencyContactName, setEmergencyContactName] = useState(user.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user.emergencyContactPhone || '');

  // Role-specific Landlord states
  const [businessName, setBusinessName] = useState(user.businessName || '');
  const [tinNumber, setTinNumber] = useState(user.tinNumber || '1012938472');
  const [tinVerified, setTinVerified] = useState(user.tinVerified ?? true);
  const [payoutMethod, setPayoutMethod] = useState(user.payoutMethod || 'MTN MoMo');
  const [payoutNumber, setPayoutNumber] = useState(user.payoutNumber || '');

  // Role-specific Admin states
  const [supportEmail, setSupportEmail] = useState(user.supportEmail || 'support@safenest.ug');
  const [supportPhone, setSupportPhone] = useState(user.supportPhone || '+256 700 123 456');
  const [primaryColor, setPrimaryColor] = useState(user.primaryColor || '#059669');

  // UI Control states
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showPhoneVerifyModal, setShowPhoneVerifyModal] = useState(false);
  const [showEmailVerifyModal, setShowEmailVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check if form is dirty
  const isDirty = 
    fullName !== (user.fullName || '') ||
    phone !== (user.phone || '') ||
    email !== (user.email || '') ||
    dateOfBirth !== (user.dateOfBirth || '') ||
    occupation !== (user.occupation || 'Employed') ||
    avatarUrl !== (user.avatarUrl || '') ||
    JSON.stringify(preferredNeighborhoods) !== JSON.stringify(user.preferredNeighborhoods || ['Kololo', 'Ntinda']) ||
    budgetMin !== (user.budgetMin || 500000) ||
    budgetMax !== (user.budgetMax || 2500000) ||
    emergencyContactName !== (user.emergencyContactName || '') ||
    emergencyContactPhone !== (user.emergencyContactPhone || '') ||
    businessName !== (user.businessName || '') ||
    tinNumber !== (user.tinNumber || '') ||
    payoutMethod !== (user.payoutMethod || 'MTN MoMo') ||
    payoutNumber !== (user.payoutNumber || '') ||
    supportEmail !== (user.supportEmail || 'support@safenest.ug') ||
    supportPhone !== (user.supportPhone || '+256 700 123 456') ||
    primaryColor !== (user.primaryColor || '#059669');

  // Handle image upload mock
  const handlePhotoAction = (actionType: 'take' | 'choose' | 'remove') => {
    setShowPhotoOptions(false);
    if (actionType === 'remove') {
      setAvatarUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');
      showToast('Profile photo removed.');
    } else {
      // Mock compression and upload to Supabase avatars/user_id.jpg
      const mockAvatars = [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150'
      ];
      const randomAvatar = mockAvatars[Math.floor(Math.random() * mockAvatars.length)];
      setAvatarUrl(randomAvatar);
      showToast('✓ Photo compressed (142KB) and uploaded to secure storage!');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBackWithCheck = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to go back?')) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  const toggleNeighborhood = (name: string) => {
    if (preferredNeighborhoods.includes(name)) {
      setPreferredNeighborhoods(preferredNeighborhoods.filter(n => n !== name));
    } else {
      setPreferredNeighborhoods([...preferredNeighborhoods, name]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      alert('Please enter a valid full name (minimum 2 characters).');
      return;
    }

    if (phone.trim() !== (user.phone || '')) {
      // Trigger phone change SMS/WhatsApp verification flow
      setShowPhoneVerifyModal(true);
      return;
    }

    if (email.trim() !== (user.email || '')) {
      // Trigger double email verification flow
      setShowEmailVerifyModal(true);
      return;
    }

    executeSave();
  };

  const executeSave = () => {
    setIsSaving(true);
    
    // Determine TIN verification state
    let nextTinVerified = tinVerified;
    if (user.role === 'landlord' && tinNumber !== user.tinNumber) {
      nextTinVerified = false; // changed, requires admin re-verification
    }

    // Save changes to the store
    store.updateUserProfile({
      fullName: fullName.trim(),
      avatarUrl,
      dateOfBirth,
      occupation,
      preferredNeighborhoods,
      budgetMin,
      budgetMax,
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      businessName: businessName.trim(),
      tinNumber: tinNumber.trim(),
      tinVerified: nextTinVerified,
      payoutMethod,
      payoutNumber: payoutNumber.trim(),
      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
      primaryColor,
    });

    // If TIN was changed, log audit & notify admin
    if (user.role === 'landlord' && tinNumber !== user.tinNumber) {
      store.logActivity(
        'TIN Changed', 
        'application', 
        user.id, 
        `Landlord changed TIN to ${tinNumber}. Automatic re-verification requested.`
      );
    }

    setIsSaving(false);
    showToast('✓ Profile updated successfully!');
    setTimeout(() => {
      onBack();
    }, 1200);
  };

  const handleVerifyPhoneCode = () => {
    if (verificationCode.trim().length !== 6) {
      alert('Please enter a valid 6-digit verification code.');
      return;
    }
    // Success! Revert status and save new phone
    setShowPhoneVerifyModal(false);
    store.updateUserProfile({ phone: phone.trim() });
    showToast('✓ Phone number verified successfully!');
    setTimeout(() => {
      executeSave();
    }, 1000);
  };

  const handleVerifyEmailSubmit = () => {
    setShowEmailVerifyModal(false);
    store.updateUserProfile({ email: email.trim() });
    showToast('✓ Verification links sent to both email addresses. Update will finalize upon double confirmation.');
    setTimeout(() => {
      executeSave();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40 flex items-center justify-between">
        <button 
          onClick={handleBackWithCheck}
          className="p-1 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black text-slate-900 tracking-tight">Edit Profile</h1>
        <div className="w-5" /> {/* Spacing spacer */}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-slate-900 text-white p-3.5 rounded-xl text-xs font-bold text-center shadow-lg animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-md mx-auto p-4 space-y-6">
        {/* 1. PROFILE PHOTO SECTION */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <img 
              src={avatarUrl} 
              alt="Profile avatar" 
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-slate-100"
            />
            <button
              type="button"
              onClick={() => setShowPhotoOptions(true)}
              className="absolute bottom-0 right-0 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-md transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
            Role: {user.role.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* 2. PERSONAL INFO CONTAINER */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            Personal Information
          </h3>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Brian Mukasa"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Phone Number
              </label>
              {phone === user.phone && (
                <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-bold">
                  ✓ Verified
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Smartphone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 755 889 004"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            {phone !== user.phone && (
              <p className="text-[10px] text-amber-600 font-bold">
                ⚠️ Changing number requires active SMS/WhatsApp code verification on save.
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              {email === user.email && (
                <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-bold">
                  ✓ Verified
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="brian.mukasa@gmail.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            {email !== user.email && (
              <p className="text-[10px] text-amber-600 font-bold">
                ⚠️ Requires double email verification validation link confirmation.
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Date of Birth
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Occupation Dropdown */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Occupation
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Briefcase className="w-4 h-4" />
              </span>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
              >
                <option value="Employed">Employed</option>
                <option value="Self-employed">Self-employed</option>
                <option value="Student">Student</option>
                <option value="Retired">Retired</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 3. TENANT (USER) SPECIFIC FIELDS */}
        {user.role === 'user' && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                Tenant Preferences
              </h3>

              {/* Preferred Neighborhoods */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Preferred Neighborhoods
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {NEIGHBORHOODS_OPTIONS.map((name) => {
                    const isSelected = preferredNeighborhoods.includes(name);
                    return (
                      <button
                        type="button"
                        key={name}
                        onClick={() => toggleNeighborhood(name)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-semibold ${
                          isSelected 
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Range Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Monthly Budget Range
                  </label>
                  <span className="font-bold text-emerald-700">
                    {budgetMin ? `UGX ${(budgetMin / 1000000).toFixed(1)}M` : 'UGX 0.5M'} - {budgetMax ? `UGX ${(budgetMax / 1000000).toFixed(1)}M` : 'UGX 3M'}
                  </span>
                </div>
                <div className="space-y-3.5">
                  <input
                    type="range"
                    min="200000"
                    max="10000000"
                    step="10000"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>UGX 200K</span>
                    <span>UGX 10M</span>
                  </div>
                </div>
              </div>
            </div>

            {/* EMERGENCY CONTACT DETAILS */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                Emergency Contact (Uganda Safety)
              </h3>

              <div className="space-y-3">
                {/* Emergency Name */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Contact Full Name
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. Sarah Mukasa"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Emergency Phone */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="e.g. +256 700 456 789"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* 4. LANDLORD SPECIFIC FIELDS */}
        {user.role === 'landlord' && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                Landlord Business Profile
              </h3>

              {/* Business Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Registered Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Grace Properties Ltd"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* TIN Number */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    URA TIN Number
                  </label>
                  {tinVerified && tinNumber === user.tinNumber ? (
                    <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-bold">
                      ⏳ Pending Check
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  placeholder="10-digit TIN number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {tinNumber !== user.tinNumber && (
                  <p className="text-[10px] text-amber-600 font-bold leading-normal">
                    ⚠️ Changing this TIN will initiate immediate automatic SafeNest admin re-verification checks.
                  </p>
                )}
              </div>
            </div>

            {/* PREFERRED PAYOUT DETAILS */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                Preferred Payout Channel (Rentals)
              </h3>

              <div className="space-y-3">
                {/* Method */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Payout Method
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Wallet className="w-4 h-4" />
                    </span>
                    <select
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                    >
                      <option value="MTN MoMo">MTN MoMo (Mobile Money)</option>
                      <option value="Airtel Money">Airtel Money</option>
                      <option value="Centenary Bank">Centenary Bank Uganda</option>
                      <option value="Stanbic Bank">Stanbic Bank Uganda</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Payout number / account */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Payout Phone / Account Number
                  </label>
                  <input
                    type="text"
                    value={payoutNumber}
                    onChange={(e) => setPayoutNumber(e.target.value)}
                    placeholder="e.g. +256 772 900 800"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* 5. ADMIN SPECIFIC FIELDS */}
        {user.role === 'super_admin' && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                Platform Support Contacts
              </h3>

              <div className="space-y-3">
                {/* Support Email */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Support Email (Visible to Tenants)
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Support Phone */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Support Helpline Phone
                  </label>
                  <input
                    type="tel"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* APP BRANDING PANEL */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                SafeNest App Branding
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Primary Brand Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-8 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SAVE CHANGES FULL-WIDTH BUTTON */}
        <button
          type="submit"
          disabled={!isDirty || isSaving}
          className={`w-full py-3 rounded-xl text-xs font-black text-white transition-all shadow-md flex items-center justify-center gap-1.5 ${
            isDirty && !isSaving
              ? 'bg-emerald-600 hover:bg-emerald-500'
              : 'bg-slate-300 cursor-not-allowed shadow-none'
          }`}
        >
          {isSaving ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>

      {/* PHOTO ACTION BOTTOM SHEET */}
      {showPhotoOptions && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-250 text-center">
            <div>
              <h4 className="text-sm font-black text-slate-900">Change Profile Photo</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">JPG or PNG up to 2MB (Auto-compressed to 200KB)</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handlePhotoAction('take')}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
              >
                📸 Take Photo
              </button>
              <button
                type="button"
                onClick={() => handlePhotoAction('choose')}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
              >
                🖼️ Choose from Gallery
              </button>
              <button
                type="button"
                onClick={() => handlePhotoAction('remove')}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100/80 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center justify-center gap-2"
              >
                🗑️ Remove Current Photo
              </button>
              <button
                type="button"
                onClick={() => setShowPhotoOptions(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHONE CODE VERIFICATION MODAL */}
      {showPhoneVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl text-center text-slate-800">
            <div>
              <h4 className="text-sm font-black text-slate-900">Verify New Phone Number</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                We sent a secure code via SMS/WhatsApp to:
                <br />
                <strong className="text-slate-800 font-bold">{phone}</strong>
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code (e.g. 123456)"
                className="w-full tracking-[0.5em] text-center text-base py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
              />
              <p className="text-[10px] text-slate-400 font-semibold">
                Hint: Type any 6 digits (e.g. 123456) to verify instantly
              </p>
            </div>

            <div className="flex gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => setShowPhoneVerifyModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyPhoneCode}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black"
              >
                Verify Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL VERIFICATION DOUBLE NOTICE */}
      {showEmailVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl text-center text-slate-800">
            <div>
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <Info className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Email Verification Required</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal text-left">
                To complete your email address update to <strong className="font-bold text-slate-800">{email}</strong>, we must send separate confirmation links to both your:
              </p>
              <div className="mt-2 text-left text-[10.5px] p-2 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <p>• Old: <strong className="font-bold">{user.email}</strong></p>
                <p>• New: <strong className="font-bold">{email}</strong></p>
              </div>
            </div>

            <div className="flex gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => setShowEmailVerifyModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyEmailSubmit}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black"
              >
                Send Links
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

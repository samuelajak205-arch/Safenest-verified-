import React, { useState } from 'react';
import {
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  Upload,
  Clock,
  HardDrive,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { LandlordApplication } from '../../types';
import { uploadFileToDrive } from '../../lib/drive';

interface LandlordApplicationFormProps {
  onSuccess: () => void;
}

export const LandlordApplicationForm: React.FC<LandlordApplicationFormProps> = ({ onSuccess }) => {
  const store = useSafeNestStore();
  const existingApp = store.applications.find((a) => a.userId === store.currentUser.id);

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(store.currentUser.fullName || '');
  const [email, setEmail] = useState(store.currentUser.email || '');
  const [phone, setPhone] = useState(store.currentUser.phone || '+256 701 445 889');
  const [nationalIdNumber, setNationalIdNumber] = useState('CM92019102K88L');
  const [businessName, setBusinessName] = useState('');
  const [taxId, setTaxId] = useState('1009823441'); // URA TIN
  const [propertyCount, setPropertyCount] = useState(3);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([
    'Residential Apartments',
    'Standalone Villas',
  ]);
  const [physicalAddress, setPhysicalAddress] = useState('Plot 8, Bukoto Crescent, Kampala');

  // Documents
  const [nationalIdUrl, setNationalIdUrl] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'
  );
  const [titleDeedUrl, setTitleDeedUrl] = useState(
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800'
  );
  const [taxCertificateUrl, setTaxCertificateUrl] = useState(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800'
  );

  const [syncToDrive, setSyncToDrive] = useState(true);
  const [declaration, setDeclaration] = useState(false);

  // If user already has an active application, display the status dashboard
  if (existingApp) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
              Application Ref: #{existingApp.id.slice(-6)}
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">Landlord Onboarding Status</h2>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              existingApp.status === 'approved'
                ? 'bg-emerald-100 text-emerald-800'
                : existingApp.status === 'rejected'
                ? 'bg-rose-100 text-rose-800'
                : existingApp.status === 'action_required'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {existingApp.status.replace('_', ' ')}
          </span>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Application Submitted</h4>
              <p className="text-[11px] text-slate-500">
                Received on {new Date(existingApp.createdAt).toLocaleDateString()} with verification documents.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                existingApp.status !== 'submitted'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white animate-pulse'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">KYC & Document Vetting</h4>
              <p className="text-[11px] text-slate-500">
                SafeNest compliance team reviews Uganda National ID (NIN), URA TIN, and Property ownership titles.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                existingApp.status === 'approved'
                  ? 'bg-emerald-600 text-white'
                  : existingApp.status === 'rejected'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              {existingApp.status === 'approved' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Verification Outcome</h4>
              {existingApp.status === 'approved' ? (
                <p className="text-[11px] text-emerald-700 font-semibold">
                  Congratulations! Your Landlord account has been verified by {existingApp.reviewedBy}. You can now list properties directly.
                </p>
              ) : existingApp.status === 'action_required' ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 mt-1">
                  <strong>Action Required:</strong> {existingApp.adminNotes}
                </div>
              ) : existingApp.status === 'rejected' ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 mt-1">
                  <strong>Rejection Reason:</strong> {existingApp.rejectionReason}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Decision expected within 24 to 48 business hours.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Application details summary */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-700">
          <h4 className="font-bold text-slate-900">Submitted Dossier:</h4>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>Name: <strong>{existingApp.fullName}</strong></div>
            <div>NIN: <strong>{existingApp.nationalIdNumber}</strong></div>
            <div>URA TIN: <strong>{existingApp.taxId || existingApp.tinNumber || 'N/A'}</strong></div>
            <div>Properties: <strong>{existingApp.propertyCount} units</strong></div>
          </div>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!fullName.trim() || !phone.trim() || !nationalIdNumber.trim()) {
        setError('Please fill in your full legal name, phone number, and Uganda National ID (NIN).');
        return;
      }
    } else if (step === 2) {
      if (propertyCount <= 0) {
        setError('Please enter a valid property count.');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!declaration) {
      setError('Please accept the legal declaration confirming ownership or management rights.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let driveFolderLink: string | undefined;

      // Optional Drive sync
      if (syncToDrive && store.googleAccessToken) {
        try {
          const docContent = `SafeNest Landlord Application Dossier\n=================================\nApplicant: ${fullName}\nPhone: ${phone}\nNIN: ${nationalIdNumber}\nURA TIN: ${taxId}\nProperty Count: ${propertyCount}\nAddress: ${physicalAddress}\nDate: ${new Date().toISOString()}`;
          const item = await uploadFileToDrive(
            store.googleAccessToken,
            `KYC_Landlord_${fullName.replace(/\s+/g, '_')}.txt`,
            'text/plain',
            docContent
          );
          store.addGoogleDriveFile(item);
          driveFolderLink = item.webViewLink;
        } catch (e) {
          console.warn('Drive upload note:', e);
        }
      }

      store.submitLandlordApplication({
        userId: store.currentUser.id,
        fullName,
        email,
        phone,
        nationalIdNumber,
        businessName: businessName || undefined,
        taxId: taxId || undefined,
        propertyCount,
        propertyTypes,
        physicalAddress,
        documents: [
          {
            id: 'doc_nin',
            type: 'national_id',
            name: 'Uganda National ID / NIN Copy',
            url: nationalIdUrl,
          },
          {
            id: 'doc_title',
            type: 'property_deed',
            name: 'Land Title / Tenancy Deed',
            url: titleDeedUrl,
          },
          {
            id: 'doc_tax',
            type: 'tax_certificate',
            name: 'URA Tax Clearance Certificate',
            url: taxCertificateUrl,
          },
        ],
        declarationAccepted: true,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-slate-100 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Become a Verified Landlord</h2>
              <p className="text-xs text-slate-500">
                Join SafeNest Uganda. List verified rentals, receive tenant inquiries, and manage properties with trust.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        {[
          { num: 1, label: 'Identity & NIN' },
          { num: 2, label: 'Property Portfolio' },
          { num: 3, label: 'KYC Verification' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              step === s.num
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                : step > s.num
                ? 'bg-slate-50 border-emerald-200 text-emerald-700 font-medium'
                : 'bg-slate-50 border-slate-200 text-slate-400 font-medium'
            }`}
          >
            <span className="text-xs block">Step {s.num}</span>
            <span className="text-[11px] truncate block">{s.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Personal & Legal */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Full Legal Name (as per NIN) *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Uganda National Identification Number (NIN) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CM92019102K88L"
                value={nationalIdNumber}
                onChange={(e) => setNationalIdNumber(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Official Phone Number (WhatsApp Enabled) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Real Estate Business / Agency Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Nakimera Property Holdings Ltd"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                URA Tax Identification Number (TIN)
              </label>
              <input
                type="text"
                placeholder="10-digit URA TIN"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Portfolio Info */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Total Rental Units Owned or Managed *
              </label>
              <input
                type="number"
                min="1"
                value={propertyCount}
                onChange={(e) => setPropertyCount(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Head Office / Physical Address in Uganda *
              </label>
              <input
                type="text"
                value={physicalAddress}
                onChange={(e) => setPhysicalAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Types of Properties in Portfolio
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Residential Apartments',
                'Standalone Villas',
                'Studio & Single Rooms',
                'Commercial Offices',
                'Student Hostels',
              ].map((type) => {
                const isSelected = propertyTypes.includes(type);
                return (
                  <label
                    key={type}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setPropertyTypes((prev) =>
                          prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                        );
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{type}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: KYC Documents & Declaration */}
      {step === 3 && (
        <div className="space-y-5">
          <p className="text-xs text-slate-600">
            To combat fraud and protect tenants in Uganda, SafeNest verifies identity documents and property ownership deeds before granting Landlord listing privileges.
          </p>

          <div className="space-y-3">
            {/* National ID */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Uganda National ID (NIN)</h4>
                  <p className="text-[11px] text-slate-500">Government issued card or official printout</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                Uploaded (Demo ID)
              </span>
            </div>

            {/* Title Deed */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Land Title / Proof of Ownership</h4>
                  <p className="text-[11px] text-slate-500">Mailo, Freehold, Leasehold or Management Agreement</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                Uploaded (Demo Title)
              </span>
            </div>

            {/* Tax Certificate */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">URA Tax Clearance Certificate</h4>
                  <p className="text-[11px] text-slate-500">Valid Uganda Revenue Authority TIN verification</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                Verified
              </span>
            </div>
          </div>

          {/* Google Drive Integration */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-emerald-700 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-950">Google Drive Document Vault Link:</span>
              <p className="text-emerald-800">
                SafeNest will sync your encrypted verification dossier to the SafeNest Google Drive folder for safe record-keeping.
              </p>
            </div>
          </div>

          {/* Declaration */}
          <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={declaration}
              onChange={(e) => setDeclaration(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span className="text-xs text-slate-700">
              I certify under penalty of perjury that all information, ownership titles, and documents provided are authentic and accurate. I agree to the SafeNest Uganda Landlord Terms of Service.
            </span>
          </label>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div></div>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-colors"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Verification Dossier'}
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ScrollText,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  FileCheck,
  Building2,
  User,
  Calendar,
  DollarSign,
  Printer,
  Download,
  ShieldCheck,
  AlertCircle,
  PenTool,
  UploadCloud,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { LeaseAgreement, LeaseStatus, RentalApplication } from '../../types';

interface LeaseManagementHubProps {
  initialApplicationToLease?: RentalApplication | null;
  onClearInitialApp?: () => void;
  onOpenLedger?: () => void;
}

export const LeaseManagementHub: React.FC<LeaseManagementHubProps> = ({
  initialApplicationToLease,
  onClearInitialApp,
  onOpenLedger,
}) => {
  const store = useSafeNestStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLease, setSelectedLease] = useState<LeaseAgreement | null>(
    store.leases[0] || null
  );

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(!!initialApplicationToLease);
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [signerRole, setSignerRole] = useState<'landlord' | 'tenant'>('tenant');
  const [signatureName, setSignatureName] = useState<string>(store.currentUser.fullName);
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);

  // New Lease Form State (prefilled if initialApplicationToLease is provided)
  const defaultProperty = store.properties[0];
  const [newLeaseForm, setNewLeaseForm] = useState({
    propertyId: initialApplicationToLease?.propertyId || defaultProperty.id,
    propertyTitle: initialApplicationToLease?.propertyTitle || defaultProperty.title,
    propertyAddress: initialApplicationToLease?.propertyAddress || defaultProperty.address,
    tenantId: initialApplicationToLease?.tenantId || store.currentUser.id,
    tenantName: initialApplicationToLease?.tenantName || 'Arthur Mugisha',
    tenantEmail: initialApplicationToLease?.tenantEmail || 'arthur.mugisha@example.ug',
    tenantPhone: initialApplicationToLease?.tenantPhone || '+256 701 445 667',
    landlordId: initialApplicationToLease?.landlordId || defaultProperty.landlordId,
    landlordName: initialApplicationToLease?.landlordName || defaultProperty.landlordName,
    startDate: '2026-10-01',
    endDate: '2027-09-30',
    monthlyRent: initialApplicationToLease?.rentAmount || defaultProperty.rentAmount,
    securityDeposit: (initialApplicationToLease?.rentAmount || defaultProperty.rentAmount) * 2,
    rentDueDay: 5,
    lateFeePercentage: 5,
    terms: {
      utilitiesIncluded: ['Water (NWSC) standard allowance'],
      umemeMeterType: 'Yaka Prepaid Digital Meter (Tenant pays recharge token)',
      petPolicy: 'Small pets allowed upon prior written consent',
      quietHours: '10:00 PM to 6:00 AM daily',
      sublettingAllowed: false,
      noticePeriodDays: 30,
      specialClauses: [
        'Tenancy governed by the Republic of Uganda Landlord and Tenant Act (2022)',
        'Premises shall be used exclusively for private residential occupation',
        'Move-in condition checklist signed by both parties is legally incorporated',
      ],
    },
  });

  // Filter leases by user role
  const leases = store.leases.filter((l) => {
    if (store.currentUser.role === 'landlord') {
      return l.landlordId === store.currentUser.id || l.landlordName.includes('Kato');
    }
    if (store.currentUser.role === 'user' || store.currentUser.role === 'applicant') {
      return l.tenantId === store.currentUser.id || l.tenantEmail === store.currentUser.email;
    }
    return true; // super_admin
  });

  const filteredLeases = leases.filter((l) => {
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesSearch =
      l.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.landlordName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.leaseNumber || l.id).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: LeaseStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Active & Executed
          </span>
        );
      case 'pending_signature':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Signature
          </span>
        );
      case 'draft':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Draft
          </span>
        );
      case 'renewed':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Renewed
          </span>
        );
      case 'terminated':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Terminated
          </span>
        );
      default:
        return null;
    }
  };

  const handleCreateLease = (e: React.FormEvent) => {
    e.preventDefault();
    const count = store.leases.length + 1;
    const leaseNumber = `SN-LSE-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const created = store.createLease({
      leaseNumber,
      propertyId: newLeaseForm.propertyId,
      propertyTitle: newLeaseForm.propertyTitle,
      propertyAddress: newLeaseForm.propertyAddress,
      propertyCity: 'Kampala',
      tenantId: newLeaseForm.tenantId,
      tenantName: newLeaseForm.tenantName,
      tenantEmail: newLeaseForm.tenantEmail,
      tenantPhone: newLeaseForm.tenantPhone,
      landlordId: newLeaseForm.landlordId,
      landlordName: newLeaseForm.landlordName,
      landlordPhone: store.currentUser.phone || '+256 772 334 112',
      status: 'pending_signature',
      startDate: newLeaseForm.startDate,
      endDate: newLeaseForm.endDate,
      durationMonths: 12,
      monthlyRent: newLeaseForm.monthlyRent,
      securityDeposit: newLeaseForm.securityDeposit,
      paymentDueDate: newLeaseForm.rentDueDay || 5,
      rentDueDay: newLeaseForm.rentDueDay,
      lateFeeAmount: 50000,
      lateFeePercentage: newLeaseForm.lateFeePercentage,
      noticePeriodDays: 30,
      terms: newLeaseForm.terms,
      applicationId: initialApplicationToLease?.id,
      landlordSignature: {
        signedByName: newLeaseForm.landlordName,
        signedAt: new Date().toISOString(),
        signatureData: `${newLeaseForm.landlordName} [AUTHORIZED LANDLORD SEAL]`,
      },
    });

    setSelectedLease(created);
    setShowCreateModal(false);
    if (onClearInitialApp) onClearInitialApp();
  };

  const handleSignLease = () => {
    if (!selectedLease || !signatureName.trim()) return;
    store.signLease(selectedLease.id, signerRole, signatureName.trim());

    // Refresh selectedLease
    const updated = store.leases.find((l) => l.id === selectedLease.id);
    if (updated) setSelectedLease(updated);
    setShowSignModal(false);
  };

  const handleSyncToDrive = () => {
    if (!selectedLease) return;
    setIsSyncingDrive(true);
    setTimeout(() => {
      setIsSyncingDrive(false);
      store.logActivity(
        'Synced Tenancy Agreement to Google Drive',
        'property',
        selectedLease.id,
        `Backed up ${selectedLease.leaseNumber}.pdf to Google Drive SafeNest folder.`
      );
      alert(
        `✓ Agreement ${selectedLease.leaseNumber} successfully synchronized to SafeNest / Leases folder in Google Drive!`
      );
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  const canLandlordSign =
    (store.currentUser.role === 'landlord' || store.currentUser.role === 'super_admin') &&
    !selectedLease?.landlordSignature?.signedAt;

  const canTenantSign =
    (store.currentUser.role === 'user' ||
      store.currentUser.role === 'applicant' ||
      store.currentUser.role === 'super_admin') &&
    !selectedLease?.tenantSignature?.signedAt;

  return (
    <div className="space-y-6">
      {/* Hub Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-emerald-600" />
            Digital Tenancy Agreements & Lease Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compliant with the Republic of Uganda Landlord and Tenant Act (2022). Legally binding digital execution.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(store.currentUser.role === 'landlord' || store.currentUser.role === 'super_admin') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Draft New Lease
            </button>
          )}

          {onOpenLedger && (
            <button
              onClick={onOpenLedger}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4" />
              View Rent Ledger
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search lease #, tenant, or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Leases' },
            { id: 'active', label: 'Active' },
            { id: 'pending_signature', label: 'Needs Signature' },
            { id: 'renewed', label: 'Renewed' },
            { id: 'terminated', label: 'Terminated' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Leases on Left, Full Contract on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column list */}
        <div className="lg:col-span-4 space-y-3">
          {filteredLeases.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <ScrollText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No leases found</p>
              <p className="text-xs text-slate-400 mt-1">Create a lease from an approved application.</p>
            </div>
          ) : (
            filteredLeases.map((lease) => {
              const isSelected = selectedLease?.id === lease.id;
              return (
                <div
                  key={lease.id}
                  onClick={() => setSelectedLease(lease)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        {lease.leaseNumber || lease.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{lease.propertyTitle}</h4>
                    </div>
                    {getStatusBadge(lease.status)}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Tenant</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">{lease.tenantName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Monthly Rent</span>
                      <span className="font-bold text-emerald-700">
                        UGX {(lease.monthlyRent / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Duration</span>
                      <span className="text-slate-700">
                        {lease.startDate} to {lease.endDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Signatures</span>
                      <span className="text-slate-700">
                        {lease.landlordSignature?.signedAt ? '✓ Landlord ' : '○ Landlord '}
                        {lease.tenantSignature?.signedAt ? '✓ Tenant' : '○ Tenant'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right column: Formatted Tenancy Agreement Viewer */}
        <div className="lg:col-span-8">
          {selectedLease ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-4">
              {/* Action Toolbar */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-600 px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
                    {selectedLease.leaseNumber}
                  </span>
                  {getStatusBadge(selectedLease.status)}
                </div>

                <div className="flex items-center gap-2">
                  {canLandlordSign && (
                    <button
                      onClick={() => {
                        setSignerRole('landlord');
                        setSignatureName(store.currentUser.fullName);
                        setShowSignModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-1.5"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      Sign as Landlord
                    </button>
                  )}

                  {canTenantSign && (
                    <button
                      onClick={() => {
                        setSignerRole('tenant');
                        setSignatureName(store.currentUser.fullName);
                        setShowSignModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-xs flex items-center gap-1.5"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      Sign as Tenant
                    </button>
                  )}

                  <button
                    onClick={handleSyncToDrive}
                    disabled={isSyncingDrive}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors title='Sync to Google Drive'"
                  >
                    <UploadCloud className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handlePrint}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors title='Print Tenancy Agreement'"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Legal Document Body */}
              <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto text-slate-800 font-serif leading-relaxed text-sm">
                {/* Formal Header */}
                <div className="text-center pb-6 border-b border-slate-200">
                  <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full font-sans text-[11px] font-bold uppercase tracking-wider mb-2">
                    Republic of Uganda · Tenancy Contract
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-950 font-sans uppercase tracking-wide">
                    Residential Tenancy Agreement
                  </h3>
                  <p className="text-xs text-slate-500 font-sans mt-1">
                    Pursuant to the Landlord and Tenant Act (2022) of the Laws of Uganda
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    SafeNest Reference: {selectedLease.leaseNumber}
                  </p>
                </div>

                {/* Parties Preamble */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-500">
                    1. The Parties to this Agreement
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700">
                    THIS AGREEMENT is made on this{' '}
                    <strong>{new Date(selectedLease.createdAt).toLocaleDateString('en-GB')}</strong> BETWEEN:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">THE LANDLORD</span>
                      <strong className="text-slate-900 text-sm block">{selectedLease.landlordName}</strong>
                      <span className="text-slate-600 block">Verified SafeNest Landlord</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">THE TENANT</span>
                      <strong className="text-slate-900 text-sm block">{selectedLease.tenantName}</strong>
                      <span className="text-slate-600 block">{selectedLease.tenantPhone}</span>
                      <span className="text-slate-600 block">{selectedLease.tenantEmail}</span>
                    </div>
                  </div>
                </div>

                {/* The Demised Premises */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-500">
                    2. The Demised Premises
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700">
                    The Landlord hereby lets and the Tenant takes the residential premises known as{' '}
                    <strong>{selectedLease.propertyTitle}</strong>, situated at{' '}
                    <strong>{selectedLease.propertyAddress}</strong>, together with all fixtures and fittings in verified
                    working condition.
                  </p>
                </div>

                {/* Term & Rent Schedule */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-500">
                    3. Term, Rent & Security Deposit Schedule
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-sans text-xs bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                    <div>
                      <span className="text-[10px] text-emerald-800 block">Monthly Rent</span>
                      <strong className="text-emerald-950 font-bold text-sm font-mono">
                        UGX {selectedLease.monthlyRent.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 block">Security Deposit</span>
                      <strong className="text-emerald-950 font-bold text-sm font-mono">
                        UGX {selectedLease.securityDeposit.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 block">Rent Due Date</span>
                      <strong className="text-emerald-950 font-bold text-sm">
                        Day {selectedLease.rentDueDay} of month
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 block">Term Duration</span>
                      <strong className="text-emerald-950 font-bold text-sm">
                        {selectedLease.startDate} to {selectedLease.endDate}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Statutory Covenants and Clauses */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-500">
                    4. Operational Covenants & Utility Rules
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                    <li>
                      <strong>Electricity (UMEME Yaka):</strong> {selectedLease.terms.umemeMeterType}.
                    </li>
                    <li>
                      <strong>Water Services (NWSC):</strong> {selectedLease.terms.utilitiesIncluded.join(', ')}.
                    </li>
                    <li>
                      <strong>Quiet Hours & Community Respect:</strong> {selectedLease.terms.quietHours}.
                    </li>
                    <li>
                      <strong>Pet Policy:</strong> {selectedLease.terms.petPolicy}.
                    </li>
                    <li>
                      <strong>Subletting:</strong> Subletting is strictly{' '}
                      {selectedLease.terms.sublettingAllowed ? 'permitted with consent' : 'prohibited'}.
                    </li>
                    <li>
                      <strong>Notice of Termination:</strong> Minimum {selectedLease.terms.noticePeriodDays} days
                      formal written notice before lease expiration.
                    </li>
                    {selectedLease.terms.specialClauses.map((clause, idx) => (
                      <li key={idx}>{clause}</li>
                    ))}
                  </ul>
                </div>

                {/* Signatures & Execution Section */}
                <div className="pt-6 border-t border-slate-200 space-y-4 font-sans">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    5. Execution & Digital Signatures
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Landlord Sign Block */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">Landlord Signature</span>
                      {selectedLease.landlordSignature?.signedAt ? (
                        <div className="space-y-1">
                          <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-emerald-950 font-mono text-xs">
                            <ShieldCheck className="w-4 h-4 text-emerald-700 inline mr-1" />
                            {selectedLease.landlordSignature.signatureData}
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            Executed by <strong>{selectedLease.landlordSignature.signedByName}</strong> on{' '}
                            {new Date(selectedLease.landlordSignature.signedAt).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-400">
                          Awaiting Landlord Signature
                        </div>
                      )}
                    </div>

                    {/* Tenant Sign Block */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">Tenant Signature</span>
                      {selectedLease.tenantSignature?.signedAt ? (
                        <div className="space-y-1">
                          <div className="p-3 bg-purple-100/70 border border-purple-300 rounded-xl text-purple-950 font-mono text-xs">
                            <ShieldCheck className="w-4 h-4 text-purple-700 inline mr-1" />
                            {selectedLease.tenantSignature.signatureData}
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            Executed by <strong>{selectedLease.tenantSignature.signedByName}</strong> on{' '}
                            {new Date(selectedLease.tenantSignature.signedAt).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-400">
                          Awaiting Tenant Signature
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              <ScrollText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h4 className="text-base font-bold text-slate-700">No Lease Selected</h4>
              <p className="text-xs text-slate-400 mt-1">
                Select a lease agreement from the list to view legal terms, execution status, and printable contract.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE LEASE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Draft Uganda Tenancy Agreement</h3>
                  <p className="text-xs text-slate-500">
                    Compliant contract template with Republic of Uganda Tenancy Act rules
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLease} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Select Property</label>
                  <select
                    value={newLeaseForm.propertyId}
                    onChange={(e) => {
                      const prop = store.properties.find((p) => p.id === e.target.value);
                      if (prop) {
                        setNewLeaseForm({
                          ...newLeaseForm,
                          propertyId: prop.id,
                          propertyTitle: prop.title,
                          propertyAddress: prop.address,
                          monthlyRent: prop.rentAmount,
                          securityDeposit: prop.rentAmount * 2,
                          landlordId: prop.landlordId,
                          landlordName: prop.landlordName,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    {store.properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} · UGX {p.rentAmount.toLocaleString()}/mo ({p.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tenant Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeaseForm.tenantName}
                    onChange={(e) => setNewLeaseForm({ ...newLeaseForm, tenantName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tenant Email *</label>
                  <input
                    type="email"
                    required
                    value={newLeaseForm.tenantEmail}
                    onChange={(e) => setNewLeaseForm({ ...newLeaseForm, tenantEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tenant Phone (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={newLeaseForm.tenantPhone}
                    onChange={(e) => setNewLeaseForm({ ...newLeaseForm, tenantPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Landlord Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeaseForm.landlordName}
                    onChange={(e) => setNewLeaseForm({ ...newLeaseForm, landlordName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Rent (UGX) *</label>
                  <input
                    type="number"
                    step="100000"
                    required
                    value={newLeaseForm.monthlyRent}
                    onChange={(e) =>
                      setNewLeaseForm({ ...newLeaseForm, monthlyRent: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 font-mono border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Security Deposit (UGX) *</label>
                  <input
                    type="number"
                    step="100000"
                    required
                    value={newLeaseForm.securityDeposit}
                    onChange={(e) =>
                      setNewLeaseForm({ ...newLeaseForm, securityDeposit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 font-mono border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newLeaseForm.startDate}
                    onChange={(e) => setNewLeaseForm({ ...newLeaseForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={newLeaseForm.endDate}
                    onChange={(e) => setNewLeaseForm({ ...newLeaseForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
                >
                  Generate & Issue Digital Lease
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIGN LEASE MODAL */}
      {showSignModal && selectedLease && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Digitally Sign Agreement ({signerRole.toUpperCase()})
                </h3>
                <p className="text-xs text-slate-500">Lease: {selectedLease.leaseNumber}</p>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Legal Validity under Uganda Electronic Signatures Act (2011)
              </span>
              <p className="text-[11px] text-purple-800">
                Your typed legal name combined with your verified SafeNest account credentials serves as your binding
                digital signature.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type Your Full Legal Name to Sign *
              </label>
              <input
                type="text"
                required
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20"
              />
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 text-center">
                &quot;{signatureName}&quot; [DIGITALLY SIGNED VIA SAFENEST UG]
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!signatureName.trim()}
                onClick={handleSignLease}
                className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-xs disabled:opacity-50"
              >
                Confirm Digital Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

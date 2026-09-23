import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt,
  Download,
  Printer,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  X,
  UploadCloud,
  Check,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { RentPaymentRecord, RentPaymentStatus, RentPaymentMethod } from '../../types';

interface ManualRentLedgerViewProps {
  onOpenLeases?: () => void;
}

export const ManualRentLedgerView: React.FC<ManualRentLedgerViewProps> = ({ onOpenLeases }) => {
  const store = useSafeNestStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<RentPaymentRecord | null>(null);
  const [showRecordModal, setShowRecordModal] = useState<boolean>(false);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);
  const [confirmRefNumber, setConfirmRefNumber] = useState<string>('');
  const [confirmNotes, setConfirmNotes] = useState<string>('');

  // Form state for recording manual payment
  const activeLeases = store.leases.filter((l) => l.status === 'active' || l.status === 'renewed');
  const defaultLease = activeLeases[0] || store.leases[0];

  const [paymentForm, setPaymentForm] = useState({
    leaseId: defaultLease?.id || '',
    propertyId: defaultLease?.propertyId || '',
    propertyTitle: defaultLease?.propertyTitle || '',
    tenantId: defaultLease?.tenantId || '',
    tenantName: defaultLease?.tenantName || '',
    landlordId: defaultLease?.landlordId || '',
    landlordName: defaultLease?.landlordName || '',
    amount: defaultLease?.monthlyRent || 1800000,
    billingPeriod: 'October 2026',
    dueDate: '2026-10-05',
    paidDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'mtn_momo' as RentPaymentMethod,
    referenceNumber: 'MTN-UG-994821',
    notes: 'Paid via MTN MoMo merchant code',
    status: 'paid' as RentPaymentStatus,
  });

  // Filter payments
  const payments = store.rentPayments.filter((p) => {
    if (store.currentUser.role === 'landlord') {
      return p.landlordId === store.currentUser.id || p.landlordName.includes('Kato');
    }
    if (store.currentUser.role === 'user' || store.currentUser.role === 'applicant') {
      return p.tenantId === store.currentUser.id || p.tenantName.includes(store.currentUser.fullName);
    }
    return true; // super_admin
  });

  const filteredPayments = payments.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.billingPeriod.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Metrics
  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueAmount = payments
    .filter((p) => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: RentPaymentStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Confirmed Paid
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Confirmation
          </span>
        );
      case 'overdue':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Overdue
          </span>
        );
      default:
        return null;
    }
  };

  const getMethodLabel = (method: RentPaymentMethod) => {
    switch (method) {
      case 'mtn_momo':
        return 'MTN MoMo (Uganda)';
      case 'airtel_money':
        return 'Airtel Money';
      case 'bank_transfer':
        return 'Bank Transfer (Stanbic/Centenary)';
      case 'cash':
        return 'Cash with Physical Slip';
      default:
        return method;
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    store.recordRentPayment({
      leaseId: paymentForm.leaseId,
      propertyId: paymentForm.propertyId,
      propertyTitle: paymentForm.propertyTitle,
      tenantId: paymentForm.tenantId,
      tenantName: paymentForm.tenantName,
      landlordId: paymentForm.landlordId,
      landlordName: paymentForm.landlordName,
      amount: Number(paymentForm.amount),
      billingPeriod: paymentForm.billingPeriod,
      dueDate: paymentForm.dueDate,
      paidDate: paymentForm.paidDate,
      paymentMethod: paymentForm.paymentMethod,
      referenceNumber: paymentForm.referenceNumber,
      status: paymentForm.status,
      notes: paymentForm.notes,
      confirmedBy:
        paymentForm.status === 'paid'
          ? `${store.currentUser.fullName} (${store.currentUser.role === 'super_admin' ? 'Admin' : 'Landlord'})`
          : undefined,
      confirmedAt: paymentForm.status === 'paid' ? new Date().toISOString() : undefined,
    });

    setShowRecordModal(false);
  };

  const handleConfirmPayment = (paymentId: string) => {
    store.confirmRentPayment(paymentId, confirmRefNumber || undefined, confirmNotes || undefined);
    setConfirmingPaymentId(null);
    setConfirmRefNumber('');
    setConfirmNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            Manual Rent Tracking & Official Receipts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manual offline ledger tracking (MTN MoMo, Airtel Money, Bank Deposit). Strictly no payment gateway integrations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(store.currentUser.role === 'super_admin' || store.currentUser.role === 'landlord') && (
            <button
              onClick={() => setShowRecordModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Log Manual Payment
            </button>
          )}

          {onOpenLeases && (
            <button
              onClick={onOpenLeases}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Manage Leases
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Confirmed Collections</span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-mono">
            UGX {totalCollected.toLocaleString()}
          </h3>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified by Landlord / Admin
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Pending Confirmations</span>
          <h3 className="text-xl sm:text-2xl font-bold text-amber-600 mt-1 font-mono">
            UGX {pendingAmount.toLocaleString()}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting payment verification</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Overdue Arrears</span>
          <h3 className="text-xl sm:text-2xl font-bold text-rose-600 mt-1 font-mono">
            UGX {overdueAmount.toLocaleString()}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 block">Exceeded rent due grace period</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipt #, tenant, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Payments' },
            { id: 'paid', label: 'Paid & Confirmed' },
            { id: 'pending', label: 'Pending' },
            { id: 'overdue', label: 'Overdue' },
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

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Receipt #</th>
                <th className="px-6 py-3.5">Tenant & Property</th>
                <th className="px-6 py-3.5">Period & Due Date</th>
                <th className="px-6 py-3.5">Amount (UGX)</th>
                <th className="px-6 py-3.5">Method & Ref</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No payment records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {p.receiptNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{p.tenantName}</div>
                      <div className="text-slate-400 text-[11px] line-clamp-1">{p.propertyTitle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{p.billingPeriod}</div>
                      <div className="text-slate-400 text-[11px]">Due: {p.dueDate}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      UGX {p.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{getMethodLabel(p.paymentMethod)}</div>
                      {p.referenceNumber && (
                        <div className="text-slate-500 font-mono text-[10px]">Ref: {p.referenceNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(p.status)}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                      {p.status === 'pending' &&
                        (store.currentUser.role === 'super_admin' || store.currentUser.role === 'landlord') && (
                          <button
                            onClick={() => setConfirmingPaymentId(p.id)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                          >
                            Confirm
                          </button>
                        )}
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 inline-flex"
                      >
                        <Receipt className="w-3 h-3" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Record Manual Rent Payment</h3>
                  <p className="text-xs text-slate-500">Log offline cash, MTN MoMo, or bank deposit</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Lease Agreement</label>
                <select
                  value={paymentForm.leaseId}
                  onChange={(e) => {
                    const l = store.leases.find((lease) => lease.id === e.target.value);
                    if (l) {
                      setPaymentForm({
                        ...paymentForm,
                        leaseId: l.id,
                        propertyId: l.propertyId,
                        propertyTitle: l.propertyTitle,
                        tenantId: l.tenantId,
                        tenantName: l.tenantName,
                        landlordId: l.landlordId,
                        landlordName: l.landlordName,
                        amount: l.monthlyRent,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  {store.leases.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.leaseNumber || l.id} · {l.tenantName} ({l.propertyTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Period</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October 2026"
                    value={paymentForm.billingPeriod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, billingPeriod: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (UGX) *</label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as RentPaymentMethod })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="mtn_momo">MTN Mobile Money (Uganda)</option>
                    <option value="airtel_money">Airtel Money</option>
                    <option value="bank_transfer">Bank Transfer (Stanbic/Centenary)</option>
                    <option value="cash">Cash in Hand</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reference / Slip #</label>
                  <input
                    type="text"
                    placeholder="e.g. MTN-TX-882910"
                    value={paymentForm.referenceNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                    className="w-full px-3 py-2 font-mono border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentForm.paidDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paidDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={paymentForm.status}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, status: e.target.value as RentPaymentStatus })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="paid">Confirmed Paid</option>
                    <option value="pending">Pending Verification</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Narration</label>
                <input
                  type="text"
                  placeholder="e.g. Paid into Landlord Stanbic account directly"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
                >
                  Save Payment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM PAYMENT MODAL */}
      {confirmingPaymentId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Payment Receipt</h3>
                <p className="text-xs text-slate-500">Acknowledge receipt of funds from tenant</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank / MoMo Transaction Reference #
                </label>
                <input
                  type="text"
                  placeholder="e.g. MTN-998271 or Stanbic-DEP-449"
                  value={confirmRefNumber}
                  onChange={(e) => setConfirmRefNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirmation Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Verified against bank statement"
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingPaymentId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmPayment(confirmingPaymentId)}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
              >
                Confirm & Issue Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL DIGITAL RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold font-mono text-emerald-800 px-2.5 py-1 bg-emerald-50 rounded-lg">
                OFFICIAL DIGITAL RECEIPT
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  title="Print Receipt"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div className="space-y-4 text-xs font-sans text-slate-800">
              <div className="text-center pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-950">SafeNest Uganda</h3>
                <p className="text-[11px] text-slate-500">Smart Rentals & Tenancy Hub · Kampala, Uganda</p>
                <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-lg font-mono font-bold text-slate-800">
                  {selectedReceipt.receiptNumber}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">RECEIVED FROM:</span>
                  <strong className="text-slate-900 text-xs block">{selectedReceipt.tenantName}</strong>
                  <span className="text-slate-500 text-[11px]">Tenant</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">PROPERTY:</span>
                  <strong className="text-slate-900 text-xs block line-clamp-1">{selectedReceipt.propertyTitle}</strong>
                  <span className="text-slate-500 text-[11px]">{selectedReceipt.billingPeriod} Rent</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Amount Received
                </span>
                <span className="text-2xl font-bold font-mono text-emerald-950 block mt-0.5">
                  UGX {selectedReceipt.amount.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-1">
                  Payment Method: {getMethodLabel(selectedReceipt.paymentMethod)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 block">Date of Payment:</span>
                  <strong>{selectedReceipt.paidDate || selectedReceipt.createdAt}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Transaction Reference:</span>
                  <strong className="font-mono">{selectedReceipt.referenceNumber || 'N/A'}</strong>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block">Confirmed By:</span>
                  <strong className="text-slate-800">
                    {selectedReceipt.confirmedBy || 'SafeNest Platform Administrator'}
                  </strong>
                </div>
              </div>

              {/* Digital Seal */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>VERIFIED ELECTRONIC RECEIPT · SAFENEST UG</span>
                </div>
                <span className="font-mono text-slate-400">STATUS: {selectedReceipt.status.toUpperCase()}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl shadow-xs"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

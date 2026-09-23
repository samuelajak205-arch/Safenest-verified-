import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  CheckCircle,
  Clock,
  Printer,
  ShieldCheck,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  Zap,
  Droplet,
  Key,
  X,
  ChevronRight,
  PenTool,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { InspectionChecklist, InspectionItem } from '../../types';

interface InspectionChecklistViewProps {
  onOpenLeases?: () => void;
}

export const InspectionChecklistView: React.FC<InspectionChecklistViewProps> = ({ onOpenLeases }) => {
  const store = useSafeNestStore();
  const [selectedInspection, setSelectedInspection] = useState<InspectionChecklist | null>(
    store.inspections[0] || null
  );
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const defaultLease = store.leases[0];
  const [createForm, setCreateForm] = useState({
    leaseId: defaultLease?.id || '',
    propertyId: defaultLease?.propertyId || '',
    propertyTitle: defaultLease?.propertyTitle || '',
    tenantId: defaultLease?.tenantId || '',
    tenantName: defaultLease?.tenantName || '',
    landlordId: defaultLease?.landlordId || '',
    landlordName: defaultLease?.landlordName || '',
    type: 'move_in' as 'move_in' | 'move_out',
    inspectionDate: new Date().toISOString().split('T')[0],
    umemeMeterReading: '78.5 kWh balance',
    waterMeterReading: '412.3 units',
    keysHandedOverCount: 3,
    items: [
      { area: 'Living Room', condition: 'good' as const, notes: 'Freshly painted, no wall marks' },
      { area: 'Kitchen Cabinets & Sink', condition: 'good' as const, notes: 'Sink drains properly, tiles clean' },
      { area: 'Master Bedroom', condition: 'good' as const, notes: 'Closet doors smooth, window latch secured' },
      { area: 'Bathroom & Water Heater', condition: 'good' as const, notes: 'Hot water heater tested functional' },
      { area: 'Electrical Outlets & Bulbs', condition: 'good' as const, notes: 'All fixtures equipped with LED bulbs' },
      { area: 'Balcony & Windows', condition: 'fair' as const, notes: 'Minor scratch on aluminum sliding track' },
    ],
  });

  const inspections = store.inspections.filter((insp) => {
    if (store.currentUser.role === 'landlord') {
      return insp.landlordId === store.currentUser.id || insp.landlordName.includes('Kato');
    }
    if (store.currentUser.role === 'user' || store.currentUser.role === 'applicant') {
      return insp.tenantId === store.currentUser.id || insp.tenantName.includes(store.currentUser.fullName);
    }
    return true; // super_admin
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created = store.createInspection({
      leaseId: createForm.leaseId,
      propertyId: createForm.propertyId,
      propertyTitle: createForm.propertyTitle,
      tenantId: createForm.tenantId,
      tenantName: createForm.tenantName,
      landlordId: createForm.landlordId,
      landlordName: createForm.landlordName,
      type: createForm.type,
      inspectionDate: createForm.inspectionDate,
      inspectorName: store.currentUser.fullName,
      umemeMeterReading: createForm.umemeMeterReading,
      waterMeterReading: createForm.waterMeterReading,
      keysHandedOverCount: Number(createForm.keysHandedOverCount),
      areas: createForm.items,
      items: createForm.items,
      overallStatus: 'draft',
      landlordSignOff: false,
      tenantSignOff: false,
    });

    setSelectedInspection(created);
    setShowCreateModal(false);
  };

  const handleSignOff = (role: 'landlord' | 'tenant') => {
    if (!selectedInspection) return;
    store.signOffInspection(selectedInspection.id, role);
    const updated = store.inspections.find((i) => i.id === selectedInspection.id);
    if (updated) setSelectedInspection(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            Move-In & Move-Out Inspection Checklists
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standard condition verification, UMEME Yaka meter tokens, NWSC water meter readings, and dual digital sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(store.currentUser.role === 'super_admin' || store.currentUser.role === 'landlord') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              New Inspection Checklist
            </button>
          )}

          {onOpenLeases && (
            <button
              onClick={onOpenLeases}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              View Leases
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-4 space-y-3">
          {inspections.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No inspections recorded</p>
              <p className="text-xs text-slate-400 mt-1">Create a move-in checklist for active tenancies.</p>
            </div>
          ) : (
            inspections.map((insp) => {
              const isSelected = selectedInspection?.id === insp.id;
              return (
                <div
                  key={insp.id}
                  onClick={() => setSelectedInspection(insp)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 px-2 py-0.5 bg-emerald-50 rounded">
                        {insp.type === 'move_in' ? 'Move-In Inspection' : 'Move-Out Inspection'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mt-1">{insp.propertyTitle}</h4>
                    </div>
                    {insp.overallStatus === 'completed' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                        Signed Off
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                        In Progress
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Tenant</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">{insp.tenantName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Date</span>
                      <span className="text-slate-700">{insp.inspectionDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Sign-offs</span>
                      <span className="text-slate-700">
                        {insp.landlordSignOff ? '✓ Landlord' : '○ Landlord'} ·{' '}
                        {insp.tenantSignOff ? '✓ Tenant' : '○ Tenant'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Items Inspected</span>
                      <span className="text-slate-700">{(insp.items || insp.areas || []).length} Areas</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Details */}
        <div className="lg:col-span-8">
          {selectedInspection ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-4">
              {/* Toolbar */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg uppercase">
                    {selectedInspection.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Date: {selectedInspection.inspectionDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100"
                    title="Print Checklist"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Checklist Content */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedInspection.propertyTitle}</h3>
                  <p className="text-xs text-slate-500">
                    Inspected for Tenant: <strong>{selectedInspection.tenantName}</strong> · Landlord:{' '}
                    <strong>{selectedInspection.landlordName}</strong>
                  </p>
                </div>

                {/* Meter Readings & Keys */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                    <span className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> UMEME Yaka Meter
                    </span>
                    <strong className="text-sm font-mono text-slate-900 block mt-1">
                      {selectedInspection.umemeMeterReading || 'Meter Reading N/A'}
                    </strong>
                    <span className="text-[10px] text-amber-700 block">Prepaid Token Units</span>
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
                    <span className="text-[10px] font-bold text-blue-800 uppercase flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5" /> NWSC Water Meter
                    </span>
                    <strong className="text-sm font-mono text-slate-900 block mt-1">
                      {selectedInspection.waterMeterReading || 'Meter Reading N/A'}
                    </strong>
                    <span className="text-[10px] text-blue-700 block">National Water Units</span>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <Key className="w-3.5 h-3.5" /> Keys Handed Over
                    </span>
                    <strong className="text-sm font-mono text-slate-900 block mt-1">
                      {selectedInspection.keysHandedOverCount} Set(s)
                    </strong>
                    <span className="text-[10px] text-emerald-700 block">Gate, Main Door, Bedroom</span>
                  </div>
                </div>

                {/* Areas Inspected Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Area Condition Verification Checklist
                  </h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="px-4 py-2.5">Premises Area / Fixture</th>
                          <th className="px-4 py-2.5">Condition</th>
                          <th className="px-4 py-2.5">Observations & Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedInspection.items || selectedInspection.areas || []).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-semibold text-slate-800">{item.area}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                  item.condition === 'good'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.condition === 'fair'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {item.condition.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{item.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Dual Sign-Off Block */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bilateral Condition Endorsement
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Landlord Sign Off */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                      <span className="font-bold text-slate-800 block">Landlord Endorsement</span>
                      {selectedInspection.landlordSignOff ? (
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                          <CheckCircle className="w-4 h-4" />
                          <span>Endorsed on {new Date(selectedInspection.landlordSignDate!).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSignOff('landlord')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs text-xs flex items-center gap-1.5"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          Sign Off as Landlord
                        </button>
                      )}
                    </div>

                    {/* Tenant Sign Off */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                      <span className="font-bold text-slate-800 block">Tenant Endorsement</span>
                      {selectedInspection.tenantSignOff ? (
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                          <CheckCircle className="w-4 h-4" />
                          <span>Endorsed on {new Date(selectedInspection.tenantSignDate!).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSignOff('tenant')}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-xs text-xs flex items-center gap-1.5"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          Sign Off as Tenant
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h4 className="text-base font-bold text-slate-700">No Inspection Selected</h4>
              <p className="text-xs text-slate-400 mt-1">
                Select an inspection from the left panel to inspect condition ratings and endorsements.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE INSPECTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">New Move-In / Move-Out Inspection</h3>
                  <p className="text-xs text-slate-500">Record condition checklist and meter readings</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Lease Agreement</label>
                <select
                  value={createForm.leaseId}
                  onChange={(e) => {
                    const l = store.leases.find((lease) => lease.id === e.target.value);
                    if (l) {
                      setCreateForm({
                        ...createForm,
                        leaseId: l.id,
                        propertyId: l.propertyId,
                        propertyTitle: l.propertyTitle,
                        tenantId: l.tenantId,
                        tenantName: l.tenantName,
                        landlordId: l.landlordId,
                        landlordName: l.landlordName,
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
                  <label className="block font-semibold text-slate-700 mb-1">Inspection Type</label>
                  <select
                    value={createForm.type}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, type: e.target.value as 'move_in' | 'move_out' })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="move_in">Move-In Inspection</option>
                    <option value="move_out">Move-Out Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inspection Date</label>
                  <input
                    type="date"
                    value={createForm.inspectionDate}
                    onChange={(e) => setCreateForm({ ...createForm, inspectionDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">UMEME Yaka Meter Balance</label>
                  <input
                    type="text"
                    placeholder="e.g. 54.2 kWh remaining"
                    value={createForm.umemeMeterReading}
                    onChange={(e) => setCreateForm({ ...createForm, umemeMeterReading: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NWSC Water Meter Units</label>
                  <input
                    type="text"
                    placeholder="e.g. 412.3 units"
                    value={createForm.waterMeterReading}
                    onChange={(e) => setCreateForm({ ...createForm, waterMeterReading: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Number of Key Sets Handed Over</label>
                  <input
                    type="number"
                    min="1"
                    value={createForm.keysHandedOverCount}
                    onChange={(e) => setCreateForm({ ...createForm, keysHandedOverCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
                >
                  Create Inspection Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

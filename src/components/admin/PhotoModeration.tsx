import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Camera,
  Maximize2,
  ChevronRight,
  Filter,
  Eye,
  User,
  MapPin,
  Download,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { Property, PropertyImage, RejectionReason } from '../../types';

interface PhotoModerationProps {
  onSelectPropertyDetail?: (property: Property) => void;
}

const REJECTION_REASONS: RejectionReason[] = [
  'Blurry/Low quality',
  'Watermark/Logo present',
  'Inappropriate content',
  'Wrong property',
  'Duplicate photo',
  'Misleading/Stock photo',
  'Other',
];

export const PhotoModeration: React.FC<PhotoModerationProps> = () => {
  const store = useSafeNestStore();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'queue' | 'history'>('queue');
  const [queueFilter, setQueueFilter] = useState<'all' | 'pending' | 'action_needed'>('pending');

  // Inspection lightbox modal
  const [inspectingImage, setInspectingImage] = useState<PropertyImage | null>(null);

  // Rejection modal state
  const [rejectingImageId, setRejectingImageId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<RejectionReason>('Blurry/Low quality');
  const [customRejectionNotes, setCustomRejectionNotes] = useState('');

  // Bulk rejection modal
  const [isBulkRejectOpen, setIsBulkRejectOpen] = useState(false);
  const [bulkRejectionReason, setBulkRejectionReason] = useState<RejectionReason>('Blurry/Low quality');
  const [bulkNotes, setBulkNotes] = useState('');

  // Selected property
  const selectedProperty = store.properties.find((p) => p.id === selectedPropertyId);

  // Queue of properties needing attention
  const propertiesWithPendingPhotos = store.properties.filter((p) =>
    p.images.some((img) => img.status === 'pending')
  );
  const propertiesWithRejectedPhotos = store.properties.filter((p) =>
    p.images.some((img) => img.status === 'rejected')
  );

  const displayedProperties = store.properties.filter((p) => {
    if (queueFilter === 'pending') {
      return p.images.some((img) => img.status === 'pending');
    }
    if (queueFilter === 'action_needed') {
      return p.images.some((img) => img.status === 'rejected');
    }
    return true;
  });

  const handleApprovePhoto = (propertyId: string, imageId: string) => {
    store.moderatePhoto(propertyId, imageId, 'approve');
  };

  const handleOpenRejectModal = (imageId: string) => {
    setRejectingImageId(imageId);
    setRejectionReason('Blurry/Low quality');
    setCustomRejectionNotes('');
  };

  const handleConfirmReject = () => {
    if (!selectedPropertyId || !rejectingImageId) return;
    store.moderatePhoto(
      selectedPropertyId,
      rejectingImageId,
      'reject',
      rejectionReason,
      customRejectionNotes || `Rejected: ${rejectionReason}`
    );
    setRejectingImageId(null);
  };

  const handleApproveAll = () => {
    if (!selectedPropertyId) return;
    store.bulkModeratePhotos(selectedPropertyId, 'approve_all');
  };

  const handleBulkReject = () => {
    if (!selectedPropertyId) return;
    store.bulkModeratePhotos(
      selectedPropertyId,
      'reject_all',
      bulkRejectionReason,
      bulkNotes || `Bulk rejected: ${bulkRejectionReason}`
    );
    setIsBulkRejectOpen(false);
  };

  const exportModerationHistoryCSV = () => {
    const headers = ['Date', 'Moderator', 'Property Title', 'Action', 'Reason', 'Notes'];
    const rows = store.moderationLogs.map((log) => [
      new Date(log.createdAt).toLocaleString(),
      log.moderatorName,
      `"${log.propertyTitle.replace(/"/g, '""')}"`,
      log.action,
      log.reason || 'N/A',
      `"${(log.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SafeNest_Moderation_History_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900">Admin Photo Moderation Studio</h1>
              <p className="text-xs text-slate-500">
                Ensure every listing has authentic, high-resolution, un-watermarked images of real properties in Uganda.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setFilterTab('queue');
              setSelectedPropertyId(null);
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              filterTab === 'queue'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Moderation Queue ({propertiesWithPendingPhotos.length})
          </button>
          <button
            onClick={() => setFilterTab('history')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              filterTab === 'history'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            Audit History ({store.moderationLogs.length})
          </button>
        </div>
      </div>

      {filterTab === 'queue' && (
        <>
          {/* Detail View of a Selected Property for Review */}
          {selectedProperty ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Top Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <button
                    onClick={() => setSelectedPropertyId(null)}
                    className="text-xs text-emerald-700 font-semibold hover:underline mb-1 inline-flex items-center gap-1"
                  >
                    ← Back to Pending Queue
                  </button>
                  <h2 className="text-xl font-black text-slate-900">{selectedProperty.title}</h2>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {selectedProperty.neighborhood}, {selectedProperty.city} · Landlord:{' '}
                    <strong>{selectedProperty.landlordName}</strong> ({selectedProperty.landlordPhone})
                  </p>
                </div>

                {/* Quick Bulk Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBulkRejectOpen(true)}
                    className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject All
                  </button>
                  <button
                    onClick={handleApproveAll}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve All & Publish
                  </button>
                </div>
              </div>

              {/* Photos Inspection Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    Submitted Photos ({selectedProperty.images.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    Click zoom to inspect high-resolution sharpness
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedProperty.images.map((img, idx) => (
                    <div
                      key={img.id}
                      className={`rounded-2xl border-2 overflow-hidden bg-slate-50 flex flex-col transition-all ${
                        img.status === 'approved'
                          ? 'border-emerald-500/70 shadow-xs'
                          : img.status === 'rejected'
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-400/20'
                      }`}
                    >
                      {/* Photo Container */}
                      <div className="relative aspect-4/3 overflow-hidden bg-slate-900 group">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                            #{idx + 1}
                          </span>
                          {img.isMain && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                              Primary Thumbnail
                            </span>
                          )}
                        </div>

                        {/* Zoom button */}
                        <button
                          onClick={() => setInspectingImage(img)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-xs transition-colors"
                          title="Inspect High-Res"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Status Watermark */}
                        <div className="absolute bottom-2 left-2">
                          {img.status === 'approved' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                              <Check className="w-3 h-3" /> Approved
                            </span>
                          )}
                          {img.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Needs Review
                            </span>
                          )}
                          {img.status === 'rejected' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                              <X className="w-3 h-3" /> Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Photo Meta & Actions */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <div className="text-[11px] text-slate-500 flex items-center justify-between">
                          <span>Res: {img.resolution || '1920x1080'}</span>
                          <span>Size: {img.fileSize || '2.1 MB'}</span>
                        </div>

                        {img.rejectionReason && (
                          <div className="p-2 bg-rose-100 rounded-lg text-[11px] text-rose-800">
                            <strong>Reason:</strong> {img.rejectionReason}
                            {img.moderationNotes && (
                              <p className="mt-0.5 text-rose-700">{img.moderationNotes}</p>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2">
                          <button
                            onClick={() => handleApprovePhoto(selectedProperty.id, img.id)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                              img.status === 'approved'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 hover:bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {img.status === 'approved' ? 'Approved' : 'Approve'}
                          </button>

                          <button
                            onClick={() => handleOpenRejectModal(img.id)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                              img.status === 'rejected'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 hover:bg-rose-100 text-rose-800'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {img.status === 'rejected' ? 'Rejected' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Outcome Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Current Property Status:</h4>
                  <p className="text-xs text-slate-600">
                    {selectedProperty.images.every((img) => img.status === 'approved')
                      ? '✅ All photos approved. This property is fully published and visible to renters.'
                      : selectedProperty.images.some((img) => img.status === 'rejected')
                      ? '⚠️ Some photos rejected. Landlord will be notified to re-upload suitable replacements.'
                      : '⏳ Photos pending moderation review before publication.'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPropertyId(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Save & Return to Queue
                </button>
              </div>
            </div>
          ) : (
            /* Queue List of Properties */
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Properties Awaiting Moderation
                  </h2>
                  <p className="text-xs text-slate-500">
                    FIFO review order for landlord submissions.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setQueueFilter('pending')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      queueFilter === 'pending'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Pending ({propertiesWithPendingPhotos.length})
                  </button>
                  <button
                    onClick={() => setQueueFilter('action_needed')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      queueFilter === 'action_needed'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Rejections ({propertiesWithRejectedPhotos.length})
                  </button>
                  <button
                    onClick={() => setQueueFilter('all')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      queueFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    All Properties ({store.properties.length})
                  </button>
                </div>
              </div>

              {displayedProperties.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <h4 className="text-sm font-bold text-slate-800">Photo Queue Clear!</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    No properties currently require photo inspection. All photos meet the SafeNest standard.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {displayedProperties.map((prop) => {
                    const pendingCount = prop.images.filter((i) => i.status === 'pending').length;
                    const rejectedCount = prop.images.filter((i) => i.status === 'rejected').length;
                    const approvedCount = prop.images.filter((i) => i.status === 'approved').length;

                    return (
                      <div
                        key={prop.id}
                        onClick={() => setSelectedPropertyId(prop.id)}
                        className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 px-3 rounded-2xl cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prop.images[0]?.url || ''}
                            alt=""
                            className="w-16 h-12 object-cover rounded-xl border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 hover:text-emerald-700">
                                {prop.title}
                              </h4>
                              {prop.status === 'published' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  Published
                                </span>
                              )}
                              {prop.status === 'pending' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                  Under Review
                                </span>
                              )}
                              {prop.status === 'pending_photos' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                                  Fixes Needed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {prop.neighborhood}, {prop.city} · Landlord: {prop.landlordName} · Submitted {new Date(prop.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right text-xs">
                            <span className="font-bold text-amber-600 block">
                              {pendingCount} Pending Photos
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {approvedCount} Approved · {rejectedCount} Rejected
                            </span>
                          </div>

                          <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs">
                            Review Photos
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* History / Audit Trail Tab */}
      {filterTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Photo Moderation Audit Trail</h2>
              <p className="text-xs text-slate-500">
                Log of all photo approvals and rejections made by moderators.
              </p>
            </div>
            <button
              onClick={exportModerationHistoryCSV}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export to CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Moderator</th>
                  <th className="py-2.5 px-3">Property</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {store.moderationLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{log.moderatorName}</td>
                    <td className="py-3 px-3 text-slate-700 max-w-xs truncate font-medium">
                      {log.propertyTitle}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          log.action === 'approve'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{log.reason || '—'}</td>
                    <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{log.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Individual Photo Rejection Modal */}
      {rejectingImageId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-rose-700">
                <XCircle className="w-4 h-4" />
                Reject Property Photo
              </h3>
              <button
                onClick={() => setRejectingImageId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Standard Rejection Reason *
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value as RejectionReason)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20"
              >
                {REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Feedback for Landlord (Instructions for re-upload)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Photo is too dark/grainy. Please take daytime photos with curtains open."
                value={customRejectionNotes}
                onChange={(e) => setCustomRejectionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingImageId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reject Modal */}
      {isBulkRejectOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm text-rose-700">
                Bulk Reject All Photos
              </h3>
              <button
                onClick={() => setIsBulkRejectOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Rejection Reason</label>
              <select
                value={bulkRejectionReason}
                onChange={(e) => setBulkRejectionReason(e.target.value as RejectionReason)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                {REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Moderator Guidance
              </label>
              <textarea
                rows={3}
                placeholder="Instructions for landlord..."
                value={bulkNotes}
                onChange={(e) => setBulkNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsBulkRejectOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkReject}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl"
              >
                Reject All Photos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom modal */}
      {inspectingImage && (
        <div
          onClick={() => setInspectingImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-3 bg-slate-900 flex items-center justify-between text-xs text-white">
              <span className="font-semibold">
                High-Resolution Inspection ({inspectingImage.resolution} · {inspectingImage.fileSize})
              </span>
              <button
                onClick={() => setInspectingImage(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center bg-black overflow-auto p-2">
              <img
                src={inspectingImage.url}
                alt=""
                className="max-h-[80vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

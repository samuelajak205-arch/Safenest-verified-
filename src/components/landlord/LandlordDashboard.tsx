import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Plus,
  Upload,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Camera,
  HardDrive,
  Info,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { Property, PropertyImage } from '../../types';

interface LandlordDashboardProps {
  onUploadNew: () => void;
  onSelectProperty: (property: Property) => void;
}

export const LandlordDashboard: React.FC<LandlordDashboardProps> = ({
  onUploadNew,
  onSelectProperty,
}) => {
  const store = useSafeNestStore();
  const landlordProperties = store.properties.filter(
    (p) => p.landlordId === store.currentUser.id || store.currentUser.role === 'super_admin'
  );

  // Inquiries received
  const receivedInquiries = store.inquiries.filter((i) =>
    landlordProperties.some((p) => p.id === i.propertyId)
  );

  const [activeTab, setActiveTab] = useState<'properties' | 'inquiries' | 'inspections'>('properties');

  // Re-upload photo modal state
  const [reuploadingProperty, setReuploadingProperty] = useState<Property | null>(null);
  const [reuploadingImage, setReuploadingImage] = useState<PropertyImage | null>(null);
  const [newReplacementUrl, setNewReplacementUrl] = useState('');

  const publishedCount = landlordProperties.filter((p) => p.status === 'published').length;
  const pendingCount = landlordProperties.filter((p) => p.status === 'pending').length;
  const rejectedPhotosCount = landlordProperties.reduce(
    (acc, p) => acc + p.images.filter((img) => img.status === 'rejected').length,
    0
  );

  const handleOpenReupload = (property: Property, image: PropertyImage) => {
    setReuploadingProperty(property);
    setReuploadingImage(image);
    setNewReplacementUrl('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200');
  };

  const handleConfirmReupload = () => {
    if (!reuploadingProperty || !reuploadingImage || !newReplacementUrl) return;
    store.reuploadPhoto(
      reuploadingProperty.id,
      reuploadingImage.id,
      newReplacementUrl,
      '2.4 MB',
      '2048x1365'
    );
    setReuploadingProperty(null);
    setReuploadingImage(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Landlord Property Management</h1>
            {store.currentUser.isVerified && (
              <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Landlord
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, {store.currentUser.fullName}. Manage your rental units, resolve photo moderation flags, and reply to tenant inquiries.
          </p>
        </div>

        <button
          onClick={onUploadNew}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Property
        </button>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Listings</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{landlordProperties.length}</div>
          <span className="text-[11px] text-slate-400">In Uganda portfolio</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Live & Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{publishedCount}</div>
          <span className="text-[11px] text-emerald-600">Visible to all renters</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Photo Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</div>
          <span className="text-[11px] text-slate-400">Pending admin approval</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tenant Inquiries</span>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{receivedInquiries.length}</div>
          <span className="text-[11px] text-blue-600">Prospective tenant leads</span>
        </div>
      </div>

      {/* Alert if photos rejected */}
      {rejectedPhotosCount > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-rose-900">
                Action Required: {rejectedPhotosCount} Photos Rejected by SafeNest Admin
              </h4>
              <p className="text-xs text-rose-700">
                Please re-upload replacement photos for the flagged listings below to complete publication.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('properties')}
            className="px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-2xs shrink-0"
          >
            Fix Rejected Photos
          </button>
        </div>
      )}

      {/* Tab Switcher: Listings vs Inquiries */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'properties'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Properties ({landlordProperties.length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'inquiries'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tenant Inquiries & Leads ({receivedInquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('inspections')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'inspections'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Daily Inspections ({store.inspectionBookings.filter(b => b.agentId === store.currentUser.id).length})
        </button>
      </div>

      {/* Tab 1: Properties List */}
      {activeTab === 'properties' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="divide-y divide-slate-100">
            {landlordProperties.map((prop) => {
              const approvedImgs = prop.images.filter((i) => i.status === 'approved').length;
              const pendingImgs = prop.images.filter((i) => i.status === 'pending').length;
              const rejectedImgs = prop.images.filter((i) => i.status === 'rejected');

              return (
                <div key={prop.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div
                      onClick={() => onSelectProperty(prop)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <img
                        src={prop.images[0]?.url || ''}
                        alt=""
                        className="w-16 h-14 object-cover rounded-xl border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                            {prop.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                              prop.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prop.status === 'pending_photos'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {prop.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {prop.neighborhood}, {prop.city} · USh {prop.rentAmount.toLocaleString()} / mo · {prop.bedrooms} Bed · {prop.bathrooms} Bath
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <span className="font-semibold text-slate-700 block">
                          Photos: {approvedImgs}/{prop.images.length} Approved
                        </span>
                        {pendingImgs > 0 && (
                          <span className="text-[11px] text-amber-600 font-medium">
                            {pendingImgs} Pending Review
                          </span>
                        )}
                        {rejectedImgs.length > 0 && (
                          <span className="text-[11px] text-rose-600 font-bold block">
                            {rejectedImgs.length} Rejected
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onSelectProperty(prop)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* Rejected Photos Resolution Sub-strip */}
                  {rejectedImgs.length > 0 && (
                    <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Action Needed: Fix Rejected Images for this listing</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {rejectedImgs.map((rejImg) => (
                          <div
                            key={rejImg.id}
                            className="flex items-center gap-2 p-2 bg-white rounded-xl border border-rose-200"
                          >
                            <img
                              src={rejImg.url}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg shrink-0 opacity-70"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-rose-800 truncate">
                                {rejImg.rejectionReason}
                              </p>
                              <p className="text-[10px] text-slate-500 line-clamp-1">
                                {rejImg.moderationNotes || 'Needs replacement'}
                              </p>
                              <button
                                onClick={() => handleOpenReupload(prop, rejImg)}
                                className="mt-1 text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                              >
                                <Upload className="w-3 h-3" />
                                Re-upload Replacement
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Tenant Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Prospective Tenant Inquiries</h2>
          {receivedInquiries.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">No inquiries received yet. Inquiries will appear here when tenants book inspections.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {receivedInquiries.map((inq) => (
                <div key={inq.id} className="py-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{inq.name}</h4>
                        <span className="text-[11px] text-slate-500">
                          interested in <strong className="text-slate-800">{inq.propertyTitle}</strong>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 italic">"{inq.message}"</p>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{inq.phone}</span>
                    </div>
                    {inq.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inq.email}</span>
                      </div>
                    )}
                    {inq.moveInDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Move-in: {new Date(inq.moveInDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <a
                      href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hello ${inq.name}, I received your SafeNest inquiry regarding ${inq.propertyTitle}.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Reply on WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Daily Inspections */}
      {activeTab === 'inspections' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">Today's Inspection Bookings</h2>
            <span className="text-xs text-slate-500 font-semibold">
              {store.inspectionBookings.filter(b => b.agentId === store.currentUser.id).length} Scheduled
            </span>
          </div>

          {store.inspectionBookings.filter(b => b.agentId === store.currentUser.id).length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold">No inspection bookings assigned to you yet.</p>
              <p className="text-[10px] text-slate-400 mt-1">When tenants book inspections for your properties, they will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {store.inspectionBookings
                .filter(b => b.agentId === store.currentUser.id)
                .map((bk) => {
                  const matchedProp = store.properties.find((p) => p.id === bk.propertyId);
                  const tenantName = bk.userId === 'usr_tenant_001' ? 'Samuel Tenant' : 'Prospective Tenant';
                  const tenantPhone = '+256 782 555 123';

                  return (
                    <div key={bk.id} className="py-4 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded capitalize ${
                              bk.type === 'virtual' ? 'bg-indigo-50 text-indigo-700' :
                              bk.type === 'premium' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'
                            }`}>
                              {bk.type === 'virtual' ? '🎥 Virtual' : bk.type === 'premium' ? '💎 Premium' : '📍 In-Person'} Tour
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-xs font-bold text-slate-900">
                              {matchedProp ? matchedProp.title : 'Property Listing'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Tenant: <strong className="text-slate-700">{tenantName}</strong> ({tenantPhone})
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{new Date(bk.scheduledAt).toLocaleDateString()} at {new Date(bk.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-extrabold text-slate-900">
                            UGX {bk.price.toLocaleString()}
                          </span>
                          {/* Payment Status Badge */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase ${
                            bk.paymentStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            bk.paymentStatus === 'claimed_paid' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                            bk.paymentStatus === 'disputed' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {bk.paymentStatus === 'confirmed' ? 'CONFIRMED' :
                             bk.paymentStatus === 'claimed_paid' ? 'PAID (Awaiting Conf.)' :
                             bk.paymentStatus === 'disputed' ? 'DISPUTED' : 'PENDING'}
                          </span>
                        </div>
                      </div>

                      {/* Payment details if renter claimed paid */}
                      {bk.paymentStatus === 'claimed_paid' && (
                        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs space-y-1.5">
                          <p className="font-semibold text-blue-900 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-blue-700" />
                            <span>Renter claims payment has been sent via Mobile Money:</span>
                          </p>
                          {bk.paymentReference && (
                            <p className="text-[11px] text-blue-800">
                              <strong>Transaction ID / Ref:</strong> <span className="font-mono bg-blue-100 px-1 py-0.5 rounded text-blue-950 font-bold">{bk.paymentReference}</span>
                            </p>
                          )}
                          {bk.paymentProofUrl && (
                            <div className="mt-2">
                              <span className="text-[10px] font-bold text-slate-500 block mb-1">Attached Receipt Screenshot:</span>
                              <a href={bk.paymentProofUrl} target="_blank" rel="noreferrer" className="inline-block border border-slate-200 rounded-lg overflow-hidden max-w-[150px] hover:opacity-90">
                                <img src={bk.paymentProofUrl} alt="MoMo Receipt" className="w-full object-cover aspect-video" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Agent actions */}
                      <div className="flex gap-2 items-center justify-end bg-slate-50 p-2 rounded-xl border border-slate-100">
                        {bk.paymentStatus !== 'confirmed' ? (
                          <>
                            <button
                              onClick={() => store.confirmBookingPayment(bk.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors"
                            >
                              Confirm Payment
                            </button>
                            
                            {bk.paymentStatus === 'claimed_paid' && (
                              <button
                                onClick={() => store.disputeBookingPayment(bk.id)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold transition-colors"
                              >
                                Not Paid / Disagree
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 px-2 py-1 bg-emerald-100/50 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Payment Confirmed & Inspection Ready
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Re-upload Photo Replacement Modal */}
      {reuploadingImage && reuploadingProperty && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Re-upload Replacement Photo</h3>
            <p className="text-xs text-slate-500">
              Replace the rejected photo for "{reuploadingProperty.title}".
            </p>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs">
              <span className="font-bold text-rose-800">Admin Rejection Feedback:</span>
              <p className="text-rose-700 mt-0.5">
                {reuploadingImage.rejectionReason} - {reuploadingImage.moderationNotes || 'Please upload high-resolution replacement.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                New High-Quality Photo URL *
              </label>
              <input
                type="url"
                value={newReplacementUrl}
                onChange={(e) => setNewReplacementUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            {newReplacementUrl && (
              <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={newReplacementUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setReuploadingProperty(null);
                  setReuploadingImage(null);
                }}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReupload}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs"
              >
                Submit for Moderation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

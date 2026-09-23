import React, { useState } from 'react';
import {
  MessageSquare,
  Building2,
  Bell,
  ChevronRight,
  User,
  ShieldCheck,
  Calendar,
  Info,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { Inquiry } from '../../types';
import { ChatModal } from '../common/ChatModal';

interface UserInboxViewProps {
  onBrowseRentals: () => void;
}

export const UserInboxView: React.FC<UserInboxViewProps> = ({ onBrowseRentals }) => {
  const store = useSafeNestStore();
  const [activeTab, setActiveTab] = useState<'all' | 'landlords' | 'community' | 'inspections'>('all');
  const [activeChatInquiry, setActiveChatInquiry] = useState<Inquiry | null>(null);

  // States for submitting inspection payments
  const [activeClaimingId, setActiveClaimingId] = useState<string | null>(null);
  const [tempRef, setTempRef] = useState('');
  const [tempProof, setTempProof] = useState('');

  // Fetch user inspection bookings
  const myBookings = store.inspectionBookings.filter((b) => b.userId === store.currentUser.id);

  // Inquiries relevant to this user or general announcements
  const userInquiries = store.inquiries.filter(
    (i) => i.userId === store.currentUser.id || i.userId === 'usr_tenant_001' || i.userId === 'all_tenants'
  );

  // Dynamic user property/building resolution based on active lease agreements
  const activeLease = store.leases.find(
    (l) => (l.tenantId === store.currentUser.id || l.tenantId === 'usr_user_001') && l.status === 'active'
  );
  const userPropertyId = activeLease?.propertyId || 'prop_001';
  const propertyTitle = activeLease ? activeLease.propertyTitle.split('—')[0].split('with')[0].trim() : 'Kololo Luxury Suite';
  const displayBuildingName = `${propertyTitle} Community Chat`;

  // Fetch latest group chat message for real-time inbox status previews
  const communityChatMessages = store.buildingChatMessages.filter(
    (m) => m.propertyId === userPropertyId
  );
  const lastCommunityMessage = communityChatMessages[communityChatMessages.length - 1];
  const lastCommunityText = lastCommunityMessage
    ? `${lastCommunityMessage.senderName}: ${lastCommunityMessage.message}`
    : 'No community updates yet.';

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900">Inbox</h1>
          <p className="text-xs text-slate-500">
            Messages with landlords, building announcements, and notifications
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'all', label: 'All Messages' },
          { id: 'landlords', label: 'Landlords' },
          { id: 'community', label: 'Building Chat' },
          { id: 'inspections', label: `Inspections (${myBookings.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold min-h-[38px] transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="space-y-2.5">
        {/* Building Chat card simulation */}
        {(activeTab === 'all' || activeTab === 'community') && (
          <div
            onClick={() =>
              setActiveChatInquiry({
                id: 'building_chat',
                propertyId: userPropertyId,
                propertyTitle: displayBuildingName,
                propertyImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600',
                userId: 'building_group',
                landlordId: 'usr_landlord_001',
                name: displayBuildingName,
                email: 'community@safenest.ug',
                phone: '+256 772 000 000',
                message: lastCommunityText,
                status: 'new',
                createdAt: new Date().toISOString(),
              })
            }
            className="p-3.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex items-center justify-between hover:border-emerald-500/50 hover:shadow-xs cursor-pointer transition-all min-h-[64px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-slate-900">{displayBuildingName}</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                    Group
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 font-medium">
                  {lastCommunityText}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Active</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        )}

        {/* Inquiries */}
        {(activeTab === 'all' || activeTab === 'landlords') && userInquiries.map((inq) => (
          <div
            key={inq.id}
            onClick={() => setActiveChatInquiry(inq)}
            className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between hover:border-emerald-500/50 hover:shadow-xs cursor-pointer transition-all min-h-[64px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-slate-900">{inq.name}</h4>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md">
                    Verified Landlord
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 font-medium line-clamp-1 mt-0.5">
                  {inq.propertyTitle}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {inq.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-1.5 py-0.5 bg-emerald-500 text-slate-950 font-bold text-[9px] rounded-full">
                New
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        ))}

        {/* Tab 4: Inspections */}
        {activeTab === 'inspections' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs flex gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 mb-0.5">Offline Payments Only</p>
                <p className="text-slate-600 leading-relaxed">
                  SafeNest tracks your payment status, but does not process money. Send Mobile Money (MoMo) or pay cash directly to the agent/landlord, then click "I've Paid" to submit transaction reference.
                </p>
              </div>
            </div>

            {myBookings.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl">
                <Calendar className="w-10 h-10 mx-auto text-slate-200 mb-2" />
                <h4 className="text-xs font-bold text-slate-700">No Bookings Found</h4>
                <p className="text-[11px] text-slate-400 mt-1">Book an inspection on any property listing to see details here.</p>
                <button
                  onClick={onBrowseRentals}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-500 transition-colors"
                >
                  Browse Properties
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myBookings.map((bk) => {
                  const matchedProp = store.properties.find((p) => p.id === bk.propertyId);
                  const isClaiming = activeClaimingId === bk.id;

                  return (
                    <div key={bk.id} className="p-4 bg-white border border-slate-200 rounded-3xl space-y-3.5 shadow-2xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded capitalize ${
                              bk.type === 'virtual' ? 'bg-indigo-50 text-indigo-700' :
                              bk.type === 'premium' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'
                            }`}>
                              {bk.type === 'virtual' ? '🎥 Virtual Tour' : bk.type === 'premium' ? '💎 Premium Visit' : '📍 In-Person Visit'}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-xs font-black text-slate-800 line-clamp-1">{matchedProp ? matchedProp.title : 'Property Listing'}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {new Date(bk.scheduledAt).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} at {new Date(bk.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 mt-1">
                            Assigned Agent/MoMo: <strong className="text-slate-700">{matchedProp?.landlordName || 'SafeNest Partner'}</strong> ({matchedProp?.landlordPhone || '+256 772 300 450'})
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-slate-900 block">UGX {bk.price?.toLocaleString() || '0'}</span>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${
                            bk.paymentStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            bk.paymentStatus === 'claimed_paid' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                            bk.paymentStatus === 'disputed' ? 'bg-rose-100 text-rose-800 font-bold' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {bk.paymentStatus === 'confirmed' ? 'CONFIRMED' :
                             bk.paymentStatus === 'claimed_paid' ? 'Awaiting Conf' :
                             bk.paymentStatus === 'disputed' ? 'DISPUTED' : 'PENDING'}
                          </span>
                        </div>
                      </div>

                      {/* Display payment instructions for pending/disputed */}
                      {(bk.paymentStatus === 'pending' || bk.paymentStatus === 'disputed') && !isClaiming && (
                        <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-[11px] space-y-2">
                          <p className="font-bold text-amber-900 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>How to pay this agent directly:</span>
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-1">
                            <li>Send MoMo <strong>UGX {bk.price?.toLocaleString() || '0'}</strong> to <strong>{matchedProp?.landlordPhone || '+256 772 300 450'}</strong> ({matchedProp?.landlordName || 'SafeNest Partner'}).</li>
                            <li>Or pay cash to the agent immediately upon arrival.</li>
                          </ul>
                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() => {
                                setActiveClaimingId(bk.id);
                                setTempRef('');
                                setTempProof('');
                              }}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] rounded-xl shadow-xs transition-colors"
                            >
                              I've Paid (Submit Info)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Claim Payment Form (inline) */}
                      {isClaiming && (
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3 animate-in slide-in-from-top-2 duration-150">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-slate-800 text-[11px]">Submit Mobile Money Payment Details</h5>
                            <button
                              onClick={() => setActiveClaimingId(null)}
                              className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                            >
                              Cancel
                            </button>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">MoMo Transaction ID / Reference ID *</label>
                            <input
                              type="text"
                              value={tempRef}
                              onChange={(e) => setTempRef(e.target.value)}
                              placeholder="e.g. TXN103948574"
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-mono uppercase font-bold text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Receipt Screenshot URL (Optional)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={tempProof}
                                onChange={(e) => setTempProof(e.target.value)}
                                placeholder="e.g. Paste screenshot URL"
                                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium text-slate-600"
                              />
                              <button
                                type="button"
                                onClick={() => setTempProof('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800')}
                                className="px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200/50 text-[10px] shrink-0"
                              >
                                Use Dummy Receipt
                              </button>
                            </div>
                          </div>

                          <div className="pt-1 flex justify-end gap-1.5">
                            <button
                              onClick={() => setActiveClaimingId(null)}
                              className="px-3 py-1.5 text-slate-500 hover:text-slate-700 font-semibold"
                            >
                              Back
                            </button>
                            <button
                              onClick={() => {
                                if (!tempRef.trim()) {
                                  alert('Please provide a MoMo Transaction Reference ID.');
                                  return;
                                }
                                store.claimBookingPaid(bk.id, tempRef, tempProof || undefined);
                                setActiveClaimingId(null);
                              }}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs text-[10px]"
                            >
                              Submit Proof
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Claimed Paid state view */}
                      {bk.paymentStatus === 'claimed_paid' && (
                        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl text-[11px] space-y-1 text-blue-900 font-medium">
                          <p className="font-bold text-blue-950 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-blue-600" />
                            <span>Payment details submitted successfully!</span>
                          </p>
                          <p>Transaction ID: <span className="font-mono font-bold bg-blue-100 px-1 py-0.5 rounded text-blue-950">{bk.paymentReference}</span></p>
                          <p className="text-xs text-blue-700/90 mt-1 leading-relaxed">
                            The agent has been notified and is currently verifying this offline receipt in their ledger. You will be notified instantly when payment is confirmed!
                          </p>
                        </div>
                      )}

                      {/* Confirmed state view */}
                      {bk.paymentStatus === 'confirmed' && (
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold text-emerald-950">Payment Confirmed!</p>
                            <p className="text-[10px] text-emerald-700/90 leading-normal">
                              Your direct payment has been acknowledged. The agent is waiting to conduct your inspection!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {activeChatInquiry && (
        <ChatModal
          inquiry={activeChatInquiry}
          onClose={() => setActiveChatInquiry(null)}
        />
      )}
    </div>
  );
};

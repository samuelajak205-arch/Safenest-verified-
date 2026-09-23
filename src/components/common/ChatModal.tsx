import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  User,
  Building,
  ShieldCheck,
  Share2,
  Pin,
  MessageCircle,
  Info,
  Phone,
  CheckCircle,
  AlertCircle,
  Users,
  Check
} from 'lucide-react';
import { Inquiry, BuildingChatMessage } from '../../types';
import { useSafeNestStore } from '../../lib/store';
import { ShareModal } from './ShareModal';

interface ChatModalProps {
  inquiry: Inquiry;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ inquiry, onClose }) => {
  const store = useSafeNestStore();
  const isGroupChat = inquiry.id === 'building_chat';
  const propertyId = inquiry.propertyId;

  const [inputText, setInputText] = useState('');
  const [sharingMessage, setSharingMessage] = useState<any>(null);
  const [showDirectory, setShowDirectory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group chat announcements (pinned notices)
  const activeAnnouncements = store.buildingChatAnnouncements.filter(
    (a) => a.propertyId === propertyId
  );
  const pinnedAnnouncement = activeAnnouncements.find((a) => a.pinned);

  // Resolve staff members of this property
  const propertyStaff = store.buildingStaff.filter((s) => s.propertyId === propertyId);

  // Resolve active leases of this property to display real tenant rosters
  const activeLeases = store.leases.filter(
    (l) => l.propertyId === propertyId && l.status === 'active'
  );

  // Load appropriate messages depending on Chat mode
  // If building group chat, pull dynamically from store
  const [localMessages, setLocalMessages] = useState<any[]>([
    {
      id: 'msg_initial_1',
      senderName: inquiry.name,
      senderId: inquiry.userId,
      senderRole: 'landlord',
      senderBadge: 'Landlord',
      message: inquiry.message,
      createdAt: inquiry.createdAt || new Date().toISOString(),
    }
  ]);

  const activeMessages = isGroupChat
    ? store.buildingChatMessages.filter((m) => m.propertyId === propertyId)
    : localMessages;

  // Auto scroll to bottom when message arrives
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages, showDirectory]);

  // Click-to-chat helper for staff / tenant
  const triggerWhatsAppChat = (phoneNumber: string, name: string, roleName: string) => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const defaultText = `Hello ${name}, I am contacting you from the SafeNest community group chat regarding the block facilities and maintenance request.`;
    const encodedText = encodeURIComponent(defaultText);
    const link = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(link, '_blank');
  };

  const handleShareMessage = async (msgText: string, sender: string) => {
    const text = `💬 Message from ${sender}: "${msgText}"\n\nSent via SafeNest Uganda`;
    const url = window.location.origin;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SafeNest Chat Message',
          text,
          url
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed', err);
        }
      }
    } else {
      setSharingMessage({ senderName: sender, message: msgText });
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    if (isGroupChat) {
      // 1. Group community message dispatch
      const senderRole = store.currentUser.role === 'landlord' ? 'landlord' : 'tenant';
      
      // Look up current user's apartment number if they are a tenant
      const myLease = store.leases.find(
        (l) => l.tenantId === store.currentUser.id && l.status === 'active'
      );
      const myAptBadge = myLease ? (myLease.propertyAddress || 'Resident') : 'Resident';
      const senderBadge = store.currentUser.role === 'landlord' ? 'Landlord' : `Tenant • ${myAptBadge}`;

      store.sendBuildingChatMessage(
        propertyId,
        inputText.trim(),
        store.currentUser.id,
        store.currentUser.fullName,
        senderRole,
        senderBadge
      );

      setInputText('');

      // Auto reply trigger for demo experience if user sends message
      if (store.currentUser.role === 'user') {
        setTimeout(() => {
          const mockReplies = [
            {
              text: "Hello everyone, the cleaner has completed cleaning the third-floor stairwells. Please let me know if there are any issues.",
              sender: "Sarah Cleaner",
              role: "staff" as const,
              badge: "Staff • Cleaner",
              phone: "+256 788 901 234"
            },
            {
              text: "Thank you, Sarah. We noticed the security gates are being locked at exactly 10 PM. Can we review this?",
              sender: "Brian Mukasa",
              role: "tenant" as const,
              badge: "Tenant • Apt 14",
              phone: "+256 701 445 667"
            }
          ];
          const choice = mockReplies[Math.floor(Math.random() * mockReplies.length)];
          
          store.sendBuildingChatMessage(
            propertyId,
            choice.text,
            `mock_user_${Date.now()}`,
            choice.sender,
            choice.role,
            choice.badge
          );
        }, 2500);
      }
    } else {
      // 2. Direct message scenario
      const newMsg = {
        id: `msg_direct_${Date.now()}`,
        senderName: store.currentUser.fullName,
        senderId: store.currentUser.id,
        senderRole: store.currentUser.role === 'landlord' ? 'landlord' : 'tenant',
        senderBadge: store.currentUser.role === 'landlord' ? 'Landlord' : 'Tenant',
        message: inputText.trim(),
        createdAt: new Date().toISOString(),
      };

      setLocalMessages((prev) => [...prev, newMsg]);
      setInputText('');

      // Auto reply simulation for 1-to-1 landlord-tenant messages
      setTimeout(() => {
        setLocalMessages((prev) => [
          ...prev,
          {
            id: `msg_reply_${Date.now()}`,
            senderName: inquiry.landlordId ? 'Grace Nakimera' : 'SafeNest Support',
            senderId: inquiry.landlordId || 'system',
            senderRole: inquiry.landlordId ? 'landlord' : 'system',
            senderBadge: inquiry.landlordId ? 'Landlord' : 'Support',
            message: 'Hello! Thank you for reaching out. The property is open for in-person tours and active viewing bookings. Please let us know if there is anything specific you would like to ask.',
            createdAt: new Date().toISOString(),
          }
        ]);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md h-[92vh] sm:h-[650px] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Chat Header */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
              {isGroupChat ? <Building className="w-5 h-5 text-white" /> : inquiry.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5 truncate">
                {inquiry.name}
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </h3>
              <p className="text-[10px] text-slate-400 truncate">
                {isGroupChat ? 'SafeNest Verified Block Chat' : inquiry.propertyTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isGroupChat && (
              <button
                onClick={() => setShowDirectory(!showDirectory)}
                className={`p-2 text-slate-300 hover:text-white rounded-xl min-h-[38px] transition-colors flex items-center gap-1 text-[11px] font-bold ${
                  showDirectory ? 'bg-slate-800 text-white' : ''
                }`}
                title="View Directory"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Directory</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg min-h-[38px] min-w-[38px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Directory Drawer (If opened for Community chat) */}
        {isGroupChat && showDirectory && (
          <div className="bg-slate-100 border-b border-slate-200 p-3.5 space-y-3.5 overflow-y-auto max-h-[180px] transition-all">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Verified Building Contractors
              </h4>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 font-bold rounded-full">
                {propertyStaff.length} active
              </span>
            </div>

            {/* Contractors List inside Drawer */}
            <div className="grid grid-cols-2 gap-2">
              {propertyStaff.map((staff) => (
                <div key={staff.id} className="p-2 bg-white rounded-xl border border-slate-200 flex flex-col justify-between space-y-1.5">
                  <div>
                    <h5 className="font-bold text-[11px] text-slate-900 truncate">{staff.name}</h5>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-full">
                      {staff.role}
                    </span>
                  </div>
                  <button
                    onClick={() => triggerWhatsAppChat(staff.phone || '+256772000000', staff.name, staff.role)}
                    className="w-full py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[9px] font-black flex items-center justify-center gap-1 transition-all"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              ))}
              {propertyStaff.length === 0 && (
                <div className="col-span-2 text-center py-2 text-[10px] text-slate-400">
                  No staff members registered yet.
                </div>
              )}
            </div>

            {/* Tenants List inside Drawer */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                Active Residents ({activeLeases.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeLeases.map((lease) => (
                  <span
                    key={lease.id}
                    className="inline-block px-2 py-1 bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-lg"
                  >
                    {lease.tenantName} ({lease.propertyAddress || 'Unit'})
                  </span>
                ))}
                {activeLeases.length === 0 && (
                  <span className="text-[10px] text-slate-400 italic">No resident leases signed yet.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pinned Announcements Bar */}
        {isGroupChat && pinnedAnnouncement && (
          <div className="bg-amber-50 border-b border-amber-200 p-2.5 flex items-start gap-2.5 text-[11px] text-amber-900">
            <Pin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 rotate-45" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="font-extrabold uppercase text-[9px] tracking-wider text-amber-800">
                  PINNED ANNOUNCEMENT
                </span>
                <span className="text-[9px] text-amber-600">
                  · {new Date(pinnedAnnouncement.createdAt).toLocaleDateString()}
                </span>
              </div>
              <strong className="font-bold text-slate-900 block truncate text-xs">
                {pinnedAnnouncement.title}
              </strong>
              <p className="text-[11px] text-slate-700 leading-relaxed line-clamp-2">
                {pinnedAnnouncement.body}
              </p>
            </div>
          </div>
        )}

        {/* Gatekeeper Inquiries Status & Response panel for Landlord and Tenant */}
        {!isGroupChat && (
          <div>
            {(inquiry.status === 'forwarded' || inquiry.status === 'new' || inquiry.status === 'reviewing') ? (
              <div className="bg-amber-50 border-b border-amber-200 p-3.5 text-[11px] text-slate-800 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                  <span className="p-1 bg-amber-100 rounded-full shrink-0 text-xs">⏳</span>
                  <span>Direct Contact Blocked (Mediation Active)</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11.5px]">
                  Contacts and WhatsApp links are shielded to protect owner privacy. This is a SafeNest pre-screened lead. Approve the connection to unlock.
                </p>
                {store.currentUser.role === 'landlord' && (
                  <button
                    onClick={() => {
                      store.connectInquiryParties(inquiry.id, 'both', 'Landlord Grace Nakimera approved direct connection!');
                      alert('✓ Direct connection approved! Tenant phone details and WhatsApp click-to-chat bridge are now unlocked.');
                      onClose();
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Approve & Unlock Direct Contacts</span>
                  </button>
                )}
              </div>
            ) : inquiry.status === 'connected' ? (
              <div className="bg-emerald-50 border-b border-emerald-200 p-3.5 text-[11px] text-emerald-950 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                  <span className="p-1 bg-emerald-100 rounded-full shrink-0 text-xs">🎉</span>
                  <span>Verified Connection Active</span>
                </div>
                <p className="text-emerald-800 leading-relaxed text-[11.5px]">
                  Direct communication channels are now fully authorized. Call, email, or use the direct WhatsApp link to chat.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 text-xs font-bold text-slate-700 bg-white border border-emerald-100 p-2.5 rounded-xl">
                  <span className="flex items-center gap-1">📞 {inquiry.phone || '+256 701 445 667'}</span>
                  <span className="hidden sm:inline text-slate-300">|</span>
                  <span className="flex items-center gap-1">✉️ {inquiry.email || 'tenant@safenest.ug'}</span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Message Thread Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-slate-200/60 border border-slate-300/40 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-wider">
              {isGroupChat ? '💬 ENCRYPTED NEIGHBORHOOD CHANNEL' : '🔒 1-ON-1 VERIFIED CHAT'}
            </span>
          </div>

          {activeMessages.map((m: any) => {
            const isSelf = m.senderId === store.currentUser.id;
            const isSystem = m.senderId === 'system';

            // Extract role metrics
            const isLandlord = m.senderRole === 'landlord';
            const isStaff = m.senderRole === 'staff';
            const isTenant = m.senderRole === 'tenant' || m.senderRole === 'user' || (!isLandlord && !isStaff && !isSystem);

            // Fetch dynamic lease information for accurate apartment numbers
            const lease = store.leases.find((l) => l.tenantId === m.senderId && l.status === 'active');
            const dynamicAptNumber = lease?.propertyAddress || m.senderBadge || 'Resident';

            if (isSystem) {
              return (
                <div key={m.id} className="text-center py-1">
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                    {m.message}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} group relative`}
              >
                <div className="max-w-[85%] space-y-0.5">
                  
                  {/* Sender Name & Badges */}
                  <div className={`flex items-center gap-1.5 px-1 flex-wrap ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] font-black text-slate-800">
                      {m.senderName} 
                      {/* Show apartment details directly in name as requested for tenants */}
                      {isTenant && (
                        <span className="text-slate-400 font-normal ml-1">
                          ({dynamicAptNumber.includes('Apt') || dynamicAptNumber.includes('Unit') ? dynamicAptNumber : `Apt ${dynamicAptNumber}`})
                        </span>
                      )}
                    </span>

                    {/* Role Badge Tag */}
                    {isLandlord && (
                      <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.2 rounded-md">
                        <Check className="w-2.5 h-2.5" />
                        Landlord
                      </span>
                    )}
                    {isStaff && (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[8px] font-black px-1.5 py-0.2 rounded-md">
                        Staff • {m.senderBadge?.replace('Staff • ', '') || 'Contractor'}
                      </span>
                    )}
                    {isTenant && !isSelf && (
                      <span className="bg-slate-150 text-slate-600 text-[8px] font-extrabold px-1.5 py-0.2 rounded-md">
                        Tenant
                      </span>
                    )}
                  </div>

                  {/* Bubble Container */}
                  <div className="flex items-center gap-2">
                    {isSelf && (
                      <button
                        onClick={() => handleShareMessage(m.message, m.senderName)}
                        className="opacity-0 group-hover:opacity-100 p-1 bg-slate-200 hover:bg-slate-300 text-slate-500 rounded-lg transition-opacity shrink-0"
                        title="Share Message"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Chat Bubble Text */}
                    <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isSelf
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs'
                    }`}>
                      {m.message}
                    </div>

                    {!isSelf && (
                      <div className="flex items-center gap-1">
                        {/* WhatsApp Click-to-chat deep-link for Staff and Landlord, or any active contractors */}
                        {(isStaff || isLandlord || isTenant) && (
                          <button
                            onClick={() => {
                              // Retrieve standard mock phone numbers
                              const defaultPhones: Record<string, string> = {
                                'Sarah Cleaner': '+256 788 901 234',
                                'Peter Okello': '+256 755 234 567',
                                'Grace Nakimera': '+256 772 334 112',
                                'Brian Mukasa': '+256 701 445 667',
                              };
                              const phoneNum = defaultPhones[m.senderName] || '+256 772 000 000';
                              triggerWhatsAppChat(phoneNum, m.senderName, m.senderBadge || 'Resident');
                            }}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full transition-all shrink-0 shadow-2xs"
                            title={`Click to WhatsApp Chat with ${m.senderName}`}
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                          </button>
                        )}

                        <button
                          onClick={() => handleShareMessage(m.message, m.senderName)}
                          className="opacity-0 group-hover:opacity-100 p-1 bg-slate-200 hover:bg-slate-300 text-slate-500 rounded-lg transition-opacity shrink-0"
                          title="Share Message"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Timestamp and Hold feedback */}
                  <div className={`flex items-center gap-2 px-1 text-[9px] text-slate-400 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    <span>
                      {new Date(m.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>·</span>
                    <span className="text-[8px]">Tap share icon to export</span>
                  </div>

                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Textbox Box */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isGroupChat ? "Broadcast to block community..." : "Type your message..."}
            className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 min-h-[44px]"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="px-4 py-2.5 bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs min-h-[44px] flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>

      </div>

      {sharingMessage && (
        <ShareModal
          title="SafeNest Chat Message"
          text={`💬 Message from ${sharingMessage.senderName}: "${sharingMessage.message}"`}
          url={window.location.origin}
          onClose={() => setSharingMessage(null)}
        />
      )}
    </div>
  );
};

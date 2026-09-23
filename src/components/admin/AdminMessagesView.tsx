import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  MessageSquare,
  Megaphone,
  Box,
  Search,
  Pin,
  Clock,
  ArrowRight,
  Send,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  FileText,
  User,
  ExternalLink,
  ChevronRight,
  MessageCircle,
  Activity,
  Check,
  AlertCircle
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { Inquiry, DirectChatMessage } from '../../types';

interface AdminMessagesViewProps {
  onNavigateToInquiryDetail?: (id: string) => void;
}

export const AdminMessagesView: React.FC<AdminMessagesViewProps> = ({ onNavigateToInquiryDetail }) => {
  const store = useSafeNestStore();
  const [activeTab, setActiveTab] = useState<'action' | 'chats' | 'announcements' | 'system'>('action');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Time mock for 3 days and 24 hrs stuck/waiting calculations
  const CURRENT_TIME_MS = new Date('2026-09-17T23:36:13-07:00').getTime();

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversationId, store.directMessages]);

  // Calculations for ACTION TAB Groupings
  const getStuckInterests = (): Inquiry[] => {
    return store.inquiries.filter((inq) => {
      if (inq.status === 'dismissed' || inq.status === 'connected') return false;
      const ageMs = CURRENT_TIME_MS - new Date(inq.createdAt).getTime();
      return ageMs > 3 * 24 * 60 * 60 * 1000; // > 3 days
    });
  };

  const getWaitingOnLandlord = (): Inquiry[] => {
    return store.inquiries.filter((inq) => {
      if (inq.status !== 'contacting_landlord' && inq.status !== 'forwarded') return false;
      const ageMs = CURRENT_TIME_MS - new Date(inq.createdAt).getTime();
      return ageMs > 24 * 60 * 60 * 1000; // > 24 hours
    });
  };

  const getNewInterests = (): Inquiry[] => {
    return store.inquiries.filter(inq => inq.status === 'new');
  };

  const getLandlordDeclinedInterests = (): Inquiry[] => {
    // any rejected or closed by landlord (or simulated as dismissed but with landlord note)
    return store.inquiries.filter(inq => inq.status === 'closed' || (inq.status === 'dismissed' && inq.adminNotes?.toLowerCase().includes('decline')));
  };

  const getFollowUpRequested = (): Inquiry[] => {
    return store.inquiries.filter(inq => inq.message.toLowerCase().includes('call') || inq.message.toLowerCase().includes('schedule') || inq.message.toLowerCase().includes('urgent'));
  };

  const newInterests = getNewInterests();
  const stuckInterests = getStuckInterests();
  const waitingLandlord = getWaitingOnLandlord();
  const landlordDeclined = getLandlordDeclinedInterests();
  const followUpRequested = getFollowUpRequested();

  const totalActionCount = newInterests.length + stuckInterests.length + waitingLandlord.length + landlordDeclined.length + followUpRequested.length;

  // CHATS Tab calculations
  // Get unique conversations based on inquiries
  const conversations = store.inquiries.map(inq => {
    const messages = store.directMessages.filter(m => m.conversationId === inq.conversationId);
    const lastMsg = messages[messages.length - 1];
    return {
      inquiry: inq,
      conversationId: inq.conversationId || `conv_${inq.id}`,
      lastMessage: lastMsg || {
        senderName: inq.name,
        message: inq.message,
        createdAt: inq.createdAt
      },
      unreadCount: inq.status === 'new' ? 1 : 0,
      isPinned: inq.id === 'inq_001', // mock pin the top active chat
      isActiveNow: inq.status === 'contacting_user' || inq.status === 'connecting'
    };
  }).sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());

  // Group conversations by recency
  const getGroupedChats = () => {
    const pinned: typeof conversations = [];
    const active: typeof conversations = [];
    const today: typeof conversations = [];
    const yesterday: typeof conversations = [];
    const thisWeek: typeof conversations = [];
    const older: typeof conversations = [];

    const now = new Date('2026-09-17T23:36:13-07:00').getTime();

    conversations.forEach(c => {
      if (c.isPinned) {
        pinned.push(c);
        return;
      }
      if (c.isActiveNow) {
        active.push(c);
        return;
      }

      const msgTime = new Date(c.lastMessage.createdAt).getTime();
      const diffHrs = (now - msgTime) / (1000 * 60 * 60);

      if (diffHrs < 24) {
        today.push(c);
      } else if (diffHrs < 48) {
        yesterday.push(c);
      } else if (diffHrs < 168) {
        thisWeek.push(c);
      } else {
        older.push(c);
      }
    });

    return { pinned, active, today, yesterday, thisWeek, older };
  };

  const groupedChats = getGroupedChats();

  // ANNOUNCEMENTS
  const announcements = [
    {
      id: 'ann_1',
      title: '📋 Standard Verification Update for Renters',
      sender: 'SafeNest Admin (David)',
      body: 'All renters are now required to submit their National Identification Number (NIN) to obtain the "NIN Verified" status prior to direct connection to landlords.',
      createdAt: '2026-03-15T09:00:00Z',
      reads: 142
    },
    {
      id: 'ann_2',
      title: '⚡ MTN MoMo Instant Receipt Verification',
      sender: 'SafeNest Finance',
      body: 'In-person inspection bookings can now be paid instantly via MTN MoMo with automatic visual receipt generation.',
      createdAt: '2026-03-14T15:30:00Z',
      reads: 98
    }
  ];

  // SYSTEM LOGS / MESSAGES
  const systemLogs = [
    {
      id: 'log_1',
      type: 'security_alert',
      title: '🔒 Successful Backup Confirmed',
      body: 'SafeNest automatic database snapshot completed successfully. 1,492 inquiry records backed up to Google Drive storage.',
      createdAt: '2026-03-17T23:00:00Z'
    },
    {
      id: 'log_2',
      type: 'audit_log',
      title: '👤 NIN Validation Success',
      body: 'User "Brian Mukasa" verified successfully matching NIRA record registration: CF9810...',
      createdAt: '2026-03-17T18:42:00Z'
    },
    {
      id: 'log_3',
      type: 'system_alert',
      title: '🚀 Cloud Infrastructure Healthy',
      body: 'Development environment server active on host 0.0.0.0:3000 running behind SafeNest proxy.',
      createdAt: '2026-03-17T00:01:00Z'
    }
  ];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedConversationId) return;

    // Send the message
    store.sendDirectMessage(
      selectedConversationId,
      chatInput,
      'usr_admin_001',
      'David (Gatekeeper)',
      'admin'
    );
    setChatInput('');
  };

  // Find inquiry linked to selected conversation
  const selectedInq = store.inquiries.find(inq => inq.conversationId === selectedConversationId);
  const activeChatMessages = store.directMessages.filter(m => m.conversationId === selectedConversationId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[calc(100vh-140px)] pb-16">
      {/* Sidebar/Inbox Area (7 columns on large screen if chat open, otherwise 12) */}
      <div className={`col-span-1 lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden min-h-[500px]`}>
        {/* Header Tabs */}
        <div className="bg-slate-900 p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-black flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Gatekeeper Inbox</span>
            </h1>
            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
              Admin Mode
            </span>
          </div>

          {/* Search bar */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations, names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* 4 Tabs Menu */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 text-center text-xs">
          <button
            onClick={() => setActiveTab('action')}
            className={`py-3 font-extrabold flex flex-col items-center justify-center gap-1 border-b-2 transition-all ${
              activeTab === 'action'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wide">
              Action {totalActionCount > 0 && <span className="text-red-500">({totalActionCount})</span>}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`py-3 font-extrabold flex flex-col items-center justify-center gap-1 border-b-2 transition-all ${
              activeTab === 'chats'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wide">Chats</span>
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`py-3 font-extrabold flex flex-col items-center justify-center gap-1 border-b-2 transition-all ${
              activeTab === 'announcements'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wide">Broadcast</span>
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`py-3 font-extrabold flex flex-col items-center justify-center gap-1 border-b-2 transition-all ${
              activeTab === 'system'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Box className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wide">System</span>
          </button>
        </div>

        {/* Tab Body List Scroll area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[550px]">
          
          {/* TAB 1: 🔔 ACTION NEEDED */}
          {activeTab === 'action' && (
            <div className="p-3 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Action Required
                </span>
                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-bold text-[10px]">
                  {totalActionCount} pending
                </span>
              </div>

              {/* 🟠 NEW INTERESTS SECTION */}
              {newInterests.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase text-amber-800 tracking-wider bg-amber-50 p-1.5 rounded-md border border-amber-100 flex items-center justify-between">
                    <span>🟠 New Interests</span>
                    <span>({newInterests.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {newInterests.map(inq => (
                      <div key={inq.id} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-all shadow-3xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-950">
                            {inq.name}
                          </span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Just now
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-semibold line-clamp-1">
                          🏠 {inq.propertyTitle}
                        </div>
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-md border border-slate-100 line-clamp-2">
                          "{inq.message}"
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => {
                              setSelectedConversationId(inq.conversationId || `conv_${inq.id}`);
                              setActiveTab('chats');
                            }}
                            className="flex-1 text-center py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black hover:bg-emerald-700 uppercase"
                          >
                            Reply / Chat
                          </button>
                          <button
                            onClick={() => onNavigateToInquiryDetail?.(inq.id)}
                            className="px-2.5 text-center py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-200 flex items-center justify-center gap-1"
                          >
                            <span>Full Profile</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🟠 STUCK INTERESTS SECTION */}
              {stuckInterests.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase text-red-800 tracking-wider bg-red-50 p-1.5 rounded-md border border-red-100 flex items-center justify-between">
                    <span>🔴 Stuck &gt; 3 Days</span>
                    <span>({stuckInterests.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {stuckInterests.map(inq => {
                      const days = Math.round((CURRENT_TIME_MS - new Date(inq.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={inq.id} className="p-3 bg-red-50/20 border border-red-200 rounded-xl hover:border-red-500 transition-all shadow-3xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-950 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              {inq.name}
                            </span>
                            <span className="text-[10px] font-black text-red-700 uppercase bg-red-100/60 px-1.5 py-0.5 rounded">
                              {days} Days Stuck
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-700 font-semibold">
                            Stage: <span className="uppercase text-red-700 font-black">{inq.status.replace('_', ' ')}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">
                            🏠 {inq.propertyTitle}
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => {
                                setSelectedConversationId(inq.conversationId || `conv_${inq.id}`);
                                setActiveTab('chats');
                              }}
                              className="flex-1 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-lg hover:bg-red-700 uppercase text-center"
                            >
                              Emergency Follow Up
                            </button>
                            <button
                              onClick={() => onNavigateToInquiryDetail?.(inq.id)}
                              className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-200"
                            >
                              View Detail
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 🟠 WAITING ON LANDLORD */}
              {waitingLandlord.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase text-indigo-800 tracking-wider bg-indigo-50 p-1.5 rounded-md border border-indigo-100 flex items-center justify-between">
                    <span>🔵 Waiting on Landlord (&gt;24h)</span>
                    <span>({waitingLandlord.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {waitingLandlord.map(inq => (
                      <div key={inq.id} className="p-3 bg-indigo-50/10 border border-indigo-100 rounded-xl hover:border-indigo-500 transition-all shadow-3xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-950">
                            {inq.name} ➔ {inq.landlordSnapshot?.name || 'Grace Nakimera'}
                          </span>
                          <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-black uppercase">
                            No Reply Yet
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600">
                          Property: <strong className="text-slate-800 font-bold">{inq.propertyTitle}</strong>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <a
                            href={`https://wa.me/${(inq.landlordSnapshot?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hi ${inq.landlordSnapshot?.name}, David from SafeNest here regarding the qualified tenant referral "${inq.name}" for your property "${inq.propertyTitle}". Just following up to see if you had any questions.`
                            )}`}
                            target="_blank"
                            rel="referrer"
                            className="flex-1 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg hover:bg-indigo-700 uppercase text-center flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Send WA Reminder
                          </a>
                          <button
                            onClick={() => onNavigateToInquiryDetail?.(inq.id)}
                            className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-200"
                          >
                            Detail
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🟠 USER FOLLOW-UP REQUESTED */}
              {followUpRequested.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase text-teal-800 tracking-wider bg-teal-50 p-1.5 rounded-md border border-teal-100 flex items-center justify-between">
                    <span>🟢 User Inspection Requests</span>
                    <span>({followUpRequested.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {followUpRequested.slice(0, 2).map(inq => (
                      <div key={inq.id} className="p-3 bg-teal-50/15 border border-teal-100 rounded-xl space-y-1.5 shadow-3xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900">{inq.name}</span>
                          <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-black uppercase">Schedule Request</span>
                        </div>
                        <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-100">
                          "{inq.message}"
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedConversationId(inq.conversationId || `conv_${inq.id}`);
                              setActiveTab('chats');
                            }}
                            className="flex-1 text-center py-1.5 bg-teal-600 text-white rounded-lg text-[10px] font-bold hover:bg-teal-700 uppercase"
                          >
                            Propose Inspection
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 💬 CHATS LIST */}
          {activeTab === 'chats' && (
            <div className="divide-y divide-slate-100">
              
              {/* PINNED SECTION */}
              {groupedChats.pinned.length > 0 && (
                <div className="p-2.5 bg-slate-50/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-2 mb-1.5 flex items-center gap-1">
                    <Pin className="w-3.5 h-3.5 text-emerald-600" />
                    Pinned Conversations
                  </span>
                  {groupedChats.pinned.map(c => (
                    <button
                      key={c.conversationId}
                      onClick={() => setSelectedConversationId(c.conversationId)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 border ${
                        selectedConversationId === c.conversationId
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={c.inquiry.propertyImage}
                        alt="prop"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <strong className="text-xs font-black text-slate-900">{c.inquiry.name}</strong>
                          <span className="text-[9px] text-slate-400">
                            {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-800 font-extrabold truncate">{c.inquiry.propertyTitle}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {c.lastMessage.senderName ? `${c.lastMessage.senderName}: ` : ''}{c.lastMessage.message}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* ACTIVE NOW SECTION */}
              {groupedChats.active.length > 0 && (
                <div className="p-2.5">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block px-2 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Conversations
                  </span>
                  <div className="space-y-1.5">
                    {groupedChats.active.map(c => (
                      <button
                        key={c.conversationId}
                        onClick={() => setSelectedConversationId(c.conversationId)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 border ${
                          selectedConversationId === c.conversationId
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-white border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={c.inquiry.propertyImage}
                          alt="prop"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <strong className="text-xs font-black text-slate-900">{c.inquiry.name}</strong>
                            <span className="text-[9px] text-slate-400">
                              {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-800 font-bold truncate">{c.inquiry.propertyTitle}</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {c.lastMessage.senderName ? `${c.lastMessage.senderName}: ` : ''}{c.lastMessage.message}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TODAY SECTION */}
              {groupedChats.today.length > 0 && (
                <div className="p-2.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-2 mb-1">Today</span>
                  {groupedChats.today.map(c => (
                    <button
                      key={c.conversationId}
                      onClick={() => setSelectedConversationId(c.conversationId)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 border ${
                        selectedConversationId === c.conversationId
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                        {c.inquiry.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <strong className="text-xs font-extrabold text-slate-900">{c.inquiry.name}</strong>
                          <span className="text-[9px] text-slate-400">
                            {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{c.inquiry.propertyTitle}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 italic">
                          "{c.lastMessage.message}"
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* YESTERDAY & OLDER */}
              {(groupedChats.yesterday.length > 0 || groupedChats.thisWeek.length > 0 || groupedChats.older.length > 0) && (
                <div className="p-2.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-2 mb-1">Older Conversations</span>
                  {[...groupedChats.yesterday, ...groupedChats.thisWeek, ...groupedChats.older].map(c => (
                    <button
                      key={c.conversationId}
                      onClick={() => setSelectedConversationId(c.conversationId)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 border ${
                        selectedConversationId === c.conversationId
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                        {c.inquiry.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <strong className="text-xs text-slate-800">{c.inquiry.name}</strong>
                          <span className="text-[9px] text-slate-400">
                            {new Date(c.lastMessage.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {c.lastMessage.message}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* ARCHIVED (COLLAPSED MOCK) */}
              <div className="p-2 bg-slate-50">
                <details className="text-xs font-bold text-slate-500 cursor-pointer">
                  <summary className="p-2 select-none hover:text-slate-800 uppercase tracking-wider text-[9px] font-black">
                    📦 Show 24 Archived Chats
                  </summary>
                  <div className="p-2 text-[11px] text-slate-400 italic">
                    Historical completed connections archived cleanly.
                  </div>
                </details>
              </div>

            </div>
          )}

          {/* TAB 3: 📢 BROADCAST ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="p-3 space-y-3.5">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                System Broadcasts
              </span>
              <div className="space-y-3">
                {announcements.map(ann => (
                  <div key={ann.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-xs text-slate-900 flex items-start gap-1.5 leading-snug">
                      <Megaphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      {ann.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ann.body}
                    </p>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50 mt-1">
                      <span>Sender: {ann.sender}</span>
                      <span>Reads: {ann.reads} views</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: 📦 SYSTEM */}
          {activeTab === 'system' && (
            <div className="p-3 space-y-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                Administrative Audit Logs
              </span>
              <div className="space-y-2">
                {systemLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-900 text-slate-200 rounded-xl space-y-1 border border-slate-800">
                    <div className="flex justify-between items-center text-[10px] font-black text-emerald-400 uppercase">
                      <span>{log.type.replace('_', ' ')}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h5 className="font-bold text-xs text-white">{log.title}</h5>
                    <p className="text-[11px] text-slate-400">{log.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Chat Conversation Thread Context & Message logs Area (7 columns) */}
      <div className="col-span-1 lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col min-h-[500px]">
        {selectedConversationId && selectedInq ? (
          <div className="flex-1 flex flex-col h-full justify-between">
            {/* Thread Header with snapshot copy */}
            <div className="bg-slate-50 border-b border-slate-200 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedInq.propertyImage}
                  alt="prop"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-1">
                    {selectedInq.propertyTitle}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                    <span className="font-extrabold text-slate-800 shrink-0">
                      Applicant: {selectedInq.name}
                    </span>
                    <span>·</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase rounded">
                      {selectedInq.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action trigger button link */}
              <button
                onClick={() => onNavigateToInquiryDetail?.(selectedInq.id)}
                className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
              >
                <span>Process Stage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sticky warning warning landlords can't bypass */}
            <div className="bg-amber-50 border-b border-amber-100 px-3.5 py-2 text-[10px] font-bold text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Contact locked for landlord Grace Nakimera until you approve the direct mediation link!</span>
            </div>

            {/* Messages Content scroll body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 max-h-[380px]">
              <div className="text-center my-2">
                <span className="px-2 py-1 bg-slate-200/60 rounded text-[9px] font-black uppercase tracking-wider text-slate-500">
                  Secure Direct Bridge Active
                </span>
              </div>

              {activeChatMessages.map((msg) => {
                const isAdmin = msg.senderRole === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 shadow-3xs ${
                        isAdmin
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 text-[9px] font-bold opacity-80">
                        <span>{msg.senderName}</span>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap font-medium">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Thread Textarea input sending bar */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder={`Type a prefilled message reply to ${selectedInq.name}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white min-h-[42px]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50/20">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-2.5" />
            <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
              No Conversation Selected
            </h4>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1 leading-relaxed">
              Select an ongoing direct qualification chat from the **Chats** tab, or click "Reply / Chat" on a new action request to begin secure gatekeeper messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

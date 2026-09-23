import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Building2,
  ChevronRight,
  ShieldCheck,
  Search,
  Users,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Megaphone,
  Phone,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  Pin,
  X,
  Send,
  Share2,
  User,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { Inquiry, BuildingStaff, BuildingChatMessage, BuildingChatAnnouncement, StaffRole } from '../../types';
import { ChatModal } from '../common/ChatModal';

export const LandlordMessagesView: React.FC = () => {
  const store = useSafeNestStore();
  
  // Tabs: 'attention' | 'building' | 'direct' | 'system'
  const [activeTab, setActiveTab] = useState<'attention' | 'building' | 'direct' | 'system'>('attention');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected building details sub-view
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [buildingSubTab, setBuildingSubTab] = useState<'chat' | 'announcements' | 'staff' | 'tenants'>('chat');
  
  // Modals / Form States
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<BuildingStaff | null>(null);
  const [showAddAnnModal, setShowAddAnnModal] = useState(false);
  
  // Chat input
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // New staff form state
  const [staffForm, setStaffForm] = useState({
    name: '',
    role: 'Electrician' as StaffRole,
    phone: '',
    availability: 'Mon-Fri 8AM-5PM',
    notes: '',
  });

  // New announcement form state
  const [annForm, setAnnForm] = useState({
    title: '',
    body: '',
    pinned: true,
  });

  // Auto scroll building chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [store.buildingChatMessages, selectedBuildingId, buildingSubTab]);

  // Current Landlord's Portfolio Properties
  const landlordProperties = store.properties.filter(
    (p) => p.landlordId === store.currentUser.id || p.createdBy === store.currentUser.id
  );

  // Use general properties if landlord currently has none listed
  const activeProperties = landlordProperties.length > 0 ? landlordProperties : store.properties;

  // Selected Property Object
  const selectedProperty = store.properties.find((p) => p.id === selectedBuildingId);

  // 1. Needs Attention Tab Filter (Unread/Unreplied direct inquiries + Urgent System notifications)
  const needsAttentionInquiries = store.inquiries.filter(
    (inq) => (inq.landlordId === store.currentUser.id || inq.landlordId === 'usr_landlord_001') && inq.status !== 'closed'
  );

  // 2. Direct Messages Tab (All individual inquires)
  const directInquiries = store.inquiries.filter(
    (inq) => inq.landlordId === store.currentUser.id || inq.landlordId === 'usr_landlord_001'
  );

  // 3. System Tab Filter (In-App notices for landlord)
  const systemNotifications = store.notifications.filter(
    (n) => n.userId === store.currentUser.id && (n.type === 'payment' || n.type === 'system_alert' || n.type === 'maintenance')
  );

  // Search filter
  const filteredInquiries = (inquiries: Inquiry[]) => {
    return inquiries.filter(
      (i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredProperties = () => {
    return activeProperties.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Click-to-chat WhatsApp generator
  const getWhatsAppLink = (phone: string, staffName: string) => {
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    const text = `Hello ${staffName}, this is landlord Grace Nakimera from SafeNest. I would like to request maintenance services on our block. Please let me know your availability.`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
  };

  // Submit new staff
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.phone || !selectedBuildingId) return;

    store.addStaffMember({
      propertyId: selectedBuildingId,
      name: staffForm.name,
      role: staffForm.role,
      phone: staffForm.phone,
      whatsappNumber: staffForm.phone,
      availability: staffForm.availability,
      notes: staffForm.notes,
      photoUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=150`,
    });

    setStaffForm({
      name: '',
      role: 'Electrician',
      phone: '',
      availability: 'Mon-Fri 8AM-5PM',
      notes: '',
    });
    setShowAddStaffModal(false);
  };

  // Edit staff
  const handleEditStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    store.editStaffMember(editingStaff);
    setEditingStaff(null);
  };

  // Submit announcement
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.body || !selectedBuildingId) return;

    store.addBuildingAnnouncement({
      propertyId: selectedBuildingId,
      title: annForm.title,
      body: annForm.body,
      pinned: annForm.pinned,
    });

    setAnnForm({
      title: '',
      body: '',
      pinned: true,
    });
    setShowAddAnnModal(false);
  };

  // Send message inside building group chat
  const handleSendGroupMessage = () => {
    if (!chatInput.trim() || !selectedBuildingId) return;

    store.sendBuildingChatMessage(
      selectedBuildingId,
      chatInput.trim(),
      store.currentUser.id,
      store.currentUser.fullName,
      'landlord',
      'Landlord'
    );

    setChatInput('');
  };

  // Extract Tenant roster for selected building based on active leases
  const buildingTenants = store.leases.filter(
    (l) => l.propertyId === selectedBuildingId && l.status === 'active'
  );

  return (
    <div className="space-y-4 pb-28">
      {/* 1. Main List Navigation Views */}
      {!selectedBuildingId ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div>
              <h1 className="text-xl font-black text-slate-900">Communication Hub</h1>
              <p className="text-xs text-slate-500">
                Manage inquiries, property group chats, verified staff, and system logs
              </p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-emerald-200">
              Landlord Mode
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations, buildings, or messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 min-h-[42px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Four Navigation Sections Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-bold">
            {[
              { id: 'attention', label: 'Needs Attention', badge: needsAttentionInquiries.length },
              { id: 'building', label: 'By Building', badge: activeProperties.length },
              { id: 'direct', label: 'Direct Chats', badge: directInquiries.length },
              { id: 'system', label: 'System Logs', badge: systemNotifications.filter(n => !n.isRead).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery('');
                }}
                className={`py-2 px-1 rounded-lg text-center relative transition-all min-h-[38px] flex flex-col items-center justify-center ${
                  activeTab === tab.id
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[8px] font-black ${
                    tab.id === 'attention' ? 'bg-rose-500 text-white' : 'bg-slate-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content Lists Based on Tabs */}
          <div className="space-y-2.5">
            {/* TAB: Needs Attention */}
            {activeTab === 'attention' && (
              <>
                {needsAttentionInquiries.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 space-y-2">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-800">You are all caught up!</h4>
                    <p className="text-[11px] text-slate-400">No unread tenant inquiries require attention.</p>
                  </div>
                ) : (
                  filteredInquiries(needsAttentionInquiries).map((inquiry) => (
                    <div
                      key={inquiry.id}
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-center justify-between hover:border-amber-400 hover:shadow-xs cursor-pointer transition-all min-h-[70px]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-xs shrink-0 relative">
                          {inquiry.name.charAt(0)}
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {inquiry.name}
                            </h4>
                            <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-sm">
                              NEW
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800 font-semibold truncate">
                            {inquiry.propertyTitle}
                          </p>
                          <p className="text-[11px] text-slate-600 truncate italic">
                            "{inquiry.message}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <ChevronRight className="w-4 h-4 text-amber-500" />
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* TAB: By Building */}
            {activeTab === 'building' && (
              <>
                {filteredProperties().map((property) => {
                  // Count current staff and active tenants
                  const staffCount = store.buildingStaff.filter((s) => s.propertyId === property.id).length;
                  const tenantCount = store.leases.filter((l) => l.propertyId === property.id && l.status === 'active').length;
                  const latestMsg = store.buildingChatMessages
                    .filter((m) => m.propertyId === property.id)
                    .pop();

                  return (
                    <div
                      key={property.id}
                      onClick={() => {
                        setSelectedBuildingId(property.id);
                        setBuildingSubTab('chat');
                      }}
                      className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col hover:border-emerald-500 hover:shadow-xs cursor-pointer transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0 border border-slate-200">
                            <Building2 className="w-5 h-5 text-emerald-600" />
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                              {property.title.split('—')[0].split('with')[0].trim()}
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            </h4>
                            <p className="text-[10px] text-slate-400">
                              {property.neighborhood}, {property.city}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>

                      {/* Snippet message */}
                      <div className="p-2 rounded-lg bg-slate-50 text-[11px] text-slate-600 truncate">
                        {latestMsg ? (
                          <span>
                            <strong className="text-slate-800">{latestMsg.senderName}:</strong> {latestMsg.message}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No messages in this channel yet.</span>
                        )}
                      </div>

                      {/* Info badges */}
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 border-t border-slate-100 pt-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {tenantCount} Tenants
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                          {staffCount} Verified Staff
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* TAB: Direct */}
            {activeTab === 'direct' && (
              <>
                {directInquiries.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-800">No direct inquiries</h4>
                    <p className="text-[11px] text-slate-400">Prospect tenants will appear here when they send an inquiry.</p>
                  </div>
                ) : (
                  filteredInquiries(directInquiries).map((inquiry) => (
                    <div
                      key={inquiry.id}
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between hover:border-emerald-500/50 hover:shadow-xs cursor-pointer transition-all min-h-[64px]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0 border border-emerald-100">
                          {inquiry.name.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {inquiry.name}
                            </h4>
                            <span className="text-[9px] text-slate-400">
                              · {new Date(inquiry.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-700 font-medium truncate">
                            {inquiry.propertyTitle}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{inquiry.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* TAB: System Logs */}
            {activeTab === 'system' && (
              <>
                {systemNotifications.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-800">No system events</h4>
                    <p className="text-[11px] text-slate-400">Automated landlord transaction logs appear here.</p>
                  </div>
                ) : (
                  systemNotifications.map((noti) => (
                    <div
                      key={noti.id}
                      className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl flex items-start gap-3"
                    >
                      <div className="p-2 bg-slate-200 text-slate-600 rounded-lg shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[10px] text-slate-800 uppercase tracking-wider">
                            {noti.type}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(noti.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">
                          {noti.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {noti.body}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </>
      ) : (
        /* 2. Building Conversation Hub Nested Sub-View */
        <div className="space-y-4">
          {/* Sub-Header Back Navigation */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <button
              onClick={() => setSelectedBuildingId(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors py-2 px-1 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portfolio</span>
            </button>

            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              SafeNest Verified Block
            </span>
          </div>

          {/* Building Title block */}
          <div className="p-4 bg-emerald-900 text-white rounded-2xl relative overflow-hidden shadow-md">
            <div className="relative z-10 space-y-1">
              <h2 className="font-black text-sm sm:text-base leading-tight">
                {selectedProperty?.title.split('—')[0].split('with')[0].trim()}
              </h2>
              <p className="text-xs text-emerald-200">
                {selectedProperty?.address}, {selectedProperty?.neighborhood}, {selectedProperty?.city}
              </p>
            </div>
            {/* Background design accents */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
              <Building2 className="w-32 h-32" />
            </div>
          </div>

          {/* Sub-tabs inside Building Hub */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-[10px] font-bold">
            {[
              { id: 'chat', label: '💬 Group Chat' },
              { id: 'announcements', label: '📢 Notices' },
              { id: 'staff', label: '👥 Staff Directory' },
              { id: 'tenants', label: '🏠 Tenant Roster' },
            ].map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => setBuildingSubTab(subTab.id as any)}
                className={`py-2 px-1 rounded-lg text-center transition-all min-h-[36px] flex items-center justify-center ${
                  buildingSubTab === subTab.id
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {subTab.label}
              </button>
            ))}
          </div>

          {/* SUB-VIEW 1: GROUP CHAT */}
          {buildingSubTab === 'chat' && (
            <div className="border border-slate-200 rounded-2xl bg-slate-50 flex flex-col overflow-hidden h-[480px]">
              {/* Pinned Announcement Bar in Chat */}
              {store.buildingChatAnnouncements.filter((a) => a.propertyId === selectedBuildingId && a.pinned).length > 0 && (
                <div className="bg-amber-50 border-b border-amber-200 p-2.5 flex items-start gap-2 text-[11px] text-amber-900">
                  <Pin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 rotate-45" />
                  <div className="min-w-0 flex-1">
                    <strong className="font-extrabold block">PINNED ANNOUNCEMENT:</strong>
                    <span className="line-clamp-1 italic">
                      "{store.buildingChatAnnouncements.filter((a) => a.propertyId === selectedBuildingId && a.pinned)[0].title} - {store.buildingChatAnnouncements.filter((a) => a.propertyId === selectedBuildingId && a.pinned)[0].body}"
                    </span>
                  </div>
                  <button
                    onClick={() => setBuildingSubTab('announcements')}
                    className="text-[10px] font-bold text-amber-700 hover:underline shrink-0 ml-1 mt-0.5"
                  >
                    View
                  </button>
                </div>
              )}

              {/* Message List Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                <div className="text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-slate-200 text-slate-600 uppercase font-black tracking-wide">
                    Encrypted Block Community Chat
                  </span>
                </div>

                {store.buildingChatMessages
                  .filter((m) => m.propertyId === selectedBuildingId)
                  .map((msg) => {
                    const isLandlord = msg.senderRole === 'landlord';
                    const isSystem = msg.senderId === 'system';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center py-1">
                          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                            {msg.message}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isLandlord ? 'items-end' : 'items-start'}`}
                      >
                        <div className="max-w-[85%] space-y-0.5">
                          {/* Sender meta */}
                          <div className={`flex items-center gap-1.5 px-1 ${isLandlord ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] font-black text-slate-800">
                              {msg.senderName}
                            </span>
                            {msg.senderBadge && (
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                isLandlord
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : msg.senderRole === 'staff'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}>
                                {msg.senderBadge}
                              </span>
                            )}
                          </div>

                          {/* Message bubble */}
                          <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                            isLandlord
                              ? 'bg-emerald-600 text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs'
                          }`}>
                            {msg.message}
                          </div>

                          {/* Timestamp and Pin Trigger */}
                          <div className={`flex items-center gap-2 px-1 text-[9px] text-slate-400 ${isLandlord ? 'justify-end' : 'justify-start'}`}>
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>·</span>
                            <button
                              onClick={() => store.togglePinMessage(msg.id)}
                              className={`hover:text-slate-600 flex items-center gap-0.5 ${msg.isPinned ? 'text-amber-500 font-bold' : ''}`}
                            >
                              <Pin className={`w-2.5 h-2.5 ${msg.isPinned ? 'fill-current' : 'rotate-45'}`} />
                              {msg.isPinned ? 'Pinned' : 'Pin'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Send Input Box */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendGroupMessage()}
                  placeholder="Broadcast message to all tenants & staff in block..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 min-h-[44px]"
                />
                <button
                  onClick={handleSendGroupMessage}
                  disabled={!chatInput.trim()}
                  className="px-4.5 py-2.5 bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs min-h-[44px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: ANNOUNCEMENTS */}
          {buildingSubTab === 'announcements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Community Announcements Board
                </h3>
                <button
                  onClick={() => setShowAddAnnModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg flex items-center gap-1 hover:bg-emerald-700 min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Notice</span>
                </button>
              </div>

              <div className="space-y-3">
                {store.buildingChatAnnouncements.filter((a) => a.propertyId === selectedBuildingId).length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 space-y-2">
                    <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-800">No active notices</h4>
                    <p className="text-[11px] text-slate-400">Post utility updates, emergency alerts, or general rules here.</p>
                  </div>
                ) : (
                  store.buildingChatAnnouncements
                    .filter((a) => a.propertyId === selectedBuildingId)
                    .map((ann) => (
                      <div
                        key={ann.id}
                        className={`p-4 rounded-2xl border ${
                          ann.pinned
                            ? 'bg-amber-50/70 border-amber-200'
                            : 'bg-white border-slate-200'
                        } flex items-start justify-between gap-3`}
                      >
                        <div className="space-y-2 min-w-0">
                          <div className="flex items-center gap-2">
                            {ann.pinned && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Pin className="w-2.5 h-2.5 fill-current" />
                                PINNED NOTICE
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(ann.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                            {ann.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {ann.body}
                          </p>
                        </div>

                        <button
                          onClick={() => store.deleteBuildingAnnouncement(ann.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg shrink-0 transition-colors"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: STAFF DIRECTORY */}
          {buildingSubTab === 'staff' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Verified Building Contractors
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Tenants can view contact details and chat directly on WhatsApp
                  </p>
                </div>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg flex items-center gap-1 hover:bg-emerald-700 min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Staff</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {store.buildingStaff.filter((s) => s.propertyId === selectedBuildingId).length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-800">No staff registered</h4>
                    <p className="text-[11px] text-slate-400">Add trusted plumbers, askaris, or gardeners for your tenants to contact.</p>
                  </div>
                ) : (
                  store.buildingStaff
                    .filter((s) => s.propertyId === selectedBuildingId)
                    .map((staff) => (
                      <div
                        key={staff.id}
                        className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-3 shadow-2xs hover:border-emerald-500/30 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
                            {staff.photoUrl ? (
                              <img
                                src={staff.photoUrl}
                                alt={staff.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <User className="w-6 h-6 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-xs text-slate-900 truncate">
                                {staff.name}
                              </h4>
                              <span className="text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-full">
                                {staff.role}
                              </span>
                            </div>

                            <p className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              {staff.availability}
                            </p>

                            {staff.notes && (
                              <p className="text-[11px] text-slate-500 line-clamp-2">
                                {staff.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                          {/* WhatsApp Click-to-Chat Deep Link */}
                          <a
                            href={getWhatsAppLink(staff.phone, staff.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition-all min-h-[34px]"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                            <span>WhatsApp Link</span>
                          </a>

                          {/* Edit / Trash Actions for landlord */}
                          <button
                            onClick={() => setEditingStaff(staff)}
                            className="p-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg min-h-[34px] min-w-[34px] flex items-center justify-center"
                            title="Edit Contractor Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => store.deleteStaffMember(staff.id)}
                            className="p-1.5 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 rounded-lg min-h-[34px] min-w-[34px] flex items-center justify-center"
                            title="Remove Contractor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* SUB-VIEW 4: TENANT ROSTER */}
          {buildingSubTab === 'tenants' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Active Block Residents
                </h3>
                <p className="text-[10px] text-slate-400">
                  Tenants with verified active lease agreements are automatically grouped here
                </p>
              </div>

              <div className="space-y-2.5">
                {buildingTenants.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-800">No active tenants yet</h4>
                    <p className="text-[11px] text-slate-400">Approved applicants with signed leases will automatically join.</p>
                  </div>
                ) : (
                  buildingTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0 border border-slate-200">
                          {tenant.tenantName.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {tenant.tenantName}
                          </h4>
                          <p className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                            <span className="bg-emerald-50 px-1.5 py-0.2 rounded-md">
                              Unit {tenant.propertyAddress || 'Unit'}
                            </span>
                            · Active Resident
                          </p>
                        </div>
                      </div>

                      {/* Deep Click WhatsApp shortcut */}
                      <a
                        href={`https://wa.me/${(tenant.tenantPhone || '+256772000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${tenant.tenantName}, this is the landlord Grace Nakimera from SafeNest...`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px] rounded-lg flex items-center gap-1 hover:bg-emerald-100 min-h-[36px]"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat Link</span>
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS & DRAWERS */}
      {/* ======================================================== */}

      {/* 1. Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-150 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
                Register Verified Contractor
              </h3>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Peter Okello"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 min-h-[40px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Profession / Role
                </label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as StaffRole })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 min-h-[40px]"
                >
                  {['Askari', 'Electrician', 'Plumber', 'Gardener', 'Cleaner', 'Garbage Collector', 'Carpenter', 'Painter', 'Other'].map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., +256 755 234 567"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 min-h-[40px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Availability hours
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mon-Sat 8AM-6PM"
                  value={staffForm.availability}
                  onChange={(e) => setStaffForm({ ...staffForm, availability: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 min-h-[40px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Notes
                </label>
                <textarea
                  placeholder="Notes about rates or specific skills..."
                  value={staffForm.notes}
                  onChange={(e) => setStaffForm({ ...staffForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 min-h-[60px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all min-h-[42px]"
              >
                Register Contractor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-150 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
                Edit Contractor Profile
              </h3>
              <button
                onClick={() => setEditingStaff(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditStaff} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 min-h-[40px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Profession / Role
                </label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value as StaffRole })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 min-h-[40px]"
                >
                  {['Askari', 'Electrician', 'Plumber', 'Gardener', 'Cleaner', 'Garbage Collector', 'Carpenter', 'Painter', 'Other'].map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={editingStaff.phone}
                  onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value, whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 min-h-[40px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Availability hours
                </label>
                <input
                  type="text"
                  required
                  value={editingStaff.availability}
                  onChange={(e) => setEditingStaff({ ...editingStaff, availability: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 min-h-[40px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Notes
                </label>
                <textarea
                  value={editingStaff.notes || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 min-h-[60px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all min-h-[42px]"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Announcement Modal */}
      {showAddAnnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-150 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
                Publish Building Broadcast
              </h3>
              <button
                onClick={() => setShowAddAnnModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAnnouncement} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Notice Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Scheduled Water Pump Outage"
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 min-h-[40px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Message / Details
                </label>
                <textarea
                  required
                  placeholder="Write clear instructions for residents..."
                  value={annForm.body}
                  onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 min-h-[100px]"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="pinned-ann"
                  checked={annForm.pinned}
                  onChange={(e) => setAnnForm({ ...annForm, pinned: e.target.checked })}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="pinned-ann" className="text-xs font-bold text-slate-700">
                  Pin to group chat & flag as urgent broadcast
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all min-h-[42px]"
              >
                Broadcast Notice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Selected inquiry direct chat modal */}
      {selectedInquiry && (
        <ChatModal inquiry={selectedInquiry} onClose={() => setSelectedInquiry(null)} />
      )}
    </div>
  );
};

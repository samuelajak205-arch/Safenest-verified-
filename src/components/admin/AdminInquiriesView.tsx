import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Send,
  CheckCircle,
  XCircle,
  MessageSquare,
  Search,
  Filter,
  ArrowRight,
  Phone,
  Mail,
  UserCheck,
  MapPin,
  Clock,
  Pin,
  Info,
  Check,
  ExternalLink,
  ChevronRight,
  Copy,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  Building,
  User,
  Activity,
  FileText
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { Inquiry } from '../../types';
import { AdminMessagesView } from './AdminMessagesView';

export const AdminInquiriesView: React.FC = () => {
  const store = useSafeNestStore();
  
  // High level toggle: 'pipeline' overview vs 'inbox' (Part 2 of requirements)
  const [viewMode, setViewMode] = useState<'pipeline' | 'inbox'>('pipeline');
  
  // Selected Inquiry ID for full screen upgraded Detail view (Part 1 of requirements)
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<Inquiry['status'] | 'all'>('new');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Input tracking for inline review/mediation notes
  const [adminNotesText, setAdminNotesText] = useState<Record<string, string>>({});
  const [selectedChannel, setSelectedChannel] = useState<Record<string, 'whatsapp' | 'in_app' | 'both'>>({});
  
  // Notes autosave simulation indicators
  const [autosaveStatus, setAutosaveStatus] = useState<Record<string, 'saved' | 'saving' | 'none'>>({});
  const [copiedLandlordPhone, setCopiedLandlordPhone] = useState(false);

  // Auto-scroll to top when selected inquiry changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedInquiryId, viewMode]);

  // Handle Note Auto-saving simulation
  const handleNotesChange = (inqId: string, value: string) => {
    setAdminNotesText(prev => ({ ...prev, [inqId]: value }));
    setAutosaveStatus(prev => ({ ...prev, [inqId]: 'saving' }));
    
    // Simulate background secure local save
    setTimeout(() => {
      // Actually save back to store
      const inq = store.inquiries.find(i => i.id === inqId);
      if (inq) {
        store.inquiries = store.inquiries.map(i => {
          if (i.id === inqId) {
            return { ...i, adminNotes: value };
          }
          return i;
        });
        localStorage.setItem('safenest_inquiries', JSON.stringify(store.inquiries));
      }
      setAutosaveStatus(prev => ({ ...prev, [inqId]: 'saved' }));
    }, 800);
  };

  const handleLaunchWhatsApp = (inqId: string, url: string, party: 'user' | 'landlord') => {
    store.logActivity(
      'WhatsApp Contact Launched',
      'inquiry',
      inqId,
      `Admin initiated WhatsApp chat with ${party === 'user' ? 'renter' : 'landlord'} for interest ID: ${inqId}`
    );
    // Also append directly to the activity timeline
    store.inquiries = store.inquiries.map(inq => {
      if (inq.id === inqId) {
        const updatedLog = inq.activityLog ? [...inq.activityLog] : [];
        updatedLog.push({
          type: 'whatsapp_sent',
          content: `WhatsApp chat launched with ${party === 'user' ? 'Applicant (Tenant)' : 'Landlord (Owner)'}`,
          timestamp: new Date().toISOString()
        });
        return { ...inq, activityLog: updatedLog };
      }
      return inq;
    });
    localStorage.setItem('safenest_inquiries', JSON.stringify(store.inquiries));
    window.open(url, '_blank');
  };

  const handleUpdateStatus = (inqId: string, status: Inquiry['status']) => {
    const notes = adminNotesText[inqId] || '';
    store.updateInquiryStatus(inqId, status, notes);
  };

  const handleConnect = (inqId: string) => {
    const channel = selectedChannel[inqId] || 'both';
    const notes = adminNotesText[inqId] || '';
    store.connectInquiryParties(inqId, channel, notes);
  };

  const handleDismiss = (inqId: string) => {
    const notes = adminNotesText[inqId] || 'Inquiry dismissed based on compliance verification rules.';
    store.dismissInquiry(inqId, notes);
  };

  const getStatusBadge = (status: Inquiry['status']) => {
    switch (status) {
      case 'new':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">New Interest</span>;
      case 'contacting_user':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Contacting User</span>;
      case 'qualified':
        return <span className="bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">User Qualified</span>;
      case 'contacting_landlord':
        return <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Contacting Landlord</span>;
      case 'connecting':
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Connecting</span>;
      case 'connected':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Directly Connected</span>;
      case 'dismissed':
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Dismissed</span>;
      default:
        return <span className="bg-slate-200 text-slate-800 border border-slate-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  const stages: { status: Inquiry['status']; label: string }[] = [
    { status: 'new', label: 'New' },
    { status: 'contacting_user', label: 'Contact User' },
    { status: 'qualified', label: 'Qualified' },
    { status: 'contacting_landlord', label: 'Contact Owner' },
    { status: 'connecting', label: 'Connecting' },
    { status: 'connected', label: 'Connected' },
  ];

  // Filter inquiries based on pipeline state
  const filteredInquiries = store.inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    return inq.status === activeTab;
  });

  // Render Messenger Inbox View Mode (Part 2 of Requirements)
  if (viewMode === 'inbox') {
    return (
      <div className="space-y-4">
        {/* Toggle Panel */}
        <div className="bg-white border border-slate-200 p-2 rounded-xl flex shadow-3xs">
          <button
            onClick={() => setViewMode('pipeline')}
            className="flex-1 py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-all uppercase tracking-wider"
          >
            🎛️ Gatekeeper Pipeline
          </button>
          <button
            onClick={() => setViewMode('inbox')}
            className="flex-1 py-2 text-center text-xs font-black bg-slate-900 text-white rounded-lg transition-all uppercase tracking-wider shadow-sm"
          >
            💬 Messenger Inbox
          </button>
        </div>

        <AdminMessagesView
          onNavigateToInquiryDetail={(id) => {
            setSelectedInquiryId(id);
            setViewMode('pipeline');
          }}
        />
      </div>
    );
  }

  // Render upgraded inquiry detail page if selected
  if (selectedInquiryId) {
    const inq = store.inquiries.find((i) => i.id === selectedInquiryId);
    if (!inq) {
      setSelectedInquiryId(null);
      return null;
    }

    // Resolve snapshots (Part 3 frozen data audit)
    // Fallback to live store state if snapshots don't exist yet
    const propertyLive = store.properties.find(p => p.id === inq.propertyId);
    
    const propSnapshot = inq.propertySnapshot || {
      title: inq.propertyTitle,
      image: inq.propertyImage,
      address: propertyLive?.address || 'Kampala, Uganda',
      rentAmount: propertyLive?.rentAmount || 1500000,
      bedrooms: propertyLive?.bedrooms || 2,
      bathrooms: propertyLive?.bathrooms || 1.5,
      squareFeet: propertyLive?.squareFeet || 950,
      verified: propertyLive?.status === 'published'
    };

    const landSnapshot = inq.landlordSnapshot || {
      name: 'Grace Nakimera',
      phone: propertyLive?.landlordPhone || '+256 772 334 112',
      email: propertyLive?.landlordEmail || 'grace@safenest.ug',
      verified: propertyLive?.landlordVerified || true,
      propertiesCount: 3,
      rating: 4.8,
      connectionsCount: 14
    };

    const userSnapshot = inq.userSnapshot || {
      name: inq.name,
      verified: inq.name.includes('Sarah') || inq.name.includes('Brian'),
      ninStatus: 'NIN VERIFIEDCF9810',
      phone: inq.phone,
      email: inq.email,
      employmentStatus: 'Employed (Finance Officer)',
      monthlyIncome: 'UGX 8,500,000',
      currentLocation: 'Kampala Central',
      moveInDate: inq.moveInDate || '2026-04-01',
      occupantsCount: 1,
      pets: 'None',
      preferredContact: inq.preferredContact
    };

    // Prefilled messaging anchors
    const renterPhoneClean = inq.phone.replace(/[^0-9]/g, '');
    const landlordPhoneClean = landSnapshot.phone.replace(/[^0-9]/g, '');

    const renterWhatsAppUrl = `https://wa.me/${renterPhoneClean}?text=${encodeURIComponent(
      `Hi ${inq.name}, David from SafeNest here regarding your interest in "${inq.propertyTitle}". I'd like to ask a couple of quick questions.`
    )}`;
    const landlordWhatsAppUrl = `https://wa.me/${landlordPhoneClean}?text=${encodeURIComponent(
      `Hi, David here from SafeNest. I have a qualified prospective tenant for "${inq.propertyTitle}" named ${inq.name}. Let me know if you are available to discuss connecting.`
    )}`;

    const currentStageIndex = stages.findIndex((s) => s.status === inq.status);
    const userNotes = adminNotesText[inq.id] || inq.adminNotes || '';

    // Calculate time in stage or age
    const timeInStageText = inq.status === 'new' ? 'Created Just Now' : 'Active review stage';

    const handleCopyPhone = (phone: string) => {
      navigator.clipboard.writeText(phone);
      setCopiedLandlordPhone(true);
      setTimeout(() => setCopiedLandlordPhone(false), 2000);
    };

    return (
      <div className="space-y-5 pb-32">
        {/* Detail Top Action Header Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSelectedInquiryId(null)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                  Secure Gatekeeper Pipeline
                </span>
                <span className="text-[10px] text-slate-400">· ID: {inq.id}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black mt-0.5">
                Mediation Case: {inq.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {getStatusBadge(inq.status)}
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {timeInStageText}
            </span>
          </div>
        </div>

        {/* Dynamic Stepper progress visual */}
        {inq.status !== 'dismissed' && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-3xs">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2.5">
              Verification Progress Pipeline
            </h4>
            <div className="flex items-center justify-between overflow-x-auto pb-1 gap-1">
              {stages.map((stg, sIdx) => {
                const isActive = stg.status === inq.status;
                const isPassed = currentStageIndex > sIdx;
                return (
                  <div key={stg.status} className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                          : isPassed
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      {stg.label}
                    </span>
                    {sIdx < stages.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main layout grid - left side cards, right side timeline + notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* LEFT SIDE: Snapshot details */}
          <div className="space-y-5">
            
            {/* 1. PROPERTY SNAPSHOT CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  Property Snapshot (Auditable)
                </span>
                <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  8 photos
                </span>
              </div>
              <div className="relative">
                <img
                  src={propSnapshot.image}
                  alt={propSnapshot.title}
                  className="w-full h-44 object-cover"
                />
                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border border-emerald-500/20">
                  ✓ Verified Listing
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-950 leading-snug">
                    {propSnapshot.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{propSnapshot.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Bedrooms</span>
                    <strong className="text-slate-900 font-extrabold">{propSnapshot.bedrooms} Bed</strong>
                  </div>
                  <div className="border-x border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Bathrooms</span>
                    <strong className="text-slate-900 font-extrabold">{propSnapshot.bathrooms} Bath</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Size</span>
                    <strong className="text-slate-900 font-extrabold">{propSnapshot.squareFeet} sqft</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">MONTHLY RENT</span>
                  <strong className="text-emerald-700 font-black text-sm">
                    UGX {propSnapshot.rentAmount ? (propSnapshot.rentAmount / 1000000).toFixed(1) : '1.5'}M/mo
                  </strong>
                </div>
              </div>
            </div>

            {/* 2. LANDLORD CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Owner Information
                </span>
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-black rounded uppercase tracking-wide">
                  Verified Landlord
                </span>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-700 border border-slate-200 shadow-3xs text-sm">
                    {landSnapshot.name.charAt(0)}
                  </div>
                  <div>
                    <strong className="text-xs font-black text-slate-950 block">{landSnapshot.name}</strong>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                      <span>⭐ {landSnapshot.rating} Rating</span>
                      <span>·</span>
                      <span>{landSnapshot.propertiesCount} properties</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Direct Line:</span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${landSnapshot.phone}`}
                        className="text-emerald-700 hover:underline font-extrabold flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {landSnapshot.phone}
                      </a>
                      <button
                        onClick={() => handleCopyPhone(landSnapshot.phone)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-all"
                        title="Copy Phone Number"
                      >
                        {copiedLandlordPhone ? (
                          <span className="text-[9px] text-emerald-600 font-black uppercase">Copied</span>
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Email:</span>
                    <span className="text-slate-800 font-medium">{landSnapshot.email}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Connected Inq:</span>
                    <span className="text-slate-800 font-extrabold">{landSnapshot.connectionsCount} Tenants</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. USER PROFILE SNAPSHOT CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Renter Tenant Profile Snapshot
                </span>
                <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase tracking-wide flex items-center gap-1">
                  <span>NIN Confirmed</span>
                </span>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center font-black text-emerald-800 border border-emerald-100 text-xs">
                      {userSnapshot.name.charAt(0)}
                    </div>
                    <div>
                      <strong className="text-xs font-black text-slate-950 block">{userSnapshot.name}</strong>
                      <span className="text-[10px] font-bold text-slate-500">NIN Registered CFT9402..</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-black uppercase rounded-full">
                    NIN Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-[11px] text-slate-700">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Income Statement:</span>
                    <strong className="text-slate-900 font-extrabold">{userSnapshot.monthlyIncome}/mo</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Employment Status:</span>
                    <strong className="text-slate-900 font-extrabold truncate block">{userSnapshot.employmentStatus}</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Preferred Move-In:</span>
                    <strong className="text-slate-900 font-extrabold">{new Date(userSnapshot.moveInDate).toLocaleDateString()}</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Occupants:</span>
                    <strong className="text-slate-900 font-extrabold">{userSnapshot.occupantsCount} Person, Pets: {userSnapshot.pets}</strong>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Contact Method Preference:</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[9px] uppercase rounded">
                      {userSnapshot.preferredContact}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-l-4 border-slate-400 rounded-r-xl italic text-xs text-slate-700 leading-relaxed font-semibold">
                  "{inq.message}"
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Private Admin notes + Chronological Activity Timeline */}
          <div className="space-y-5 flex flex-col h-full">
            
            {/* 1. PRIVATE ADMIN NOTES CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-3.5 bg-amber-500 text-slate-950 flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5 font-extrabold">
                  <FileText className="w-4 h-4 text-slate-950" />
                  Private Mediation Admin Notes (Internal Only)
                </span>
                <span className="text-[9px] bg-slate-900 text-white font-black uppercase px-2 py-0.5 rounded tracking-wide">
                  Private
                </span>
              </div>
              <div className="p-4 space-y-2">
                <textarea
                  value={userNotes}
                  onChange={(e) => handleNotesChange(inq.id, e.target.value)}
                  placeholder="Record your qualification calls, landlord answers, or escrow payment terms here..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 min-h-[140px] focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:bg-white"
                />
                
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <span className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    Never visible to tenants or landlords.
                  </span>
                  
                  {autosaveStatus[inq.id] === 'saving' && (
                    <span className="text-amber-700 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Saving changes...
                    </span>
                  )}
                  {autosaveStatus[inq.id] === 'saved' && (
                    <span className="text-emerald-700 flex items-center gap-1">
                      ✓ Auto-saved securely
                    </span>
                  )}
                  {(!autosaveStatus[inq.id] || autosaveStatus[inq.id] === 'none') && (
                    <span className="text-slate-400">All changes persistent</span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. CHRONOLOGICAL TIMELINE (Part 5 timeline requirement) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex-1 flex flex-col">
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Chronological Activity Timeline
                </span>
                <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">
                  Real Time
                </span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[360px]">
                {/* Timeline Items */}
                <div className="relative border-l-2 border-slate-200 pl-4 space-y-4 text-xs font-semibold">
                  
                  {/* First log node: Received */}
                  <div className="relative">
                    <span className="absolute -left-[23px] top-0 bg-emerald-600 rounded-full w-2.5 h-2.5 border border-white" />
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-extrabold text-slate-900 uppercase text-[9px] tracking-wider">Interest Statement Received</span>
                      <span className="text-[9px] text-slate-400">{new Date(inq.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">"Applied through portal listing looking for direct connection."</p>
                  </div>

                  {/* Dynamic store logs */}
                  {inq.activityLog && inq.activityLog.map((log, lIdx) => {
                    let dotColor = 'bg-slate-400';
                    if (log.type === 'stage_change') dotColor = 'bg-blue-600';
                    if (log.type === 'note') dotColor = 'bg-amber-500';
                    if (log.type === 'whatsapp_sent') dotColor = 'bg-emerald-600';
                    if (log.type === 'whatsapp_received') dotColor = 'bg-indigo-600';

                    return (
                      <div key={lIdx} className="relative">
                        <span className={`absolute -left-[23px] top-0 rounded-full w-2.5 h-2.5 border border-white ${dotColor}`} />
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-extrabold text-slate-900 uppercase text-[9px] tracking-wider">
                            {log.type.replace('_', ' ')}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{log.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM FIXED NEXT ACTION BAR (Part 4 requirement) */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 border-t border-slate-800 shadow-xl z-40">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">
                CURRENT STAGE: {inq.status.replace('_', ' ')}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Take the next compliant gatekeeper action to progress the tenant application.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDismiss(inq.id)}
                className="py-2 px-3 border border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-900/20 rounded-xl text-xs font-black uppercase tracking-wider"
              >
                Dismiss Case
              </button>

              {/* DYNAMIC FLOW TRIGGERS */}
              {inq.status === 'new' && (
                <>
                  <button
                    onClick={() => handleLaunchWhatsApp(inq.id, renterWhatsAppUrl, 'user')}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Applicant</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(inq.id, 'contacting_user')}
                    className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl uppercase"
                  >
                    Mark Contacting
                  </button>
                </>
              )}

              {inq.status === 'contacting_user' && (
                <>
                  <button
                    onClick={() => handleLaunchWhatsApp(inq.id, renterWhatsAppUrl, 'user')}
                    className="py-2 px-4 border border-emerald-600 text-emerald-400 hover:bg-emerald-950/30 font-bold uppercase text-xs rounded-xl"
                  >
                    Open WA Chat
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(inq.id, 'qualified')}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Verify & Qualify Applicant</span>
                  </button>
                </>
              )}

              {inq.status === 'qualified' && (
                <>
                  <button
                    onClick={() => handleLaunchWhatsApp(inq.id, landlordWhatsAppUrl, 'landlord')}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Owner</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(inq.id, 'contacting_landlord')}
                    className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl uppercase"
                  >
                    Mark Contacting Owner
                  </button>
                </>
              )}

              {inq.status === 'contacting_landlord' && (
                <>
                  <button
                    onClick={() => handleLaunchWhatsApp(inq.id, landlordWhatsAppUrl, 'landlord')}
                    className="py-2 px-4 border border-indigo-500 text-indigo-400 hover:bg-indigo-950/30 font-bold uppercase text-xs rounded-xl"
                  >
                    Open Landlord Chat
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(inq.id, 'connecting')}
                    className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-black uppercase text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Move to Connecting Stage</span>
                  </button>
                </>
              )}

              {inq.status === 'connecting' && (
                <div className="flex items-center gap-2">
                  <div className="text-[10px] text-slate-400">
                    Channel:
                    <select
                      value={selectedChannel[inq.id] || 'both'}
                      onChange={(e) => setSelectedChannel({ ...selectedChannel, [inq.id]: e.target.value as any })}
                      className="ml-1.5 bg-slate-800 border border-slate-700 rounded text-xs font-bold text-white p-1"
                    >
                      <option value="both">WA + In-App</option>
                      <option value="whatsapp">WhatsApp Only</option>
                      <option value="in_app">In-App Only</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleConnect(inq.id)}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs rounded-xl flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Activate Bridge (Unlock Link)</span>
                  </button>
                </div>
              )}

              {inq.status === 'connected' && (
                <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg">
                  ✓ Connection Bridge Unlocked & Active
                </span>
              )}

              {inq.status === 'dismissed' && (
                <span className="bg-slate-800 text-slate-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg">
                  Dismissed Case Resolved
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    );
  }

  // Fallback default render: Pipeline List Overview (Part 1 of Requirements)
  return (
    <div className="space-y-4 pb-28">
      {/* Top Selector Panel to toggle Inbox vs Pipeline */}
      <div className="bg-white border border-slate-200 p-2 rounded-xl flex shadow-3xs">
        <button
          onClick={() => setViewMode('pipeline')}
          className="flex-1 py-2 text-center text-xs font-black bg-slate-900 text-white rounded-lg transition-all uppercase tracking-wider shadow-sm"
        >
          🎛️ Gatekeeper Pipeline
        </button>
        <button
          onClick={() => setViewMode('inbox')}
          className="flex-1 py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-all uppercase tracking-wider"
        >
          💬 Messenger Inbox
        </button>
      </div>

      {/* Page Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
          <h1 className="text-lg sm:text-xl font-black">Gatekeeper Interest Control</h1>
        </div>
        <p className="text-[11px] text-slate-300 mt-1">
          Review user inquiries, qualify intent, communicate via direct links, and unlock authenticated renter-landlord connections.
        </p>
      </div>

      {/* Pipeline Status Filter Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-1">
        {(['new', 'contacting_user', 'qualified', 'contacting_landlord', 'connecting', 'connected', 'dismissed', 'all'] as const).map((tab) => {
          const count = store.inquiries.filter((inq) => {
            if (tab === 'all') return true;
            return inq.status === tab;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-[10px] font-extrabold capitalize whitespace-nowrap border-b-2 transition-all min-h-[38px] ${
                activeTab === tab
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.replace('_', ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Search Input bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search inquiries by user name, property name or statement..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 min-h-[42px]"
        />
      </div>

      {/* Pipeline List Cards */}
      <div className="space-y-4">
        {filteredInquiries.map((inq) => {
          const property = store.properties.find((p) => p.id === inq.propertyId);
          const currentStageIndex = stages.findIndex((s) => s.status === inq.status);

          return (
            <div
              key={inq.id}
              onClick={() => setSelectedInquiryId(inq.id)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer shadow-3xs overflow-hidden flex flex-col justify-between"
            >
              {/* Header block */}
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={inq.propertyImage}
                    alt={inq.propertyTitle}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900 line-clamp-1">
                      {inq.propertyTitle}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{property?.neighborhood || 'Kampala, Uganda'}</span>
                      <span>·</span>
                      <strong className="text-emerald-700 font-bold">
                        UGX {property ? (property.rentAmount / 1000000).toFixed(1) : '1.5'}M/mo
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  {getStatusBadge(inq.status)}
                  <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Inner details statement summary */}
              <div className="p-3.5 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    👤 <strong className="text-slate-900 font-extrabold">{inq.name}</strong>
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Preferred: {inq.preferredContact}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 italic">
                  "{inq.message}"
                </p>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-100 mt-2">
                  <span>Owner: {property?.landlordName || 'Grace Nakimera'}</span>
                  <span className="text-emerald-600 hover:text-emerald-800 font-black uppercase flex items-center gap-0.5">
                    Process Case ➔
                  </span>
                </div>
              </div>

            </div>
          );
        })}

        {filteredInquiries.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="font-extrabold text-xs text-slate-700">No Cases Found</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              There are no interest cases in this pipeline stage matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

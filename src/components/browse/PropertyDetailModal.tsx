import React, { useState, Suspense, lazy } from 'react';
import {
  X,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  ShieldCheck,
  Heart,
  Share2,
  CheckCircle2,
  Phone,
  Mail,
  HardDrive,
  Send,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { Property } from '../../types';
import { useSafeNestStore } from '../../lib/store';
import { InspectionBookingForm } from '../rental/InspectionBookingForm';
import { RentalApplicationModal } from '../rental/RentalApplicationModal';
import { getOptimizedImage } from '../../lib/imageUtils';
import { ShareModal } from '../common/ShareModal';

// FIX 8: Lazy load Google Maps
const SafeNestMap = lazy(() => 
  import('../maps/SafeNestMap').then(module => ({ default: module.SafeNestMap }))
);

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  onContactLandlordSuccess?: () => void;
  onApplicationSuccess?: (appId: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onContactLandlordSuccess,
  onApplicationSuccess,
}) => {
  const store = useSafeNestStore();
  const isFavorite = store.favorites.includes(property.id);

  // Application state
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [applicationSubmittedId, setApplicationSubmittedId] = useState<string | null>(null);

  // Gallery state
  const approvedImages = property.images.filter((img) => img.status !== 'rejected');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);

  // Gatekeeper interest form state
  const [interestMessageText, setInterestMessageText] = useState('Hi, I\'m interested in this house. Is it still available? Can I view it this Saturday?');
  const [preferredContact, setPreferredContact] = useState<'in_app' | 'whatsapp' | 'phone'>('whatsapp');
  const [interestSuccess, setInterestSuccess] = useState(false);

  // FIX 1: Use optimized image URL (1200px wide for detail view)
  const currentImageRaw = approvedImages[selectedImageIndex] || approvedImages[0];
  const currentImage = currentImageRaw ? { ...currentImageRaw, url: getOptimizedImage(currentImageRaw.url, 1200) } : null;

  const formatCurrency = (amount: number, curr: 'UGX' | 'USD') => {
    if (curr === 'UGX') {
      return `USh ${amount.toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const handleShare = async () => {
    const hasActiveInspection = store.inspectionBookings.some(
      (b) => b.propertyId === property.id && b.userId === store.currentUser.id && b.status === 'confirmed'
    );
    const locationText = hasActiveInspection ? property.address : `${property.neighborhood}, ${property.city}`;
    const text = `🏠 ${property.title}\n📍 ${locationText}\n💰 UGX ${property.rentAmount?.toLocaleString()}/month`;
    const url = `${window.location.origin}/p/${property.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text,
          url
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed', err);
        }
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Check out this verified rental property on SafeNest Uganda: ${property.title} in ${property.neighborhood}, ${property.city} for ${formatCurrency(property.rentAmount, property.currency)}/mo!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-800 capitalize">
              {property.propertyType}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {property.neighborhood}, {property.city}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => store.toggleFavorite(property.id)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="Save Favorite"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="Share listing"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Gallery Section */}
          <div className="space-y-3">
            <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-slate-900 group">
              {currentImage && (
                <img
                  src={currentImage.url}
                  alt={property.title}
                  onClick={() => setIsLightboxOpen(true)}
                  className="w-full h-full object-cover cursor-zoom-in"
                />
              )}

              {/* Prev / Next Controls */}
              {approvedImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex(
                        (selectedImageIndex - 1 + approvedImages.length) % approvedImages.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-xs transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((selectedImageIndex + 1) % approvedImages.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-xs transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Photo Counter */}
              <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-xs">
                Photo {selectedImageIndex + 1} of {approvedImages.length}
              </div>
            </div>

            {/* Thumbnails Row */}
            {approvedImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {approvedImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-emerald-600 scale-102'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Key Summary */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-800 tracking-tight">
                  {formatCurrency(property.rentAmount, property.currency)}
                </span>
                <span className="text-sm font-semibold text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Security Deposit: {formatCurrency(property.securityDeposit || property.rentAmount, property.currency)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowApplicationModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Apply for Tenancy
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              {copiedLink && (
                <span className="text-xs text-emerald-600 font-medium">Link copied!</span>
              )}
            </div>
          </div>

          {/* Title and Address */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{property.title}</h1>
            <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              {property.address}, {property.neighborhood}, {property.city} ({property.stateRegion} Region, Uganda)
            </p>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Bedrooms</span>
                <span className="text-sm font-bold text-slate-800">{property.bedrooms} Bed</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <Bath className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Bathrooms</span>
                <span className="text-sm font-bold text-slate-800">{property.bathrooms} Bath</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <Maximize className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Floor Area</span>
                <span className="text-sm font-bold text-slate-800">
                  {property.squareFeet ? `${property.squareFeet} sqft` : 'Spacious'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Available From</span>
                <span className="text-sm font-bold text-slate-800">
                  {new Date(property.availableDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Two Columns: Details & Contact Landlord */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
            {/* Left Column: Description & Amenities */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">About this Property</h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">Amenities & Facilities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Drive Vault Document Integration */}
              {property.driveDocumentName && (
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">Verified Tenancy Agreement</h4>
                      <p className="text-xs text-emerald-700">{property.driveDocumentName}</p>
                    </div>
                  </div>
                  <a
                    href={property.driveDocumentLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-900 px-3 py-1.5 bg-white rounded-lg border border-emerald-200 shadow-2xs"
                  >
                    View in Drive
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Right Column: Landlord Card & Contact Form */}
            <div className="space-y-4">
              {/* Landlord Card (Under Gatekeeper Permissions Control) */}
              {(() => {
                const existingInquiry = store.inquiries.find(
                  (i) => i.propertyId === property.id && i.userId === store.currentUser.id
                );
                
                const isTenantConnected = existingInquiry?.status === 'connected';
                const isAllowedToSeeContact =
                  store.currentUser.role === 'super_admin' ||
                  store.currentUser.id === property.landlordId ||
                  isTenantConnected;

                const handleSendInterestMessage = () => {
                  if (!interestMessageText.trim()) return;
                  store.submitInquiry({
                    propertyId: property.id,
                    propertyTitle: property.title,
                    propertyImage: approvedImages[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600',
                    userId: store.currentUser.id,
                    landlordId: property.landlordId || 'usr_landlord_001',
                    name: store.currentUser.fullName,
                    email: store.currentUser.email,
                    phone: store.currentUser.phone || '+256 700 000 000',
                    message: interestMessageText.trim(),
                    preferredContact: preferredContact,
                  });
                  setInterestSuccess(true);
                  setTimeout(() => {
                    setInterestSuccess(false);
                  }, 4000);
                };

                const cleanPhone = (property.landlordPhone || '+256 772 334 112').replace(/[^0-9]/g, '');
                const whatsappText = `Hi ${property.landlordName}, this is ${store.currentUser.fullName} from SafeNest regarding your property "${property.title}". I would love to follow up on my approved inquiry!`;
                const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`;

                return (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-base">
                          {property.landlordName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 text-sm">{property.landlordName}</h4>
                            {property.landlordVerified && (
                              <span title="SafeNest Verified Landlord">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-emerald-700 font-medium">SafeNest Verified Landlord</p>
                          <p className="text-[11px] text-slate-500">Fast Response Rate (within 2 hours)</p>
                        </div>
                      </div>

                      {isAllowedToSeeContact ? (
                        <div className="space-y-2 pt-2 border-t border-slate-200/80 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{property.landlordPhone || '+256 772 334 112'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{property.landlordEmail || 'landlord@safenest.ug'}</span>
                          </div>
                          
                          {/* Active WhatsApp direct bridge deep link */}
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                            <span>Chat on WhatsApp</span>
                          </a>
                        </div>
                      ) : (
                        <div className="pt-2.5 border-t border-slate-200/80 space-y-2">
                          <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                            <strong className="font-extrabold flex items-center gap-1 text-slate-800">
                              🔒 Contacts Blocked (SafeNest Gatekeeper)
                            </strong>
                            <p className="leading-relaxed">
                              SafeNest mediates first interactions to protect property owners. Submit an interest message to request contact access.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Renters Gatekeeper Interest Message Form */}
                    {store.currentUser.role === 'user' && (
                      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                        <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                          💬 Express Interest
                        </h4>

                        {!existingInquiry ? (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                Tell us what you're looking for:
                              </label>
                              <textarea
                                value={interestMessageText}
                                onChange={(e) => setInterestMessageText(e.target.value)}
                                placeholder="Hi, I'm interested in this house. Is it still available? Can I view it this Saturday?"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 min-h-[80px]"
                              />
                            </div>

                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Your details:</span>
                              <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400">👤</span>
                                  <strong>{store.currentUser.fullName}</strong>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400">📱</span>
                                  <span>{store.currentUser.phone || '+256 755 889 004'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400">📧</span>
                                  <span className="truncate">{store.currentUser.email}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                How would you like us to respond?
                              </label>
                              <div className="grid grid-cols-1 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPreferredContact('in_app')}
                                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                                    preferredContact === 'in_app'
                                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span>💬</span>
                                    <span>In-App Message</span>
                                  </span>
                                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    preferredContact === 'in_app' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                                  }`}>
                                    {preferredContact === 'in_app' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setPreferredContact('whatsapp')}
                                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                                    preferredContact === 'whatsapp'
                                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span>🟢</span>
                                    <span>WhatsApp Direct</span>
                                  </span>
                                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    preferredContact === 'whatsapp' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                                  }`}>
                                    {preferredContact === 'whatsapp' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setPreferredContact('phone')}
                                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                                    preferredContact === 'phone'
                                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span>📞</span>
                                    <span>Phone Call</span>
                                  </span>
                                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    preferredContact === 'phone' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                                  }`}>
                                    {preferredContact === 'phone' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                                  </span>
                                </button>
                              </div>
                            </div>

                            {interestSuccess && (
                              <div className="text-[11px] text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-xl p-2.5 font-bold">
                                ✓ Message submitted to SafeNest! Admin review in progress.
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={handleSendInterestMessage}
                              disabled={!interestMessageText.trim()}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Send Interest</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {existingInquiry.status === 'new' || existingInquiry.status === 'reviewing' || existingInquiry.status === 'contacting_user' || existingInquiry.status === 'qualified' || existingInquiry.status === 'contacting_landlord' || existingInquiry.status === 'connecting' ? (
                              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed font-semibold">
                                ⏳ Under SafeNest Gatekeeper Review: Your interest message is being qualified by David / SafeNest Admin. Contacts unlock once verified.
                              </div>
                            ) : existingInquiry.status === 'forwarded' ? (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed font-semibold">
                                📋 Request Forwarded: Landlord has received your message via SafeNest mediation. Contacts unlock upon direct connection confirmation.
                              </div>
                            ) : existingInquiry.status === 'connected' ? (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed font-bold">
                                🎉 Verified Connection Approved! Landlord contact details are unlocked above. Tap the WhatsApp link to chat.
                              </div>
                            ) : (
                              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 leading-relaxed font-semibold">
                                ⚠️ Inquiry Dismissed: This interest inquiry has been closed by admin. Please contact support if you need help.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Rental Tenancy Application Card */}
              <div className="bg-linear-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Apply for Tenancy</h4>
                    <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">
                      Direct Landlord Dossier
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Submit your Uganda NIN, employment details, and documents to start the formal rental screening process.
                </p>
                <button
                  type="button"
                  onClick={() => setShowApplicationModal(true)}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-xs transition-colors"
                >
                  Start Tenancy Application
                </button>
              </div>

              {/* Map & Location */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Location</h3>
                    <p className="text-[11px] text-slate-500">{property.neighborhood}, {property.city}</p>
                  </div>
                  <button 
                    onClick={() => setShowBookingForm(true)}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-[11px] font-bold rounded-lg transition-colors"
                  >
                    Unlock Exact Address
                  </button>
                </div>
                <div className="h-[250px] bg-slate-100 relative">
                  <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Loading map...</div>}>
                    <SafeNestMap 
                      role={store.currentUser.role} 
                      selectedPropertyId={property.id} 
                    />
                  </Suspense>
                </div>
                <div className="p-4 bg-slate-50">
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Book an Inspection (In-Person / Virtual)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <InspectionBookingForm
          property={property}
          onClose={() => setShowBookingForm(false)}
          onSuccess={() => {
            setShowBookingForm(false);
            onClose();
            // Dispatch a navigation event to the Inbox
            window.dispatchEvent(new CustomEvent('safenest-navigate', { detail: 'user-inbox' }));
          }}
        />
      )}

      {/* Rental Application Modal */}
      {showApplicationModal && (
        <RentalApplicationModal
          property={property}
          onClose={() => setShowApplicationModal(false)}
          onSuccess={(appId) => {
            setShowApplicationModal(false);
            setApplicationSubmittedId(appId);
            if (onApplicationSuccess) onApplicationSuccess(appId);
            alert('✓ Tenancy application submitted successfully! The landlord will review your dossier.');
          }}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          property={property}
          text={(() => {
            const hasActiveInspection = store.inspectionBookings.some(
              (b) => b.propertyId === property.id && b.userId === store.currentUser.id && b.status === 'confirmed'
            );
            const locationText = hasActiveInspection ? property.address : `${property.neighborhood}, ${property.city}`;
            return `🏠 ${property.title}\n📍 ${locationText}\n💰 UGX ${property.rentAmount?.toLocaleString()}/month`;
          })()}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Property } from '../../types';
import { X, Copy, CheckCircle2, MessageCircle, Mail, Facebook, Share2 } from 'lucide-react';

interface ShareModalProps {
  property?: Property;
  onClose: () => void;
  title?: string;
  text?: string;
  url?: string;
  imageUrl?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ 
  property, 
  onClose,
  title,
  text,
  url,
  imageUrl
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  
  const finalTitle = title || property?.title || "SafeNest";
  const finalUrl = url || (property ? `${window.location.origin}/p/${property.id}` : window.location.origin);
  const finalImage = imageUrl || property?.images?.[0]?.url || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600";
  
  const finalShareText = text || (property 
    ? `🏠 ${property.title}\n📍 ${property.neighborhood}, ${property.city}\n💰 UGX ${property.rentAmount?.toLocaleString()}/month` 
    : "SafeNest - Verified Rentals & Quick Sales across Kampala & Entebbe.");

  const handleCopy = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${finalShareText}\n\n${finalUrl}`)}`, '_blank');
  };

  const handleEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(finalTitle)}&body=${encodeURIComponent(`${finalShareText}\n\nView details here: ${finalUrl}`)}`, '_blank');
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}`, '_blank');
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(finalShareText)}&url=${encodeURIComponent(finalUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Share Item</h3>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-slate-500">
              {finalImage ? (
                <img src={finalImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 line-clamp-1">{finalTitle}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{finalShareText}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button onClick={handleWhatsApp} className="flex flex-col items-center justify-center gap-2 p-2 hover:bg-emerald-50 rounded-xl group transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-115 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600">WhatsApp</span>
            </button>
            <button onClick={handleEmail} className="flex flex-col items-center justify-center gap-2 p-2 hover:bg-blue-50 rounded-xl group transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-115 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600">Email</span>
            </button>
            <button onClick={handleFacebook} className="flex flex-col items-center justify-center gap-2 p-2 hover:bg-indigo-50 rounded-xl group transition-colors">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-115 transition-transform">
                <Facebook className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600">Facebook</span>
            </button>
            <button onClick={handleCopy} className="flex flex-col items-center justify-center gap-2 p-2 hover:bg-slate-100 rounded-xl group transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center group-hover:scale-115 transition-transform">
                {copiedLink ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </div>
              <span className="text-[10px] font-semibold text-slate-600">{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

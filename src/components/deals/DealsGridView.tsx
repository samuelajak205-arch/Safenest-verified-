import React, { useState } from 'react';
import { useSafeNestStore } from '../../lib/store';
import { Flame, Filter, ChevronDown, CheckCircle2, Plus, X, Upload, ShieldCheck, MapPin, Camera, Image } from 'lucide-react';
import { StoryViewer } from './StoryViewer';
import { Deal } from '../../types';

const CATEGORIES = ['All Deals', 'Electronics', 'Furniture', 'Appliances', 'Vehicles', 'Home Items'];

const STOCK_PHOTOS: Record<string, string[]> = {
  'Furniture': [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', // sofa
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800', // office chair
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', // desk
  ],
  'Electronics': [
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', // tv
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', // laptop
    'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800', // phone
  ],
  'Appliances': [
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800', // fridge
    'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800', // microwave
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800', // blender
  ],
  'Home Items': [
    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800', // mattress
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800', // lamp
    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800', // rug
  ],
  'Other': [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800', // book
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', // watch
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', // headphones
  ],
};

export const DealsGridView: React.FC = () => {
  const store = useSafeNestStore();
  const [selectedCategory, setSelectedCategory] = useState('All Deals');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'expiring_soon'>('newest');
  const [selectedDealIndex, setSelectedDealIndex] = useState<number | null>(null);

  // Form State for Submission
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Furniture' | 'Electronics' | 'Appliances' | 'Home Items' | 'Other'>('Furniture');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState(store.currentUser.phone || '+256 ');
  const [city, setCity] = useState('Kampala');
  const [area, setArea] = useState('');
  const [condition, setCondition] = useState('Used - Good');
  const [durationHours, setDurationHours] = useState(48);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [photoMode, setPhotoMode] = useState<'stock' | 'upload' | 'camera' | 'custom'>('stock');
  const [capturedImage, setCapturedImage] = useState<string>('');

  const resetForm = () => {
    setTitle('');
    setCategory('Furniture');
    setPrice('');
    setOriginalPrice('');
    setDescription('');
    setContactPhone(store.currentUser.phone || '+256 ');
    setCity('Kampala');
    setArea('');
    setCondition('Used - Good');
    setDurationHours(48);
    setSelectedPhotoIndex(0);
    setCustomPhotoUrl('');
    setCapturedImage('');
    setPhotoMode('stock');
  };

  const handleSubmitDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !description.trim() || !contactPhone.trim() || !area.trim()) {
      return;
    }

    let photoUrl = '';
    if (photoMode === 'stock') {
      photoUrl = STOCK_PHOTOS[category]?.[selectedPhotoIndex] || STOCK_PHOTOS['Other'][0];
    } else if (photoMode === 'upload' || photoMode === 'camera') {
      photoUrl = capturedImage || STOCK_PHOTOS[category]?.[0] || STOCK_PHOTOS['Other'][0];
    } else {
      photoUrl = customPhotoUrl.trim() || STOCK_PHOTOS[category]?.[0] || STOCK_PHOTOS['Other'][0];
    }

    store.addDeal({
      title,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      description,
      photos: [photoUrl],
      city,
      area,
      condition,
      contactPhone,
      sellerName: store.currentUser.fullName,
      durationHours,
      expiresAt: new Date(Date.now() + durationHours * 3600000).toISOString(),
      isFeatured: false,
    });

    resetForm();
    setShowAddDealModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Filter and sort active deals
  const filteredDeals = store.deals
    .filter(d => d.status === 'active' && new Date(d.expiresAt) > new Date())
    .filter(d => selectedCategory === 'All Deals' || d.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'expiring_soon':
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleOpenDeal = (index: number) => {
    setSelectedDealIndex(index);
    store.markDealViewed(filteredDeals[index].id);
  };

  const handleNextDeal = () => {
    if (selectedDealIndex !== null && selectedDealIndex < filteredDeals.length - 1) {
      const nextIndex = selectedDealIndex + 1;
      setSelectedDealIndex(nextIndex);
      store.markDealViewed(filteredDeals[nextIndex].id);
    } else {
      setSelectedDealIndex(null);
    }
  };

  const handlePrevDeal = () => {
    if (selectedDealIndex !== null && selectedDealIndex > 0) {
      const prevIndex = selectedDealIndex - 1;
      setSelectedDealIndex(prevIndex);
      store.markDealViewed(filteredDeals[prevIndex].id);
    } else {
      setSelectedDealIndex(null);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Deals Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 border border-white/30 w-fit text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Community Marketplace</span>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddDealModal(true);
              }}
              className="px-3.5 py-1.5 bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 min-h-[32px] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Post a Deal
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Flame className="w-6 h-6 fill-white" />
              Hot Deals & Quick Sales
            </h2>
            <p className="text-white/95 text-sm mt-0.5">
              Anyone can post quick sales. 100% verified sellers display a badge.
            </p>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col gap-3">
        {/* Categories (Horizontal Scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[40px] ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-xs font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-0 text-xs font-semibold text-slate-800 focus:ring-0 focus:outline-hidden py-0 pl-1 pr-6 cursor-pointer appearance-none"
              style={{ background: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>') no-repeat right center / 12px` }}
            >
              <option value="newest">Newest First</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-3">
          <Flame className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No active deals</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Check back later for new hot deals in this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {filteredDeals.map((deal, index) => {
            const hasViewed = store.hasViewedDeal(deal.id);
            const expiresAt = new Date(deal.expiresAt).getTime();
            const hoursLeft = (expiresAt - Date.now()) / 3600000;
            
            let timeBadge = '';
            let timeColor = '';
            
            if (hoursLeft < 1) {
              timeBadge = '< 1h left';
              timeColor = 'bg-red-500 text-white';
            } else if (hoursLeft < 24) {
              timeBadge = `${Math.floor(hoursLeft)}h left`;
              timeColor = 'bg-amber-500 text-white';
            } else {
              timeBadge = `${Math.floor(hoursLeft / 24)}d left`;
              timeColor = 'bg-slate-800 text-white';
            }

            return (
              <div 
                key={deal.id}
                onClick={() => handleOpenDeal(index)}
                className={`bg-white rounded-2xl border overflow-hidden shadow-xs cursor-pointer group flex flex-col transition-all ${
                  hasViewed ? 'border-slate-200 opacity-80' : 'border-amber-200 hover:shadow-md'
                }`}
              >
                {/* Image */}
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  <img 
                    src={deal.photos[0]} 
                    alt={deal.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide shadow-xs backdrop-blur-md ${timeColor}`}>
                      {timeBadge}
                    </span>
                    {deal.isFeatured && (
                      <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md">
                        <Flame className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-800 line-clamp-1 leading-tight mb-1">
                    {deal.title}
                  </h3>
                  
                  <div className="flex items-center gap-1 my-1">
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[65%]">
                      {deal.area}, {deal.city}
                    </span>
                    {deal.isVerifiedSeller && (
                      <span className="ml-auto inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-md border border-emerald-100 font-bold shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 fill-emerald-100" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-2 flex flex-col gap-0.5">
                    {deal.originalPrice ? (
                      <span className="text-[10px] text-slate-400 line-through">
                        UGX {deal.originalPrice.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 opacity-0">-</span>
                    )}
                    <span className="text-sm font-bold text-emerald-600">
                      UGX {deal.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedDealIndex !== null && (
        <StoryViewer
          deal={filteredDeals[selectedDealIndex]}
          deals={filteredDeals}
          currentIndex={selectedDealIndex}
          onClose={() => setSelectedDealIndex(null)}
          onNext={handleNextDeal}
          onPrev={handlePrevDeal}
          hasNext={selectedDealIndex < filteredDeals.length - 1}
          hasPrev={selectedDealIndex > 0}
        />
      )}

      {showAddDealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Post a Hot Deal</h3>
                <p className="text-xs text-slate-500">Sell quick to neighbors in Kampala</p>
              </div>
              <button
                onClick={() => setShowAddDealModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form onSubmit={handleSubmitDeal} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Badge info banner */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/60 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-normal">
                  <span className="font-bold">Community Notice:</span> Anyone can post! But only physically verified accounts display the trusted <span className="font-bold text-emerald-700">Verified Seller badge</span>. Current status: {store.currentUser.isVerified ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[9px] ml-1">Verified Seller</span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-md text-[9px] ml-1">Standard (No Badge)</span>
                  )}
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Item Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. L-Shaped Sofa Set"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setCategory(cat);
                      setSelectedPhotoIndex(0); // Reset index on category change
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Furniture">Furniture</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Appliances">Appliances</option>
                    <option value="Home Items">Home Items</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Promo Price (UGX)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 250000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Original Price (UGX)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500000"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Area & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Neighborhood / Area</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ntinda"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +256772000000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Condition & Expiration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Used - Like New">Used - Like New</option>
                    <option value="Used - Good">Used - Good</option>
                    <option value="Used - Fair">Used - Fair</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Deal Active Period</label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value={24}>24 Hours (Urgent)</option>
                    <option value={48}>48 Hours (Standard)</option>
                    <option value={72}>72 Hours (Extended)</option>
                    <option value={168}>1 Week</option>
                  </select>
                </div>
              </div>

              {/* Photo Source Toggle */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Deal Photo</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setPhotoMode('stock'); setCapturedImage(''); }}
                    className={`text-center py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      photoMode === 'stock'
                        ? 'bg-white text-orange-600 shadow-xs border border-orange-100'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <Image className="w-3.5 h-3.5" />
                    <span>Stock Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPhotoMode('upload'); setCapturedImage(''); }}
                    className={`text-center py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      photoMode === 'upload'
                        ? 'bg-white text-orange-600 shadow-xs border border-orange-100'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Device Storage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPhotoMode('camera'); setCapturedImage(''); }}
                    className={`text-center py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      photoMode === 'camera'
                        ? 'bg-white text-orange-600 shadow-xs border border-orange-100'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Pic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPhotoMode('custom'); setCapturedImage(''); }}
                    className={`text-center py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      photoMode === 'custom'
                        ? 'bg-white text-orange-600 shadow-xs border border-orange-100'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <span className="text-[9px] font-extrabold leading-none">URL</span>
                    <span>Custom Link</span>
                  </button>
                </div>

                {photoMode === 'stock' && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-400">Select a matched stock image for {category}:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(STOCK_PHOTOS[category] || STOCK_PHOTOS['Other']).map((url, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedPhotoIndex(index)}
                          className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                            selectedPhotoIndex === index
                              ? 'border-amber-500 ring-2 ring-amber-100'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={url} alt={`Option ${index}`} className="w-full h-full object-cover" />
                          {selectedPhotoIndex === index && (
                            <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center">
                              <span className="bg-amber-500 text-white p-0.5 rounded-full text-[8px] font-bold">✓</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {photoMode === 'upload' && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-400">Select an image file from your device's photo library or storage:</p>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-amber-400 transition-all relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {capturedImage ? (
                        <div className="relative aspect-video max-h-32 mx-auto rounded-lg overflow-hidden border border-slate-200">
                          <img src={capturedImage} alt="Uploaded" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCapturedImage(''); }}
                            className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black/80 text-white p-1 rounded-full text-[10px] font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">Click or Drag & Drop File</span>
                          <span className="text-[10px] text-slate-400">PNG, JPG, or WEBP up to 5MB</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {photoMode === 'camera' && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-400">Instantly snap a fresh picture of your item using your device camera:</p>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-amber-400 transition-all relative">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {capturedImage ? (
                        <div className="relative aspect-video max-h-32 mx-auto rounded-lg overflow-hidden border border-slate-200">
                          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCapturedImage(''); }}
                            className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black/80 text-white p-1 rounded-full text-[10px] font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 animate-pulse">
                            <Camera className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">Tap to Trigger Live Camera</span>
                          <span className="text-[10px] text-slate-400">Uses your device's native camera stream</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {photoMode === 'custom' && (
                  <div className="space-y-1">
                    <input
                      type="url"
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all"
                    />
                    <p className="text-[10px] text-slate-400">Provide an absolute image path starting with http/https.</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Description & Reason for Sale</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell buyers about the item, how long you used it, and why you are selling..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-xl shadow-md hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer"
                >
                  Publish Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useSafeNestStore } from '../../lib/store';
import { Flame, Plus, Search, MoreVertical, Edit, Trash2, Eye, MessageCircle, Clock } from 'lucide-react';
import { Deal } from '../../types';

export const AdminDealsManagementView: React.FC = () => {
  const store = useSafeNestStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Basic filtering
  const filteredDeals = store.deals.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          Manage Deals
        </h2>
        <button 
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          onClick={() => alert("Create deal modal would open here.")} // Mock for now
        >
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search deals..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredDeals.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm">No deals found.</p>
            </div>
          ) : (
            filteredDeals.map(deal => {
              const isActive = deal.status === 'active' && new Date(deal.expiresAt) > new Date();
              
              return (
                <div key={deal.id} className="p-4 flex flex-col sm:flex-row gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex gap-4 flex-1">
                    <img 
                      src={deal.photos[0]} 
                      alt={deal.title}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                    />
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-slate-800 line-clamp-1">{deal.title}</h3>
                        {!isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase font-bold tracking-wider">
                            Expired
                          </span>
                        )}
                        {deal.isFeatured && isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded uppercase font-bold tracking-wider flex items-center gap-0.5">
                            <Flame className="w-3 h-3" /> Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-1">{deal.category} • UGX {deal.price.toLocaleString()}</p>
                      
                      {/* Stats Row */}
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1" title="Views">
                          <Eye className="w-3.5 h-3.5" /> {deal.viewsCount}
                        </span>
                        <span className="flex items-center gap-1" title="Messages">
                          <MessageCircle className="w-3.5 h-3.5" /> {deal.messagesCount}
                        </span>
                        <span className="flex items-center gap-1" title="Expires">
                          <Clock className="w-3.5 h-3.5" /> 
                          {new Date(deal.expiresAt).toLocaleDateString()} {new Date(deal.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 mt-3 sm:mt-0 border-slate-100">
                    <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this deal?')) {
                          store.deleteDeal(deal.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

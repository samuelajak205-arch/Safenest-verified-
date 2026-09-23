import React, { useState } from 'react';
import {
  Layers,
  Building2,
  Users,
  ShieldCheck,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Trash2,
  Eye,
  Check,
  X,
  Plus,
  Flame,
  FileText,
  Activity,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { Property, UserProfile, UserRole } from '../../types';

interface AdminDashboardProps {
  onNavigateToModeration: () => void;
  onNavigateToApplications: () => void;
  onSelectProperty: (property: Property) => void;
  onUploadNewProperty: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToModeration,
  onNavigateToApplications,
  onSelectProperty,
  onUploadNewProperty,
}) => {
  const store = useSafeNestStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users' | 'activity'>('overview');
  const [propertySearch, setPropertySearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Counts
  const totalListings = store.properties.length;
  const publishedListings = store.properties.filter((p) => p.status === 'published').length;
  const pendingReviewListings = store.properties.filter((p) => p.status === 'pending').length;
  const pendingPhotosListings = store.properties.filter((p) => p.status === 'pending_photos').length;
  const pendingPhotosCount = store.properties.reduce(
    (acc, p) => acc + p.images.filter((img) => img.status === 'pending').length,
    0
  );
  const pendingAppsCount = store.applications.filter(
    (a) => a.status === 'submitted' || a.status === 'under_review'
  ).length;

  const filteredProperties = store.properties.filter(
    (p) =>
      p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.neighborhood.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.landlordName.toLowerCase().includes(propertySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900">SafeNest Platform Admin HQ</h1>
              <p className="text-xs text-slate-500">
                Master control panel for Uganda operations, property approvals, KYC verification, and user management.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onUploadNewProperty}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Property
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('listings')}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-400 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Properties</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalListings}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {publishedListings} Published · {pendingReviewListings} In Review
          </div>
        </div>

        <div
          onClick={onNavigateToModeration}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-amber-400 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Photo Queue</span>
            <Camera className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{pendingPhotosCount}</div>
          <div className="text-[11px] text-slate-500">
            Across {pendingReviewListings} listings awaiting approval
          </div>
        </div>

        <div
          onClick={onNavigateToApplications}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Landlord Applications</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">{pendingAppsCount}</div>
          <div className="text-[11px] text-slate-500">
            KYC documents awaiting NIN / TIN check
          </div>
        </div>

        <div
          onClick={() => setActiveTab('activity')}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-400 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Platform Inquiries</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{store.inquiries.length}</div>
          <div className="text-[11px] text-slate-500">
            Tenant leads & inspection bookings
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Overview & Insights
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'listings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Manage Listings ({store.properties.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'activity' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Audit Logs ({store.activityLogs.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Action Workflows */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Administrative Action Tasks</h3>
            <div className="space-y-3">
              {pendingPhotosCount > 0 && (
                <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">
                        {pendingPhotosCount} Property Photos Pending Moderation
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        Ensure compliance with anti-watermarking and clarity standards.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onNavigateToModeration}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold"
                  >
                    Open Review
                  </button>
                </div>
              )}

              {pendingAppsCount > 0 && (
                <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-950">
                        {pendingAppsCount} Landlord KYC Applications Awaiting Decision
                      </h4>
                      <p className="text-[11px] text-blue-800">
                        Check Uganda NIN, URA TIN, and title deed ownership.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onNavigateToApplications}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                  >
                    Review KYC
                  </button>
                </div>
              )}

              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">
                      Google Drive Tenancy & Document Vault
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      Secure cloud vault for lease agreements, KYC archives, and property deeds.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-white px-3 py-1 rounded-lg border border-emerald-200">
                  Ready
                </span>
              </div>
            </div>
          </div>

          {/* Market Geography Snapshot */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Market Geography</h3>
            <div className="space-y-2 text-xs">
              {[
                { city: 'Kampala (Kololo, Naguru, Nakasero)', count: 4, pct: '60%' },
                { city: 'Entebbe (Manyago, Lake View)', count: 1, pct: '20%' },
                { city: 'Jinja (Nile River Front)', count: 1, pct: '20%' },
              ].map((item) => (
                <div key={item.city} className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{item.city}</span>
                    <span>{item.count} listings</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: item.pct }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Listings Management Table */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search properties or landlord..."
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Property</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Monthly Rent</th>
                  <th className="py-2.5 px-3">Landlord</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Featured</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={prop.images[0]?.url || ''}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        />
                        <div className="max-w-xs">
                          <h4 className="font-bold text-slate-900 truncate">{prop.title}</h4>
                          <span className="text-[11px] text-slate-400">
                            {prop.bedrooms} Bed · {prop.bathrooms} Bath · {prop.images.length} photos
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {prop.neighborhood}, {prop.city}
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-800">
                      {prop.currency} {prop.rentAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-medium">
                      {prop.landlordName}
                      {prop.landlordVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline ml-1" />
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={prop.status}
                        onChange={(e) => store.updateProperty(prop.id, { status: e.target.value as any })}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-hidden ${
                          prop.status === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : prop.status === 'pending_photos'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="published">Published</option>
                        <option value="pending">Pending Review</option>
                        <option value="pending_photos">Rejected Photos</option>
                        <option value="draft">Draft</option>
                        <option value="rented">Rented</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => store.updateProperty(prop.id, { isFeatured: !prop.isFeatured })}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          prop.isFeatured
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-500'
                        }`}
                        title="Toggle Featured"
                      >
                        <Flame className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectProperty(prop)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete listing "${prop.title}"?`)) {
                              store.deleteProperty(prop.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Activity Logs */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Platform Activity & Audit Stream</h2>
          <div className="divide-y divide-slate-100">
            {store.activityLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-xl mt-0.5">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{log.action}</h4>
                    <p className="text-slate-600 mt-0.5">{log.details}</p>
                    <span className="text-[10px] text-slate-400">By {log.userName}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Search,
  Users,
  ShieldCheck,
  Building,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  X,
  Edit2,
  Filter,
  Check,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { UserRole } from '../../types';

interface ManagedUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole | 'applicant';
  status: 'active' | 'pending' | 'suspended';
  avatarUrl: string;
  joinedDate: string;
  nin?: string;
  propertiesCount?: number;
  leasesCount?: number;
}

const INITIAL_USERS: ManagedUser[] = [
  {
    id: 'usr_admin_001',
    fullName: 'David Kato',
    email: 'admin.kato@safenest.ug',
    phone: '+256 701 445 889',
    role: 'super_admin',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    joinedDate: '2026-01-10',
    nin: 'CM840291048KPL',
  },
  {
    id: 'usr_landlord_001',
    fullName: 'Grace Nakimera',
    email: 'grace.nakimera@property.ug',
    phone: '+256 772 334 112',
    role: 'landlord',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    joinedDate: '2026-02-14',
    nin: 'CF910283471NTG',
    propertiesCount: 3,
  },
  {
    id: 'usr_landlord_002',
    fullName: 'Patrick Kigozi',
    email: 'patrick.kigozi@kampalarealestate.ug',
    phone: '+256 782 119 400',
    role: 'landlord',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    joinedDate: '2026-02-18',
    nin: 'CM790123998KPL',
    propertiesCount: 2,
  },
  {
    id: 'usr_applicant_001',
    fullName: 'Sarah Namubiru',
    email: 'sarah.namubiru@gmail.com',
    phone: '+256 703 551 229',
    role: 'applicant',
    status: 'pending',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    joinedDate: '2026-03-01',
    nin: 'CF890451928WAK',
  },
  {
    id: 'usr_applicant_002',
    fullName: 'Emmanuel Ssenyonjo',
    email: 'emmanuel.ssenyonjo@gmail.com',
    phone: '+256 752 900 112',
    role: 'applicant',
    status: 'pending',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    joinedDate: '2026-03-03',
    nin: 'CM920194812ENT',
  },
  {
    id: 'usr_tenant_001',
    fullName: 'Brian Mukasa',
    email: 'brian.mukasa@gmail.com',
    phone: '+256 755 889 004',
    role: 'user',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    joinedDate: '2026-02-20',
    leasesCount: 1,
  },
  {
    id: 'usr_tenant_002',
    fullName: 'Joanita Akello',
    email: 'joanita.akello@gmail.com',
    phone: '+256 774 209 118',
    role: 'user',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    joinedDate: '2026-02-25',
    leasesCount: 1,
  },
  {
    id: 'usr_tenant_003',
    fullName: 'Robert Mugabe',
    email: 'robert.m@techcorp.co.ug',
    phone: '+256 788 440 991',
    role: 'user',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    joinedDate: '2026-02-28',
    leasesCount: 0,
  },
];

export const AdminUsersView: React.FC = () => {
  const store = useSafeNestStore();
  const [usersList, setUsersList] = useState<ManagedUser[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<'all' | 'landlords' | 'tenants' | 'applicants'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [editRoleModal, setEditRoleModal] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole>('user');

  // Filter users by tab and search
  const filteredUsers = usersList.filter((u) => {
    if (activeTab === 'landlords' && u.role !== 'landlord') return false;
    if (activeTab === 'tenants' && u.role !== 'user') return false;
    if (activeTab === 'applicants' && u.role !== 'applicant') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.fullName.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
            SUPER ADMIN
          </span>
        );
      case 'landlord':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-300">
            LANDLORD
          </span>
        );
      case 'applicant':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
            APPLICANT
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-300">
            USER
          </span>
        );
    }
  };

  const handleUpdateRole = () => {
    if (!selectedUser) return;
    setUsersList((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, role: targetRole, status: 'active' } : u))
    );
    setSelectedUser((prev) => (prev ? { ...prev, role: targetRole, status: 'active' } : null));
    setEditRoleModal(false);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500">
            {usersList.length} total registered accounts across SafeNest Uganda
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or phone number..."
          className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 shadow-xs min-h-[44px]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs: All / Landlords / Tenants / Applicants */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
        {[
          { id: 'all', label: 'All', count: usersList.length },
          { id: 'landlords', label: 'Landlords', count: usersList.filter((u) => u.role === 'landlord').length },
          { id: 'tenants', label: 'Tenants', count: usersList.filter((u) => u.role === 'user').length },
          { id: 'applicants', label: 'Applicants', count: usersList.filter((u) => u.role === 'applicant').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-1 rounded-lg text-center font-bold transition-all min-h-[40px] flex flex-col items-center justify-center ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-[11px] leading-tight">{tab.label}</span>
            <span className="text-[10px] opacity-75 font-normal">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* User Cards List */}
      <div className="space-y-2.5">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No users found</p>
            <p className="text-[11px]">Try searching with a different term or tab</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                setSelectedUser(user);
                setTargetRole((user.role === 'applicant' ? 'landlord' : user.role) as UserRole);
              }}
              className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center justify-between gap-3 min-h-[76px]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900 truncate">
                      {user.fullName}
                    </h3>
                    {getRoleBadge(user.role)}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>{user.phone}</span>
                    <span>•</span>
                    <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUser(user);
                    setTargetRole((user.role === 'applicant' ? 'landlord' : user.role) as UserRole);
                    setEditRoleModal(true);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                >
                  Edit Role
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Details & Change Role Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                User Details
              </span>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setEditRoleModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={selectedUser.avatarUrl}
                alt={selectedUser.fullName}
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedUser.fullName}</h3>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
                <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold">{selectedUser.phone}</span>
              </div>
              {selectedUser.nin && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Uganda NIN:</span>
                  <span className="font-semibold text-emerald-700">{selectedUser.nin}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="capitalize font-bold text-slate-800">{selectedUser.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registration:</span>
                <span>{new Date(selectedUser.joinedDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Change Role Section */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                Assign System Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'user', label: 'User / Tenant' },
                  { role: 'landlord', label: 'Landlord' },
                  { role: 'super_admin', label: 'Admin' },
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setTargetRole(item.role as UserRole)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                      targetRole === item.role
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleUpdateRole}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-sm"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

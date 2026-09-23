import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Bell,
  Check,
  User,
  LogOut,
  ShieldCheck,
  X,
  ChevronDown,
  Heart,
  MessageSquare,
  FileText,
  Inbox,
  FileBadge,
  Flame,
  AlertTriangle,
  Calendar,
  Trash2,
  ShieldAlert,
  DollarSign,
  TrendingDown,
  CheckCircle2
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { UserRole } from '../../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const store = useSafeNestStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const role = store.currentUser.role;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute unread notifications count based on real SafeNestStore notifications
  const userNotifications = store.notifications.filter(n => n.userId === store.currentUser.id);
  const totalNotifications = userNotifications.filter(n => !n.isRead).length;

  const handleSwitchRole = (newRole: UserRole) => {
    store.switchRole(newRole);
    setShowUserMenu(false);
    if (newRole === 'super_admin') {
      onNavigate('admin-home');
    } else if (newRole === 'landlord') {
      onNavigate('landlord-home');
    } else {
      onNavigate('user-browse');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          
          {/* LEFT: SafeNest Logo + Green "UG" badge (NO other icons) */}
          <div
            onClick={() => {
              if (role === 'super_admin') onNavigate('admin-home');
              else if (role === 'landlord') onNavigate('landlord-home');
              else onNavigate('user-browse');
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none min-h-[44px]"
            role="button"
            aria-label="SafeNest Home"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                SafeNest
              </span>
              {/* Green "UG" badge (country) */}
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-black text-[10px] tracking-wide border border-emerald-500/30">
                UG
              </span>
            </div>
          </div>

          {/* RIGHT: ONLY Notification Bell + 40px Avatar (NO heart, NO message icons) */}
          <div className="flex items-center gap-2" ref={dropdownRef}>
            
            {/* Bell Icon with badge count */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationsDropdown(!showNotificationsDropdown);
                  setShowUserMenu(false);
                }}
                className="w-10 h-10 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-full relative flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                title="Notifications"
                aria-label={`${totalNotifications} notifications`}
              >
                <Bell className="w-5 h-5" />
                {totalNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 px-1 min-w-[15px] h-3.5 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                    {totalNotifications}
                  </span>
                )}
              </button>

              {/* FIX 3: Bell Dropdown Menu */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 text-slate-200">
                  <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Notifications</span>
                    {totalNotifications > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          userNotifications.forEach((n) => {
                            if (!n.isRead) store.markNotificationRead(n.id);
                          });
                        }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-extrabold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                    {userNotifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-slate-500 text-xs">
                        No notifications yet. You're all caught up!
                      </div>
                    ) : (
                      userNotifications.slice(0, 5).map((n) => {
                        // Icon resolver
                        let icon = <Bell className="w-4 h-4 text-slate-400 shrink-0" />;
                        if (n.type === 'emergency' || n.type === 'critical') {
                          icon = <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />;
                        } else if (n.type === 'price_drop') {
                          icon = <TrendingDown className="w-4 h-4 text-amber-400 shrink-0" />;
                        } else if (n.type.startsWith('new_property') || n.type === 'new_property_match') {
                          icon = <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />;
                        } else if (n.type.startsWith('application')) {
                          icon = <FileBadge className="w-4 h-4 text-blue-400 shrink-0" />;
                        } else if (n.type.startsWith('inspection') || n.type.startsWith('inspection_')) {
                          icon = <Calendar className="w-4 h-4 text-purple-400 shrink-0" />;
                        } else if (n.type === 'new_deal' || n.type === 'hot_deals') {
                          icon = <Flame className="w-4 h-4 text-orange-400 shrink-0" />;
                        } else if (n.type === 'receipt_ready' || n.type === 'rent_due_3_days') {
                          icon = <DollarSign className="w-4 h-4 text-green-400 shrink-0" />;
                        }

                        return (
                          <div
                            key={n.id}
                            onClick={() => {
                              store.markNotificationRead(n.id);
                              setShowNotificationsDropdown(false);
                              if (n.link) onNavigate(n.link);
                            }}
                            className={`p-3 hover:bg-slate-800/80 cursor-pointer flex items-start gap-3 transition-colors relative ${
                              !n.isRead ? 'bg-slate-800/30' : ''
                            }`}
                          >
                            {icon}
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`text-xs truncate ${!n.isRead ? 'font-extrabold text-white' : 'font-semibold text-slate-300'}`}>
                                  {n.title}
                                </p>
                                {!n.isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_#10b981]" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {n.body}
                              </p>
                              <span className="text-[9px] text-slate-500 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {/* Delete action */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                store.deleteNotification(n.id);
                              }}
                              className="p-1 hover:text-red-400 text-slate-600 transition-colors shrink-0"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        setShowNotificationsDropdown(false);
                        onNavigate('notifications');
                      }}
                      className="w-full text-center px-3.5 py-2 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 min-h-[40px] cursor-pointer"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar (circle, 40px) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotificationsDropdown(false);
                }}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/60 hover:border-emerald-400 focus:outline-hidden transition-all flex items-center justify-center min-h-[44px] min-w-[44px]"
                aria-expanded={showUserMenu}
                aria-label="Open User Account Menu"
              >
                <img
                  src={
                    store.currentUser.avatarUrl ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
                  }
                  alt={store.currentUser.fullName}
                  className="w-full h-full object-cover"
                />
              </button>

              {/* User Account & Live Role Switcher Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 text-slate-200">
                  <div className="px-3.5 py-2 border-b border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Current Account
                    </p>
                    <p className="text-xs font-bold text-white truncate mt-0.5">
                      {store.currentUser.fullName}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          role === 'super_admin'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : role === 'landlord'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : 'bg-slate-700 text-slate-300 border-slate-600'
                        }`}
                      >
                        {role === 'super_admin'
                          ? 'Super Admin'
                          : role === 'landlord'
                          ? 'Landlord'
                          : 'User / Tenant'}
                      </span>
                    </div>
                  </div>

                  {/* Direct Link to Settings Screen */}
                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('profile');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 min-h-[40px] flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        store.logoutUser();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-slate-800 min-h-[40px] flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Modal Removed in favor of Dropdown */}
    </header>
  );
};

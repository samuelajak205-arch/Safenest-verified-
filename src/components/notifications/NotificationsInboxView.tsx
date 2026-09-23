import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  Building2,
  Calendar,
  DollarSign,
  FileBadge,
  Flame,
  TrendingDown,
  Mail,
  MessageCircle,
  Smartphone,
  Eye,
  Filter,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { NotificationItem } from '../../types';

export const NotificationsInboxView: React.FC = () => {
  const store = useSafeNestStore();
  const currentUser = store.currentUser;
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'deals'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const notifications = store.notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'critical') return n.isUrgent || n.type === 'emergency' || n.type === 'critical' || n.type === 'rent_due_3_days';
    if (filter === 'deals') return n.type === 'new_deal' || n.type === 'hot_deals';
    return true;
  });

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'emergency':
      case 'critical':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />,
          bg: 'bg-red-50 border-red-200',
          badgeText: 'Emergency',
          badgeColor: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'price_drop':
        return {
          icon: <TrendingDown className="w-5 h-5 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-200',
          badgeText: 'Price Reduction',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'new_property_match':
      case 'new_property':
        return {
          icon: <Building2 className="w-5 h-5 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-200',
          badgeText: 'Listing Match',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'application_status':
      case 'application_update':
        return {
          icon: <FileBadge className="w-5 h-5 text-blue-600" />,
          bg: 'bg-blue-50 border-blue-200',
          badgeText: 'Application',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'inspection_confirmed':
        return {
          icon: <Calendar className="w-5 h-5 text-purple-600" />,
          bg: 'bg-purple-50 border-purple-200',
          badgeText: 'Inspection',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'new_deal':
      case 'hot_deals':
        return {
          icon: <Flame className="w-5 h-5 text-orange-600" />,
          bg: 'bg-orange-50 border-orange-200',
          badgeText: 'Hot Deal',
          badgeColor: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'receipt_ready':
      case 'rent_due_3_days':
        return {
          icon: <DollarSign className="w-5 h-5 text-teal-600" />,
          bg: 'bg-teal-50 border-teal-200',
          badgeText: 'Rent & Invoices',
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-200'
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-slate-600" />,
          bg: 'bg-slate-50 border-slate-200',
          badgeText: 'Alert',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-200'
        };
    }
  };

  const handleMarkAllRead = () => {
    store.markAllNotificationsRead(currentUser.id);
    showToast('All notifications marked as read.');
  };

  const handleDeleteAllRead = () => {
    const readIds = notifications.filter(n => n.isRead).map(n => n.id);
    if (readIds.length === 0) {
      showToast('No read notifications to delete.');
      return;
    }
    readIds.forEach(id => store.deleteNotification(id));
    showToast('Deleted all read notifications.');
  };

  return (
    <div className="space-y-4 pb-32 max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900">Notification Center</h1>
          <p className="text-xs text-slate-500">
            {unreadCount === 0 ? 'No unread alerts' : `${unreadCount} unread alerts pending`}
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">SafeNest UG</span>
      </div>

      {/* TOAST SYSTEM */}
      {toastMessage && (
        <div className="p-3 bg-emerald-900 text-white text-xs font-semibold rounded-2xl flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SYSTEM CONTROLS & CHANNELS DEMO */}
      <div className="bg-slate-900 rounded-3xl p-4 text-white space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-extrabold">Active Notification Pipeline</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            FCM Channel Active
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Notifications are routed server-side respecting Uganda's <strong>9 PM to 7 AM quiet hour limits</strong>, frequency restrictions (<strong>max 3 alerts daily</strong>), and dynamic user settings.
        </p>
        
        {/* Active Preference Badges */}
        <div className="pt-1 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase">Configured Channels:</span>
          {store.getUserPreferences(currentUser.id).pushEnabled && (
            <span className="flex items-center gap-1 bg-slate-800 text-emerald-400 text-[10px] px-2.5 py-1 rounded-xl border border-slate-700 font-bold">
              <Smartphone className="w-3 h-3" /> Push
            </span>
          )}
          {store.getUserPreferences(currentUser.id).whatsappEnabled && (
            <span className="flex items-center gap-1 bg-slate-800 text-green-400 text-[10px] px-2.5 py-1 rounded-xl border border-slate-700 font-bold">
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </span>
          )}
          {store.getUserPreferences(currentUser.id).emailEnabled && (
            <span className="flex items-center gap-1 bg-slate-800 text-sky-400 text-[10px] px-2.5 py-1 rounded-xl border border-slate-700 font-bold">
              <Mail className="w-3 h-3" /> Email
            </span>
          )}
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto py-1 scrollbar-thin">
        <div className="flex items-center gap-1.5 shrink-0">
          {(['all', 'unread', 'critical', 'deals'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {t} {t === 'unread' && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleMarkAllRead}
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 bg-white"
            title="Mark All Read"
          >
            Mark All Read
          </button>
          <button
            onClick={handleDeleteAllRead}
            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 bg-white"
            title="Delete All Read"
          >
            Clear Read
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">No matching notifications</h3>
              <p className="text-xs text-slate-500 mt-1">There are no records matching your active filter "{filter}".</p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const styles = getNotificationStyles(n.type);
            return (
              <div
                key={n.id}
                className={`bg-white rounded-3xl border transition-all p-4 flex gap-3.5 relative shadow-xs ${
                  !n.isRead ? 'border-emerald-200 ring-1 ring-emerald-500/10' : 'border-slate-200'
                }`}
              >
                {/* Visual Accent Circle */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-slate-100 border border-slate-200`}>
                  {styles.icon}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${styles.badgeColor}`}>
                      {styles.badgeText}
                    </span>
                    {!n.isRead && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                        NEW ALERT
                      </span>
                    )}
                  </div>

                  <h2 className={`text-sm tracking-tight ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                    {n.title}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {n.body}
                  </p>

                  {/* Delivery pipeline feedback */}
                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Simulation Channels Feed */}
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <span>Sent via:</span>
                      {store.getUserPreferences(currentUser.id).pushEnabled && <Smartphone className="w-3.5 h-3.5 text-slate-500" title="Push notification" />}
                      {store.getUserPreferences(currentUser.id).whatsappEnabled && <MessageCircle className="w-3.5 h-3.5 text-slate-500" title="WhatsApp push simulated" />}
                      {store.getUserPreferences(currentUser.id).emailEnabled && <Mail className="w-3.5 h-3.5 text-slate-500" title="Email push simulated" />}
                    </div>
                  </div>
                </div>

                {/* Vertical action tray */}
                <div className="flex flex-col gap-1 shrink-0 justify-between items-end">
                  <button
                    onClick={() => {
                      if (n.isRead) {
                        store.markNotificationUnread(n.id);
                      } else {
                        store.markNotificationRead(n.id);
                      }
                    }}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                    title={n.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      store.deleteNotification(n.id);
                      showToast('Notification removed.');
                    }}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

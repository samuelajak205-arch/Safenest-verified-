import { useState, useEffect } from 'react';
import {
  Property,
  LandlordApplication,
  Inquiry,
  ActivityLog,
  ModerationLog,
  UserProfile,
  UserRole,
  PropertyImage,
  RejectionReason,
  GoogleDriveItem,
  RentalApplication,
  RentalApplicationStatus,
  LeaseAgreement,
  LeaseStatus,
  RentPaymentRecord,
  InspectionChecklist,
  PropertyInspectionBooking,
  Deal,
  DealViewRecord,
  NotificationItem,
  NotificationPreferences,
  DeviceToken,
  NotificationQueueItem,
  BuildingStaff,
  BuildingChatMessage,
  BuildingChatAnnouncement,
  StaffRole,
  Connection,
  DirectChatMessage,
} from '../types';
import {
  INITIAL_PROPERTIES,
  INITIAL_APPLICATIONS,
  INITIAL_INQUIRIES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_MODERATION_LOGS,
  INITIAL_RENTAL_APPLICATIONS,
  INITIAL_LEASES,
  INITIAL_RENT_PAYMENTS,
  INITIAL_INSPECTIONS,
  INITIAL_INSPECTION_BOOKINGS,
  INITIAL_DEALS,
  INITIAL_DEAL_VIEWS,
} from './mockData';
import { DEMO_USERS, setAccessTokenForSession } from './auth';

export const INITIAL_BUILDING_STAFF: BuildingStaff[] = [
  {
    id: 'staff_001',
    propertyId: 'prop_001',
    name: 'John Mukasa',
    role: 'Electrician',
    phone: '+256 755 123 456',
    whatsappNumber: '+256 755 123 456',
    availability: 'Mon-Sat 8AM-6PM',
    notes: 'Primary electrician for Kololo block. Reliable and quick.',
    photoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
  },
  {
    id: 'staff_002',
    propertyId: 'prop_001',
    name: 'Peter Okello',
    role: 'Plumber',
    phone: '+256 755 234 567',
    whatsappNumber: '+256 755 234 567',
    availability: '24/7 Emergency',
    notes: 'Handles general plumbing and water pump issues.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'staff_003',
    propertyId: 'prop_001',
    name: 'Joseph Kisekka',
    role: 'Askari',
    phone: '+256 755 345 678',
    whatsappNumber: '+256 755 345 678',
    availability: 'Night Shift (6PM-6AM)',
    notes: 'Senior guard at main gate.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    id: 'staff_004',
    propertyId: 'prop_001',
    name: 'Sarah Nakato',
    role: 'Gardener',
    phone: '+256 755 456 789',
    whatsappNumber: '+256 755 456 789',
    availability: 'Tue, Thu, Sat',
    notes: 'Keeps compound clean and trim.',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 'staff_005',
    propertyId: 'prop_001',
    name: 'Grace Tukahirwa',
    role: 'Cleaner',
    phone: '+256 755 567 890',
    whatsappNumber: '+256 755 567 890',
    availability: 'Mon-Fri 7AM-4PM',
    notes: 'Common areas cleaning lady.',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  }
];

export const INITIAL_BUILDING_CHAT_MESSAGES: BuildingChatMessage[] = [
  {
    id: 'chat_msg_001',
    propertyId: 'prop_001',
    senderId: 'usr_tenant_001',
    senderName: 'Sarah K.',
    senderRole: 'tenant',
    senderBadge: 'Apt 4B',
    message: 'Anyone has plumber number? My kitchen sink is dripping.',
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  },
  {
    id: 'chat_msg_002',
    propertyId: 'prop_001',
    senderId: 'staff_002',
    senderName: 'Peter Okello',
    senderRole: 'staff',
    senderBadge: 'Plumber',
    message: 'I can come at 2 PM today to fix the sink, Sarah.',
    createdAt: new Date(Date.now() - 3600000 * 2.3).toISOString(),
  },
  {
    id: 'chat_msg_003',
    propertyId: 'prop_001',
    senderId: 'usr_tenant_002',
    senderName: 'James Mugisha',
    senderRole: 'tenant',
    senderBadge: 'Apt 2A',
    message: 'Thanks Peter. By the way, water is off in Block B right now. Is anyone else experiencing this?',
    createdAt: new Date(Date.now() - 3600000 * 2.1).toISOString(),
  },
  {
    id: 'chat_msg_004',
    propertyId: 'prop_001',
    senderId: 'usr_landlord_001',
    senderName: 'Grace Nakimera',
    senderRole: 'landlord',
    senderBadge: 'Landlord',
    message: 'Hi everyone! Yes, Peter, please check the Block B water pump bypass first before going to Sarah.',
    createdAt: new Date(Date.now() - 3600000 * 2.0).toISOString(),
    isPinned: true
  }
];

export const INITIAL_BUILDING_CHAT_ANNOUNCEMENTS: BuildingChatAnnouncement[] = [
  {
    id: 'ann_001',
    propertyId: 'prop_001',
    title: 'Water Maintenance Saturday',
    body: 'Notice: Routine water pump and storage tank flushing will occur on Saturday from 8 AM to 12 PM. Water supply will be temporarily shut off during this time. Please store water in advance.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    pinned: true,
  }
];

const STORAGE_KEYS = {
  CURRENT_USER: 'safenest_user',
  PROPERTIES: 'safenest_properties',
  APPLICATIONS: 'safenest_applications',
  INQUIRIES: 'safenest_inquiries',
  FAVORITES: 'safenest_favorites',
  ACTIVITY_LOGS: 'safenest_activity_logs',
  MODERATION_LOGS: 'safenest_moderation_logs',
  RENTAL_APPLICATIONS: 'safenest_rental_applications',
  LEASES: 'safenest_leases',
  RENT_PAYMENTS: 'safenest_rent_payments',
  INSPECTIONS: 'safenest_inspections',
  INSPECTION_BOOKINGS: 'safenest_inspection_bookings',
  DEALS: 'safenest_deals',
  DEAL_VIEWS: 'safenest_deal_views',
  NOTIFICATIONS: 'safenest_notifications',
  NOTIFICATION_PREFS: 'safenest_notification_prefs',
  DEVICE_TOKENS: 'safenest_device_tokens',
  NOTIFICATION_QUEUE: 'safenest_notification_queue',
  BUILDING_STAFF: 'safenest_building_staff',
  BUILDING_CHAT_MESSAGES: 'safenest_building_chat_messages',
  BUILDING_CHAT_ANNOUNCEMENTS: 'safenest_building_chat_announcements',
  CONNECTIONS: 'safenest_connections',
};

export class SafeNestStore {
  private static instance: SafeNestStore;
  private listeners: Set<() => void> = new Set();

  public currentUser: UserProfile;
  public properties: Property[];
  public applications: LandlordApplication[];
  public inquiries: Inquiry[];
  public connections: Connection[];
  public favorites: string[]; // property IDs
  public activityLogs: ActivityLog[];
  public moderationLogs: ModerationLog[];
  public rentalApplications: RentalApplication[];
  public leases: LeaseAgreement[];
  public rentPayments: RentPaymentRecord[];
  public inspections: InspectionChecklist[];
  public inspectionBookings: PropertyInspectionBooking[];
  public deals: Deal[];
  public dealViews: DealViewRecord[];
  public googleDriveFiles: GoogleDriveItem[] = [];
  public googleAccessToken: string | null = null;
  public googleUserEmail: string | null = null;

  // Landlord Messaging System fields
  public buildingStaff: BuildingStaff[];
  public buildingChatMessages: BuildingChatMessage[];
  public buildingChatAnnouncements: BuildingChatAnnouncement[];
  public directMessages: DirectChatMessage[];

  // Notification properties
  public notifications: NotificationItem[];
  public notificationPreferences: Record<string, NotificationPreferences>; // keyed by userId
  public deviceTokens: DeviceToken[];
  public notificationQueue: NotificationQueueItem[];

  public isLoggedIn: boolean;
  public developerMode: boolean;

  private constructor() {
    // Load from localStorage or defaults
    this.isLoggedIn = this.load('safenest_is_logged_in', true);
    this.developerMode = this.load('safenest_developer_mode_active', false);

    this.currentUser = this.load(STORAGE_KEYS.CURRENT_USER, DEMO_USERS.super_admin);
    this.properties = this.load(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES).map((p: any) => ({
      ...p,
      inspectionPriceVirtual: p.inspectionPriceVirtual ?? 5000,
      inspectionPriceInPerson: p.inspectionPriceInPerson ?? 15000,
      inspectionPricePremium: p.inspectionPricePremium ?? 25000,
    }));
    this.applications = this.load(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const rawInquiries = this.load(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
    this.inquiries = rawInquiries.map((inq: any) => {
      const prop = this.properties.find(p => p.id === inq.propertyId);
      const landlord = inq.landlordSnapshot || (prop ? {
        name: prop.landlordName || 'Grace Nakimera',
        phone: prop.landlordPhone || '+256 755 987 654',
        email: 'grace@email.com',
        verified: true,
        propertiesCount: 3,
        rating: 4.8,
        connectionsCount: 24
      } : null);

      const user = inq.userSnapshot || {
        name: inq.name || 'Brian Mukasa',
        verified: true,
        ninStatus: 'Verified (NIN Confirmed)',
        phone: inq.phone || '+256 755 889 004',
        email: inq.email || 'brian.mukasa@gmail.com',
        employmentStatus: 'Employed',
        monthlyIncome: 'UGX 8.5M/month',
        currentLocation: 'Currently in Nakasero',
        moveInDate: inq.moveInDate || '2026-10-01',
        occupantsCount: 1,
        pets: 'None',
        preferredContact: inq.preferredContact || 'whatsapp'
      };

      const defaultEvents = [
        {
          type: 'interest_received',
          content: 'User submitted interest',
          timestamp: inq.createdAt || new Date().toISOString()
        }
      ];

      return {
        ...inq,
        conversationId: inq.conversationId || `conv_${inq.id}`,
        propertySnapshot: inq.propertySnapshot || prop || null,
        landlordSnapshot: landlord,
        userSnapshot: user,
        activityLog: inq.activityLog || defaultEvents
      };
    });
    this.connections = this.load(STORAGE_KEYS.CONNECTIONS, []);
    this.directMessages = this.load('safenest_direct_messages', [
      {
        id: 'dir_msg_1',
        conversationId: 'conv_inq_001',
        senderId: 'usr_admin_001',
        senderName: 'David (Gatekeeper)',
        senderRole: 'admin',
        message: "Hi Brian, David from SafeNest here regarding your interest in \"Modern 2-Bedroom Luxury Suite with Kololo Hill View\". I'd like to ask a couple of quick questions.",
        createdAt: '2026-03-12T16:25:00Z'
      },
      {
        id: 'dir_msg_2',
        conversationId: 'conv_inq_001',
        senderId: 'usr_tenant_001',
        senderName: 'Brian Mukasa',
        senderRole: 'user',
        message: 'Hello David, yes I am very interested. I can do Saturday at 11am if that works for Grace.',
        createdAt: '2026-03-12T16:30:00Z'
      }
    ]);
    this.favorites = this.load(STORAGE_KEYS.FAVORITES, ['prop_001', 'prop_002']);
    this.activityLogs = this.load(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
    this.moderationLogs = this.load(STORAGE_KEYS.MODERATION_LOGS, INITIAL_MODERATION_LOGS);
    this.rentalApplications = this.load(STORAGE_KEYS.RENTAL_APPLICATIONS, INITIAL_RENTAL_APPLICATIONS);
    this.leases = this.load(STORAGE_KEYS.LEASES, INITIAL_LEASES);
    this.rentPayments = this.load(STORAGE_KEYS.RENT_PAYMENTS, INITIAL_RENT_PAYMENTS);
    this.inspections = this.load(STORAGE_KEYS.INSPECTIONS, INITIAL_INSPECTIONS);
    this.inspectionBookings = this.load(STORAGE_KEYS.INSPECTION_BOOKINGS, INITIAL_INSPECTION_BOOKINGS);
    this.deals = this.load(STORAGE_KEYS.DEALS, INITIAL_DEALS);
    this.dealViews = this.load(STORAGE_KEYS.DEAL_VIEWS, INITIAL_DEAL_VIEWS);

    // Load notifications state
    this.notifications = this.load(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif_001',
        userId: 'usr_tenant_001',
        type: 'new_deal',
        title: '🔥 New Hot Deal',
        body: 'Sofa set UGX 300K — 2 days left',
        link: 'deals',
        data: { price: 300000, title: 'Sofa set' },
        isRead: false,
        isUrgent: false,
        channelSent: ['inapp', 'push'],
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min ago
      },
      {
        id: 'notif_002',
        userId: 'usr_tenant_001',
        type: 'new_property_match',
        title: '🏠 3 new properties in Kololo',
        body: 'Match your saved search',
        link: 'browse',
        data: { neighborhood: 'Kololo', count: 3 },
        isRead: false,
        isUrgent: false,
        channelSent: ['inapp'],
        createdAt: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hrs ago
      },
      {
        id: 'notif_003',
        userId: 'usr_tenant_001',
        type: 'application_viewed',
        title: '📩 Application viewed',
        body: 'Sarah viewed your application',
        link: 'tenant_applications',
        data: { landlord_name: 'Sarah' },
        isRead: true,
        isUrgent: false,
        channelSent: ['inapp', 'email'],
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // Yesterday
      },
      {
        id: 'notif_004',
        userId: 'usr_tenant_001',
        type: 'rent_due_3_days',
        title: '💰 Rent due in 3 days',
        body: 'UGX 2,800,000 for Apt 4B',
        link: 'rent_ledger',
        data: { amount: 2800000, property_title: 'Apt 4B' },
        isRead: true,
        isUrgent: true,
        channelSent: ['inapp', 'whatsapp', 'push'],
        createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), // 2 days ago
      }
    ]);

    this.notificationPreferences = this.load(STORAGE_KEYS.NOTIFICATION_PREFS, {
      usr_tenant_001: {
        userId: 'usr_tenant_001',
        propertyAlerts: true,
        priceDrops: true,
        hotDeals: true,
        dealEnding: true,
        applicationUpdates: true,
        inspectionReminders: true,
        rentReminders: true,
        leaseUpdates: true,
        chatMessages: true,
        announcements: true,
        maintenanceUpdates: true,
        weeklyDigest: false,
        streakReminders: false,
        pushEnabled: true,
        whatsappEnabled: true,
        emailEnabled: false,
        quietHoursEnabled: true,
        quietHoursStart: '21:00',
        quietHoursEnd: '07:00',
        dailyLimit: 3,
        updatedAt: new Date().toISOString(),
      },
      usr_landlord_001: {
        userId: 'usr_landlord_001',
        propertyAlerts: true,
        priceDrops: true,
        hotDeals: true,
        dealEnding: true,
        applicationUpdates: true,
        inspectionReminders: true,
        rentReminders: true,
        leaseUpdates: true,
        chatMessages: true,
        announcements: true,
        maintenanceUpdates: true,
        weeklyDigest: false,
        streakReminders: false,
        pushEnabled: true,
        whatsappEnabled: true,
        emailEnabled: false,
        quietHoursEnabled: true,
        quietHoursStart: '21:00',
        quietHoursEnd: '07:00',
        dailyLimit: 3,
        updatedAt: new Date().toISOString(),
      },
      usr_admin_001: {
        userId: 'usr_admin_001',
        propertyAlerts: true,
        priceDrops: true,
        hotDeals: true,
        dealEnding: true,
        applicationUpdates: true,
        inspectionReminders: true,
        rentReminders: true,
        leaseUpdates: true,
        chatMessages: true,
        announcements: true,
        maintenanceUpdates: true,
        weeklyDigest: false,
        streakReminders: false,
        pushEnabled: true,
        whatsappEnabled: true,
        emailEnabled: false,
        quietHoursEnabled: true,
        quietHoursStart: '21:00',
        quietHoursEnd: '07:00',
        dailyLimit: 3,
        updatedAt: new Date().toISOString(),
      }
    });

    this.deviceTokens = this.load(STORAGE_KEYS.DEVICE_TOKENS, []);
    this.notificationQueue = this.load(STORAGE_KEYS.NOTIFICATION_QUEUE, []);
    this.buildingStaff = this.load(STORAGE_KEYS.BUILDING_STAFF, INITIAL_BUILDING_STAFF);
    this.buildingChatMessages = this.load(STORAGE_KEYS.BUILDING_CHAT_MESSAGES, INITIAL_BUILDING_CHAT_MESSAGES);
    this.buildingChatAnnouncements = this.load(STORAGE_KEYS.BUILDING_CHAT_ANNOUNCEMENTS, INITIAL_BUILDING_CHAT_ANNOUNCEMENTS);
  }

  public static getInstance(): SafeNestStore {
    if (!SafeNestStore.instance) {
      SafeNestStore.instance = new SafeNestStore();
    }
    return SafeNestStore.instance;
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn(`Error loading key ${key}:`, e);
    }
    return fallback;
  }

  private save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error saving key ${key}:`, e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  // --- User & Role Management ---
  public loginUser(user: UserProfile) {
    this.currentUser = user;
    this.isLoggedIn = true;
    this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.save('safenest_is_logged_in', true);
    this.logActivity('Logged In', 'user', user.id, `Logged in as ${user.fullName}`);
    this.notify();
  }

  public logoutUser() {
    this.isLoggedIn = false;
    this.save('safenest_is_logged_in', false);
    this.logActivity('Logged Out', 'user', this.currentUser?.id || 'unknown', 'Logged out of SafeNest');
    this.notify();
  }

  public setDeveloperMode(val: boolean) {
    this.developerMode = val;
    this.save('safenest_developer_mode_active', val);
    this.notify();
  }

  public addCustomLandlordApplication(appData: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    companyName: string;
    nationalId: string;
  }) {
    const newApp: LandlordApplication = {
      id: `app_${Math.random().toString(36).substr(2, 9)}`,
      userId: appData.userId,
      fullName: appData.fullName,
      email: appData.email,
      phone: appData.phone,
      nationalIdNumber: appData.nationalId,
      physicalAddress: 'Kampala, Uganda',
      businessName: appData.companyName,
      propertyCount: 0,
      documents: [],
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.applications = [newApp, ...this.applications];
    this.save(STORAGE_KEYS.APPLICATIONS, this.applications);
    this.logActivity('Landlord Application Submitted', 'application', appData.userId, `Submitted application for ${appData.fullName}`);
    this.notify();
  }

  public switchRole(role: UserRole) {
    this.currentUser = DEMO_USERS[role];
    this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.logActivity(
      'Switched Active Role',
      'user',
      this.currentUser.id,
      `Switched context to ${this.currentUser.fullName} (${role.toUpperCase()})`
    );
    this.notify();
  }

  public updateUserProfile(updates: Partial<UserProfile>) {
    this.currentUser = { ...this.currentUser, ...updates };
    this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.logActivity('Updated Profile', 'user', this.currentUser.id, 'Personal profile information updated');
    this.notify();
  }

  // --- Google Drive Linkage ---
  public setGoogleDriveAuth(token: string | null, email: string | null) {
    this.googleAccessToken = token;
    this.googleUserEmail = email;
    setAccessTokenForSession(token);
    this.notify();
  }

  public setGoogleDriveFiles(files: GoogleDriveItem[]) {
    this.googleDriveFiles = files;
    this.notify();
  }

  public addGoogleDriveFile(file: GoogleDriveItem) {
    this.googleDriveFiles = [file, ...this.googleDriveFiles.filter((f) => f.id !== file.id)];
    this.logActivity('Uploaded to Google Drive', 'drive', file.id, `Saved file: ${file.name}`);
    this.notify();
  }

  public removeGoogleDriveFile(fileId: string) {
    this.googleDriveFiles = this.googleDriveFiles.filter((f) => f.id !== fileId);
    this.logActivity('Deleted from Google Drive', 'drive', fileId, 'File removed from SafeNest Drive vault');
    this.notify();
  }

  // --- Property Management ---
  public addProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'favoritesCount' | 'inquiriesCount'>) {
    const newPropId = `prop_${Date.now()}`;
    const now = new Date().toISOString();
    
    // Assign created images with ids
    const imagesWithIds = propertyData.images.map((img, idx) => ({
      ...img,
      id: img.id || `img_${newPropId}_${idx + 1}`,
      propertyId: newPropId,
      status: this.currentUser.role === 'super_admin' ? ('approved' as const) : ('pending' as const),
    }));

    const status = this.currentUser.role === 'super_admin' ? 'published' : 'pending';

    const newProperty: Property = {
      ...propertyData,
      id: newPropId,
      images: imagesWithIds,
      status,
      createdAt: now,
      updatedAt: now,
      publishedAt: status === 'published' ? now : undefined,
      viewsCount: 0,
      favoritesCount: 0,
      inquiriesCount: 0,
    };

    this.properties = [newProperty, ...this.properties];
    this.save(STORAGE_KEYS.PROPERTIES, this.properties);

    this.logActivity(
      status === 'published' ? 'Created & Published Property' : 'Submitted Property for Review',
      'property',
      newPropId,
      `Property "${newProperty.title}" uploaded with ${imagesWithIds.length} photos.`
    );

    if (newProperty.status === 'published') {
      setTimeout(() => {
        this.sendNotification({
          type: 'new_property_match',
          title: `🏠 New property in ${newProperty.neighborhood}`,
          body: `${newProperty.bedrooms} bed · UGX ${newProperty.rentAmount.toLocaleString()}/month`,
          link: 'browse',
          data: { id: newProperty.id, neighborhood: newProperty.neighborhood, bedrooms: newProperty.bedrooms, rent: newProperty.rentAmount }
        });
      }, 100);
    }

    this.notify();
    return newProperty;
  }

  public updateProperty(id: string, updates: Partial<Property>) {
    this.properties = this.properties.map((p) => {
      if (p.id === id) {
        const oldRent = p.rentAmount;
        const newRent = updates.rentAmount;
        if (newRent !== undefined && newRent < oldRent) {
          setTimeout(() => {
            this.sendNotification({
              type: 'price_drop',
              title: '💰 Price drop on saved property',
              body: `Now UGX ${newRent.toLocaleString()} (was UGX ${oldRent.toLocaleString()})`,
              link: 'browse',
              data: { id, old_rent: oldRent, new_rent: newRent }
            });
          }, 100);
        }
        const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
        return updated;
      }
      return p;
    });
    this.save(STORAGE_KEYS.PROPERTIES, this.properties);
    this.notify();
  }

  public deleteProperty(id: string) {
    const prop = this.properties.find((p) => p.id === id);
    this.properties = this.properties.filter((p) => p.id !== id);
    this.save(STORAGE_KEYS.PROPERTIES, this.properties);
    if (prop) {
      this.logActivity('Deleted Property', 'property', id, `Removed "${prop.title}"`);
    }
    this.notify();
  }

  public incrementViews(id: string) {
    this.properties = this.properties.map((p) => {
      if (p.id === id) {
        return { ...p, viewsCount: p.viewsCount + 1 };
      }
      return p;
    });
    this.save(STORAGE_KEYS.PROPERTIES, this.properties);
    this.notify();
  }

  public bookInspection(
    propertyId: string,
    type: 'virtual' | 'in_person' | 'premium',
    scheduledAt: string,
    price: number,
    paymentMethod: 'momo' | 'cash'
  ) {
    const property = this.properties.find(p => p.id === propertyId);
    const booking: PropertyInspectionBooking = {
      id: `insp_bk_${Date.now()}`,
      userId: this.currentUser.id,
      propertyId,
      agentId: property?.landlordId || 'usr_landlord_001',
      type,
      scheduledAt,
      price,
      paymentStatus: 'pending',
      paymentMethod,
      status: 'booked',
      addressRevealed: false,
      revealExpiresAt: new Date(new Date(scheduledAt).getTime() + 24 * 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.inspectionBookings = [booking, ...this.inspectionBookings];
    this.save(STORAGE_KEYS.INSPECTION_BOOKINGS, this.inspectionBookings);
    
    const propTitle = property ? property.title : 'Property';
    const timeStr = new Date(scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Notification 1: To the tenant confirming booking
    // User: "Booking confirmed. Pay UGX X to agent before [time]"
    this.sendNotification({
      type: 'inspection_confirmed',
      title: '📅 Booking Confirmed',
      body: `Booking confirmed. Pay UGX ${price.toLocaleString()} to agent before ${timeStr}`,
      link: 'inspections',
      targetUserId: this.currentUser.id,
      data: { id: booking.id, propertyId }
    });

    // Notification 2: To the landlord of the property (agent)
    // Agent: "New booking at [time] with [user]"
    if (property && property.landlordId && property.landlordId !== this.currentUser.id) {
      this.sendNotification({
        type: 'inspection_confirmed',
        title: '📅 New Inspection Scheduled',
        body: `New booking at ${timeStr} with ${this.currentUser.fullName}`,
        link: 'inspections',
        targetUserId: property.landlordId,
        data: { id: booking.id, propertyId }
      });
    }

    this.logActivity(
      'Booked Inspection',
      'property',
      propertyId,
      `User booked a ${type} inspection with ${paymentMethod} payment.`
    );
    this.notify();
    return booking;
  }

  // User claims payment
  public claimBookingPaid(bookingId: string, reference?: string, proofUrl?: string, paymentMethod?: 'momo' | 'cash') {
    this.inspectionBookings = this.inspectionBookings.map((b) => {
      if (b.id === bookingId) {
        const updated: PropertyInspectionBooking = {
          ...b,
          paymentStatus: 'claimed_paid',
          paymentReference: reference || b.paymentReference,
          paymentProofUrl: proofUrl || b.paymentProofUrl,
          paymentMethod: paymentMethod || b.paymentMethod,
          paidAt: new Date().toISOString(),
        };

        // Notify Agent: "User claims payment of UGX X. Please confirm."
        const property = this.properties.find(p => p.id === b.propertyId);
        if (property && property.landlordId) {
          this.sendNotification({
            type: 'inspection_confirmed',
            title: '💳 Payment Claim Submitted',
            body: `User claims payment of UGX ${b.price.toLocaleString()}. Please confirm.`,
            link: 'inspections',
            targetUserId: property.landlordId,
            data: { id: b.id, propertyId: b.propertyId }
          });
        }

        return updated;
      }
      return b;
    });
    this.save(STORAGE_KEYS.INSPECTION_BOOKINGS, this.inspectionBookings);
    this.notify();
  }

  // Agent confirms payment
  public confirmBookingPayment(bookingId: string, notes?: string) {
    this.inspectionBookings = this.inspectionBookings.map((b) => {
      if (b.id === bookingId) {
        const timeStr = new Date(b.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const updated: PropertyInspectionBooking = {
          ...b,
          paymentStatus: 'confirmed',
          status: 'confirmed',
          confirmedBy: this.currentUser.id,
          confirmedAt: new Date().toISOString(),
          addressRevealed: true,
        };

        // Notify User: "Payment confirmed. See you at [time]!"
        this.sendNotification({
          type: 'inspection_confirmed',
          title: '✓ Payment Confirmed',
          body: `Payment confirmed. See you at ${timeStr}!`,
          link: 'inspections',
          targetUserId: b.userId,
          data: { id: b.id, propertyId: b.propertyId }
        });

        return updated;
      }
      return b;
    });
    this.save(STORAGE_KEYS.INSPECTION_BOOKINGS, this.inspectionBookings);
    this.notify();
  }

  // Agent disputes payment / says Not Paid
  public disputeBookingPayment(bookingId: string, notes?: string) {
    this.inspectionBookings = this.inspectionBookings.map((b) => {
      if (b.id === bookingId) {
        const updated: PropertyInspectionBooking = {
          ...b,
          paymentStatus: 'disputed',
        };

        this.sendNotification({
          type: 'inspection_confirmed',
          title: '⚠️ Payment Disputed',
          body: `The agent reported that they have not received payment yet. Please contact the agent or verify your MoMo transaction reference.`,
          link: 'inspections',
          targetUserId: b.userId,
          data: { id: b.id, propertyId: b.propertyId }
        });

        return updated;
      }
      return b;
    });
    this.save(STORAGE_KEYS.INSPECTION_BOOKINGS, this.inspectionBookings);
    this.notify();
  }

  public assignPropertyToLandlord(propertyId: string, landlordId: string, landlordName: string) {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return;
    this.updateProperty(propertyId, {
      landlordId,
      landlordName,
      landlordVerified: true,
    });
    this.logActivity(
      'Assigned Property to Landlord',
      'property',
      propertyId,
      `Admin assigned "${prop.title}" to verified landlord ${landlordName}.`
    );
  }

  // --- Landlord Messaging System (Module 4) ---

  public addStaffMember(staffData: Omit<BuildingStaff, 'id'>) {
    const newStaff: BuildingStaff = {
      ...staffData,
      id: `staff_${Date.now()}`,
    };
    this.buildingStaff = [newStaff, ...this.buildingStaff];
    this.save(STORAGE_KEYS.BUILDING_STAFF, this.buildingStaff);
    this.logActivity(
      'Added Building Staff',
      'property',
      staffData.propertyId,
      `Added ${staffData.name} as verified ${staffData.role}.`
    );
    this.notify();
    return newStaff;
  }

  public editStaffMember(updatedStaff: BuildingStaff) {
    this.buildingStaff = this.buildingStaff.map((s) =>
      s.id === updatedStaff.id ? updatedStaff : s
    );
    this.save(STORAGE_KEYS.BUILDING_STAFF, this.buildingStaff);
    this.logActivity(
      'Updated Building Staff',
      'property',
      updatedStaff.propertyId,
      `Updated staff profile for ${updatedStaff.name} (${updatedStaff.role}).`
    );
    this.notify();
  }

  public deleteStaffMember(id: string) {
    const staff = this.buildingStaff.find((s) => s.id === id);
    if (!staff) return;
    this.buildingStaff = this.buildingStaff.filter((s) => s.id !== id);
    this.save(STORAGE_KEYS.BUILDING_STAFF, this.buildingStaff);
    this.logActivity(
      'Deleted Building Staff',
      'property',
      staff.propertyId,
      `Removed staff member ${staff.name} (${staff.role}).`
    );
    this.notify();
  }

  public sendBuildingChatMessage(
    propertyId: string,
    message: string,
    senderId: string,
    senderName: string,
    senderRole: 'landlord' | 'tenant' | 'staff',
    senderBadge?: string
  ) {
    const newMsg: BuildingChatMessage = {
      id: `chat_msg_${Date.now()}`,
      propertyId,
      senderId,
      senderName,
      senderRole,
      senderBadge,
      message,
      createdAt: new Date().toISOString(),
    };
    this.buildingChatMessages = [...this.buildingChatMessages, newMsg];
    this.save(STORAGE_KEYS.BUILDING_CHAT_MESSAGES, this.buildingChatMessages);
    
    // Auto-reply simulation from other tenants/staff if landlord says something
    if (senderRole === 'landlord' && !message.startsWith('👋 Welcome')) {
      setTimeout(() => {
        const randomReplies = [
          "Noted, thanks Grace!",
          "Acknowledged. Will inform my roommate.",
          "Thank you for the update!",
          "Got it, landlord."
        ];
        const randomReply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
        this.sendBuildingChatMessage(
          propertyId,
          randomReply,
          'usr_tenant_001',
          'Sarah K.',
          'tenant',
          'Apt 4B'
        );
      }, 1500);
    }

    this.notify();
    return newMsg;
  }

  public togglePinMessage(messageId: string) {
    this.buildingChatMessages = this.buildingChatMessages.map((m) =>
      m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
    );
    this.save(STORAGE_KEYS.BUILDING_CHAT_MESSAGES, this.buildingChatMessages);
    this.notify();
  }

  public addBuildingAnnouncement(annData: Omit<BuildingChatAnnouncement, 'id' | 'createdAt'>) {
    const newAnn: BuildingChatAnnouncement = {
      ...annData,
      id: `ann_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.buildingChatAnnouncements = [newAnn, ...this.buildingChatAnnouncements];
    this.save(STORAGE_KEYS.BUILDING_CHAT_ANNOUNCEMENTS, this.buildingChatAnnouncements);

    // Also trigger as an official broadcast/notification to all tenants!
    this.sendNotification({
      type: 'announcement',
      title: `Building Announcement: ${newAnn.title}`,
      body: newAnn.body,
      link: 'landlord-messages',
      is_urgent: newAnn.pinned,
      data: { propertyId: newAnn.propertyId, announcementId: newAnn.id }
    });

    this.logActivity(
      'Broadcast Building Announcement',
      'property',
      newAnn.propertyId,
      `Broadcast notice: "${newAnn.title}"`
    );
    this.notify();
    return newAnn;
  }

  public deleteBuildingAnnouncement(id: string) {
    const ann = this.buildingChatAnnouncements.find((a) => a.id === id);
    if (!ann) return;
    this.buildingChatAnnouncements = this.buildingChatAnnouncements.filter((a) => a.id !== id);
    this.save(STORAGE_KEYS.BUILDING_CHAT_ANNOUNCEMENTS, this.buildingChatAnnouncements);
    this.logActivity(
      'Deleted Building Announcement',
      'property',
      ann.propertyId,
      `Removed notice: "${ann.title}"`
    );
    this.notify();
  }

  public autoAddTenantToBuilding(tenantId: string, tenantName: string, propertyId: string, aptNumber: string) {
    const prop = this.properties.find(p => p.id === propertyId);
    const buildingName = prop ? prop.title.split('—')[0].split('with')[0].trim() : 'Apartments';

    // Send Welcome Message to Tenant via system notification (in-app + simulated whatsapp/email)
    this.sendNotification({
      type: 'announcement',
      title: `Welcome to ${buildingName}!`,
      body: `Welcome to ${buildingName}! You have been automatically added to the building group chat.`,
      link: 'landlord-messages',
      targetUserId: tenantId,
      is_urgent: false,
      data: { propertyId, buildingName }
    });

    // Post welcome greeting in building chat
    this.sendBuildingChatMessage(
      propertyId,
      `👋 Welcome ${tenantName} (${aptNumber}) to the building community!`,
      'system',
      'SafeNest System',
      'staff',
      'System'
    );

    // Notify landlord
    const landlordId = prop ? prop.landlordId : 'usr_landlord_001';
    this.sendNotification({
      type: 'announcement',
      title: 'New Tenant Grouped Into Chat',
      body: `${tenantName} has signed the lease and was automatically added to the ${buildingName} group chat.`,
      link: 'landlord-messages',
      targetUserId: landlordId,
      is_urgent: false,
      data: { propertyId, tenantId }
    });

    this.logActivity(
      'Tenant Grouped Into Chat',
      'property',
      propertyId,
      `${tenantName} automatically added to ${buildingName} community chat.`
    );
  }

  public broadcastAnnouncement(title: string, message: string) {
    const announcementInquiry: Inquiry = {
      id: `ann_${Date.now()}`,
      propertyId: 'general',
      propertyTitle: `📢 Announcement: ${title}`,
      propertyImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
      userId: 'all_tenants',
      landlordId: this.currentUser.id,
      name: this.currentUser.fullName,
      email: this.currentUser.email,
      phone: this.currentUser.phone || '+256 700 000 000',
      message: message,
      preferredContact: 'in_app',
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    this.inquiries = [announcementInquiry, ...this.inquiries];
    this.save(STORAGE_KEYS.INQUIRIES, this.inquiries);
    this.logActivity(
      'Sent Tenant Announcement',
      'inquiry',
      announcementInquiry.id,
      `Landlord ${this.currentUser.fullName} broadcast: "${title}"`
    );

    const isEmergency = title.toLowerCase().includes('emergency') || title.toLowerCase().includes('alert');
    setTimeout(() => {
      this.sendNotification({
        type: isEmergency ? 'emergency_alert' : 'announcement',
        title: isEmergency ? `🚨 EMERGENCY: ${title}` : `📢 Announcement: ${title}`,
        body: message,
        link: 'browse',
        is_urgent: isEmergency,
        data: { title, message }
      });
    }, 100);

    this.notify();
  }

  // --- Photo Moderation (Module 5 & 6) ---
  public moderatePhoto(
    propertyId: string,
    imageId: string,
    action: 'approve' | 'reject' | 'flag',
    reason?: RejectionReason,
    notes?: string
  ) {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return;

    const now = new Date().toISOString();
    const updatedImages = prop.images.map((img) => {
      if (img.id === imageId) {
        return {
          ...img,
          status: action === 'approve' ? ('approved' as const) : ('rejected' as const),
          rejectionReason: action === 'reject' ? reason : undefined,
          moderationNotes: notes || img.moderationNotes,
          reviewedBy: this.currentUser.fullName,
          reviewedAt: now,
        };
      }
      return img;
    });

    // Check overall property status
    const anyRejected = updatedImages.some((img) => img.status === 'rejected');
    const allApproved = updatedImages.every((img) => img.status === 'approved');

    let newPropStatus = prop.status;
    if (anyRejected) {
      newPropStatus = 'pending_photos';
    } else if (allApproved && prop.status === 'pending') {
      newPropStatus = 'published';
    }

    this.updateProperty(propertyId, {
      images: updatedImages,
      status: newPropStatus,
      moderationNotes: anyRejected ? `Action required: Photo(s) rejected (${reason})` : undefined,
      publishedAt: newPropStatus === 'published' && !prop.publishedAt ? now : prop.publishedAt,
    });

    const modLog: ModerationLog = {
      id: `mod_${Date.now()}`,
      propertyId,
      propertyTitle: prop.title,
      imageId,
      moderatorId: this.currentUser.id,
      moderatorName: this.currentUser.fullName,
      action,
      reason,
      notes,
      createdAt: now,
    };

    this.moderationLogs = [modLog, ...this.moderationLogs];
    this.save(STORAGE_KEYS.MODERATION_LOGS, this.moderationLogs);

    this.logActivity(
      action === 'approve' ? 'Approved Photo' : 'Rejected Photo',
      'photo',
      imageId,
      `Admin ${action}d image for "${prop.title}". Reason: ${reason || 'Meets standards'}`
    );

    this.notify();
  }

  public bulkModeratePhotos(
    propertyId: string,
    action: 'approve_all' | 'reject_all',
    reason?: RejectionReason,
    notes?: string
  ) {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return;

    const now = new Date().toISOString();
    const updatedImages: PropertyImage[] = prop.images.map((img) => ({
      ...img,
      status: action === 'approve_all' ? 'approved' : 'rejected',
      rejectionReason: action === 'reject_all' ? reason : undefined,
      moderationNotes: action === 'reject_all' ? notes : undefined,
      reviewedBy: this.currentUser.fullName,
      reviewedAt: now,
    }));

    const newPropStatus = action === 'approve_all' ? 'published' : 'pending_photos';

    this.updateProperty(propertyId, {
      images: updatedImages,
      status: newPropStatus,
      publishedAt: action === 'approve_all' ? now : undefined,
      moderationNotes: action === 'reject_all' ? `Bulk rejected photos. Reason: ${reason}` : undefined,
    });

    this.logActivity(
      action === 'approve_all' ? 'Bulk Approved All Photos' : 'Bulk Rejected All Photos',
      'property',
      propertyId,
      `Moderator ${this.currentUser.fullName} bulk ${action === 'approve_all' ? 'approved' : 'rejected'} ${updatedImages.length} photos for "${prop.title}"`
    );

    this.notify();
  }

  public reuploadPhoto(propertyId: string, oldImageId: string, newUrl: string, fileSize?: string, resolution?: string) {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return;

    const now = new Date().toISOString();
    const updatedImages = prop.images.map((img) => {
      if (img.id === oldImageId) {
        return {
          ...img,
          url: newUrl,
          status: 'pending' as const, // goes back to admin queue
          rejectionReason: undefined,
          moderationNotes: undefined,
          reviewedBy: undefined,
          reviewedAt: undefined,
          fileSize: fileSize || '2.2 MB',
          resolution: resolution || '1920x1080',
          createdAt: now,
        };
      }
      return img;
    });

    const anyStillRejected = updatedImages.some((img) => img.status === 'rejected');

    this.updateProperty(propertyId, {
      images: updatedImages,
      status: anyStillRejected ? 'pending_photos' : 'pending',
      moderationNotes: 'Replacement photo submitted by landlord. Awaiting admin review.',
    });

    this.logActivity(
      'Re-uploaded Photo',
      'photo',
      oldImageId,
      `Landlord re-uploaded image on "${prop.title}". Sent to moderation queue.`
    );

    this.notify();
  }

  // --- Favorites (Module 3) ---
  public toggleFavorite(propertyId: string) {
    const isFav = this.favorites.includes(propertyId);
    if (isFav) {
      this.favorites = this.favorites.filter((id) => id !== propertyId);
    } else {
      this.favorites = [...this.favorites, propertyId];
    }
    this.save(STORAGE_KEYS.FAVORITES, this.favorites);

    // Update count on property
    this.properties = this.properties.map((p) => {
      if (p.id === propertyId) {
        return {
          ...p,
          favoritesCount: isFav ? Math.max(0, p.favoritesCount - 1) : p.favoritesCount + 1,
        };
      }
      return p;
    });
    this.save(STORAGE_KEYS.PROPERTIES, this.properties);

    this.notify();
  }

  // --- Inquiries (Module 3) ---
  public submitInquiry(inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) {
    const prop = this.properties.find(p => p.id === inquiryData.propertyId);
    const landlord = prop ? {
      name: prop.landlordName || 'Grace Nakimera',
      phone: prop.landlordPhone || '+256 755 987 654',
      email: 'grace@email.com',
      verified: true,
      propertiesCount: 3,
      rating: 4.8,
      connectionsCount: 24
    } : null;

    const user = {
      name: inquiryData.name,
      verified: true,
      ninStatus: 'Verified (NIN Confirmed)',
      phone: inquiryData.phone,
      email: inquiryData.email,
      employmentStatus: 'Employed',
      monthlyIncome: 'UGX 8.5M/month',
      currentLocation: 'Currently in Nakasero',
      moveInDate: inquiryData.moveInDate || '2026-10-01',
      occupantsCount: 1,
      pets: 'None',
      preferredContact: inquiryData.preferredContact
    };

    const newInq: Inquiry = {
      ...inquiryData,
      id: `inq_${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
      conversationId: `conv_inq_${Date.now()}`,
      propertySnapshot: prop || null,
      landlordSnapshot: landlord,
      userSnapshot: user,
      activityLog: [
        {
          type: 'interest_received',
          content: 'User submitted interest',
          timestamp: new Date().toISOString()
        }
      ]
    };

    this.inquiries = [newInq, ...this.inquiries];
    this.save(STORAGE_KEYS.INQUIRIES, this.inquiries);

    // Update property count
    this.properties = this.properties.map((p) => {
      if (p.id === newInq.propertyId) {
        return { ...p, inquiriesCount: p.inquiriesCount + 1 };
      }
      return p;
    });
    this.save(STORAGE_KEYS.PROPERTIES, this.properties);

    // Notify super_admin
    setTimeout(() => {
      this.sendNotification({
        type: 'new_deal',
        title: '🔥 New Gatekeeper Interest Request',
        body: `New interest submitted by ${newInq.name} on "${newInq.propertyTitle}". Preferred responder: ${newInq.preferredContact.toUpperCase()}.`,
        link: 'admin-gatekeeper',
        targetUserId: 'usr_admin_001',
        is_urgent: true,
      });
    }, 100);

    this.logActivity('Sent Property Inquiry', 'inquiry', newInq.id, `Inquiry sent for "${newInq.propertyTitle}"`);
    this.notify();
    return newInq;
  }

  public updateInquiryStatus(id: string, status: Inquiry['status'], notes?: string) {
    this.inquiries = this.inquiries.map((inq) => {
      if (inq.id === id) {
        const updatedLog = inq.activityLog ? [...inq.activityLog] : [];
        updatedLog.push({
          type: 'stage_change',
          from: inq.status,
          to: status,
          content: `Stage transitioned from ${inq.status.toUpperCase()} to ${status.toUpperCase()}`,
          timestamp: new Date().toISOString()
        });
        if (notes) {
          updatedLog.push({
            type: 'note',
            content: `Admin Note added: "${notes}"`,
            timestamp: new Date().toISOString()
          });
        }
        const updated = {
          ...inq,
          status,
          adminNotes: notes !== undefined ? notes : inq.adminNotes,
          activityLog: updatedLog,
        };

        // Notify user about status change if relevant
        if (status === 'contacting_user') {
          setTimeout(() => {
            this.sendNotification({
              type: 'parties_connected',
              title: '💬 SafeNest Admin Reaching Out',
              body: `SafeNest Admin is reviewing your interest in "${inq.propertyTitle}". We will contact you shortly via ${inq.preferredContact === 'whatsapp' ? 'WhatsApp' : inq.preferredContact === 'phone' ? 'phone' : 'in-app chat'}.`,
              link: 'user-inbox',
              targetUserId: inq.userId,
            });
          }, 100);
        }

        return updated;
      }
      return inq;
    });
    this.save(STORAGE_KEYS.INQUIRIES, this.inquiries);
    this.logActivity('Updated Inquiry Status', 'inquiry', id, `Inquiry status changed to ${status}`);
    this.notify();
  }

  public forwardInquiryToLandlord(id: string, notes?: string) {
    this.inquiries = this.inquiries.map((inq) => {
      if (inq.id === id) {
        const updatedLog = inq.activityLog ? [...inq.activityLog] : [];
        updatedLog.push({
          type: 'stage_change',
          from: inq.status,
          to: 'forwarded',
          content: `Inquiry forwarded to landlord`,
          timestamp: new Date().toISOString()
        });
        if (notes) {
          updatedLog.push({
            type: 'note',
            content: `Admin Note added: "${notes}"`,
            timestamp: new Date().toISOString()
          });
        }
        const updated = {
          ...inq,
          status: 'forwarded' as const,
          forwardedAt: new Date().toISOString(),
          adminNotes: notes || inq.adminNotes,
          activityLog: updatedLog,
        };
        
        // Notify the landlord of the forwarded inquiry
        setTimeout(() => {
          this.sendNotification({
            type: 'inquiry_forwarded',
            title: '📋 New Inquiry Forwarded by SafeNest',
            body: `SafeNest Admin has forwarded a new verified interest request for your property "${inq.propertyTitle}". Check your inquiries panel to reply.`,
            link: 'landlord-messages',
            targetUserId: inq.landlordId || 'usr_landlord_001',
            is_urgent: true,
          });
        }, 100);

        return updated;
      }
      return inq;
    });
    this.save(STORAGE_KEYS.INQUIRIES, this.inquiries);
    this.logActivity('Forwarded Property Inquiry', 'inquiry', id, `Inquiry forwarded to landlord for ID ${id}`);
    this.notify();
  }

  public connectInquiryParties(id: string, channel: 'whatsapp' | 'in_app' | 'both', notes?: string) {
    this.inquiries = this.inquiries.map((inq) => {
      if (inq.id === id) {
        const updatedLog = inq.activityLog ? [...inq.activityLog] : [];
        updatedLog.push({
          type: 'stage_change',
          from: inq.status,
          to: 'connected',
          content: `Inquiry parties connected via ${channel.toUpperCase()}`,
          timestamp: new Date().toISOString()
        });
        if (notes) {
          updatedLog.push({
            type: 'note',
            content: `Admin Note added on connection: "${notes}"`,
            timestamp: new Date().toISOString()
          });
        }
        const updated = {
          ...inq,
          status: 'connected' as const,
          connectedAt: new Date().toISOString(),
          channel,
          whatsappBridgeEnabled: true,
          adminNotes: notes || inq.adminNotes,
          activityLog: updatedLog,
        };

        // Add a new connection record
        const newConn: Connection = {
          id: `conn_${Date.now()}`,
          interestId: id,
          userId: inq.userId,
          landlordId: inq.landlordId,
          propertyId: inq.propertyId,
          connectedBy: this.currentUser.id,
          channel,
          connectedAt: new Date().toISOString(),
        };
        this.connections = [newConn, ...this.connections];
        this.save(STORAGE_KEYS.CONNECTIONS, this.connections);

        // Notify both parties of the unlock & bridge activation
        setTimeout(() => {
          // 1. Notify User (Tenant)
          this.sendNotification({
            type: 'parties_connected',
            title: '🎉 Unlocked & Connected!',
            body: `SafeNest Approved: You are now directly connected to the landlord for "${inq.propertyTitle}". Tap 'Inbox' to view contact and WhatsApp link!`,
            link: 'user-inbox',
            targetUserId: inq.userId,
            is_urgent: true,
          });

          // 2. Notify Landlord
          this.sendNotification({
            type: 'parties_connected',
            title: '🎉 Connected with Applicant!',
            body: `SafeNest Approved: You are now connected with "${inq.name}" for "${inq.propertyTitle}". Direct messaging and WhatsApp bridge unlocked!`,
            link: 'landlord-messages',
            targetUserId: inq.landlordId || 'usr_landlord_001',
            is_urgent: true,
          });
        }, 100);

        return updated;
      }
      return inq;
    });
    this.save(STORAGE_KEYS.INQUIRIES, this.inquiries);
    this.logActivity('Approved Inquiry Connection', 'inquiry', id, `Direct connection approved between tenant and landlord for inquiry ${id}`);
    this.notify();
  }

  public dismissInquiry(id: string, notes?: string) {
    this.inquiries = this.inquiries.map((inq) => {
      if (inq.id === id) {
        const updatedLog = inq.activityLog ? [...inq.activityLog] : [];
        updatedLog.push({
          type: 'stage_change',
          from: inq.status,
          to: 'dismissed',
          content: `Inquiry dismissed. Reason: ${notes || 'No reason specified'}`,
          timestamp: new Date().toISOString()
        });
        return {
          ...inq,
          status: 'dismissed' as const,
          dismissedAt: new Date().toISOString(),
          adminNotes: notes || inq.adminNotes,
          activityLog: updatedLog,
        };
      }
      return inq;
    });
    this.save(STORAGE_KEYS.INQUIRIES, this.inquiries);
    this.logActivity('Dismissed Property Inquiry', 'inquiry', id, `Inquiry dismissed by admin: ${notes || 'No reason specified'}`);
    this.notify();
  }

  public sendDirectMessage(conversationId: string, message: string, senderId: string, senderName: string, senderRole: 'admin' | 'landlord' | 'tenant' | 'user') {
    const newMsg: DirectChatMessage = {
      id: `dir_msg_${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      senderRole,
      message,
      createdAt: new Date().toISOString(),
    };

    this.directMessages = [...this.directMessages, newMsg];
    this.save('safenest_direct_messages', this.directMessages);

    // Also update the inquiry activity log with this message!
    this.inquiries = this.inquiries.map((inq) => {
      if (inq.conversationId === conversationId) {
        const updatedLog = inq.activityLog ? [...inq.activityLog] : [];
        updatedLog.push({
          type: senderRole === 'admin' ? 'whatsapp_sent' : 'whatsapp_received',
          content: `${senderName}: ${message}`,
          timestamp: new Date().toISOString(),
        });
        return {
          ...inq,
          activityLog: updatedLog,
        };
      }
      return inq;
    });
    this.save(STORAGE_KEYS.INQUIRIES, this.inquiries);

    this.notify();
    return newMsg;
  }

  // --- Landlord Applications (Module 4) ---
  public submitLandlordApplication(
    appData: Omit<LandlordApplication, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) {
    const newApp: LandlordApplication = {
      ...appData,
      id: `app_${Date.now()}`,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.applications = [newApp, ...this.applications];
    this.save(STORAGE_KEYS.APPLICATIONS, this.applications);

    // If current user submitted it, update their role to applicant
    if (this.currentUser.id === newApp.userId) {
      this.currentUser = { ...this.currentUser, role: 'applicant' };
      this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    }

    this.logActivity(
      'Submitted Landlord Application',
      'application',
      newApp.id,
      `Applicant ${newApp.fullName} applied with ${newApp.propertyCount} properties.`
    );

    this.notify();
    return newApp;
  }

  public approveApplication(applicationId: string, adminNotes?: string) {
    const now = new Date().toISOString();
    const app = this.applications.find((a) => a.id === applicationId);
    if (!app) return;

    this.applications = this.applications.map((a) => {
      if (a.id === applicationId) {
        return {
          ...a,
          status: 'approved' as const,
          adminNotes: adminNotes || a.adminNotes,
          reviewedBy: this.currentUser.fullName,
          reviewedAt: now,
          updatedAt: now,
        };
      }
      return a;
    });
    this.save(STORAGE_KEYS.APPLICATIONS, this.applications);

    // If demo applicant matches, promote them
    if (this.currentUser.id === app.userId) {
      this.currentUser = {
        ...this.currentUser,
        role: 'landlord',
        isVerified: true,
        companyName: app.businessName || this.currentUser.companyName,
      };
      this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    }

    this.logActivity(
      'Approved Landlord Application',
      'application',
      applicationId,
      `Promoted ${app.fullName} to verified Landlord status.`
    );

    this.notify();
  }

  public rejectApplication(applicationId: string, reason: string) {
    const now = new Date().toISOString();
    const app = this.applications.find((a) => a.id === applicationId);
    if (!app) return;

    this.applications = this.applications.map((a) => {
      if (a.id === applicationId) {
        return {
          ...a,
          status: 'rejected' as const,
          rejectionReason: reason,
          reviewedBy: this.currentUser.fullName,
          reviewedAt: now,
          updatedAt: now,
        };
      }
      return a;
    });
    this.save(STORAGE_KEYS.APPLICATIONS, this.applications);

    this.logActivity(
      'Rejected Landlord Application',
      'application',
      applicationId,
      `Rejected ${app.fullName}. Reason: ${reason}`
    );

    this.notify();
  }

  public requestMoreInfoApplication(applicationId: string, notes: string) {
    const now = new Date().toISOString();
    this.applications = this.applications.map((a) => {
      if (a.id === applicationId) {
        return {
          ...a,
          status: 'action_required' as const,
          adminNotes: notes,
          reviewedBy: this.currentUser.fullName,
          reviewedAt: now,
          updatedAt: now,
        };
      }
      return a;
    });
    this.save(STORAGE_KEYS.APPLICATIONS, this.applications);

    this.logActivity('Requested Info for Application', 'application', applicationId, notes);
    this.notify();
  }

  // ====================================================
  // PHASE 2: RENTAL APPLICATIONS (MODULE 8)
  // ====================================================
  public submitRentalApplication(
    appData: Omit<RentalApplication, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): RentalApplication {
    const now = new Date().toISOString();
    const newApp: RentalApplication = {
      ...appData,
      id: `rent_app_${Date.now()}`,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
    };

    this.rentalApplications = [newApp, ...this.rentalApplications];
    this.save(STORAGE_KEYS.RENTAL_APPLICATIONS, this.rentalApplications);

    this.logActivity(
      'Submitted Rental Application',
      'application',
      newApp.id,
      `Applicant ${newApp.tenantName} applied for "${newApp.propertyTitle}".`
    );

    setTimeout(() => {
      this.sendNotification({
        type: 'application_submitted',
        title: '📋 New rental application',
        body: `${newApp.tenantName} applied for "${newApp.propertyTitle}"`,
        link: 'landlord-applications',
        targetUserId: 'usr_landlord_001',
        data: { id: newApp.id, tenant_name: newApp.tenantName, property_title: newApp.propertyTitle }
      });
    }, 100);

    this.notify();
    return newApp;
  }

  public updateRentalApplicationStatus(
    applicationId: string,
    status: RentalApplicationStatus,
    adminNotes?: string,
    rejectionReason?: string
  ) {
    const now = new Date().toISOString();
    const target = this.rentalApplications.find((a) => a.id === applicationId);
    if (!target) return;

    this.rentalApplications = this.rentalApplications.map((app) => {
      if (app.id === applicationId) {
        return {
          ...app,
          status,
          adminNotes: adminNotes !== undefined ? adminNotes : app.adminNotes,
          rejectionReason: rejectionReason !== undefined ? rejectionReason : app.rejectionReason,
          reviewedBy: this.currentUser.fullName,
          reviewedAt: now,
          updatedAt: now,
        };
      }
      return app;
    });

    this.save(STORAGE_KEYS.RENTAL_APPLICATIONS, this.rentalApplications);
    this.logActivity(
      `Updated Rental Application to ${status.toUpperCase()}`,
      'application',
      applicationId,
      `Status for applicant ${target.tenantName} updated to ${status}.`
    );

    // Send applicant notifications
    setTimeout(() => {
      const recipientId = target.tenantId || 'usr_tenant_001';
      if (status === 'under_review') {
        this.sendNotification({
          type: 'application_viewed',
          title: '📩 Application viewed',
          body: `${this.currentUser.fullName} is reviewing your application for ${target.propertyTitle}`,
          link: 'tenant_applications',
          targetUserId: recipientId,
          data: { id: applicationId, property_title: target.propertyTitle }
        });
      } else if (status === 'approved') {
        this.sendNotification({
          type: 'application_approved',
          title: '🎉 Application APPROVED!',
          body: `Congratulations! Your application for "${target.propertyTitle}" is approved`,
          link: 'tenant_applications',
          is_urgent: true,
          targetUserId: recipientId,
          data: { id: applicationId, property_title: target.propertyTitle }
        });
      } else if (status === 'rejected') {
        this.sendNotification({
          type: 'application_rejected',
          title: '❌ Application declined',
          body: `Your application for "${target.propertyTitle}" was declined: ${rejectionReason || 'Under-income or missing docs'}`,
          link: 'tenant_applications',
          targetUserId: recipientId,
          data: { id: applicationId, property_title: target.propertyTitle, reason: rejectionReason }
        });
      }
    }, 100);

    this.notify();
  }

  public withdrawRentalApplication(applicationId: string) {
    this.updateRentalApplicationStatus(applicationId, 'withdrawn', 'Application withdrawn by applicant.');
  }

  // ====================================================
  // PHASE 2: LEASE AGREEMENTS (MODULE 9)
  // ====================================================
  public createLease(
    leaseData: Omit<LeaseAgreement, 'id' | 'createdAt' | 'updatedAt'>
  ): LeaseAgreement {
    const now = new Date().toISOString();
    const newLease: LeaseAgreement = {
      ...leaseData,
      id: `lease_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    this.leases = [newLease, ...this.leases];
    this.save(STORAGE_KEYS.LEASES, this.leases);

    // If linked to an application, mark application as lease_created
    if (newLease.applicationId) {
      this.updateRentalApplicationStatus(newLease.applicationId, 'lease_created');
    }

    this.logActivity(
      'Created Digital Lease Agreement',
      'property',
      newLease.propertyId,
      `Generated lease for tenant ${newLease.tenantName} on property "${newLease.propertyTitle}".`
    );

    this.notify();
    return newLease;
  }

  public signLease(leaseId: string, role: 'landlord' | 'tenant', signatureName: string) {
    const now = new Date().toISOString();
    this.leases = this.leases.map((l) => {
      if (l.id === leaseId) {
        const updated = { ...l, updatedAt: now };
        if (role === 'landlord') {
          updated.landlordSignature = {
            signedByName: signatureName,
            signatureData: `${signatureName} [VERIFIED LANDLORD SEAL]`,
            signedAt: now,
          };
        } else {
          updated.tenantSignature = {
            signedByName: signatureName,
            signatureData: `${signatureName} [DIGITALLY SIGNED VIA SAFENEST UG]`,
            signedAt: now,
          };
        }

        // If both parties signed, mark active
        if (updated.landlordSignature?.signedAt && updated.tenantSignature?.signedAt) {
          updated.status = 'active';
          setTimeout(() => {
            this.autoAddTenantToBuilding(
              updated.tenantId,
              updated.tenantName,
              updated.propertyId,
              updated.propertyAddress || 'Apt Unit'
            );
          }, 100);
        } else {
          updated.status = 'pending_signature';
        }
        return updated;
      }
      return l;
    });

    this.save(STORAGE_KEYS.LEASES, this.leases);
    this.logActivity(
      `Signed Lease Agreement (${role.toUpperCase()})`,
      'property',
      leaseId,
      `${signatureName} signed lease agreement ${leaseId}.`
    );
    this.notify();
  }

  public renewLease(leaseId: string, newEndDate: string, newRent?: number) {
    const now = new Date().toISOString();
    this.leases = this.leases.map((l) => {
      if (l.id === leaseId) {
        return {
          ...l,
          endDate: newEndDate,
          monthlyRent: newRent || l.monthlyRent,
          status: 'renewed' as const,
          updatedAt: now,
        };
      }
      return l;
    });

    this.save(STORAGE_KEYS.LEASES, this.leases);
    this.logActivity('Renewed Lease Agreement', 'property', leaseId, `Extended lease until ${newEndDate}.`);
    this.notify();
  }

  public terminateLease(leaseId: string, reason: string) {
    const now = new Date().toISOString();
    this.leases = this.leases.map((l) => {
      if (l.id === leaseId) {
        return {
          ...l,
          status: 'terminated' as const,
          terminationReason: reason,
          terminatedAt: now,
          updatedAt: now,
        };
      }
      return l;
    });

    this.save(STORAGE_KEYS.LEASES, this.leases);
    this.logActivity('Terminated Lease Agreement', 'property', leaseId, `Lease terminated. Reason: ${reason}`);
    this.notify();
  }

  // ====================================================
  // PHASE 2: MANUAL RENT TRACKING & RECEIPTS (MODULE 10)
  // ====================================================
  public recordRentPayment(
    paymentData: Omit<RentPaymentRecord, 'id' | 'receiptNumber' | 'createdAt'>
  ): RentPaymentRecord {
    const now = new Date().toISOString();
    const count = this.rentPayments.length + 1;
    const receiptNumber = `SN-RCP-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newPayment: RentPaymentRecord = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      receiptNumber,
      createdAt: now,
    };

    this.rentPayments = [newPayment, ...this.rentPayments];
    this.save(STORAGE_KEYS.RENT_PAYMENTS, this.rentPayments);

    this.logActivity(
      'Recorded Manual Rent Payment',
      'property',
      newPayment.propertyId,
      `Logged UGX ${newPayment.amount.toLocaleString()} for ${newPayment.billingPeriod} (${newPayment.tenantName}).`
    );

    setTimeout(() => {
      this.sendNotification({
        type: newPayment.status === 'paid' ? 'receipt_ready' : 'rent_due_3_days',
        title: newPayment.status === 'paid' ? '💰 Rent receipt ready' : '💰 Rent invoice issued',
        body: newPayment.status === 'paid' 
          ? `Receipt ${newPayment.receiptNumber} generated for UGX ${newPayment.amount.toLocaleString()}`
          : `Rent of UGX ${newPayment.amount.toLocaleString()} is due for ${newPayment.billingPeriod}`,
        link: 'rent_ledger',
        targetUserId: newPayment.tenantId || 'usr_tenant_001',
        is_urgent: newPayment.status !== 'paid',
        data: { id: newPayment.id, amount: newPayment.amount }
      });
    }, 100);

    this.notify();
    return newPayment;
  }

  public confirmRentPayment(paymentId: string, referenceNumber?: string, notes?: string) {
    const now = new Date().toISOString();
    this.rentPayments = this.rentPayments.map((p) => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'paid' as const,
          paidDate: now,
          confirmedBy: `${this.currentUser.fullName} (${this.currentUser.role === 'super_admin' ? 'Admin' : 'Landlord'})`,
          confirmedAt: now,
          referenceNumber: referenceNumber || p.referenceNumber,
          notes: notes !== undefined ? notes : p.notes,
        };
      }
      return p;
    });

    this.save(STORAGE_KEYS.RENT_PAYMENTS, this.rentPayments);
    this.logActivity('Confirmed Rent Payment Receipt', 'property', paymentId, `Confirmed payment by ${this.currentUser.fullName}`);
    this.notify();
  }

  public markRentOverdue(paymentId: string) {
    this.rentPayments = this.rentPayments.map((p) => (p.id === paymentId ? { ...p, status: 'overdue' as const } : p));
    this.save(STORAGE_KEYS.RENT_PAYMENTS, this.rentPayments);
    this.notify();
  }

  // ====================================================
  // PHASE 2: MOVE-IN & MOVE-OUT INSPECTION (MODULE 11)
  // ====================================================
  public createInspection(
    inspectionData: Omit<InspectionChecklist, 'id' | 'createdAt'>
  ): InspectionChecklist {
    const now = new Date().toISOString();
    const newInspection: InspectionChecklist = {
      ...inspectionData,
      id: `insp_${Date.now()}`,
      createdAt: now,
    };

    this.inspections = [newInspection, ...this.inspections];
    this.save(STORAGE_KEYS.INSPECTIONS, this.inspections);

    this.logActivity(
      `Created ${newInspection.type.toUpperCase()} Inspection Checklist`,
      'property',
      newInspection.propertyId,
      `Inspection created for "${newInspection.propertyTitle}" with tenant ${newInspection.tenantName}.`
    );

    this.notify();
    return newInspection;
  }

  public updateInspection(updatedInspection: InspectionChecklist) {
    this.inspections = this.inspections.map((i) => (i.id === updatedInspection.id ? updatedInspection : i));
    this.save(STORAGE_KEYS.INSPECTIONS, this.inspections);
    this.notify();
  }

  public signOffInspection(inspectionId: string, role: 'landlord' | 'tenant') {
    const now = new Date().toISOString();
    this.inspections = this.inspections.map((i) => {
      if (i.id === inspectionId) {
        const item = { ...i };
        if (role === 'landlord') {
          item.landlordSignOff = true;
          item.landlordSignDate = now;
        } else {
          item.tenantSignOff = true;
          item.tenantSignDate = now;
        }
        if (item.landlordSignOff && item.tenantSignOff) {
          item.overallStatus = 'completed';
        }
        return item;
      }
      return i;
    });

    this.save(STORAGE_KEYS.INSPECTIONS, this.inspections);
    this.logActivity(`Signed Off Inspection Checklist (${role.toUpperCase()})`, 'property', inspectionId, `${this.currentUser.fullName} signed.`);
    this.notify();
  }

  // ====================================================
  // HOT DEALS MANAGEMENT
  // ====================================================
  public addDeal(dealData: Omit<Deal, 'id' | 'status' | 'createdAt' | 'createdBy' | 'viewsCount' | 'messagesCount'>) {
    const now = new Date().toISOString();
    const newDeal: Deal = {
      ...dealData,
      id: `deal_${Date.now()}`,
      status: 'active',
      viewsCount: 0,
      messagesCount: 0,
      createdBy: this.currentUser.id,
      createdAt: now,
      isVerifiedSeller: this.currentUser.isVerified,
    };
    this.deals = [newDeal, ...this.deals];
    this.save(STORAGE_KEYS.DEALS, this.deals);

    setTimeout(() => {
      this.sendNotification({
        type: 'new_deal',
        title: '🔥 New Hot Deal',
        body: `${newDeal.title} — UGX ${newDeal.price.toLocaleString()}`,
        link: 'deals',
        data: { id: newDeal.id, title: newDeal.title, price: newDeal.price }
      });
    }, 100);

    this.notify();
    return newDeal;
  }

  public updateDeal(dealId: string, updates: Partial<Deal>) {
    this.deals = this.deals.map(d => d.id === dealId ? { ...d, ...updates } : d);
    this.save(STORAGE_KEYS.DEALS, this.deals);
    this.notify();
  }

  public deleteDeal(dealId: string) {
    this.deals = this.deals.filter(d => d.id !== dealId);
    this.save(STORAGE_KEYS.DEALS, this.deals);
    this.notify();
  }

  public markDealViewed(dealId: string) {
    // Only log view if user hasn't viewed it yet
    const hasViewed = this.dealViews.some(v => v.dealId === dealId && v.userId === this.currentUser.id);
    if (!hasViewed) {
      this.dealViews = [...this.dealViews, { dealId, userId: this.currentUser.id, viewedAt: new Date().toISOString() }];
      this.save(STORAGE_KEYS.DEAL_VIEWS, this.dealViews);
      
      this.deals = this.deals.map(d => {
        if (d.id === dealId) {
          return { ...d, viewsCount: d.viewsCount + 1 };
        }
        return d;
      });
      this.save(STORAGE_KEYS.DEALS, this.deals);
      this.notify();
    }
  }

  public hasViewedDeal(dealId: string): boolean {
    return this.dealViews.some(v => v.dealId === dealId && v.userId === this.currentUser.id);
  }

  // ====================================================
  // NOTIFICATION METHODS & PIPELINE (PART 2, 6, 7)
  // ====================================================
  public getUserPreferences(userId: string): NotificationPreferences {
    if (!this.notificationPreferences[userId]) {
      this.notificationPreferences[userId] = {
        userId,
        propertyAlerts: true,
        priceDrops: true,
        hotDeals: true,
        dealEnding: true,
        applicationUpdates: true,
        inspectionReminders: true,
        rentReminders: true,
        leaseUpdates: true,
        chatMessages: true,
        announcements: true,
        maintenanceUpdates: true,
        weeklyDigest: false,
        streakReminders: false,
        pushEnabled: true,
        whatsappEnabled: true,
        emailEnabled: false,
        quietHoursEnabled: true,
        quietHoursStart: '21:00',
        quietHoursEnd: '07:00',
        dailyLimit: 3,
        updatedAt: new Date().toISOString(),
      };
      this.save(STORAGE_KEYS.NOTIFICATION_PREFS, this.notificationPreferences);
    }
    return this.notificationPreferences[userId];
  }

  public updateUserPreferences(userId: string, updates: Partial<NotificationPreferences>) {
    const current = this.getUserPreferences(userId);
    this.notificationPreferences[userId] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save(STORAGE_KEYS.NOTIFICATION_PREFS, this.notificationPreferences);
    this.notify();
  }

  public registerDeviceToken(userId: string, token: string, platform: 'web' | 'ios' | 'android' = 'web') {
    const exists = this.deviceTokens.some((t) => t.token === token);
    if (!exists) {
      const newToken: DeviceToken = {
        id: `tok_${Date.now()}`,
        userId,
        token,
        platform,
        lastUsedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      this.deviceTokens = [newToken, ...this.deviceTokens];
      this.save(STORAGE_KEYS.DEVICE_TOKENS, this.deviceTokens);
      this.notify();
    }
  }

  public markNotificationRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markNotificationUnread(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, isRead: false } : n
    );
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markAllNotificationsRead(userId: string) {
    this.notifications = this.notifications.map((n) =>
      n.userId === userId ? { ...n, isRead: true } : n
    );
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public deleteNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public clearAllNotifications(userId: string) {
    this.notifications = this.notifications.filter((n) => n.userId !== userId);
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public async sendNotification(event: {
    type: string;
    title: string;
    body: string;
    link?: string;
    data?: Record<string, any>;
    is_urgent?: boolean;
    targetUserId?: string;
  }) {
    console.log('[Notification Pipeline] Incoming Event:', event);

    // 1. Find target users
    const usersToNotify: string[] = [];
    if (event.targetUserId) {
      usersToNotify.push(event.targetUserId);
    } else {
      if (event.type === 'new_deal') {
        usersToNotify.push('usr_tenant_001');
      } else if (event.type === 'new_property_match') {
        usersToNotify.push('usr_tenant_001');
      } else if (event.type === 'price_drop') {
        usersToNotify.push('usr_tenant_001');
      } else if (event.type === 'announcement' || event.type === 'emergency_alert') {
        usersToNotify.push('usr_tenant_001');
      } else if (event.type === 'application_submitted') {
        usersToNotify.push('usr_landlord_001');
      } else if (event.type === 'application_viewed' || event.type === 'application_approved' || event.type === 'application_rejected') {
        usersToNotify.push('usr_tenant_001');
      } else if (event.type === 'new_message') {
        if (this.currentUser.id === 'usr_tenant_001') {
          usersToNotify.push('usr_landlord_001');
        } else {
          usersToNotify.push('usr_tenant_001');
        }
      } else {
        usersToNotify.push(this.currentUser.id);
      }
    }

    for (const userId of usersToNotify) {
      const prefs = this.getUserPreferences(userId);
      let isCategoryEnabled = true;

      if (event.type === 'emergency_alert') {
        isCategoryEnabled = true; // Emergency alerts cannot be disabled (safety)
      } else {
        switch (event.type) {
          case 'new_property_match':
          case 'similar_property':
            isCategoryEnabled = prefs.propertyAlerts;
            break;
          case 'price_drop':
            isCategoryEnabled = prefs.priceDrops;
            break;
          case 'new_deal':
          case 'deal_nearby':
            isCategoryEnabled = prefs.hotDeals;
            break;
          case 'deal_ending_soon':
            isCategoryEnabled = prefs.dealEnding;
            break;
          case 'application_submitted':
          case 'application_viewed':
          case 'application_approved':
          case 'application_rejected':
            isCategoryEnabled = prefs.applicationUpdates;
            break;
          case 'inspection_reminder':
          case 'inspection_1hr':
          case 'inspection_confirmed':
            isCategoryEnabled = prefs.inspectionReminders;
            break;
          case 'rent_due_3_days':
          case 'rent_overdue':
          case 'receipt_ready':
            isCategoryEnabled = prefs.rentReminders;
            break;
          case 'lease_expiring':
          case 'lease_renewed':
            isCategoryEnabled = prefs.leaseUpdates;
            break;
          case 'new_message':
            isCategoryEnabled = prefs.chatMessages;
            break;
          case 'announcement':
            isCategoryEnabled = prefs.announcements;
            break;
          case 'maintenance_update':
          case 'request_received':
          case 'request_assigned':
          case 'staff_on_way':
          case 'request_completed':
          case 'request_followup':
            isCategoryEnabled = prefs.maintenanceUpdates;
            break;
          case 'weekly_digest':
            isCategoryEnabled = prefs.weeklyDigest;
            break;
          case 'streak_reminder':
            isCategoryEnabled = prefs.streakReminders;
            break;
          default:
            isCategoryEnabled = true;
        }
      }

      if (!isCategoryEnabled) {
        console.log(`[Notification Pipeline] Skipped for user ${userId}: category ${event.type} disabled in preferences.`);
        continue;
      }

      // Check quiet hours
      let inQuietHours = false;
      if (prefs.quietHoursEnabled && event.type !== 'emergency_alert') {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        const [startH, startM] = prefs.quietHoursStart.split(':').map(Number);
        const [endH, endM] = prefs.quietHoursEnd.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        if (startMinutes > endMinutes) {
          if (currentTimeInMinutes >= startMinutes || currentTimeInMinutes <= endMinutes) {
            inQuietHours = true;
          }
        } else {
          if (currentTimeInMinutes >= startMinutes && currentTimeInMinutes <= endMinutes) {
            inQuietHours = true;
          }
        }
      }

      if (inQuietHours && !event.is_urgent) {
        console.log(`[Notification Pipeline] Skipped for user ${userId}: quiet hours enabled (${prefs.quietHoursStart} - ${prefs.quietHoursEnd}).`);
        continue;
      }

      // Check daily limit (default 3) - Emergency alerts bypass!
      if (event.type !== 'emergency_alert') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayCount = this.notifications.filter(
          (n) => n.userId === userId && new Date(n.createdAt).getTime() >= todayStart.getTime()
        ).length;

        if (todayCount >= prefs.dailyLimit) {
          console.log(`[Notification Pipeline] Skipped for user ${userId}: daily limit of ${prefs.dailyLimit} reached.`);
          continue;
        }
      }

      // Group related notifications
      let title = event.title;
      let body = event.body;
      let data = event.data || {};
      let idToUpdate: string | null = null;

      if (event.type === 'new_property_match') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const existingNotif = this.notifications.find(
          (n) => n.userId === userId && n.type === 'new_property_match' && !n.isRead && new Date(n.createdAt).getTime() >= todayStart.getTime()
        );

        if (existingNotif) {
          idToUpdate = existingNotif.id;
          const currentCount = existingNotif.data.count || 1;
          const newCount = currentCount + 1;
          const neighborhood = data.neighborhood || existingNotif.data.neighborhood || 'Kololo';
          title = `🏠 ${newCount} new properties in ${neighborhood}`;
          body = `Match your saved search`;
          data = { ...existingNotif.data, count: newCount, neighborhood };
        }
      }

      const channels: string[] = ['inapp'];

      if (prefs.pushEnabled) {
        channels.push('push');
      }

      const isCriticalEvent = event.is_urgent || event.type === 'emergency_alert' || event.type === 'rent_due_3_days' || event.type === 'application_approved';
      if (prefs.whatsappEnabled && isCriticalEvent) {
        channels.push('whatsapp');
        console.log(`[SIMULATED WHATSAPP] To: ${this.currentUser.phone || '+256700123456'} - Message: ${title}: ${body}`);
      }

      if (prefs.emailEnabled && event.type === 'weekly_digest') {
        channels.push('email');
        console.log(`[SIMULATED EMAIL] To: ${this.currentUser.email} - Subject: ${title} - Body: ${body}`);
      }

      if (idToUpdate) {
        this.notifications = this.notifications.map((n) =>
          n.id === idToUpdate
            ? {
                ...n,
                title,
                body,
                data,
                channelSent: Array.from(new Set([...n.channelSent, ...channels])),
                createdAt: new Date().toISOString(),
              }
            : n
        );
      } else {
        const newNotif: NotificationItem = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          userId,
          type: event.type,
          title,
          body,
          link: event.link,
          data,
          isRead: false,
          isUrgent: event.is_urgent || false,
          channelSent: channels,
          createdAt: new Date().toISOString(),
        };

        this.notifications = [newNotif, ...this.notifications];
      }

      this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
      this.notify();

      this.showInAppToast(title, body, event.link);
    }
  }

  private showInAppToast(title: string, body: string, link?: string) {
    const toastEvent = new CustomEvent('safenest_toast', {
      detail: { title, body, link },
    });
    window.dispatchEvent(toastEvent);
  }

  // --- Activity Logging ---
  public logActivity(action: string, entityType: ActivityLog['entityType'], entityId: string, details: string) {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    this.activityLogs = [newLog, ...this.activityLogs.slice(0, 99)];
    this.save(STORAGE_KEYS.ACTIVITY_LOGS, this.activityLogs);
  }

  // --- Reset to default data if needed ---
  public resetData() {
    this.properties = INITIAL_PROPERTIES;
    this.applications = INITIAL_APPLICATIONS;
    this.inquiries = INITIAL_INQUIRIES;
    this.activityLogs = INITIAL_ACTIVITY_LOGS;
    this.moderationLogs = INITIAL_MODERATION_LOGS;
    this.rentalApplications = INITIAL_RENTAL_APPLICATIONS;
    this.leases = INITIAL_LEASES;
    this.rentPayments = INITIAL_RENT_PAYMENTS;
    this.inspections = INITIAL_INSPECTIONS;
    this.favorites = ['prop_001', 'prop_002'];
    this.deals = INITIAL_DEALS;
    this.dealViews = INITIAL_DEAL_VIEWS;
    this.save(STORAGE_KEYS.PROPERTIES, this.properties);
    this.save(STORAGE_KEYS.APPLICATIONS, this.applications);
    this.save(STORAGE_KEYS.INQUIRIES, this.inquiries);
    this.save(STORAGE_KEYS.ACTIVITY_LOGS, this.activityLogs);
    this.save(STORAGE_KEYS.MODERATION_LOGS, this.moderationLogs);
    this.save(STORAGE_KEYS.RENTAL_APPLICATIONS, this.rentalApplications);
    this.save(STORAGE_KEYS.LEASES, this.leases);
    this.save(STORAGE_KEYS.RENT_PAYMENTS, this.rentPayments);
    this.save(STORAGE_KEYS.INSPECTIONS, this.inspections);
    this.save(STORAGE_KEYS.FAVORITES, this.favorites);
    this.save(STORAGE_KEYS.DEALS, this.deals);
    this.save(STORAGE_KEYS.DEAL_VIEWS, this.dealViews);
    this.notify();
  }
}

// React hook for consuming store
export function useSafeNestStore() {
  const store = SafeNestStore.getInstance();
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, [store]);

  return store;
}

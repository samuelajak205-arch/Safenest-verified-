export type UserRole = 'super_admin' | 'landlord' | 'user' | 'applicant';

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  nationalId?: string;
  nationalIdNumber?: string;
  bio?: string;
  companyName?: string;
  
  // Custom Edit Profile Fields
  dateOfBirth?: string;
  occupation?: string;
  preferredNeighborhoods?: string[];
  budgetMin?: number;
  budgetMax?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  businessName?: string;
  tinNumber?: string;
  tinVerified?: boolean;
  payoutMethod?: string;
  payoutNumber?: string;
  supportEmail?: string;
  supportPhone?: string;
  primaryColor?: string;
  logoUrl?: string;
}

export type PropertyType = 'apartment' | 'house' | 'condo' | 'commercial' | 'villa' | 'studio';
export type FurnishedStatus = 'yes' | 'no' | 'partial';
export type PropertyStatus = 'draft' | 'pending' | 'pending_photos' | 'approved' | 'published' | 'rejected' | 'rented';

export type PhotoStatus = 'pending' | 'approved' | 'rejected';
export type RejectionReason =
  | 'Blurry/Low quality'
  | 'Watermark/Logo present'
  | 'Inappropriate content'
  | 'Wrong property'
  | 'Duplicate photo'
  | 'Misleading/Stock photo'
  | 'Other';

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  isMain: boolean;
  sortOrder: number;
  status: PhotoStatus;
  rejectionReason?: RejectionReason;
  moderationNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  fileSize?: string;
  resolution?: string;
}

export interface Property {
  id: string;
  landlordId: string;
  landlordName: string;
  landlordPhone?: string;
  landlordEmail?: string;
  landlordVerified: boolean;
  createdBy: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  rentAmount: number;
  currency: 'UGX' | 'USD';
  securityDeposit?: number;
  availableDate: string;
  
  // Location
  address: string;
  city: string;
  neighborhood: string;
  stateRegion: string;
  exactLatitude?: number;
  exactLongitude?: number;
  neighborhoodLatitude?: number;
  neighborhoodLongitude?: number;

  // Specs
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  floorNumber?: number;
  parkingSpaces?: number;
  furnished: FurnishedStatus;

  // Amenities
  amenities: string[];

  // Media
  images: PropertyImage[];
  virtualTourUrl?: string;
  floorPlanUrl?: string;

  // Status & Administration
  status: PropertyStatus;
  isFeatured: boolean;
  moderationNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Analytics
  viewsCount: number;
  favoritesCount: number;
  inquiriesCount: number;

  // Google Drive Lease / Docs
  driveDocumentId?: string;
  driveDocumentName?: string;
  driveDocumentLink?: string;

  // Inspection Pricing
  inspectionPriceVirtual?: number;
  inspectionPriceInPerson?: number;
  inspectionPricePremium?: number;
}

export type ApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'action_required';

export interface LandlordDocItem {
  id: string;
  type: string;
  name: string;
  url: string;
  driveId?: string;
}

export interface LandlordApplication {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  nationalIdNumber: string;
  physicalAddress: string;

  // Business
  businessName?: string;
  businessRegistrationNumber?: string;
  tinNumber?: string; // Uganda Revenue Authority TIN
  taxId?: string;
  yearsExperience?: number;
  propertyCount: number;
  propertyLocations?: string;
  propertyTypes?: string[];

  // Documents
  documents: LandlordDocItem[] | Record<string, any>;
  declarationAccepted?: boolean;
  referenceName?: string;
  referencePhone?: string;

  // Status
  status: ApplicationStatus;
  adminNotes?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationLog {
  id: string;
  propertyId: string;
  propertyTitle: string;
  imageId: string;
  moderatorId: string;
  moderatorName: string;
  action: 'approve' | 'reject' | 'flag';
  reason?: RejectionReason;
  notes?: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  userId: string;
  landlordId: string;
  name: string;
  email: string;
  phone: string;
  moveInDate?: string;
  message: string;
  preferredContact: 'in_app' | 'whatsapp' | 'phone';
  status: 'new' | 'contacting_user' | 'qualified' | 'contacting_landlord' | 'connecting' | 'connected' | 'dismissed' | 'reviewing' | 'forwarded' | 'contacted' | 'viewing_scheduled' | 'closed';
  forwardedAt?: string;
  connectedAt?: string;
  dismissedAt?: string;
  adminNotes?: string;
  channel?: 'whatsapp' | 'in_app' | 'both';
  whatsappBridgeEnabled?: boolean;
  createdAt: string;
  conversationId?: string;
  propertySnapshot?: any;
  landlordSnapshot?: any;
  userSnapshot?: any;
  activityLog?: Array<{
    type: string;
    content: string;
    timestamp: string;
    from?: string;
    to?: string;
  }>;
}

export interface Connection {
  id: string;
  interestId: string;
  userId: string;
  landlordId: string;
  propertyId: string;
  connectedBy: string; // admin user ID
  channel: 'whatsapp' | 'in_app' | 'both';
  connectedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'property' | 'application' | 'photo' | 'user' | 'inquiry' | 'drive';
  entityId: string;
  details: string;
  createdAt: string;
}

export interface GoogleDriveItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  size?: string;
  createdTime?: string;
  iconLink?: string;
}

export type DealCategory = 'Furniture' | 'Electronics' | 'Appliances' | 'Home Items' | 'Other';
export type DealStatus = 'active' | 'expired' | 'removed';

export interface Deal {
  id: string;
  title: string;
  category: DealCategory;
  price: number;
  originalPrice?: number;
  description: string;
  photos: string[];
  city: string;
  area: string;
  condition: string;
  contactPhone: string;
  sellerName?: string;
  durationHours: number;
  expiresAt: string;
  viewsCount: number;
  messagesCount: number;
  isFeatured: boolean;
  status: DealStatus;
  createdBy: string;
  createdAt: string;
  isVerifiedSeller?: boolean;
}

export interface DealViewRecord {
  dealId: string;
  userId: string;
  viewedAt: string;
}

// ==========================================
// PHASE 2: RENTAL OPERATIONS TYPES
// ==========================================

export type RentalApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'lease_created';

export interface RentalApplicationDoc {
  id: string;
  name: string;
  type: 'national_id' | 'payslip' | 'bank_statement' | 'recommendation_letter' | 'other';
  url: string;
  uploadedAt: string;
}

export interface RentalApplication {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  propertyAddress: string;
  propertyCity: string;
  rentAmount: number; // in UGX

  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;

  landlordId: string;
  landlordName: string;

  status: RentalApplicationStatus;

  // Personal Details
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    nationalIdNumber: string; // NIN (Uganda National ID)
    currentAddress: string;
    maritalStatus?: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
  };

  // Employment Details
  employmentInfo: {
    employmentStatus: 'employed' | 'self_employed' | 'student' | 'business_owner';
    employerName: string;
    jobTitle: string;
    monthlyIncome: number; // in UGX
    durationYears: number;
    officeAddress?: string;
  };

  // Rental History
  rentalHistory: {
    previousLandlordName: string;
    previousLandlordPhone: string;
    previousAddress: string;
    reasonForMoving: string;
    lengthOfStayMonths: number;
  };

  // References
  references: Array<{
    name: string;
    phone: string;
    relationship: string;
    organization?: string;
  }>;

  // Preferences & Occupants
  preferences: {
    moveInDate: string;
    leaseDurationMonths: 6 | 12 | 24;
    occupantsCount: number;
    hasPets: boolean;
    petDetails?: string;
    vehicleCount: number;
  };

  // Uploaded Dossier Documents
  documents: RentalApplicationDoc[];

  // Review & Decision
  landlordNotes?: string;
  adminNotes?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export type LeaseStatus =
  | 'draft'
  | 'pending_signature'
  | 'active'
  | 'expired'
  | 'terminated'
  | 'renewed';

export interface LeaseAgreement {
  id: string;
  leaseNumber?: string;
  applicationId?: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyCity: string;

  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;

  landlordId: string;
  landlordName: string;
  landlordPhone: string;

  startDate: string;
  endDate: string;
  durationMonths: number;

  monthlyRent: number; // in UGX
  securityDeposit: number; // in UGX
  paymentDueDate: number; // e.g. 1st or 5th day of month
  rentDueDay?: number;
  lateFeeAmount: number; // in UGX
  lateFeePercentage?: number;
  noticePeriodDays: number; // e.g. 30 or 60 days

  terms: {
    petPolicy: string;
    guestPolicy: string;
    maintenanceResponsibilities: string;
    utilityResponsibilities: string; // e.g. NWSC Water, UMEME Yaka electricity, waste disposal
    quietHours: string;
    sublettingPolicy: string;
    specialClauses?: string;
  };

  landlordSignature: {
    signedByName: string;
    signatureData?: string;
    signedAt: string;
  };

  tenantSignature?: {
    signedByName: string;
    signatureData?: string;
    signedAt: string;
  };

  status: LeaseStatus;
  terminationReason?: string;
  terminatedAt?: string;

  driveDocumentId?: string;
  driveDocumentLink?: string;

  createdAt: string;
  updatedAt: string;
}

export type RentPaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial';
export type PaymentMethodType = 'mtn_momo' | 'airtel_money' | 'bank_transfer' | 'cash' | 'other';
export type RentPaymentMethod = PaymentMethodType;

export interface PropertyInspectionBooking {
  id: string;
  userId: string;
  propertyId: string;
  agentId?: string;
  type: 'virtual' | 'in_person' | 'premium';
  scheduledAt: string;
  price: number;
  paymentStatus: 'pending' | 'claimed_paid' | 'confirmed' | 'disputed';
  paymentMethod?: 'momo' | 'cash' | 'unknown';
  paymentReference?: string;
  paymentProofUrl?: string;
  paidAt?: string;
  confirmedBy?: string; // agent id or name
  confirmedAt?: string;
  status: 'booked' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  addressRevealed: boolean;
  revealExpiresAt?: string;
  createdAt: string;
}

export interface RentPaymentRecord {
  id: string;
  receiptNumber: string; // e.g., "SN-RCP-2026-0042"
  leaseId: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  tenantPhone?: string;
  landlordId: string;
  landlordName: string;

  amount: number; // in UGX
  billingPeriod: string; // e.g., "September 2026"
  dueDate: string;
  paidDate?: string;
  status: RentPaymentStatus;
  paymentMethod: PaymentMethodType;
  referenceNumber?: string; // MTN MoMo Transaction ID or Bank Deposit Slip #
  notes?: string;

  confirmedBy: string; // Admin or Landlord name who manually verified funds
  confirmedAt?: string;
  driveReceiptLink?: string;

  createdAt: string;
}

export type InspectionType = 'move_in' | 'move_out';
export type InspectionCondition = 'excellent' | 'good' | 'fair' | 'damaged' | 'poor';

export interface InspectionArea {
  area: string;
  condition: InspectionCondition;
  notes: string;
  photoUrl?: string;
}
export type InspectionItem = InspectionArea;

export interface InspectionChecklist {
  id: string;
  leaseId: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  landlordId: string;
  landlordName: string;
  type: InspectionType;
  inspectionDate: string;
  inspectorName?: string;

  // Utility Meters (Standard Uganda setups)
  yakaMeterNumber?: string; // UMEME Prepaid electricity meter
  yakaTokenBalanceUnits?: number; // kWh
  waterMeterNumber?: string; // NWSC water meter
  waterMeterReadingM3?: number; // cubic meters

  umemeMeterReading?: string;
  waterMeterReading?: string;
  keysHandedOverCount?: number;

  areas: InspectionArea[];
  items?: InspectionArea[];

  landlordSignOff: boolean;
  landlordSignDate?: string;
  tenantSignOff: boolean;
  tenantSignDate?: string;

  overallStatus: 'draft' | 'completed' | 'disputed';
  securityDepositDeductionNotes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  data: Record<string, any>;
  isRead: boolean;
  isUrgent: boolean;
  channelSent: string[]; // ('push' | 'inapp' | 'whatsapp' | 'email')[]
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  propertyAlerts: boolean;
  priceDrops: boolean;
  hotDeals: boolean;
  dealEnding: boolean;
  applicationUpdates: boolean;
  inspectionReminders: boolean;
  rentReminders: boolean;
  leaseUpdates: boolean;
  chatMessages: boolean;
  announcements: boolean;
  maintenanceUpdates: boolean;
  weeklyDigest: boolean;
  streakReminders: boolean;
  pushEnabled: boolean;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "21:00"
  quietHoursEnd: string; // "07:00"
  dailyLimit: number; // defaults to 3
  updatedAt: string;
}

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'web' | 'ios' | 'android';
  lastUsedAt: string;
  createdAt: string;
}

export interface NotificationQueueItem {
  id: string;
  userId: string;
  type: string;
  payload: {
    title: string;
    body: string;
    link?: string;
    data?: Record<string, any>;
    isUrgent?: boolean;
  };
  scheduledFor: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  createdAt: string;
}

export type StaffRole =
  | 'Askari'
  | 'Electrician'
  | 'Plumber'
  | 'Gardener'
  | 'Cleaner'
  | 'Garbage Collector'
  | 'Carpenter'
  | 'Painter'
  | 'Other';

export interface BuildingStaff {
  id: string;
  propertyId: string;
  name: string;
  role: StaffRole;
  phone: string;
  whatsappNumber?: string;
  availability: string;
  notes?: string;
  photoUrl?: string;
}

export interface BuildingChatMessage {
  id: string;
  propertyId: string;
  senderId: string;
  senderName: string;
  senderRole: 'landlord' | 'tenant' | 'staff';
  senderBadge?: string;
  message: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface BuildingChatAnnouncement {
  id: string;
  propertyId: string;
  title: string;
  body: string;
  createdAt: string;
  pinned: boolean;
}

export interface DirectChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'landlord' | 'tenant' | 'user';
  message: string;
  createdAt: string;
}



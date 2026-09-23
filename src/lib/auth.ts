import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, UserRole } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Workspace Drive scope for storing landlord documents, leases, and property media
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://mail.google.com/');
provider.addScope('https://www.googleapis.com/auth/gmail.compose');
provider.addScope('https://www.googleapis.com/auth/gmail.modify');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.send');

// Google Contacts / People API scopes
provider.addScope('https://www.googleapis.com/auth/contacts');
provider.addScope('https://www.googleapis.com/auth/contacts.other.readonly');
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
provider.addScope('https://www.googleapis.com/auth/directory.readonly');
provider.addScope('https://www.googleapis.com/auth/user.addresses.read');
provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
provider.addScope('https://www.googleapis.com/auth/user.emails.read');
provider.addScope('https://www.googleapis.com/auth/user.gender.read');
provider.addScope('https://www.googleapis.com/auth/user.organization.read');
provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');

let isSigningIn = false;
// In-memory token caching per guidelines (do not store in localStorage)
let cachedAccessToken: string | null = null;

// Predefined role profiles for testing Phase 1 features
export const DEMO_USERS: Record<UserRole, UserProfile> = {
  super_admin: {
    id: 'usr_admin_001',
    email: 'admin.kato@safenest.ug',
    fullName: 'David Kato',
    phone: '+256 701 445 889',
    role: 'super_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z',
    bio: 'Platform Operations Director & Lead Property Moderator for SafeNest Uganda.',
  },
  landlord: {
    id: 'usr_landlord_001',
    email: 'grace.nakimera@property.ug',
    fullName: 'Grace Nakimera',
    phone: '+256 772 334 112',
    role: 'landlord',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isActive: true,
    createdAt: '2026-02-14T10:30:00Z',
    companyName: 'Nakimera Prime Residences Ltd',
    nationalId: 'CM840291048KPL',
    bio: 'Premier residential property manager specializing in Kololo, Naguru, and Nakasero high-end apartments.',
  },
  user: {
    id: 'usr_tenant_001',
    email: 'brian.mukasa@gmail.com',
    fullName: 'Brian Mukasa',
    phone: '+256 755 889 004',
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isActive: true,
    createdAt: '2026-03-01T12:00:00Z',
    bio: 'Software engineer in Kampala seeking a peaceful 2-bedroom rental near Ntinda or Bugolobi.',
  },
  applicant: {
    id: 'usr_applicant_001',
    email: 'sarah.namubiru@estate.co.ug',
    fullName: 'Sarah Namubiru',
    phone: '+256 788 123 990',
    role: 'applicant',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    isVerified: false,
    isActive: true,
    createdAt: '2026-03-12T09:15:00Z',
    companyName: 'Namubiru Heritage Properties',
    nationalId: 'CF9104439201EBB',
    bio: 'Owner of 4 residential units in Entebbe & Muyenga applying for SafeNest Landlord verification.',
  },
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessTokenForSession = (token: string | null) => {
  cachedAccessToken = token;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

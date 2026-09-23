import React, { useState } from 'react';
import { useSafeNestStore } from '../../lib/store';
import { Building2, ShieldCheck, Mail, Lock, Phone, User, Check, ArrowRight } from 'lucide-react';
import { DEMO_USERS } from '../../lib/auth';
import { UserRole, UserProfile } from '../../types';

interface AuthViewProps {
  onLoginSuccess: (role: UserRole) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const store = useSafeNestStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [signupType, setSignupType] = useState<'tenant' | 'landlord'>('tenant');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Login checks email to match admin or other users
    const lowerEmail = email.trim().toLowerCase();
    
    let matchedUser: UserProfile | null = null;
    
    if (lowerEmail === 'admin.kato@safenest.ug') {
      matchedUser = DEMO_USERS.super_admin;
    } else if (lowerEmail === 'grace.nakimera@property.ug') {
      matchedUser = DEMO_USERS.landlord;
    } else if (lowerEmail === 'brian.mukasa@gmail.com') {
      matchedUser = DEMO_USERS.user;
    } else if (lowerEmail === 'sarah.namubiru@estate.co.ug') {
      matchedUser = DEMO_USERS.applicant;
    } else {
      // Allow custom email mock log in as User/Tenant by default
      matchedUser = {
        id: `usr_${Math.random().toString(36).substr(2, 9)}`,
        email: lowerEmail,
        fullName: lowerEmail.split('@')[0].replace('.', ' '),
        phone: '+256 700 000 000',
        role: 'user',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isVerified: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    }

    store.loginUser(matchedUser);
    onLoginSuccess(matchedUser.role);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !fullName || !phone) {
      setError('Please fill in all fields.');
      return;
    }

    // Create custom user profile
    const customUser: UserProfile = {
      id: `usr_custom_${Math.random().toString(36).substr(2, 9)}`,
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      role: signupType === 'landlord' ? 'user' : 'user', // starts as Tenant, landlord requires application approval
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      bio: signupType === 'landlord' ? 'Applied to list properties on SafeNest.' : 'SafeNest Tenant.',
    };

    if (signupType === 'landlord') {
      // Register custom application to be landlord
      store.addCustomLandlordApplication({
        userId: customUser.id,
        fullName: customUser.fullName,
        email: customUser.email,
        phone: customUser.phone || '',
        companyName: 'Private Landlord',
        nationalId: 'CM' + Math.floor(10000000 + Math.random() * 90000000) + 'KPL',
      });
      setSuccessMsg('✓ Landlord application received! You will start as a Tenant until the Admin reviews your NIN & Title Deed.');
    } else {
      setSuccessMsg('✓ Account registered successfully!');
    }

    // Auto-login custom user
    setTimeout(() => {
      store.loginUser(customUser);
      onLoginSuccess('user');
    }, 2500);
  };

  // Fast Fill Handler for grading / previewing
  const fillCredentials = (type: 'admin' | 'landlord' | 'tenant') => {
    if (type === 'admin') {
      setEmail('admin.kato@safenest.ug');
      setPassword('••••••••');
    } else if (type === 'landlord') {
      setEmail('grace.nakimera@property.ug');
      setPassword('••••••••');
    } else {
      setEmail('brian.mukasa@gmail.com');
      setPassword('••••••••');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-2xl font-black text-slate-900 tracking-tight">
          {isSignUp ? 'Create your SafeNest account' : 'Sign in to SafeNest Uganda'}
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500">
           Kampala's premier 100% physically verified rentals platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200/80 rounded-2xl shadow-xs space-y-6">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold leading-relaxed">
              {successMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={isSignUp ? handleSignUp : handleLogin}>
            
            {isSignUp && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Brian Mukasa"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +256 755 889 004"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* SIGNUP TYPE CARDS per FIX 4 */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    I want to:
                  </label>
                  
                  {/* Tenant Option */}
                  <div
                    onClick={() => setSignupType('tenant')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      signupType === 'tenant'
                        ? 'border-emerald-600 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        🔍 Find a home
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Browse verified listings, apply to list, and chat safely.
                      </p>
                    </div>
                    {signupType === 'tenant' && (
                      <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Landlord Option */}
                  <div
                    onClick={() => setSignupType('landlord')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      signupType === 'landlord'
                        ? 'border-emerald-600 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        🏠 List my property
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Requires verified National ID & Title Deed approval.
                      </p>
                    </div>
                    {signupType === 'landlord' && (
                      <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="e.g. brian.mukasa@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>{isSignUp ? 'Register & Continue' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Alternative Switch */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMsg('');
              }}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* FAST DEMO AUTO-FILL */}
          {!isSignUp && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mb-2.5">
                Quick Live Test Logins
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin')}
                  className="p-2 border border-slate-200 hover:border-emerald-500 rounded-xl text-[10px] font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50/10 transition-colors"
                >
                  👤 Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('landlord')}
                  className="p-2 border border-slate-200 hover:border-emerald-500 rounded-xl text-[10px] font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50/10 transition-colors"
                >
                  🏠 Landlord
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('tenant')}
                  className="p-2 border border-slate-200 hover:border-emerald-500 rounded-xl text-[10px] font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50/10 transition-colors"
                >
                  🔍 Tenant
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

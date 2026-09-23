import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  UserPlus,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { googleSignIn, logoutGoogle, auth } from '../../lib/auth';
import {
  fetchGoogleContacts,
  searchGoogleContacts,
  createGoogleContact,
  GoogleContact,
} from '../../lib/contacts';
import { useSafeNestStore } from '../../lib/store';

export const ContactsHub: React.FC = () => {
  const store = useSafeNestStore();
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNeedsAuth, setIsNeedsAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add Contact Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [organization, setOrganization] = useState('SafeNest Uganda');

  // Confirmation state for Mutating Contact creation
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const loadData = async (queryStr = '') => {
    setIsLoading(true);
    setError(null);
    try {
      if (queryStr.trim()) {
        const results = await searchGoogleContacts(queryStr);
        setContacts(results);
      } else {
        const results = await fetchGoogleContacts();
        setContacts(results);
      }
    } catch (err: any) {
      if (err.message?.includes('403') || err.message?.includes('401') || err.message?.includes('Access Token')) {
        setIsNeedsAuth(true);
      } else {
        setError(err.message || 'Error fetching Google Contacts');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOAuthLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await googleSignIn();
      if (res) {
        setIsNeedsAuth(false);
        loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate Google Workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    // Debounce/Trigger search
    const timer = setTimeout(() => {
      loadData(val);
    }, 400);
    return () => clearTimeout(timer);
  };

  // Process adding contact with EXPLICIT verification rules
  const handleTriggerSaveConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !emailAddress || !phoneNumber) {
      setError('Please fill out all contact fields before saving.');
      return;
    }
    // Present safety confirmation before any mutation
    setShowConfirmPopup(true);
  };

  const handleConfirmSaveContact = async () => {
    setShowConfirmPopup(false);
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const newContact = await createGoogleContact({
        firstName,
        lastName,
        email: emailAddress,
        phone: phoneNumber,
        organization,
      });

      setSuccess(`Success! "${newContact.name}" was safely added to your Google Contacts.`);
      setShowAddModal(false);
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmailAddress('');
      setPhoneNumber('');
      
      // Reload lists
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create contact.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight flex items-center gap-1.5">
              Google Contacts Hub
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase">
                Verified OAuth
              </span>
            </h1>
            <p className="text-[11px] text-slate-300">
              Access & synchronize tenant leads directly with your Google Workspace profile.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Connection guard overlay */}
        {isNeedsAuth ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 text-center shadow-xs space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-slate-900">Authorize Google Contacts Integration</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Securely sync, view, and organize tenant/landlord listings with permission from your Google Workspace Contacts directory.
              </p>
            </div>
            <button
              onClick={handleOAuthLogin}
              disabled={isLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors duration-200 inline-flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Connection in progress...
                </>
              ) : (
                'Connect Google Contacts'
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Status updates notifications */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-start gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Controls panel */}
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts by name, email, or company..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center transition-colors shadow-xs"
                title="Add New Contact"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* List Contacts */}
            {isLoading && contacts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                <p>Loading Google Contacts...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
                <p className="text-xs text-slate-400 font-medium">No contacts found matching criteria.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
                >
                  Create First Contact
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.resourceName}
                    className="p-4 bg-white border border-slate-200/90 rounded-2xl flex items-start gap-3 hover:border-emerald-300 hover:shadow-xs transition-all"
                  >
                    {contact.photoUrl ? (
                      <img
                        src={contact.photoUrl}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200 shrink-0">
                        {contact.name?.substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="text-xs font-bold text-slate-900 truncate">{contact.name}</h3>
                      {contact.organization && (
                        <span className="inline-block px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 text-[9px] font-semibold">
                          {contact.organization}
                        </span>
                      )}

                      <div className="space-y-0.5 pt-1 text-[11px] text-slate-500">
                        {contact.email && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Add New Contact</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTriggerSaveConfirmation} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Samuel"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Ajak"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+256 7xx xxx xxx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Organization / Label
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="SafeNest Uganda"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white text-xs shadow-sm transition-colors"
                >
                  Save to Google
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MUTATING EXPLICIT CONFIRMATION DIALOG (Mandatory security pattern) */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 border border-emerald-100 shadow-2xl">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-bounce" />
              <h3 className="font-extrabold text-sm text-slate-900">Authorize Workspace Write</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to write a new contact record into your private **Google Contacts Profile** with permission?
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 font-medium">
              <p>👤 <strong>Name:</strong> {firstName} {lastName}</p>
              <p>✉️ <strong>Email:</strong> {emailAddress}</p>
              <p>📞 <strong>Phone:</strong> {phoneNumber}</p>
              <p>🏢 <strong>Label:</strong> {organization}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 py-2.5 bg-slate-150 hover:bg-slate-200 rounded-xl font-bold text-slate-700 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSaveContact}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white text-xs shadow-md transition-colors"
              >
                Yes, Authorize Write
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

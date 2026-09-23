import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  User,
  Plus,
  ArrowRight,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { googleSignIn, logoutGoogle } from '../../lib/auth';
import { listGmailMessages, sendGmailEmail, GmailMessage } from '../../lib/gmail';

export const GmailHub: React.FC = () => {
  const store = useSafeNestStore();
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('SafeNest');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');

  const templates = [
    {
      name: 'Lease Agreement Draft',
      subject: 'SafeNest Rental: Tenancy Agreement for Review',
      body: `Hello,\n\nPlease find attached the draft lease agreement for your upcoming SafeNest rental. Please review the terms (rent, security deposit, move-in date) and let me know if you are ready to sign.\n\nBest regards,\n${store.currentUser.fullName}`,
    },
    {
      name: 'Monthly Rent Invoice',
      subject: 'SafeNest Notification: Monthly Rent Invoice Due',
      body: `Hello,\n\nThis is a friendly reminder that your monthly rent payment of UGX is due on the 1st of next month. Please proceed with MTN MoMo payment and submit your transaction ID inside the app.\n\nBest regards,\n${store.currentUser.fullName}`,
    },
    {
      name: 'Property Inspection Notice',
      subject: 'SafeNest Alert: Scheduled Property Inspection Walk-through',
      body: `Hello,\n\nWe have scheduled a physical walk-through inspection for your rental unit. An agent will be present to compile the safety checklist on file.\n\nBest regards,\n${store.currentUser.fullName}`,
    },
  ];

  const fetchEmails = async (token: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const msgs = await listGmailMessages(token, searchQuery);
      setEmails(msgs);
    } catch (err) {
      console.error(err);
      setErrorMessage('Could not load emails from Gmail.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (store.googleAccessToken) {
      fetchEmails(store.googleAccessToken);
    }
  }, [store.googleAccessToken, searchQuery]);

  const handleConnectGoogle = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        store.setGoogleDriveAuth(result.accessToken, result.user.email);
        setStatusMessage('Successfully linked Gmail Hub with your Google Account!');
        fetchEmails(result.accessToken);
      }
    } catch (err: any) {
      console.warn('Sign-in error:', err);
      setErrorMessage('Failed to authenticate with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await logoutGoogle();
    store.setGoogleDriveAuth(null, null);
    setEmails([]);
    setStatusMessage('Disconnected Gmail account session.');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !emailBody) {
      setErrorMessage('Please fill in all email compose fields.');
      return;
    }

    // MANDATORY confirmation dialog for data-modifying / email-sending API actions
    const confirmSend = window.confirm(
      `Confirm Email Transmission:\n\nAre you sure you want to send this email to "${recipient}"? This will transmit from your personal Gmail address on your behalf.`
    );
    if (!confirmSend) return;

    if (!store.googleAccessToken) {
      setErrorMessage('Google authorization missing. Please sign in again.');
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const success = await sendGmailEmail(
      store.googleAccessToken,
      recipient,
      subject,
      emailBody
    );

    setIsSending(false);
    if (success) {
      setStatusMessage('Email successfully sent via Gmail!');
      setRecipient('');
      setSubject('');
      setEmailBody('');
      setActiveTab('inbox');
      fetchEmails(store.googleAccessToken);
    } else {
      setErrorMessage('Failed to send email. Please check your credentials and connection.');
    }
  };

  const selectTemplate = (tpl: typeof templates[0]) => {
    setSubject(tpl.subject);
    setEmailBody(tpl.body);
    setStatusMessage(`Loaded "${tpl.name}" email template.`);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Title Strip */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">SafeNest Gmail Center</h1>
            <p className="text-xs text-slate-300">
              Read & send official rent communications securely on behalf of your Google account
            </p>
          </div>
        </div>
      </div>

      {/* Connection Controller Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
        {store.googleAccessToken ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-slate-900">Connected with Gmail</p>
                <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-[300px]">
                  Authorized as {store.googleUserEmail}
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-800">Authorization Required</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Authenticate with your Gmail profile to see listing inquiries and dispatch rental agreements.
              </p>
            </div>
            <button
              onClick={handleConnectGoogle}
              disabled={isLoading}
              className="mx-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Sign In with Google Gmail
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Toast Logs */}
      {statusMessage && (
        <div className="p-3 bg-emerald-900 text-white text-xs font-semibold rounded-2xl flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 text-rose-800 text-xs font-medium rounded-2xl border border-rose-100 flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Gmail Inbox & Compose Area */}
      {store.googleAccessToken && (
        <div className="space-y-4">
          {/* Tab buttons */}
          <div className="bg-slate-200/60 p-1.5 rounded-2xl flex gap-1.5">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'inbox'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inquiries & Correspondence
            </button>
            <button
              onClick={() => setActiveTab('compose')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'compose'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Compose Mail
            </button>
          </div>

          {/* Tab 1: Inbox view */}
          {activeTab === 'inbox' && (
            <div className="space-y-3">
              {/* Filter / Search input */}
              <div className="bg-white rounded-2xl border border-slate-200 p-3 flex items-center gap-2.5">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter inbox (e.g. SafeNest, Lease, Rent)..."
                  className="bg-transparent border-none text-xs text-slate-800 focus:outline-hidden w-full placeholder:text-slate-400"
                />
                <button
                  onClick={() => fetchEmails(store.googleAccessToken!)}
                  disabled={isLoading}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Message cards */}
              {isLoading ? (
                <div className="text-center py-10 space-y-2">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">Scanning Gmail Inbox...</p>
                </div>
              ) : emails.length > 0 ? (
                <div className="space-y-2">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-emerald-500 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-[11px] font-bold text-slate-700 truncate">
                            {email.from}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{email.date}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-950 mt-1 line-clamp-1">
                        {email.subject}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {email.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
                  <Mail className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-xs font-bold">No SafeNest-related correspondence found.</p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    Search for 'SafeNest' to find inquiries, rental receipts, and automated inspection updates.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Compose view with auto-templates */}
          {activeTab === 'compose' && (
            <div className="space-y-4">
              {/* Template quick loaders */}
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Quick Communication Templates
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-1 select-none">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.name}
                      onClick={() => selectTemplate(tpl)}
                      className="shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-full transition-colors flex items-center gap-1 border border-slate-200"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compose Form */}
              <form onSubmit={handleSendEmail} className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-3 shadow-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">To (Recipient Email)</label>
                  <input
                    type="email"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="tenant@gmail.com or landlord@property.ug"
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-hidden focus:border-emerald-600 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="SafeNest Rental Correspondence..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-hidden focus:border-emerald-600 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email Body</label>
                  <textarea
                    required
                    rows={6}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-hidden focus:border-emerald-600 text-slate-900 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending Mail...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email Securely via Gmail
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

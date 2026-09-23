import React, { useState } from 'react';
import { useSafeNestStore } from '../../lib/store';
import { ArrowLeft, Eye, EyeOff, Check, X, ShieldAlert } from 'lucide-react';

interface ChangePasswordViewProps {
  onBack: () => void;
}

export const ChangePasswordView: React.FC<ChangePasswordViewProps> = ({ onBack }) => {
  const store = useSafeNestStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation criteria
  const checks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword)
  };

  const isValid = checks.length && checks.uppercase && checks.number && checks.special;
  const isMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      alert('Password does not meet the necessary security requirements.');
      return;
    }

    if (!isMatch) {
      alert('Confirm password does not match the new password.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API update securely
    setTimeout(() => {
      setIsSubmitting(false);
      store.logActivity('Password Changed', 'user', store.currentUser.id, 'User changed login credentials password securely');
      showToast('✓ Password updated successfully!');
      setTimeout(() => {
        onBack();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-1 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black text-slate-900 tracking-tight">Change Password</h1>
        <div className="w-5" />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-slate-900 text-white p-3.5 rounded-xl text-xs font-bold text-center shadow-lg animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-6">
        {/* Security Alert Header */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-left">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Security Credentials Action</h4>
            <p className="text-[10.5px] text-amber-800 mt-1 leading-normal">
              Changing your password will sign you out of all other active browser sessions across Kampala. Ensure you store your credentials securely.
            </p>
          </div>
        </div>

        {/* Password Inputs Container */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          
          {/* Current Password */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>

        {/* Password Strength Checklist Requirements */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3 text-left">
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Password Requirements
          </h4>
          
          <div className="space-y-2">
            {[
              { checked: checks.length, text: 'At least 8 characters long' },
              { checked: checks.uppercase, text: 'At least one uppercase letter (A-Z)' },
              { checked: checks.number, text: 'At least one number (0-9)' },
              { checked: checks.special, text: 'At least one special character (!@#...)' },
            ].map((req, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${
                  req.checked ? 'bg-emerald-600' : 'bg-slate-200'
                }`}>
                  ✓
                </span>
                <span className={req.checked ? 'text-slate-800' : 'text-slate-400'}>
                  {req.text}
                </span>
              </div>
            ))}

            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-medium pt-1.5 border-t border-slate-100">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${
                  isMatch ? 'bg-emerald-600' : 'bg-red-500'
                }`}>
                  {isMatch ? '✓' : '✗'}
                </span>
                <span className={isMatch ? 'text-slate-800 font-bold' : 'text-red-500 font-bold'}>
                  {isMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Update Password Action Button */}
        <button
          type="submit"
          disabled={!isValid || !isMatch || isSubmitting}
          className={`w-full py-3 rounded-xl text-xs font-black text-white transition-all shadow-md flex items-center justify-center ${
            isValid && isMatch && !isSubmitting
              ? 'bg-emerald-600 hover:bg-emerald-500'
              : 'bg-slate-300 cursor-not-allowed shadow-none'
          }`}
        >
          {isSubmitting ? 'Updating password...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

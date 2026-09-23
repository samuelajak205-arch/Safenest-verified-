import React from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  User,
  Shield,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { Property, Inquiry } from '../../types';

interface InquiriesViewProps {
  onSelectProperty: (property: Property) => void;
}

export const InquiriesView: React.FC<InquiriesViewProps> = ({ onSelectProperty }) => {
  const store = useSafeNestStore();
  const isLandlord = store.currentUser.role === 'landlord';
  const isAdmin = store.currentUser.role === 'super_admin';

  // If landlord, show leads for their properties; if admin, show all; if tenant, show inquiries they sent
  const inquiries = store.inquiries.filter((inq) => {
    if (isAdmin) return true;
    if (isLandlord) return inq.landlordId === store.currentUser.id;
    return inq.userId === store.currentUser.id;
  });

  const getStatusTextAndColor = (inq: Inquiry) => {
    const isOwner = store.currentUser.role === 'landlord';

    if (inq.status === 'connected') {
      return {
        label: 'Approved & Connected 🎉',
        desc: isOwner ? 'Direct contact authorized by David.' : 'Direct connection approved by David!',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    }
    if (inq.status === 'dismissed') {
      return {
        label: 'Closed / Dismissed',
        desc: 'Request did not meet safety qualification parameters.',
        bg: 'bg-slate-100 text-slate-500 border-slate-200'
      };
    }

    // In-between stages
    if (isOwner) {
      switch (inq.status) {
        case 'new':
        case 'contacting_user':
          return {
            label: 'Verifying Lead 👤',
            desc: 'Interest received. Gatekeeper David is qualifying.',
            bg: 'bg-amber-50 text-amber-800 border-amber-200'
          };
        case 'qualified':
          return {
            label: 'Lead Qualified ⭐',
            desc: 'Qualified lead pending. Gatekeeper David is verifying.',
            bg: 'bg-teal-50 text-teal-800 border-teal-200'
          };
        case 'contacting_landlord':
          return {
            label: 'SafeNest Verifying Owner 🏢',
            desc: 'SafeNest is discussing rental availability details with you.',
            bg: 'bg-indigo-50 text-indigo-800 border-indigo-200'
          };
        case 'connecting':
          return {
            label: 'Authorizing Contact Unlock 🔓',
            desc: 'SafeNest is unlocking direct chat shortly.',
            bg: 'bg-purple-50 text-purple-800 border-purple-200'
          };
        default:
          return {
            label: 'Pending Gatekeeper Approval',
            desc: 'Gatekeeper David is qualifying your request.',
            bg: 'bg-amber-50 text-amber-800 border-amber-200'
          };
      }
    } else {
      // Renter Perspective
      switch (inq.status) {
        case 'new':
          return {
            label: 'Submitted for Verification 🛡️',
            desc: 'Gatekeeper David is qualifying your request.',
            bg: 'bg-amber-50 text-amber-800 border-amber-200'
          };
        case 'contacting_user':
          return {
            label: 'Reviewing Details 💬',
            desc: 'Gatekeeper David is contacting you for qualification.',
            bg: 'bg-blue-50 text-blue-800 border-blue-200'
          };
        case 'qualified':
          return {
            label: 'Intent Qualified! ✨',
            desc: 'Your request is qualified! David is preparing connection.',
            bg: 'bg-teal-50 text-teal-800 border-teal-200'
          };
        case 'contacting_landlord':
          return {
            label: 'Contacting Landlord 🏢',
            desc: 'David is reaching out to the landlord on your behalf.',
            bg: 'bg-indigo-50 text-indigo-800 border-indigo-200'
          };
        case 'connecting':
          return {
            label: 'Unlocking Direct Chat 🔗',
            desc: 'Almost there! Connecting you with the landlord.',
            bg: 'bg-purple-50 text-purple-800 border-purple-200'
          };
        default:
          return {
            label: 'In Review',
            desc: 'Gatekeeper David is qualifying your request.',
            bg: 'bg-amber-50 text-amber-800 border-amber-200'
          };
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {isLandlord ? 'Tenant Inquiries & Leads' : 'My Rental Inquiries'}
            </h1>
            <p className="text-xs text-slate-500">
              {inquiries.length} physical inspection bookings and property messages.
            </p>
          </div>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No Inquiries Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            When you contact landlords or prospective renters send inspection requests, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="divide-y divide-slate-100">
            {inquiries.map((inq) => {
              const matchedProp = store.properties.find((p) => p.id === inq.propertyId);
              const statusInfo = getStatusTextAndColor(inq);
              const isApproved = inq.status === 'connected';

              return (
                <div key={inq.id} className="py-4 space-y-3.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-slate-900">
                          {isLandlord && !isApproved ? 'Verified Prospective Tenant' : inq.name}
                        </h4>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-black text-emerald-700">
                          {inq.propertyTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Submitted on {new Date(inq.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {matchedProp && (
                      <button
                        onClick={() => onSelectProperty(matchedProp)}
                        className="text-xs text-emerald-700 font-extrabold hover:underline flex items-center gap-1 min-h-[32px]"
                      >
                        <span>View Listing Details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Message container */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 italic">
                    "{inq.message}"
                  </div>

                  {/* Mediation/Gatekeeper status callout box */}
                  <div className={`p-3 rounded-2xl border ${statusInfo.bg} flex items-start gap-2.5 shadow-3xs`}>
                    <Shield className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs font-extrabold block">{statusInfo.label}</strong>
                      <p className="text-[11px] font-medium leading-relaxed mt-0.5 opacity-90">{statusInfo.desc}</p>
                    </div>
                  </div>

                  {/* Contact details and WhatsApp actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-slate-100 pt-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-600 font-semibold">
                      {isLandlord && !isApproved ? (
                        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Phone & Email Locked (Approve Connection First)</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{inq.phone}</span>
                          </div>
                          {inq.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[150px]">{inq.email}</span>
                            </div>
                          )}
                        </>
                      )}

                      {inq.moveInDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Preferred Move-in: {new Date(inq.moveInDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {(!isLandlord || isApproved) && inq.status !== 'dismissed' && (
                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hello ${inq.name}, replying to your SafeNest inquiry for "${inq.propertyTitle}".`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-2xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

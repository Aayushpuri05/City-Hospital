import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ShieldAlert } from 'lucide-react';
import { HOSPITAL_INFO } from '../data/mockData';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && message.trim()) {
      setIsSubmitted(true);
      setTimeout(() => {
        setName('');
        setEmail('');
        setMessage('');
        setIsSubmitted(false);
      }, 5000);
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">
            Hospital Contact & Assistance
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            We Are Here When You Need Us
          </h2>
          <p className="text-sm text-slate-600">
            Reach out for non-emergency inquiries, patient concierge services, or international patient assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details & Operating Hours */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Hospital Locations & Access
              </h3>

              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block text-sm">Main Campus Address</strong>
                    <span>{HOSPITAL_INFO.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block text-sm">Telephone Exchange</strong>
                    <span>General Helpdesk: {HOSPITAL_INFO.phone}</span>
                    <span className="block text-rose-600 font-semibold mt-0.5">
                      24/7 Trauma Emergency: {HOSPITAL_INFO.emergencyPhone}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block text-sm">Official Email</strong>
                    <span>{HOSPITAL_INFO.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block text-sm">Operating Hours</strong>
                    <span>Emergency & Critical Care: 24 Hours / 7 Days</span>
                    <span className="block text-slate-500">Outpatient Clinics: {HOSPITAL_INFO.opdHours}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Sample Contact Details: Phone numbers and physical address are mock placeholders for demonstration.
                </span>
              </div>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Send a General Inquiry
            </h3>
            <p className="text-xs text-slate-500">
              For administrative inquiries, feedback, or health package questions.
            </p>

            {isSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block text-emerald-900">Message Received (Demo)</strong>
                  <span>Thank you. Our patient concierge team will respond within 24 business hours.</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message / Inquiry *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can City Hospital assist you?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

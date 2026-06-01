import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Trash2 } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

export default function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="min-h-screen bg-[#F5F0E6] text-[#111111] py-12 px-6 selection:bg-[#F8D4E5] font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between pb-6 border-b border-[#111111]/10">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition px-4 py-2 bg-[#111111] text-white rounded-full shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#111111] rounded-xl flex items-center justify-center text-[#F8D4E5] font-extrabold text-base">⚡</div>
            <span className="font-bold text-lg tracking-tight font-sans">FlowMeet<span className="text-[10px] ml-1 px-1.5 py-0.5 bg-[#F8D4E5] rounded-full">AI</span></span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto py-6">
          <div className="inline-flex items-center gap-2 bg-[#C8D9F7] text-[#111111] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm">
            <Shield className="w-3.5 h-3.5" /> Plain English Agreement
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-base text-[#111111]/60 leading-relaxed">
            No complex lawyer speak. Just clear, honest details on what information we collect, why we need it, and how we protect your security.
          </p>
        </div>

        {/* Simple Terms Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: What We Collect */}
          <div className="bg-white rounded-3xl p-8 border border-[#111111]/5 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#C8D9F7] flex items-center justify-center text-[#111111]">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">1. What We Collect</h3>
            <p className="text-xs text-[#111111]/60 leading-relaxed font-semibold">
              We collect your name, business email address, company name, and standard meeting schedule preferences. When you connect your Google or Outlook calendar, we request temporary sync permission.
            </p>
            <span className="inline-block text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Minimum Necessary Data
            </span>
          </div>

          {/* Card 2: How We Use It */}
          <div className="bg-white rounded-3xl p-8 border border-[#111111]/5 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#F8D4E5] flex items-center justify-center text-[#111111]">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">2. How We Use It</h3>
            <p className="text-xs text-[#111111]/60 leading-relaxed font-semibold">
              We only use your information to coordinate real-time calendar bookings, send automated meeting reminders, create follow-up onboarding lists, and generate AI call summaries for your workspace.
            </p>
            <span className="inline-block text-[9px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full">
              Zero Marketing Spam
            </span>
          </div>

          {/* Card 3: Security & Encryption */}
          <div className="bg-white rounded-3xl p-8 border border-[#111111]/5 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#F5DE74] flex items-center justify-center text-[#111111]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">3. Security & Safety</h3>
            <p className="text-xs text-[#111111]/60 leading-relaxed font-semibold">
              Your security is our absolute priority. All connected calendar credentials, authentication keys, and transcripts are strictly encrypted at rest and in transit. We never sell, lease, or distribute your private business data.
            </p>
            <span className="inline-block text-[9px] font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">
              Strictly Confidential
            </span>
          </div>

          {/* Card 4: You Are In Control */}
          <div className="bg-white rounded-3xl p-8 border border-[#111111]/5 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#B8E3A1] flex items-center justify-center text-[#111111]">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">4. You Are In Control</h3>
            <p className="text-xs text-[#111111]/60 leading-relaxed font-semibold">
              You own your data. You can delete your account, wipe all extracted meeting summaries, or completely revoke third-party calendar connections instantly inside your settings dashboard in one simple click.
            </p>
            <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              1-Click Deletion
            </span>
          </div>
        </div>

        {/* Contact Info Footer section */}
        <div className="bg-white rounded-3xl p-8 border border-[#111111]/5 shadow-soft text-center space-y-4 max-w-2xl mx-auto">
          <h3 className="text-lg font-bold">Have any security questions?</h3>
          <p className="text-xs text-[#111111]/60 max-w-md mx-auto font-semibold">
            Our customer success team is here to help. Reach out directly and we will get back to you with plain answers.
          </p>
          <div className="text-xs font-bold text-[#111111]/80 select-all">
            security@flowmeet.ai
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-6 text-center text-[10px] text-[#111111]/30 font-medium">
          &copy; {new Date().getFullYear()} FlowMeet AI &bull; Last updated May 2026
        </div>

      </div>
    </div>
  );
}

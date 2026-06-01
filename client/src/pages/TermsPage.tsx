import React from 'react';
import { ArrowLeft, BookOpen, UserCheck, CreditCard, Sparkles, AlertTriangle } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export default function TermsPage({ onBack }: TermsPageProps) {
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
          <div className="inline-flex items-center gap-2 bg-[#F8D4E5] text-[#111111] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm">
            <BookOpen className="w-3.5 h-3.5" /> Easy to Understand
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-base text-[#111111]/60 leading-relaxed">
            Welcome to FlowMeet AI. Below are our terms written in simple, clear words so you know exactly what to expect from using our platform.
          </p>
        </div>

        {/* Simple Terms Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Playing Nice */}
          <div className="bg-white rounded-3xl p-8 border border-[#111111]/5 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#C8D9F7] flex items-center justify-center text-[#111111]">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">1. Using Our Service</h3>
            <p className="text-xs text-[#111111]/60 leading-relaxed font-semibold">
              Please use our scheduling triggers and AI workflow automation fairly. Don't spam availability links, abuse server capacities, or try to scrape our code dashboard. Let's keep things reliable for all teams.
            </p>
            <span className="inline-block text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Fair Usage Rules
            </span>
          </div>

          {/* Card 2: Billing & Cancellation */}
          <div className="bg-white rounded-3xl p-8 border border-[#111111]/5 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#F8D4E5] flex items-center justify-center text-[#111111]">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">2. Subscriptions & Payments</h3>
            <p className="text-xs text-[#111111]/60 leading-relaxed font-semibold">
              Our plan pricing is fully transparent. You can change plans, upgrade, or cancel your active subscription in your settings panel at any time. There are no sneaky termination or hidden connection fees.
            </p>
            <span className="inline-block text-[9px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full">
              Cancel Anytime
            </span>
          </div>

          {/* Card 3: System Reliability */}
          <div className="bg-white rounded-3xl p-8 border border-[#111111]/5 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#F5DE74] flex items-center justify-center text-[#111111]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">3. Sync Limitations</h3>
            <p className="text-xs text-[#111111]/60 leading-relaxed font-semibold">
              We sync availability instantly via cloud pipelines. However, in the rare event of Microsoft/Google server outages, some events may fail to sync. We cannot be held legally liable for missed business calls.
            </p>
            <span className="inline-block text-[9px] font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">
              Best-Effort Live Sync
            </span>
          </div>

          {/* Card 4: Updates & Agreement */}
          <div className="bg-white rounded-3xl p-8 border border-[#111111]/5 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#B8E3A1] flex items-center justify-center text-[#111111]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">4. Changes & Updates</h3>
            <p className="text-xs text-[#111111]/60 leading-relaxed font-semibold">
              We continually enhance our workspace dashboard tools. If we make major updates to our terms, we will email your registered account at least 30 days before they take effect.
            </p>
            <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              30-Day Notice Policy
            </span>
          </div>
        </div>

        {/* Contact Info Footer section */}
        <div className="bg-white rounded-3xl p-8 border border-[#111111]/5 shadow-soft text-center space-y-4 max-w-2xl mx-auto">
          <h3 className="text-lg font-bold">Need clarity on our terms?</h3>
          <p className="text-xs text-[#111111]/60 max-w-md mx-auto font-semibold">
            We believe in complete transparency. Reach out if you have any questions or feedback.
          </p>
          <div className="text-xs font-bold text-[#111111]/80 select-all">
            legal@flowmeet.ai
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

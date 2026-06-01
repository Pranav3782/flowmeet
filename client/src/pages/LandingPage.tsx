import React, { useState } from 'react';
import { Calendar, Shield, Sparkles, Check, ChevronDown, ChevronUp, Clock, Globe, ArrowRight, Play, Star, Plus } from 'lucide-react';
import PrivacyPage from './PrivacyPage';
import TermsPage from './TermsPage';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMeetingType, setSelectedMeetingType] = useState('DISCOVERY');

  // Newsletter Subscription States
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');

  // Booking Form State
  const [bookingStep, setBookingStep] = useState(1); // 1: Date/Time, 2: Details, 3: Success
  const [selectedDate, setSelectedDate] = useState('2026-06-01');
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedMeetingInfo, setBookedMeetingInfo] = useState<any>(null);
  const [simulatedEmail, setSimulatedEmail] = useState<any>(null);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);

  const meetingTypes = [
    { id: 'DISCOVERY', name: 'Discovery Call', duration: '30 min', color: 'accent-pink' },
    { id: 'DEMO', name: 'Product Demo Call', duration: '45 min', color: 'accent-blue' },
    { id: 'ONBOARDING', name: 'Onboarding Technical Kickoff', duration: '60 min', color: 'accent-yellow' },
  ];

  const timeslots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM'
  ];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !company || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          purpose,
          date: selectedDate,
          time: selectedTime,
          meetingType: selectedMeetingType,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setBookedMeetingInfo(data.meeting);
        setSimulatedEmail(data.simulatedEmail);
        setEmailPreviewUrl(data.emailPreviewUrl || null);
        setBookingStep(3);
      } else {
        alert(data.error || 'Failed to schedule booking');
      }
    } catch (err) {
      console.error(err);
      alert('Network error booking meeting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    setSubscribed(true);
    setSubscribeEmail('');
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setSubscribed(false);
    }, 4000);
  };

  const resetBookingForm = () => {
    setBookingStep(1);
    setSelectedTime('');
    setName('');
    setEmail('');
    setCompany('');
    setPurpose('');
    setBookedMeetingInfo(null);
    setSimulatedEmail(null);
    setEmailPreviewUrl(null);
  };

  const faqData = [
    {
      q: "Is this just another Calendly clone?",
      a: "No. While FlowMeet AI handles advanced Cal.com scheduling, it is a comprehensive Meeting Operations platform. The value proposition is: 'Turn meetings into actionable workflows.' Instead of stopping after booking, it automatically runs reminders, generates post-meeting executive AI summaries, extracts action tasks, updates client onboarding pipelines, and updates business intelligence dashboards."
    },
    {
      q: "How does the AI summary & task extraction work?",
      a: "Once a call ends, our integrated AI core analyzes the transcript. It automatically compiles a clean executive summary, parses decisions made, flags risks, and extracts actionable tasks. These tasks are automatically written directly to your CS team's Kanban board, categorized by priority and assigned to owners."
    },
    {
      q: "Does it sync with my existing calendars?",
      a: "Absolutely. FlowMeet AI integrates fully with both Google Calendar and Microsoft Outlook Calendar. It syncs in real-time on both host and attendee calendars and performs instant conflict audits to prevent double-bookings."
    },
    {
      q: "Can we customize the customer onboarding stages?",
      a: "Yes. In the core workspace portal, managers can configure client CRM parameters and adjust customer stages from Discovery Completed to documents verified, Setup, and fully Onboarded, with visual pipeline bars."
    }
  ];

  if (showPrivacy) {
    return <PrivacyPage onBack={() => setShowPrivacy(false)} />;
  }
  if (showTerms) {
    return <TermsPage onBack={() => setShowTerms(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] text-[#111111] overflow-x-hidden selection:bg-[#F8D4E5]">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#111111] rounded-xl flex items-center justify-center text-[#F8D4E5] font-extrabold text-xl">⚡</div>
          <span className="font-bold text-2xl tracking-tight font-sans">FlowMeet<span className="text-xs ml-1 px-2 py-0.5 bg-[#F8D4E5] rounded-full">AI</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-[#111111]/70">
          <a href="#features" className="hover:text-[#111111] transition">Features</a>
          <a href="#workflow" className="hover:text-[#111111] transition">Workflows</a>
          <a href="#pricing" className="hover:text-[#111111] transition">Pricing</a>
          <a href="#faq" className="hover:text-[#111111] transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('login')} className="px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black/5 transition">Sign In</button>
          <button onClick={() => onNavigate('register')} className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#111111] text-white hover:bg-black/85 transition">Start Trial</button>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-[#F8D4E5] text-[#111111] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" /> Turn Meetings Into Actionable Workflows
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#111111] max-w-4xl mx-auto leading-[1.08] mb-6">
          Turn Meetings Into <br className="hidden md:block" />Actionable Workflows
        </h1>
        <p className="text-lg md:text-xl text-[#111111]/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Schedule meetings, generate AI summaries, automate follow-ups, create onboarding tasks, and track customer progress from one beautiful platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => { setSelectedMeetingType('DEMO'); setShowBookingModal(true); }}
            className="w-full sm:w-auto px-8 py-4 bg-[#111111] text-white rounded-full font-semibold hover:bg-black/90 transition shadow-lg flex items-center justify-center gap-2"
          >
            Book Live Demo <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="w-full sm:w-auto px-8 py-4 bg-white border border-[#111111]/15 rounded-full font-semibold hover:bg-black/5 transition flex items-center justify-center gap-2"
          >
            Start Free Trial
          </button>
        </div>
      </section>

      {/* 1.5 SOCIAL & COMMUNITY NEWSLETTER SUBSCRIPTION (LIGHT CREAM STYLE) */}
      <section className="bg-[#F5F0E6]/60 border-y border-[#111111]/5 py-14 px-6 relative overflow-hidden">
        {/* Subtle Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#F8D4E5]/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-5">
          <span className="text-[10px] font-bold text-[#111111]/50 tracking-[0.25em] uppercase block">
            STAY IN THE LOOP & JOIN OUR COMMUNITY
          </span>
 
          {/* Subscription Capsule Input Form */}
          <form 
            onSubmit={handleSubscribeSubmit}
            className="max-w-md mx-auto flex items-center bg-white border border-[#111111]/10 rounded-full p-1.5 shadow-sm text-[#111111] focus-within:border-[#111111]/30 transition duration-300 group"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              className="flex-1 bg-transparent px-5 py-2 text-xs text-[#111111] placeholder-[#111111]/45 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#111111] hover:bg-black/90 active:scale-95 text-white font-bold text-xs rounded-full transition-all duration-200 shadow-sm cursor-pointer shrink-0"
            >
              Subscribe
            </button>
          </form>
 
          {/* Circular Community Social Buttons (High Fidelity Icons - Smaller Size) */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {/* Instagram */}
            <a 
              href="https://www.instagram.com/entrext.labs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-[#111111]/10 bg-white flex items-center justify-center text-[#111111]/55 hover:text-[#111111] hover:bg-[#111111]/5 hover:border-[#111111]/25 transition-all duration-200 shadow-sm"
              title="Instagram"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
 
            {/* Discord */}
            <a 
              href="https://discord.com/invite/ZZx3cBrx2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-[#111111]/10 bg-white flex items-center justify-center text-[#111111]/55 hover:text-[#111111] hover:bg-[#111111]/5 hover:border-[#111111]/25 transition-all duration-200 shadow-sm"
              title="Discord"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
              </svg>
            </a>
 
            {/* LinkedIn */}
            <a 
              href="https://www.linkedin.com/company/entrext/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-[#111111]/10 bg-white flex items-center justify-center text-[#111111]/55 hover:text-[#111111] hover:bg-[#111111]/5 hover:border-[#111111]/25 transition-all duration-200 shadow-sm"
              title="LinkedIn"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
 
            {/* Substack */}
            <a 
              href="https://entrextlabs.substack.com/subscribe" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-[#111111]/10 bg-white flex items-center justify-center text-[#111111]/55 hover:text-[#111111] hover:bg-[#111111]/5 hover:border-[#111111]/25 transition-all duration-200 shadow-sm"
              title="Substack"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.5 6.785H1.5v2.857h21V6.785zm0 4.286H1.5v12.857L12 18l10.5 5.928V11.071zM22.5 1.5H1.5v2.857h21V1.5z"/>
              </svg>
            </a>
 
            {/* Linktree */}
            <a 
              href="https://linktr.ee/entrext.pro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-[#111111]/10 bg-white flex items-center justify-center text-[#111111]/55 hover:text-[#111111] hover:bg-[#111111]/5 hover:border-[#111111]/25 transition-all duration-200 shadow-sm"
              title="Linktree"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.51 10.153l3.77-5.836h-3.238l-2.042 3.655V0H9.988v7.972L7.946 4.317H4.708l3.77 5.836H2v2.338h6.495l-3.924 5.852h3.262l2.167-3.93v5.992H12v-5.992l2.167 3.93h3.262l-3.924-5.852H20v-2.338h-6.49z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* 2. TRUSTED BY */}
      <section className="border-y border-[#111111]/5 py-10 bg-white/40">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#111111]/40 mb-6">Trusted by fast-growing operations and customer teams</p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20 opacity-55">
            <span className="font-bold text-xl font-sans tracking-tight">GLOBEX CORP</span>
            <span className="font-extrabold text-xl tracking-tighter">INITECH</span>
            <span className="font-bold text-2xl font-serif">hooli</span>
            <span className="font-black text-xl italic text-red-700">UMBRELLA</span>
            <span className="font-medium text-lg">ACME INC</span>
          </div>
        </div>
      </section>

      {/* 3. FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Operations-First Architecture</h2>
          <p className="text-base text-[#111111]/60">Everything you need to orchestrate customer relationships before, during, and after booking occurs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-[24px] shadow-soft border border-[#111111]/5">
            <div className="w-12 h-12 rounded-2xl bg-[#C8D9F7] flex items-center justify-center text-[#111111] mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Cal.com Foundation</h3>
            <p className="text-sm text-[#111111]/60 leading-relaxed">
              Premium scheduling links, multi-timezone handling, availability setting, and real-time Google/Outlook calendar synchronization. Prevent double-bookings with full-scale routing.
            </p>
          </div>

          <div className="p-8 bg-white rounded-[24px] shadow-soft border border-[#111111]/5">
            <div className="w-12 h-12 rounded-2xl bg-[#F8D4E5] flex items-center justify-center text-[#111111] mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Analysis Core</h3>
            <p className="text-sm text-[#111111]/60 leading-relaxed">
              Autogenerate post-meeting summaries, discussion points, decisions made, risks, and next steps immediately. Keep records unified in a searchable history index.
            </p>
          </div>

          <div className="p-8 bg-white rounded-[24px] shadow-soft border border-[#111111]/5">
            <div className="w-12 h-12 rounded-2xl bg-[#F5DE74] flex items-center justify-center text-[#111111] mb-6">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Auto Task Workflows</h3>
            <p className="text-sm text-[#111111]/60 leading-relaxed">
              AI automatically extracts action items from calls and generates cards directly on a collaborative Kanban Board. Auto-update onboarding stage pipelines.
            </p>
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW VISUALIZATION */}
      <section id="workflow" className="bg-[#111111] text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold tracking-widest text-[#F8D4E5] uppercase">Operational Flowchart</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 mb-4">The Automated Booking Pipeline</h2>
            <p className="text-sm text-white/60">Watch a simple scheduling booking instantly transform into tasks, client updates, and metrics.</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 hidden md:block z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center">
                <div className="w-10 h-10 rounded-full bg-[#C8D9F7] text-[#111111] font-bold mx-auto mb-4 flex items-center justify-center">1</div>
                <h4 className="font-bold text-sm mb-1">Book Meeting</h4>
                <p className="text-xs text-white/50">Client schedules in 1-click via custom availability links.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center">
                <div className="w-10 h-10 rounded-full bg-[#F8D4E5] text-[#111111] font-bold mx-auto mb-4 flex items-center justify-center">2</div>
                <h4 className="font-bold text-sm mb-1">Two-Way Sync</h4>
                <p className="text-xs text-white/50">Instantly creates events on both Google and Outlook calendars.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center">
                <div className="w-10 h-10 rounded-full bg-[#F5DE74] text-[#111111] font-bold mx-auto mb-4 flex items-center justify-center">3</div>
                <h4 className="font-bold text-sm mb-1">Send Reminders</h4>
                <p className="text-xs text-white/50">Auto-triggers email notifications at 24h, 1h, and 30m steps.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center">
                <div className="w-10 h-10 rounded-full bg-[#B8E3A1] text-[#111111] font-bold mx-auto mb-4 flex items-center justify-center">4</div>
                <h4 className="font-bold text-sm mb-1">AI Summarize</h4>
                <p className="text-xs text-white/50">Call ends, AI compiles notes and extracts action items.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center">
                <div className="w-10 h-10 rounded-full bg-white text-[#111111] font-bold mx-auto mb-4 flex items-center justify-center">5</div>
                <h4 className="font-bold text-sm mb-1">Onboarding Update</h4>
                <p className="text-xs text-white/50">Kanban board tasks created; CRM timeline is advanced.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DASHBOARD PREVIEW — MINIMAL */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Inside the Operations Cockpit</h2>
          <p className="text-sm text-[#111111]/60">A unified workspace for modern teams.</p>
        </div>
        <div className="relative mx-auto rounded-[24px] overflow-hidden shadow-soft border border-[#111111]/10 bg-white/45 max-w-3xl p-2">
          <img 
            src="/flowmeet_dashboard_preview.png" 
            alt="FlowMeet AI Dashboard" 
            className="w-full object-cover rounded-[20px] shadow-sm border border-[#111111]/5"
          />
        </div>
      </section>

      {/* 6. BENEFITS */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F8D4E5] bg-[#111111] px-3 py-1 rounded-full">For Operations Teams</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-6 mb-6">Stop managing meeting administrative fatigue. Let AI handle the workflows.</h2>
              <p className="text-base text-[#111111]/60 leading-relaxed mb-8">
                Spend less time writing manuals, copying checklists, following up on email reminders, and chasing tasks. FlowMeet AI links scheduling events directly to visual dashboards.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#B8E3A1] flex items-center justify-center mt-1 flex-shrink-0 text-black"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm font-medium text-[#111111]/80">95% reduction in manual follow-ups and action item drafting times.</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#B8E3A1] flex items-center justify-center mt-1 flex-shrink-0 text-black"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm font-medium text-[#111111]/80">Sleek multi-tenant calendars preventing any double-booking hazards.</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#B8E3A1] flex items-center justify-center mt-1 flex-shrink-0 text-black"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm font-medium text-[#111111]/80">Zero gaps in onboarding progress transitions. Full audit logs in real-time.</span>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F0E6] p-8 rounded-[32px] border border-[#111111]/5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F8D4E5]/40 rounded-full blur-3xl"></div>
              <h4 className="text-lg font-bold mb-4">Operations Metrics Uplift</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>Task Completion Rate</span>
                    <span className="text-emerald-600 font-bold">+40%</span>
                  </div>
                  <div className="h-2 bg-[#111111]/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#B8E3A1]" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>Onboarding Time-to-Value</span>
                    <span className="text-emerald-600 font-bold">-3.2 Days</span>
                  </div>
                  <div className="h-2 bg-[#111111]/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#C8D9F7]" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>Meeting Attendance Rate</span>
                    <span className="text-emerald-600 font-bold">98.2%</span>
                  </div>
                  <div className="h-2 bg-[#111111]/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F8D4E5]" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRICING */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Flexible Commercial Plans</h2>
          <p className="text-base text-[#111111]/60">Select the plan that fits your customer success or startup team.</p>

          <div className="inline-flex items-center gap-3 bg-white p-1 rounded-full border border-[#111111]/10 mt-6 shadow-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${!isAnnual ? 'bg-[#111111] text-white' : 'text-[#111111]/60'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${isAnnual ? 'bg-[#111111] text-white' : 'text-[#111111]/60'}`}
            >
              Annually <span className="text-[10px] text-[#B8E3A1] bg-[#111111] px-1.5 py-0.5 rounded ml-1 font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plan 1 */}
          <div className="p-8 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Starter</h3>
              <p className="text-xs text-[#111111]/60 mb-6">For single operators and independent PMs.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">${isAnnual ? '19' : '24'}</span>
                <span className="text-xs text-[#111111]/50"> / user / month</span>
              </div>
              <ul className="space-y-3.5 mb-8 text-sm text-[#111111]/70">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 1 Syncable Calendar</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Unlimited Booking links</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Basic AI summaries (10/mo)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Standard Kanban Board</li>
              </ul>
            </div>
            <button onClick={() => onNavigate('register')} className="w-full py-3 bg-[#111111]/5 hover:bg-[#111111]/10 text-[#111111] font-semibold btn-pill transition">Start Starter Trial</button>
          </div>

          {/* Plan 2 */}
          <div className="p-8 bg-white rounded-[24px] shadow-premium border-2 border-[#111111] flex flex-col justify-between relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#111111] text-[#F8D4E5] text-[10px] font-bold tracking-widest uppercase rounded-full">POPULAR</span>
            <div>
              <h3 className="text-lg font-bold mb-1">Pro Operator</h3>
              <p className="text-xs text-[#111111]/60 mb-6">For growing customer success and operations teams.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">${isAnnual ? '39' : '49'}</span>
                <span className="text-xs text-[#111111]/50"> / user / month</span>
              </div>
              <ul className="space-y-3.5 mb-8 text-sm text-[#111111]/70">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 3 Syncable Calendars</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Custom stage pipelines</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Unlimited AI summaries & tasks</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Advanced analytics trends</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Shared workspace team roles</li>
              </ul>
            </div>
            <button onClick={() => onNavigate('register')} className="w-full py-3 bg-[#111111] text-white hover:bg-black/90 font-semibold btn-pill transition">Start Pro Trial</button>
          </div>

          {/* Plan 3 */}
          <div className="p-8 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Enterprise Core</h3>
              <p className="text-xs text-[#111111]/60 mb-6">For high volume teams and custom setups.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">${isAnnual ? '79' : '99'}</span>
                <span className="text-xs text-[#111111]/50"> / user / month</span>
              </div>
              <ul className="space-y-3.5 mb-8 text-sm text-[#111111]/70">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Unlimited Calendars</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Strict SOC2 security settings</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> custom domain booking links</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 24/7 dedicated support</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> REST API Access</li>
              </ul>
            </div>
            <button onClick={() => onNavigate('register')} className="w-full py-3 bg-[#111111]/5 hover:bg-[#111111]/10 text-[#111111] font-semibold btn-pill transition">Contact Commercials</button>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="bg-[#F8D4E5]/30 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">What Our Core Operators Say</h2>
            <p className="text-base text-[#111111]/60">Startups and Customer success teams turning meetings into business workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="p-8 bg-white rounded-[24px] border border-[#111111]/5">
              <div className="flex items-center gap-1.5 text-[#F5DE74] mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-base text-[#111111]/80 leading-relaxed mb-6 font-medium">
                "FlowMeet AI completely reframed how we approach client meetings. Before, we'd take manual notes, forget tasks, and onboarding would take weeks. Now, it happens automatically. The visual aesthetics are breathtaking."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold">HS</div>
                <div>
                  <h4 className="font-bold text-sm">Hank Scorpio</h4>
                  <span className="text-xs text-[#111111]/50">CEO, Globex Corporation</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-[24px] border border-[#111111]/5">
              <div className="flex items-center gap-1.5 text-[#F5DE74] mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-base text-[#111111]/80 leading-relaxed mb-6 font-medium">
                "We were looking for a premium scheduler that extended past booking. FlowMeet\'s Kanban integration is brilliant. AI extracts task items instantly and assigns them correctly. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold">PG</div>
                <div>
                  <h4 className="font-bold text-sm">Peter Gibbons</h4>
                  <span className="text-xs text-[#111111]/50">Director of Systems, Initech</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Frequently Asked Questions</h2>
          <p className="text-sm text-[#111111]/60">Have questions about the platform? Let\'s address them.</p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="bg-white rounded-[20px] border border-[#111111]/5 overflow-hidden transition-all duration-300">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between font-bold text-base hover:bg-black/5 transition"
              >
                <span>{faq.q}</span>
                {activeFaq === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {activeFaq === index && (
                <div className="px-6 pb-6 text-sm text-[#111111]/70 leading-relaxed border-t border-[#111111]/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. FOOTER — ENTREXT MOCKUP MATCH */}
      <footer className="bg-[#111111] text-white">
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-10 border-b border-white/5">
            {/* Left Column — Branding & Social */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#111111] font-extrabold text-lg">⚡</div>
                <span className="font-bold text-xl tracking-tight font-sans">FlowMeet<span className="text-[10px] ml-1 px-1.5 py-0.5 bg-[#F8D4E5] text-[#111111] rounded font-black uppercase">AI</span></span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-6 max-w-[260px]">
                The simplest way to turn meetings into actionable workflows for your team.
              </p>
              <span className="text-[9px] font-black text-white/25 tracking-[0.2em] uppercase block mb-3">COMMUNITY</span>
              <div className="flex items-center gap-2.5">
                {/* Instagram */}
                <a href="https://www.instagram.com/entrext.labs" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-[#FFD54F] hover:border-white/20 transition-all">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                {/* Discord */}
                <a href="https://discord.com/invite/ZZx3cBrx2" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-[#FFD54F] hover:border-white/20 transition-all">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/></svg>
                </a>
                {/* LinkedIn */}
                <a href="https://www.linkedin.com/company/entrext/" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-[#FFD54F] hover:border-white/20 transition-all">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                {/* Substack */}
                <a href="https://entrextlabs.substack.com/subscribe" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-[#FFD54F] hover:border-white/20 transition-all">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 6.785H1.5v2.857h21V6.785zm0 4.286H1.5v12.857L12 18l10.5 5.928V11.071zM22.5 1.5H1.5v2.857h21V1.5z"/></svg>
                </a>
                {/* Linktree */}
                <a href="https://linktr.ee/entrext.pro" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-[#FFD54F] hover:border-white/20 transition-all">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13.51 10.153l3.77-5.836h-3.238l-2.042 3.655V0H9.988v7.972L7.946 4.317H4.708l3.77 5.836H2v2.338h6.495l-3.924 5.852h3.262l2.167-3.93v5.992H12v-5.992l2.167 3.93h3.262l-3.924-5.852H20v-2.338h-6.49z"/></svg>
                </a>
              </div>
            </div>
 
            {/* Center Column — Product */}
            <div>
              <h4 className="font-bold text-sm mb-4">Product</h4>
              <ul className="space-y-2.5 text-xs text-white/40">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#workflow" className="hover:text-white transition">Blog</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
 
            {/* Right Column — Legal */}
            <div>
              <h4 className="font-bold text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5 text-xs text-white/40">
                <li><span onClick={() => setShowPrivacy(true)} className="hover:text-white transition cursor-pointer">Privacy Policy</span></li>
                <li><span onClick={() => setShowTerms(true)} className="hover:text-white transition cursor-pointer">Terms of Service</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 text-[11px] text-white/25">
            &copy; FlowMeet AI &bull; Made by Entrext
          </div>
        </div>
      </footer>

      {/* ==================================================== */}
      {/* CAL.COM SCHEDULING BOOKING WIDGET MODAL              */}
      {/* ==================================================== */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-premium overflow-hidden border border-[#111111]/15 animate-fade-in max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-[#111111]/10 flex items-center justify-between bg-[#F5F0E6]/30">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#111111]" />
                <span className="font-bold text-base font-sans">Book a FlowMeet Session</span>
              </div>
              <button
                onClick={() => { setShowBookingModal(false); resetBookingForm(); }}
                className="w-8 h-8 rounded-full bg-[#111111]/5 hover:bg-[#111111]/10 text-[#111111] font-bold flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8">
              {bookingStep === 1 && (
                <div>
                  <h3 className="text-xl font-bold mb-6">1. Select Call Type & Time Slot</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {meetingTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedMeetingType(type.id)}
                        className={`p-5 rounded-2xl text-left border-2 transition ${selectedMeetingType === type.id
                            ? 'border-[#111111] bg-black/[0.02]'
                            : 'border-[#111111]/10 bg-white hover:border-[#111111]/30'
                          }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#F8D4E5] flex items-center justify-center font-bold text-[#111111] text-xs mb-3">
                          {type.id[0]}
                        </div>
                        <h4 className="font-bold text-sm mb-1">{type.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-[#111111]/60">
                          <Clock className="w-3.5 h-3.5" /> {type.duration}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Date Picker */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-2">Select Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                        min="2026-05-29"
                        max="2026-12-31"
                        className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111]"
                      />
                      <div className="flex items-center gap-1.5 text-xs text-[#111111]/50 mt-3">
                        <Globe className="w-3.5 h-3.5" /> Timeslots synced in host Timezone (UTC)
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-2">Select Time</label>
                      <div className="grid grid-cols-2 gap-2">
                        {timeslots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-3.5 text-xs font-semibold rounded-xl text-center border-2 transition ${selectedTime === slot
                                ? 'bg-[#111111] text-white border-[#111111]'
                                : 'bg-white border-[#111111]/10 hover:border-[#111111]/30 text-[#111111]'
                              }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      disabled={!selectedTime}
                      onClick={() => setBookingStep(2)}
                      className="px-6 py-3.5 bg-[#111111] text-white rounded-full font-semibold hover:bg-black/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Next: Guest Info <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {bookingStep === 2 && (
                <form onSubmit={handleBookingSubmit}>
                  <h3 className="text-xl font-bold mb-6">2. Fill Guest Information</h3>
                  <div className="space-y-5 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Your Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Wile E. Coyote"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Corporate Email</label>
                        <input
                          type="email"
                          required
                          placeholder="wile@acme.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Company Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Acme Corp"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Meeting Purpose / Onboarding Context</label>
                      <textarea
                        rows={3}
                        placeholder="We want to automate cloud calendar synchronization triggers to dispatch emails on custom timelines..."
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] resize-none"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="px-5 py-3 border border-[#111111]/15 rounded-full font-semibold hover:bg-black/5 transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3.5 bg-[#111111] text-white rounded-full font-semibold hover:bg-black/90 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? 'Syncing...' : 'Confirm and Book'} <Check className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {bookingStep === 3 && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-[#B8E3A1] flex items-center justify-center text-black mx-auto mb-6 text-2xl font-bold">
                    ✓
                  </div>
                  <h3 className="text-3xl font-extrabold mb-3">Booking Confirmed!</h3>
                  <p className="text-base text-[#111111]/60 max-w-lg mx-auto mb-8">
                    Your {selectedMeetingType.replace(/_/g, ' ').toLowerCase()} has been booked for <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>.
                    A confirmation email has been sent to <strong>{email}</strong>.
                  </p>

                  {/* Email sent confirmation card */}
                  <div className="bg-white border-2 border-[#B8E3A1] rounded-2xl p-5 max-w-md mx-auto text-left mb-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-full bg-[#B8E3A1] flex items-center justify-center text-[#1a4a2e] text-lg shrink-0">📧</div>
                      <div>
                        <h4 className="font-bold text-sm">Confirmation Email Sent!</h4>
                        <p className="text-[10px] text-[#111111]/50">Delivered to: <span className="font-bold text-[#111111]">{email}</span></p>
                      </div>
                    </div>
                    {simulatedEmail && (
                      <div className="text-xs space-y-1 mb-4 border-t border-[#111111]/5 pt-3">
                        <div><span className="text-black/50 font-semibold">Subject: </span><span className="font-bold">{simulatedEmail.subject}</span></div>
                      </div>
                    )}
                    {emailPreviewUrl ? (
                      <a
                        href={emailPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111111] text-white text-xs font-bold rounded-full hover:bg-black/85 transition"
                      >
                        👁️ View Email in Browser
                      </a>
                    ) : (
                      <p className="text-[10px] text-[#111111]/40 text-center">Email dispatched — check your inbox.</p>
                    )}
                  </div>

                  {/* Sync details card */}
                  <div className="bg-[#F5F0E6]/30 p-5 rounded-2xl border border-[#111111]/10 max-w-md mx-auto text-left mb-8">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#111111]/40 mb-3">Booking Details</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-black/50">Attendee:</span>
                        <span className="font-semibold">{name} — {email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/50">Company:</span>
                        <span className="font-semibold">{company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/50">Calendar Sync:</span>
                        <span className="font-semibold text-emerald-600">Google & Outlook ACTIVE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/50">Meeting ID:</span>
                        <span className="font-mono">{bookedMeetingInfo?.id}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowBookingModal(false); resetBookingForm(); }}
                    className="px-8 py-3.5 bg-[#111111] text-white rounded-full font-semibold hover:bg-black/90 transition btn-pill"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIBE SUCCESS TOAST */}
      {subscribed && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-fade-in">
          <div className="bg-[#111111] text-white px-6 py-4 rounded-2xl shadow-premium flex items-center gap-3 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#B8E3A1] flex items-center justify-center text-[#111111] font-bold text-sm shrink-0">✓</div>
            <div>
              <h4 className="font-bold text-sm">Thanks for subscribing!</h4>
              <p className="text-[10px] text-white/50 mt-0.5">You'll receive the latest FlowMeet updates.</p>
            </div>
            <button onClick={() => setSubscribed(false)} className="ml-4 text-white/30 hover:text-white transition text-lg font-bold">&times;</button>
          </div>
        </div>
      )}
    </div>
  );
}

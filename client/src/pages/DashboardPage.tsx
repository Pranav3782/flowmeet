import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Calendar, Search, Sparkles, Check, Clock, User as UserIcon, Play, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownRight, Bell, Settings } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // States
  const [analytics, setAnalytics] = useState<any>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchPill, setActiveSearchPill] = useState('All');
  const [loading, setLoading] = useState(true);
  const [processingMeetingId, setProcessingMeetingId] = useState<string | null>(null);

  // Fetch Dashboard Core Data
  const fetchDashboardData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [analyticsRes, meetingsRes, clientsRes, tasksRes, notifRes] = await Promise.all([
        fetch('/api/analytics', { headers }),
        fetch('/api/meetings', { headers }),
        fetch('/api/clients', { headers }),
        fetch('/api/tasks', { headers }),
        fetch('/api/notifications', { headers }),
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
      
      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json();
        if (Array.isArray(meetingsData)) {
          setMeetings(meetingsData);
        }
      }
      
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        if (Array.isArray(clientsData)) {
          setClients(clientsData);
        }
      }
      
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        if (Array.isArray(tasksData)) {
          setTasks(tasksData);
        }
      }
      
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        if (Array.isArray(notifData)) {
          setNotifications(notifData);
        }
      }
    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Complete meeting and run AI pipeline trigger
  const handleProcessMeeting = async (meetingId: string) => {
    setProcessingMeetingId(meetingId);
    try {
      const response = await fetch(`/api/meetings/${meetingId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        // Refresh dashboard data instantly!
        await fetchDashboardData();
        alert('AI Summary generated successfully! Onboarding progress advanced and tasks extracted.');
      } else {
        alert(data.error || 'Failed to process meeting');
      }
    } catch (err) {
      console.error(err);
      alert('Error triggering AI pipeline.');
    } finally {
      setProcessingMeetingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#111111]/60" />
      </div>
    );
  }

  // Get metrics from analytics endpoint
  const metrics = analytics?.metrics || {
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0,
    noShowRate: 0,
    averageMeetingDuration: 30,
    activeClients: 0,
    onboardingCompletionRate: 0,
    tasksCreated: 0,
    tasksCompleted: 0,
    taskCompletionRate: 0
  };

  // Upcomings meetings
  const upcomingMeetings = meetings.filter(m => m.status === 'SCHEDULED');
  // Recent completed meetings
  const recentCompleted = meetings.filter(m => m.status === 'COMPLETED').slice(0, 3);
  // Recent activity logs
  const activities = analytics?.activities || [];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* 1. TOP HEADER & SEARCH BAR MOCKUP */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-[#111111]/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your Meeting Operations & Workflows</h1>
          <p className="text-xs text-[#111111]/50 mt-1 font-medium">Welcome back, {user?.name}. Everything is synced and automated.</p>
        </div>

        {/* Search Panel replicating visual toggles from mockup */}
        <div className="flex items-center bg-white border border-[#111111]/10 rounded-2xl px-4 py-2 w-full lg:w-96 shadow-soft">
          <Search className="w-4.5 h-4.5 text-[#111111]/30 mr-2 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search meetings, clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm focus:outline-none w-full mr-2"
          />
          <div className="flex items-center gap-1.5 border-l border-[#111111]/10 pl-2 text-[10px] font-bold text-[#111111]/50 whitespace-nowrap">
            <span className="text-black/35 font-normal">In:</span>
            {['All', 'Meetings', 'Tasks'].map(pill => (
              <button
                key={pill}
                onClick={() => setActiveSearchPill(pill)}
                className={`px-1.5 py-0.5 rounded transition ${activeSearchPill === pill ? 'bg-[#F8D4E5] text-[#111111]' : 'hover:bg-black/5'}`}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CORE LAYOUT GRID MOCKUP STYLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: KPI DONUT + COLOURED CARDS (4 COLS) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Circular Donut KPI panel matching "23.4k" ring mockup */}
          <div className="p-8 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111]/45 mb-6 self-start">Meetings Analytics Index</h3>
            
            {/* SVG Donut Circle Ring */}
            <div className="relative w-44 h-44 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F5F0E6" strokeWidth="12" />
                {/* Segment 1: Completed (Green Accent #B8E3A1 - 60%) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#B8E3A1" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="100" />
                {/* Segment 2: Pending (Blue Accent #C8D9F7 - 25%) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#C8D9F7" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="200" />
                {/* Segment 3: Rescheduled (Pink Accent #F8D4E5 - 15%) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F8D4E5" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="230" />
              </svg>
              {/* Inner Center text displaying main metric */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold tracking-tight">{metrics.totalMeetings}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/40 mt-0.5">Total Meetings</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full text-left pt-4 border-t border-[#111111]/5">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B8E3A1]"></span>
                  <span className="text-[10px] font-semibold text-[#111111]/55 uppercase">Done</span>
                </div>
                <span className="text-sm font-bold ml-4">{metrics.completedMeetings}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C8D9F7]"></span>
                  <span className="text-[10px] font-semibold text-[#111111]/55 uppercase">Booked</span>
                </div>
                <span className="text-sm font-bold ml-4">{metrics.upcomingMeetings}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F8D4E5]"></span>
                  <span className="text-[10px] font-semibold text-[#111111]/55 uppercase">No-Show</span>
                </div>
                <span className="text-sm font-bold ml-4">{metrics.noShowRate}%</span>
              </div>
            </div>
          </div>

          {/* Metric Panel 1 (Pink Accent): Replicates "Payments received" mockup card style */}
          <div className="p-6 bg-[#F8D4E5] rounded-[24px] shadow-soft border border-black/5 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#111111]/50">Active CRM Clients</span>
              <h2 className="text-3xl font-extrabold tracking-tight">${metrics.activeClients} Active</h2>
              <p className="text-[10px] text-[#111111]/40 font-medium">Customer database synchronized</p>
            </div>
            <div className="px-2.5 py-1 bg-white rounded-full text-[10px] font-bold text-[#111111] flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +13%
            </div>
          </div>

          {/* Metric Panel 2 (Blue Accent): Replicates "Payments requested" mockup card style */}
          <div className="p-6 bg-[#C8D9F7] rounded-[24px] shadow-soft border border-black/5 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#111111]/50">Onboarding Completion</span>
              <h2 className="text-3xl font-extrabold tracking-tight">{metrics.onboardingCompletionRate}%</h2>
              <p className="text-[10px] text-[#111111]/40 font-medium">Pipeline velocity increased</p>
            </div>
            <div className="px-2.5 py-1 bg-white rounded-full text-[10px] font-bold text-[#111111] flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +6%
            </div>
          </div>

          {/* Metric Panel 3 (Yellow Accent): Replicates "Non insurance payments" mockup card style */}
          <div className="p-6 bg-[#F5DE74] rounded-[24px] shadow-soft border border-black/5 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#111111]/50">Task Completion Rate</span>
              <h2 className="text-3xl font-extrabold tracking-tight">{metrics.taskCompletionRate}%</h2>
              <p className="text-[10px] text-[#111111]/40 font-medium">Kanban productivity metrics</p>
            </div>
            <div className="px-2.5 py-1 bg-white rounded-full text-[10px] font-bold text-[#111111] flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +17%
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ACTION ITEMS + REALTIME FLOWS (8 COLS) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* "Waiting for AI Processing" Widget replicating "Waiting for bills" layout from mockup */}
          <div className="p-8 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 space-y-6">
            <div>
              <h3 className="text-lg font-bold">Waiting for AI Summary Verification</h3>
              <p className="text-xs text-[#111111]/50 mt-1 font-medium">These calls have finished. Click to trigger AI executive notes & auto-extract Kanban tasks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMeetings.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-xs text-[#111111]/40 border border-dashed border-[#111111]/10 rounded-2xl">
                  No pending calls in the pipeline. All sessions processed!
                </div>
              ) : (
                upcomingMeetings.slice(0, 2).map((meet) => {
                  const initials = meet.client.companyName[0] || 'C';
                  const colors = ['bg-[#C8D9F7]', 'bg-[#F8D4E5]', 'bg-[#F5DE74]'];
                  const randomColor = colors[meet.id.charCodeAt(0) % colors.length];

                  return (
                    <div key={meet.id} className="p-5 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-2xl flex flex-col justify-between hover:border-[#111111]/25 transition">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${randomColor} text-[#111111] font-bold flex items-center justify-center text-xs shadow-sm`}>
                            {initials}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm tracking-tight">{meet.client.companyName}</h4>
                            <span className="text-[10px] font-semibold text-[#111111]/50">{meet.meetingType.replace(/_/g, ' ')} Session</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-[#F8D4E5] rounded-full text-[10px] font-bold tracking-tight text-[#111111]">{meet.startTime}</span>
                      </div>
                      
                      <button
                        onClick={() => handleProcessMeeting(meet.id)}
                        disabled={processingMeetingId === meet.id}
                        className="w-full py-2 bg-[#111111] text-white hover:bg-black/90 text-xs font-semibold rounded-full btn-pill transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {processingMeetingId === meet.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" /> Compile AI Summary & Tasks
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* "Latest Transactions" styled Recent Completed meetings table */}
          <div className="p-8 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Recent AI Processed Operations</h3>
                <p className="text-xs text-[#111111]/50 mt-1 font-medium">Automatic meeting workflows triggered in the last 72 hours.</p>
              </div>
              <button 
                onClick={() => onNavigate('summaries')}
                className="px-4 py-2 border border-[#111111]/10 rounded-full text-xs font-semibold hover:bg-black/5 transition"
              >
                View History
              </button>
            </div>

            <div className="space-y-3">
              {recentCompleted.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#111111]/40 border border-dashed border-[#111111]/10 rounded-2xl">
                  No completed sessions yet. Book and complete a call to view summaries!
                </div>
              ) : (
                recentCompleted.map((meet) => {
                  const client = meet.client;
                  return (
                    <div key={meet.id} className="p-4 bg-[#F5F0E6]/20 border border-[#111111]/5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#F5F0E6]/30 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#B8E3A1] flex items-center justify-center font-bold text-xs">
                          ✓
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{meet.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#111111]/60">
                            <span>Client: <strong>{client.companyName}</strong></span>
                            <span>&bull;</span>
                            <span>{new Date(meet.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-stretch md:self-auto justify-between">
                        <span className="px-2.5 py-0.5 bg-[#B8E3A1] text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-wider">AI Summarized</span>
                        <button
                          onClick={() => onNavigate('summaries')}
                          className="p-2 hover:bg-[#111111]/5 rounded-lg text-xs font-semibold text-[#111111]/70 transition"
                        >
                          Details &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Activity Log TIMELINE FEED */}
          <div className="p-8 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 space-y-6">
            <div>
              <h3 className="text-lg font-bold">Recent Operations Activity</h3>
              <p className="text-xs text-[#111111]/50 mt-1 font-medium">Automatic system synchronization events and team status reports.</p>
            </div>

            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#111111]/40 border border-dashed border-[#111111]/10 rounded-2xl">
                  No recent activities recorded.
                </div>
              ) : (
                activities.slice(0, 4).map((act: any) => (
                  <div key={act.id} className="flex items-start gap-4 text-xs font-medium">
                    <div className="w-2 h-2 rounded-full bg-[#111111] mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-black/85">{act.details || act.action.replace(/_/g, ' ')}</p>
                      <div className="flex items-center gap-2 text-[#111111]/50 text-[10px]">
                        <span>Triggered by: <strong>{act.user?.name || 'System Engine'}</strong></span>
                        <span>&bull;</span>
                        <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

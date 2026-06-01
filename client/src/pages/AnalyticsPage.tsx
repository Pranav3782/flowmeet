import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Users, Calendar, CheckSquare, Clock, RefreshCw, BarChart2 } from 'lucide-react';

export default function AnalyticsPage() {
  const token = useAuthStore((state) => state.token);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const analyticsData = await response.json();
      if (response.ok) {
        setData(analyticsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#111111]/60" />
      </div>
    );
  }

  const metrics = data?.metrics || {
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

  const charts = data?.charts || {
    meetingsTrend: [],
    taskRatioTrend: [],
    onboardingRatios: []
  };

  // Accent Colors for Charts
  const COLORS = ['#F8D4E5', '#C8D9F7', '#B8E3A1', '#F5DE74'];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#111111]/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Business Intelligence Cockpit</h1>
          <p className="text-xs text-[#111111]/50 mt-1 font-medium font-sans">Analyze organizational productivity, customer success metrics, and onboarding velocities.</p>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 */}
        <div className="p-6 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F8D4E5] text-[#111111] flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#111111]/45 uppercase tracking-wider block">Meetings Completed</span>
            <h3 className="text-2xl font-extrabold mt-0.5">{metrics.completedMeetings} Calls</h3>
            <span className="text-[10px] text-[#111111]/40 font-medium">Out of {metrics.totalMeetings} total syncs</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-6 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C8D9F7] text-[#111111] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#111111]/45 uppercase tracking-wider block">Active Accounts</span>
            <h3 className="text-2xl font-extrabold mt-0.5">{metrics.activeClients} Clients</h3>
            <span className="text-[10px] text-[#111111]/40 font-medium">{metrics.onboardingCompletionRate}% Onboarded</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-6 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F5DE74] text-[#111111] flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#111111]/45 uppercase tracking-wider block">Action Items Solved</span>
            <h3 className="text-2xl font-extrabold mt-0.5">{metrics.taskCompletionRate}% Rate</h3>
            <span className="text-[10px] text-[#111111]/40 font-medium">{metrics.tasksCompleted} / {metrics.tasksCreated} Tasks</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-6 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#B8E3A1] text-[#111111] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#111111]/45 uppercase tracking-wider block">Average Duration</span>
            <h3 className="text-2xl font-extrabold mt-0.5">{metrics.averageMeetingDuration} Min</h3>
            <span className="text-[10px] text-[#111111]/40 font-medium">Optimal call efficiency level</span>
          </div>
        </div>

      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CHART 1: LINE CHART TRENDS (7 COLS) */}
        <div className="lg:col-span-8 p-8 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base tracking-tight">Scheduling Volume Trend</h3>
              <p className="text-xs text-[#111111]/50 mt-0.5 font-medium">Monthly volume of completed discovery, demo, and onboarding meetings.</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-[#B8E3A1]/35 px-2.5 py-1 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> High Velocity
            </span>
          </div>

          <div className="h-80 w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.meetingsTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F0E6" />
                <XAxis dataKey="name" stroke="#111111" opacity={0.6} />
                <YAxis stroke="#111111" opacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(17,17,17,0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#111111" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: ONBOARDING RATIOS PIE CHART (5 COLS) */}
        <div className="lg:col-span-4 p-8 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-base tracking-tight">Onboarding Segment Distribution</h3>
            <p className="text-xs text-[#111111]/50 mt-0.5 font-medium">Client status groups inside the operations CRM pipeline.</p>
          </div>

          <div className="h-64 w-full flex justify-center items-center text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.onboardingRatios}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.onboardingRatios.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(17,17,17,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-[#111111]/5 pt-4 text-xs font-semibold">
            {charts.onboardingRatios.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="text-[#111111]/75">{item.name}</span>
                </div>
                <span>{item.value} Clients</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CHART 3: BAR CHART FOR KANBAN TASK DENSITIES */}
      <div className="p-8 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 space-y-6 max-w-4xl">
        <div>
          <h3 className="font-bold text-base tracking-tight">Kanban Task Board Densities</h3>
          <p className="text-xs text-[#111111]/50 mt-0.5 font-medium">Comparison of action items in Pending, In Progress, Review, and Completed columns.</p>
        </div>

        <div className="h-72 w-full text-xs font-semibold">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.taskRatioTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F0E6" />
              <XAxis dataKey="name" stroke="#111111" opacity={0.6} />
              <YAxis stroke="#111111" opacity={0.6} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(17,17,17,0.1)' }} />
              <Bar dataKey="count" fill="#111111" radius={[8, 8, 0, 0]}>
                {charts.taskRatioTrend.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

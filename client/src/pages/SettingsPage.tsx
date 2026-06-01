import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Calendar, Shield, Sparkles, Check, RefreshCw, Key, CreditCard, Users, Link as LinkIcon, User as UserIcon, Globe, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';

interface SettingsPageProps {
  initialTab?: 'profile' | 'calendar' | 'ai' | 'team' | 'billing';
}

export default function SettingsPage({ initialTab = 'profile' }: SettingsPageProps) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  // States
  const [activeSec, setActiveSec] = useState<'profile' | 'calendar' | 'ai' | 'team' | 'billing'>(initialTab);

  useEffect(() => {
    setActiveSec(initialTab);
  }, [initialTab]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [name, setName] = useState(user?.name || 'User');
  const [email, setEmail] = useState(user?.email || 'email@flowmeet.ai');

  // Integrations states
  const [googleConnected, setGoogleConnected] = useState(true);
  const [outlookConnected, setOutlookConnected] = useState(false);

  // Team Invite Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  // AI preference
  const [aiTone, setAiTone] = useState('executive');
  const [autoTaskOwner, setAutoTaskOwner] = useState(true);

  const fetchTeam = async () => {
    try {
      const response = await fetch('/api/team', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTeam(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTeam();
    }
  }, [token]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('User Profile preferences successfully saved!');
  };

  const handleInviteTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole })
      });

      const data = await response.json();
      if (response.ok) {
        await fetchTeam();
        alert(`Simulated invitation dispatch completed for ${inviteName}! Default login password: password123`);
        setInviteName('');
        setInviteEmail('');
      } else {
        alert(data.error || 'Failed to invite team member');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        await fetchTeam();
      } else {
        const data = await response.json();
        alert(data.error || 'Role change failed');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#111111]/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System & Account Configurations</h1>
          <p className="text-xs text-[#111111]/50 mt-1 font-medium">Link calendar APIs, invite team colleagues, edit role access, and review billing limits.</p>
        </div>
      </div>

      {/* CORE CONFIG CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: NAVIGATION LIST (3 COLS) */}
        <div className="lg:col-span-3 space-y-2 bg-white p-4 rounded-[24px] shadow-soft border border-[#111111]/5">
          {[
            { id: 'profile', label: 'My Profile', icon: UserIcon },
            { id: 'calendar', label: 'Calendar Connections', icon: Calendar },
            { id: 'ai', label: 'AI Summarizer Opts', icon: Sparkles },
            { id: 'team', label: 'Workspace Team', icon: Users },
            { id: 'billing', label: 'Commercial Subscription', icon: CreditCard },
          ].map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSec(sec.id as any)}
                className={`w-full text-left px-4 py-3 rounded-full text-xs font-bold transition flex items-center gap-2.5 ${
                  activeSec === sec.id
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-[#111111]/70 hover:bg-black/5'
                }`}
              >
                <Icon className="w-4.5 h-4.5" /> {sec.label}
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: RICH CONFIG FORMS (9 COLS) */}
        <div className="lg:col-span-9 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 p-8">
          
          {/* SECTION 1: PROFILE */}
          {activeSec === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-6 max-w-lg">
              <div>
                <h3 className="font-extrabold text-base mb-1 tracking-tight">My Profile Settings</h3>
                <p className="text-xs text-[#111111]/50 font-medium">Manage your personal workspace identity.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Active Tenant Role</label>
                  <input
                    type="text"
                    disabled
                    value={`${user?.role || 'MEMBER'} (Organizational Account)`}
                    className="w-full px-4 py-3 bg-[#F5F0E6]/25 border border-[#111111]/5 text-black/55 rounded-xl text-sm font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 bg-[#111111] text-white hover:bg-black/90 font-semibold text-xs rounded-full btn-pill transition shadow-md"
              >
                Save Profile Changes
              </button>
            </form>
          )}

          {/* SECTION 2: CALENDAR CONNECTIONS */}
          {activeSec === 'calendar' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-base mb-1 tracking-tight">External Calendar Synchronizations</h3>
                <p className="text-xs text-[#111111]/50 font-medium">Verify synchronized calendar credentials to prevent double-bookings instantly.</p>
              </div>

              <div className="space-y-4 max-w-xl">
                {/* Google Calendar */}
                <div className="p-5 border border-[#111111]/10 bg-[#F5F0E6]/10 rounded-2xl flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C8D9F7] text-blue-700 flex items-center justify-center font-black">G</div>
                    <div>
                      <h4 className="font-bold text-sm">Google Calendar API</h4>
                      <p className="text-xs text-[#111111]/50 font-medium mt-0.5">
                        {googleConnected ? `Linked: david.m@flowmeet.ai` : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setGoogleConnected(!googleConnected)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full btn-pill transition flex items-center gap-1 ${
                      googleConnected 
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                        : 'bg-[#111111] text-white hover:bg-black/90'
                    }`}
                  >
                    {googleConnected ? 'Disconnect' : 'Connect API'}
                  </button>
                </div>

                {/* Microsoft Outlook */}
                <div className="p-5 border border-[#111111]/10 bg-[#F5F0E6]/10 rounded-2xl flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F8D4E5] text-pink-700 flex items-center justify-center font-black">O</div>
                    <div>
                      <h4 className="font-bold text-sm">Microsoft Outlook Calendar API</h4>
                      <p className="text-xs text-[#111111]/50 font-medium mt-0.5">
                        {outlookConnected ? 'Linked: corporate-outlook@company.com' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOutlookConnected(!outlookConnected)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full btn-pill transition flex items-center gap-1 ${
                      outlookConnected 
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                        : 'bg-[#111111] text-white hover:bg-black/90'
                    }`}
                  >
                    {outlookConnected ? 'Disconnect' : 'Connect API'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: AI OPTIONS */}
          {activeSec === 'ai' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h3 className="font-extrabold text-base mb-1 tracking-tight">AI Summarizer Preferences</h3>
                <p className="text-xs text-[#111111]/50 font-medium">Fine-tune the integrated post-meeting summary engines.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Executive Summary Tone</label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="w-full px-3 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl text-sm font-semibold cursor-pointer"
                  >
                    <option value="executive">Corporate Executive (Action-oriented bullets)</option>
                    <option value="narrative">Detailed Narrative (Paragraph summary)</option>
                    <option value="developer">Technical Developer (Focus on tasks & logic)</option>
                  </select>
                </div>

                <div className="p-4 bg-[#F5F0E6]/20 border border-[#111111]/5 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs">Auto Kanban Tasks Extraction</h4>
                    <p className="text-[10px] text-[#111111]/55 leading-relaxed mt-0.5">
                      Automatically create tasks in the "Pending" Kanban columns when meetings are completed.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoTaskOwner}
                    onChange={(e) => setAutoTaskOwner(e.target.checked)}
                    className="w-5 h-5 rounded border-[#111111]/15 text-[#111111] cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => alert('AI preferences successfully saved!')}
                className="px-6 py-3.5 bg-[#111111] text-white hover:bg-black/90 font-semibold text-xs rounded-full btn-pill transition shadow-md animate-fade-in"
              >
                Save AI Settings
              </button>
            </div>
          )}

          {/* SECTION 4: TEAM MANAGEMENT */}
          {activeSec === 'team' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-extrabold text-base mb-1 tracking-tight">Workspace Team Members</h3>
                <p className="text-xs text-[#111111]/50 font-medium">Invite colleagues, edit permissions, and manage roles.</p>
              </div>

              {/* Invite box */}
              {user?.role === 'MEMBER' ? (
                <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-1.5">
                  <Shield className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>Insufficient permissions: Only managers and admins can invite team members.</span>
                </div>
              ) : (
                <form onSubmit={handleInviteTeam} className="bg-[#F5F0E6]/30 border border-[#111111]/10 p-6 rounded-2xl space-y-4 max-w-xl shadow-soft">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#111111]/60">Invite Workspace User</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/50 mb-1">Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Alex Rivera"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#111111]/10 rounded-lg focus:outline-none focus:border-[#111111] text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/50 mb-1">Corporate Email</label>
                      <input
                        type="email"
                        required
                        placeholder="alex@flowmeet.ai"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#111111]/10 rounded-lg focus:outline-none focus:border-[#111111] text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-semibold text-black/60">Select Role:</span>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="bg-white border border-[#111111]/15 rounded-lg px-2 py-1 font-bold text-xs cursor-pointer focus:outline-none"
                      >
                        <option value="MEMBER">Member (Operator)</option>
                        <option value="MANAGER">Manager (CS Lead)</option>
                        <option value="ADMIN">Admin (Executive)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#111111] text-white hover:bg-black/90 rounded-full text-xs font-semibold btn-pill transition shadow-sm"
                    >
                      Dispatch Invite
                    </button>
                  </div>
                </form>
              )}

              {/* Members table */}
              <div className="border border-[#111111]/10 rounded-[20px] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F0E6]/30 border-b border-[#111111]/10 text-[9px] font-bold text-[#111111]/50 uppercase tracking-widest">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4 text-right">Role / Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((member) => (
                      <tr key={member.id} className="border-b border-[#111111]/5 hover:bg-[#F5F0E6]/10 text-xs">
                        <td className="p-4 font-bold text-black">{member.name}</td>
                        <td className="p-4 text-[#111111]/60 font-semibold">{member.email}</td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          {user?.role !== 'ADMIN' || member.id === user?.id ? (
                            <span className="px-2 py-0.5 bg-[#F5F0E6] rounded-full font-bold text-[10px] uppercase text-[#111111]/70">
                              {member.role}
                            </span>
                          ) : (
                            <select
                              value={member.role}
                              onChange={(e) => handleChangeRole(member.id, e.target.value)}
                              className="bg-white border border-[#111111]/15 rounded px-2 py-0.5 text-[10px] font-bold cursor-pointer focus:outline-none"
                            >
                              <option value="MEMBER">MEMBER</option>
                              <option value="MANAGER">MANAGER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 5: BILLING */}
          {activeSec === 'billing' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-base mb-1 tracking-tight">SaaS Subscription Cockpit</h3>
                <p className="text-xs text-[#111111]/50 font-medium">Verify your active operational billing tire plans.</p>
              </div>

              <div className="p-6 bg-[#C8D9F7]/20 border border-[#C8D9F7]/50 rounded-2xl flex items-center justify-between gap-6 max-w-xl">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-[#111111]/50 uppercase tracking-widest">Active Plan</span>
                  <h4 className="font-extrabold text-base text-blue-900 tracking-tight">Pro Operator Suite (14-Day Trial)</h4>
                  <p className="text-xs text-[#111111]/60 leading-relaxed font-semibold">
                    Trial expires: <strong>June 12, 2026</strong>. Auto-billing set at <strong>$49 / mo</strong>.
                  </p>
                </div>
                <button
                  onClick={() => alert('Pricing checkout simulated!')}
                  className="px-5 py-3 bg-[#111111] text-white hover:bg-black/90 text-xs font-semibold rounded-full btn-pill transition shadow-md whitespace-nowrap"
                >
                  Manage Billing
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

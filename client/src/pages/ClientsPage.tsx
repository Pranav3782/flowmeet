import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Plus, User as UserIcon, Mail, Phone, Shield, Search, RefreshCw, Check, ArrowRight, Activity } from 'lucide-react';

export default function ClientsPage() {
  const token = useAuthStore((state) => state.token);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Client Form State
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('');

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setClients(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchClients();
    }
  }, [token]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !email) return;

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ companyName, contactPerson, email, phone, industry })
      });

      if (response.ok) {
        await fetchClients();
        setShowAddModal(false);
        setCompanyName('');
        setContactPerson('');
        setEmail('');
        setPhone('');
        setIndustry('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create client');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStage = async (clientId: string, nextStage: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stage: nextStage })
      });

      if (response.ok) {
        await fetchClients();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Onboarding Stages and Percentages
  const stages = [
    { id: 'MEETING_SCHEDULED', label: 'Meeting Scheduled', pct: 15, color: 'bg-[#F8D4E5]' },
    { id: 'DISCOVERY_COMPLETED', label: 'Discovery Finished', pct: 35, color: 'bg-[#C8D9F7]' },
    { id: 'DOCUMENTS_SUBMITTED', label: 'Docs Submitted', pct: 55, color: 'bg-[#F5DE74]' },
    { id: 'SETUP_STARTED', label: 'Workspace Setup', pct: 75, color: 'bg-[#B8E3A1]' },
    { id: 'TRAINING_COMPLETED', label: 'Team Trained', pct: 90, color: 'bg-[#B8E3A1]' },
    { id: 'ONBOARDING_COMPLETED', label: 'Fully Active', pct: 100, color: 'bg-emerald-500' },
  ];

  const getStageInfo = (stageId: string) => {
    return stages.find((s) => s.id === stageId) || stages[0];
  };

  const filteredClients = clients.filter(c => 
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#111111]/60" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#111111]/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Active Client CRM & Onboarding Progress</h1>
          <p className="text-xs text-[#111111]/50 mt-1 font-medium">Coordinate corporate profiles, audit onboarding velocity, and change pipelines.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="flex items-center bg-white border border-[#111111]/10 rounded-2xl px-4 py-2 w-full lg:w-64 shadow-soft">
            <Search className="w-4 h-4 text-[#111111]/30 mr-2" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs focus:outline-none w-full"
            />
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-[#111111] text-white rounded-full font-semibold hover:bg-black/90 transition text-xs flex items-center gap-1.5 shadow-md whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add CRM Client
          </button>
        </div>
      </div>

      {/* PIPELINE DASHBOARD ROW OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const count = clients.filter(c => c.onboardingStage === stage.id).length;
          return (
            <div key={stage.id} className="p-4 bg-white rounded-2xl shadow-soft border border-[#111111]/5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#111111]/55 uppercase tracking-wide leading-tight">{stage.label}</span>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-2xl font-extrabold">{count}</span>
                <span className="text-[10px] font-semibold text-[#111111]/40">{stage.pct}% Done</span>
              </div>
              <div className={`h-1.5 ${stage.color} rounded-full mt-2 w-full opacity-60`}></div>
            </div>
          );
        })}
      </div>

      {/* CLIENTS DATABASE TABLE */}
      <div className="p-8 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#111111]/5 text-[10px] font-bold text-[#111111]/45 uppercase tracking-widest pb-4">
              <th className="py-4">Company Profile</th>
              <th className="py-4">Primary Contact</th>
              <th className="py-4">Onboarding Stage / Progress</th>
              <th className="py-4">Industry / Details</th>
              <th className="py-4 text-right">Quick Pipeline Update</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-[#111111]/40 italic border-b border-[#111111]/5">
                  No registered clients match your query. Click "Add CRM Client" to create one!
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const stageInfo = getStageInfo(client.onboardingStage);
                const currentStageIndex = stages.findIndex(s => s.id === client.onboardingStage);

                return (
                  <tr key={client.id} className="border-b border-[#111111]/5 hover:bg-[#F5F0E6]/25 transition text-sm">
                    {/* Company */}
                    <td className="py-5 font-bold">
                      <div className="flex flex-col">
                        <span className="tracking-tight text-black">{client.companyName}</span>
                        <span className="text-[10px] font-medium text-[#111111]/45 mt-0.5">CRM ID: {client.id.slice(0, 8)}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-black/80">{client.contactPerson}</span>
                        <span className="text-xs text-[#111111]/50 mt-0.5">{client.email}</span>
                      </div>
                    </td>

                    {/* Onboarding stage and progress bar */}
                    <td className="py-5">
                      <div className="space-y-1.5 w-48 lg:w-60">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-black/85 text-[11px]">{stageInfo.label}</span>
                          <span className="text-[10px] text-[#111111]/50">{stageInfo.pct}%</span>
                        </div>
                        <div className="h-2 bg-[#F5F0E6] rounded-full overflow-hidden w-full">
                          <div className={`h-full ${stageInfo.color} transition-all duration-500`} style={{ width: `${stageInfo.pct}%` }}></div>
                        </div>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="py-5 font-semibold text-xs text-[#111111]/60">
                      <div className="flex flex-col">
                        <span>{client.industry || 'Tech/SaaS'}</span>
                        <span className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-0.5 font-bold">
                          <Activity className="w-3 h-3" /> Live synchronized
                        </span>
                      </div>
                    </td>

                    {/* Quick Move Button */}
                    <td className="py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      {currentStageIndex < stages.length - 1 ? (
                        <button
                          onClick={() => handleUpdateStage(client.id, stages[currentStageIndex + 1].id)}
                          className="px-3.5 py-1.5 bg-[#111111] text-white hover:bg-black/90 rounded-full text-xs font-semibold transition inline-flex items-center gap-1 shadow-sm btn-pill"
                        >
                          Next Step <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="px-3.5 py-1.5 bg-[#B8E3A1] text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Fully Onboarded
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-premium overflow-hidden border border-[#111111]/15 animate-fade-in p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#111111]/10">
              <h3 className="font-extrabold text-lg">Register New Client CRM Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-xl font-bold text-[#111111]/50 hover:text-black">&times;</button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="Globex Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="Hank Scorpio"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Industry Segment</label>
                  <input
                    type="text"
                    placeholder="Energy & Utilities"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Corporate Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="scorpio@globex.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                  />
                  <Mail className="w-4 h-4 text-[#111111]/30 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="+1 (555) 987-6543"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                  />
                  <Phone className="w-4 h-4 text-[#111111]/30 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-[#111111]/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 border border-[#111111]/15 rounded-full font-semibold hover:bg-black/5 transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 bg-[#111111] text-white rounded-full font-semibold hover:bg-black/90 transition text-xs btn-pill"
                >
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

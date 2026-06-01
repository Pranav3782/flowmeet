import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Calendar, Search, RefreshCw, FileText, CheckCircle, AlertTriangle, HelpCircle, Check, ArrowRight, User as UserIcon } from 'lucide-react';

export default function SummariesPage() {
  const token = useAuthStore((state) => state.token);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSummary, setSelectedSummary] = useState<any>(null);

  const fetchSummaries = async () => {
    try {
      const response = await fetch('/api/summaries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSummaries(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSummaries();
    }
  }, [token]);

  const filteredSummaries = summaries.filter(s => 
    s.meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.meeting.client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const parseJsonList = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr) || [];
    } catch (e) {
      return [];
    }
  };

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
          <h1 className="text-3xl font-extrabold tracking-tight">AI Executive Meeting Summaries</h1>
          <p className="text-xs text-[#111111]/50 mt-1 font-medium font-sans">Search and browse historical meeting records compiled and extracted automatically by FlowMeet AI.</p>
        </div>

        {/* Search bar */}
        <div className="flex items-center bg-white border border-[#111111]/10 rounded-2xl px-4 py-2 w-full lg:w-72 shadow-soft">
          <Search className="w-4 h-4 text-[#111111]/30 mr-2" />
          <input
            type="text"
            placeholder="Search AI records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs focus:outline-none w-full"
          />
        </div>
      </div>

      {/* CORE DETAILS SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: LIST INDEX (5 COLS) */}
        <div className="lg:col-span-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {filteredSummaries.length === 0 ? (
            <div className="py-12 bg-white rounded-[24px] border border-dashed border-[#111111]/10 text-center text-xs text-[#111111]/45">
              No completed summaries recorded. Complete a scheduled call to trigger AI synthesis!
            </div>
          ) : (
            filteredSummaries.map((summary) => (
              <div
                key={summary.id}
                onClick={() => setSelectedSummary(summary)}
                className={`p-5 rounded-[24px] border transition cursor-pointer text-left ${
                  selectedSummary?.id === summary.id
                    ? 'border-[#111111] bg-black/[0.015] shadow-premium'
                    : 'border-[#111111]/5 bg-white shadow-soft hover:border-[#111111]/15'
                }`}
              >
                <div className="flex items-center justify-between mb-3.5">
                  <span className="px-2 py-0.5 bg-[#F8D4E5] rounded-full text-[9px] font-extrabold uppercase tracking-wide">
                    {summary.meeting.meetingType}
                  </span>
                  <span className="text-[10px] font-semibold text-[#111111]/40 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(summary.meeting.date).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm mb-1.5 text-black tracking-tight">{summary.meeting.title}</h3>
                <p className="text-xs text-[#111111]/55 leading-relaxed line-clamp-2 mb-3">{summary.summary}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-[#111111]/5 text-[10px] font-bold text-[#111111]/50">
                  <span>Client: <strong>{summary.meeting.client.companyName}</strong></span>
                  <span className="text-xs text-[#111111]/80 hover:underline flex items-center gap-0.5">Details &rarr;</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: RICH COMPILER DRAWER (7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-[24px] shadow-soft border border-[#111111]/5 p-8 min-h-[50vh] flex flex-col justify-center">
          {!selectedSummary ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#F8D4E5]/45 text-[#111111] flex items-center justify-center mx-auto text-xl">⚡</div>
              <h3 className="font-bold text-sm">Select AI Call Summary</h3>
              <p className="text-xs text-[#111111]/45 max-w-xs mx-auto leading-relaxed">
                Click any summary index card on the left panel to review full executive outlines, decisions, risks, and extracted action items.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Heading */}
              <div className="border-b border-[#111111]/10 pb-5">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#111111] bg-[#F8D4E5] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 fill-current" /> AI Synthesized Record
                  </span>
                  <span className="text-xs font-semibold text-[#111111]/50">
                    Duration: {selectedSummary.meeting.duration} min
                  </span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight mb-2">{selectedSummary.meeting.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#111111]/50">
                  <span>Date: <strong>{new Date(selectedSummary.meeting.date).toLocaleDateString()}</strong></span>
                  <span>Time: <strong>{selectedSummary.meeting.startTime}</strong></span>
                  <span>Client: <strong>{selectedSummary.meeting.client.companyName} ({selectedSummary.meeting.client.contactPerson})</strong></span>
                </div>
              </div>

              {/* Section 1: Executive Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#111111]/45 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#111111]" /> Executive Summary
                </h4>
                <p className="text-sm text-black/85 leading-relaxed bg-[#F5F0E6]/30 p-4 rounded-2xl border border-[#111111]/5">
                  {selectedSummary.summary}
                </p>
              </div>

              {/* Grid block for Discussion Points & Decisions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Discussion Points */}
                <div className="space-y-3 bg-[#F5F0E6]/10 p-5 rounded-2xl border border-[#111111]/5">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#111111]/45">Discussion Core</h4>
                  <ul className="space-y-2 text-xs leading-relaxed text-black/80 list-disc pl-4">
                    {parseJsonList(selectedSummary.discussion).map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Decisions Made */}
                <div className="space-y-3 bg-[#B8E3A1]/10 p-5 rounded-2xl border border-[#B8E3A1]/35">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Decisions Made
                  </h4>
                  <ul className="space-y-2 text-xs leading-relaxed text-emerald-950 pl-1">
                    {parseJsonList(selectedSummary.decisions).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-700 font-bold mt-0.5">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Grid block for Risks & Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Risks Flagged */}
                <div className="space-y-3 bg-[#F8D4E5]/15 p-5 rounded-2xl border border-[#F8D4E5]/35">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Risks Flagged
                  </h4>
                  <ul className="space-y-2 text-xs leading-relaxed text-rose-950 pl-1">
                    {parseJsonList(selectedSummary.risks).length === 0 ? (
                      <li className="text-[#111111]/45 italic">No risks identified on this call.</li>
                    ) : (
                      parseJsonList(selectedSummary.risks).map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-700 font-bold mt-0.5">&bull;</span> {item}
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Questions Raised */}
                <div className="space-y-3 bg-[#F5DE74]/10 p-5 rounded-2xl border border-[#F5DE74]/35">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" /> Questions Raised
                  </h4>
                  <ul className="space-y-2 text-xs leading-relaxed text-amber-950 pl-1">
                    {parseJsonList(selectedSummary.questions).length === 0 ? (
                      <li className="text-[#111111]/45 italic">No outstanding questions flagged.</li>
                    ) : (
                      parseJsonList(selectedSummary.questions).map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-700 font-bold mt-0.5">?</span> {item}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* Next Steps / Auto-Extracted Tasks */}
              <div className="space-y-3 bg-[#C8D9F7]/10 p-5 rounded-2xl border border-[#C8D9F7]/35">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-blue-800 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4" /> Next Steps & Extracted Action Items
                </h4>
                <div className="space-y-2 text-xs text-blue-950 pl-1">
                  {parseJsonList(selectedSummary.nextSteps).map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2.5 p-2 bg-white/70 rounded-lg border border-[#C8D9F7]/20 shadow-sm">
                      <div className="w-4 h-4 rounded-full bg-[#C8D9F7] text-[#111111] font-bold flex items-center justify-center text-[10px]">
                        {i + 1}
                      </div>
                      <span className="font-semibold">{item}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-[#B8E3A1] px-1.5 py-0.5 rounded ml-auto">
                        Kanban Task Created
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

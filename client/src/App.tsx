import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Page Imports
import LandingPage from './pages/LandingPage';
import AuthPages from './pages/AuthPages';
import DashboardPage from './pages/DashboardPage';
import MeetingsPage from './pages/MeetingsPage';
import TasksPage from './pages/TasksPage';
import ClientsPage from './pages/ClientsPage';
import SummariesPage from './pages/SummariesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

// Icon Imports
import { 
  LayoutDashboard, Calendar, Users, CheckSquare, Sparkles, 
  BarChart3, Bell, Settings, LogOut, Search, Clock, 
  Menu, X, Shield, ChevronDown 
} from 'lucide-react';

export default function App() {
  const { isAuthenticated, user, token, logout } = useAuthStore();
  const [currentView, setCurrentView] = useState('landing');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch real in-app notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
      fetchNotifications();
      // Poll notifications every 10 seconds for simulated real-time updates
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    } else {
      // If logout occurred, return to landing
      if (currentView !== 'login' && currentView !== 'register' && currentView !== 'forgot') {
        setCurrentView('landing');
      }
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setCurrentView('landing');
    setShowProfileDropdown(false);
  };

  const handleMarkNotifRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  // Sidebar Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'calendar', label: 'Calendar Connect', icon: Calendar }, // unified calendar view
    { id: 'clients', label: 'Clients CRM', icon: Users },
    { id: 'onboarding', label: 'Onboarding Pipeline', icon: Users }, // maps to clients CRM view
    { id: 'tasks', label: 'Tasks Kanban', icon: CheckSquare },
    { id: 'summaries', label: 'AI Summaries', icon: Sparkles },
    { id: 'analytics', label: 'Analytics Cockpit', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  // UNAUTHENTICATED GUEST FLOW
  if (!isAuthenticated) {
    if (currentView === 'landing') {
      return <LandingPage onNavigate={setCurrentView} />;
    }
    if (['login', 'register', 'forgot', 'verify'].includes(currentView)) {
      return <AuthPages initialScreen={currentView as any} onNavigate={setCurrentView} />;
    }
  }

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  // AUTHENTICATED WORKSPACE FLOW
  return (
    <div className="min-h-screen bg-[#F5F0E6] text-[#111111] flex selection:bg-[#F8D4E5] font-sans">
      
      {/* 1. SIDEBAR (sleek dark theme #111111 replicating mockup) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#111111] text-white p-6 justify-between shrink-0 border-r border-[#111111]/5 sticky top-0 h-screen">
        <div className="space-y-8 flex flex-col min-h-0 flex-1 mb-6">
          {/* Logo Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white text-[#111111] rounded-xl flex items-center justify-center font-extrabold text-lg">⚡</div>
            <span className="font-extrabold text-xl tracking-tight">FlowMeet <span className="text-[10px] bg-[#F8D4E5] text-[#111111] px-1.5 py-0.5 rounded font-black uppercase">AI</span></span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
            <span className="block text-[10px] font-bold text-white/30 uppercase tracking-widest pl-4 mb-3">WORKSPACE OPERATIONS</span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                  }}
                  className={`w-full sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span className="font-medium text-xs tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Settings & Logout */}
        <div className="space-y-3 pt-6 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-[#F8D4E5]">
              {user?.name[0] || 'U'}
            </div>
            <div className="truncate">
              <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
              <span className="text-[9px] text-white/40 block truncate uppercase font-bold">{user?.role}</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 rounded-full transition"
          >
            <LogOut className="w-4.5 h-4.5 text-rose-400" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#111111] text-white px-6 flex items-center justify-between z-40 border-b border-white/5 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-[#111111] rounded-lg flex items-center justify-center font-extrabold text-base">⚡</div>
          <span className="font-bold text-lg">FlowMeet AI</span>
        </div>
        <button 
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
        >
          {showMobileSidebar ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE SIDEBAR DRAWBAR */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 bg-[#111111] z-30 pt-20 px-6 flex flex-col justify-between pb-8">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setShowMobileSidebar(false);
                  }}
                  className={`w-full sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span className="font-bold text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-full text-white/80 font-bold transition"
          >
            <LogOut className="w-4.5 h-4.5 text-rose-400" /> Sign Out
          </button>
        </div>
      )}

      {/* 2. MAIN COCKPIT AREA */}
      <main className="flex-1 flex flex-col min-h-screen pt-16 lg:pt-0 overflow-x-hidden">
        
        {/* TOP NAVBAR CONTAINER */}
        <header className="h-16 bg-white/40 border-b border-[#111111]/5 px-6 lg:px-10 flex items-center justify-between shrink-0">
          
          {/* Breadcrumb Info */}
          <div className="hidden sm:flex items-center gap-2.5 text-xs font-semibold text-[#111111]/45">
            <span>Workspace</span>
            <span>&bull;</span>
            <span className="text-black font-bold capitalize">{currentView.replace(/-/g, ' ')}</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            
            {/* Real-time Notifications Bell Widget */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowProfileDropdown(false); }}
                className="p-2 hover:bg-black/5 rounded-full text-[#111111]/70 transition relative"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Dropdown */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-[20px] shadow-premium border border-[#111111]/15 z-50 p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-[#111111]/5 pb-2.5">
                    <h4 className="font-extrabold text-sm tracking-tight">Recent Notifications</h4>
                    {unreadNotifCount > 0 && (
                      <button 
                        onClick={handleMarkNotifRead}
                        className="text-[10px] font-bold text-emerald-700 bg-[#B8E3A1]/40 px-2 py-0.5 rounded-full"
                      >
                        Mark all Read
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-center text-[#111111]/40 py-6">No notifications recorded.</p>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div key={notif.id} className={`p-3 rounded-xl border text-xs space-y-1 transition ${
                          notif.read ? 'bg-[#F5F0E6]/10 border-[#111111]/5' : 'bg-[#F8D4E5]/10 border-[#F8D4E5]/40'
                        }`}>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-black">{notif.title}</span>
                            <span className="text-[9px] text-[#111111]/40">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[#111111]/65 leading-relaxed font-semibold">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Droplist */}
            <div className="relative">
              <button 
                onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifDropdown(false); }}
                className="flex items-center gap-2 p-1 px-3 hover:bg-black/5 rounded-full transition text-xs font-semibold cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold">
                  {user?.name[0] || 'U'}
                </div>
                <span className="hidden md:inline text-black font-bold">{user?.name}</span>
                <ChevronDown className="w-4 h-4 text-[#111111]/40" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-[20px] shadow-premium border border-[#111111]/15 z-50 p-2 animate-fade-in font-semibold text-xs text-[#111111]/70">
                  <button 
                    onClick={() => { setCurrentView('settings'); setShowProfileDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-black/5 rounded-xl transition"
                  >
                    My Settings
                  </button>
                  <button 
                    onClick={() => { setCurrentView('dashboard'); setShowProfileDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-black/5 rounded-xl transition"
                  >
                    Cockpit Dashboard
                  </button>
                  <div className="border-t border-[#111111]/5 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    Logout Session
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ACTIVE COCKPIT CONTENT (Spacious Generous Layout padding) */}
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full pb-20">
          
          {currentView === 'dashboard' && <DashboardPage onNavigate={setCurrentView} />}
          {currentView === 'meetings' && <MeetingsPage />}
          {(currentView === 'clients' || currentView === 'onboarding') && <ClientsPage />}
          {currentView === 'tasks' && <TasksPage />}
          {currentView === 'summaries' && <SummariesPage />}
          {currentView === 'analytics' && <AnalyticsPage />}
          {(currentView === 'settings' || currentView === 'calendar') && (
            <SettingsPage initialTab={currentView === 'calendar' ? 'calendar' : 'profile'} />
          )}

        </div>
      </main>

    </div>
  );
}

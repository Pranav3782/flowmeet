import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Mail, Lock, User as UserIcon, Shield, ArrowLeft, Check, AlertCircle } from 'lucide-react';

interface AuthPagesProps {
  initialScreen?: 'login' | 'register' | 'forgot' | 'verify';
  onNavigate: (view: string) => void;
}

export default function AuthPages({ initialScreen = 'login', onNavigate }: AuthPagesProps) {
  const [screen, setScreen] = useState<'login' | 'register' | 'forgot' | 'verify'>(initialScreen);
  const loginStore = useAuthStore((state) => state.login);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        loginStore(data.token, data.user);
        onNavigate('dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          organizationName: organization,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        loginStore(data.token, data.user);
        setScreen('verify');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    setLoading(true);
    // Simulate high fidelity Google OAuth logic
    setTimeout(() => {
      loginStore('mock-google-jwt-token-2026', {
        id: 'google-user-id',
        name: 'Sarah Jenkins',
        email: 'sarah.j@flowmeet.ai',
        role: 'ADMIN',
      });
      setLoading(false);
      onNavigate('dashboard');
    }, 1200);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Simulated password reset email sent successfully! Please check your spam inbox.');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center p-6 selection:bg-[#F8D4E5] font-sans">
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-premium border border-[#111111]/5 overflow-hidden animate-fade-in p-8 md:p-10 relative">
        
        {/* Floating Accent Background Blur */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#F8D4E5]/45 rounded-full blur-2xl"></div>

        {/* Back Link */}
        <button 
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-1.5 text-xs text-[#111111]/50 hover:text-[#111111] transition mb-6 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>

        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#111111] text-[#F8D4E5] rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-3 shadow-md">⚡</div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {screen === 'login' && 'Sign In to FlowMeet AI'}
            {screen === 'register' && 'Create Your CS Workspace'}
            {screen === 'forgot' && 'Reset Password'}
            {screen === 'verify' && 'Verify Email Address'}
          </h2>
          <p className="text-xs text-[#111111]/50 mt-1.5 leading-relaxed">
            {screen === 'login' && 'Access your meeting operations cockpit.'}
            {screen === 'register' && 'Turn your client scheduled bookings into action items.'}
            {screen === 'forgot' && 'Enter your registered corporate email.'}
            {screen === 'verify' && 'Almost there! Verify your credentials.'}
          </p>
        </div>

        {/* ERROR BOX */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-start gap-2 border border-red-100 animate-fade-in font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* SUCCESS BOX */}
        {successMsg && (
          <div className="mb-5 p-3.5 bg-[#B8E3A1]/30 text-emerald-800 text-xs rounded-xl flex items-start gap-2 border border-[#B8E3A1]/40 animate-fade-in font-medium">
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SCREEN 1: LOGIN */}
        {screen === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                />
                <Mail className="w-4 h-4 text-[#111111]/30 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60">Password</label>
                <button 
                  type="button"
                  onClick={() => { setScreen('forgot'); setError(''); setSuccessMsg(''); }}
                  className="text-[11px] font-semibold text-[#111111]/50 hover:text-black hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                />
                <Lock className="w-4 h-4 text-[#111111]/30 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#111111] text-white rounded-xl font-semibold hover:bg-black/90 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-6"
            >
              {loading ? 'Authenticating...' : 'Sign In with Email'}
            </button>

            {/* SEPARATOR */}
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-[#111111]/10"></div>
              <span className="flex-shrink mx-4 text-[10px] uppercase font-bold tracking-wider text-[#111111]/35">Or continue with</span>
              <div className="flex-grow border-t border-[#111111]/10"></div>
            </div>

            {/* GOOGLE SIGN IN */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 bg-white border border-[#111111]/15 rounded-xl font-semibold hover:bg-[#111111]/5 transition disabled:opacity-50 flex items-center justify-center gap-2.5 text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.186 4.114-3.58 0-6.49-2.91-6.49-6.49s2.91-6.49 6.49-6.49c1.56 0 2.98.55 4.11 1.48l3.07-3.07C18.66 1.47 15.65 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.76 0 12.24-5.48 12.24-12.24 0-.82-.07-1.62-.2-2.395H12.24z"/>
              </svg>
              Sign In with Google
            </button>

            <p className="text-center text-xs text-[#111111]/50 mt-6 font-medium">
              Don't have a workspace?{' '}
              <button 
                type="button" 
                onClick={() => { setScreen('register'); setError(''); setSuccessMsg(''); }}
                className="font-bold text-[#111111] hover:underline"
              >
                Sign Up Free
              </button>
            </p>
          </form>
        )}

        {/* SCREEN 2: REGISTER */}
        {screen === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                />
                <UserIcon className="w-4 h-4 text-[#111111]/30 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Corporate Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="sarah.j@flowmeet.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                />
                <Mail className="w-4 h-4 text-[#111111]/30 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Company / Organization</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="FlowMeet AI Corp"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                />
                <Shield className="w-4 h-4 text-[#111111]/30 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                  />
                  <Lock className="w-4 h-4 text-[#111111]/30 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Workspace Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-3 bg-white border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm font-semibold cursor-pointer"
                >
                  <option value="MEMBER">Member (Operator)</option>
                  <option value="MANAGER">Manager (CS Lead)</option>
                  <option value="ADMIN">Admin (Executive)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#111111] text-white rounded-xl font-semibold hover:bg-black/90 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-6"
            >
              {loading ? 'Creating Workspace...' : 'Register Workspace'}
            </button>

            {/* SEPARATOR */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#111111]/10"></div>
              <span className="flex-shrink mx-4 text-[10px] uppercase font-bold tracking-wider text-[#111111]/35">Or registration via</span>
              <div className="flex-grow border-t border-[#111111]/10"></div>
            </div>

            {/* GOOGLE SIGN IN */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 bg-white border border-[#111111]/15 rounded-xl font-semibold hover:bg-[#111111]/5 transition disabled:opacity-50 flex items-center justify-center gap-2.5 text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.186 4.114-3.58 0-6.49-2.91-6.49-6.49s2.91-6.49 6.49-6.49c1.56 0 2.98.55 4.11 1.48l3.07-3.07C18.66 1.47 15.65 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.76 0 12.24-5.48 12.24-12.24 0-.82-.07-1.62-.2-2.395H12.24z"/>
              </svg>
              Sign Up with Google
            </button>

            <p className="text-center text-xs text-[#111111]/50 mt-6 font-medium">
              Already have a workspace?{' '}
              <button 
                type="button" 
                onClick={() => { setScreen('login'); setError(''); setSuccessMsg(''); }}
                className="font-bold text-[#111111] hover:underline"
              >
                Sign In Instead
              </button>
            </p>
          </form>
        )}

        {/* SCREEN 3: FORGOT PASSWORD */}
        {screen === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Registered Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                />
                <Mail className="w-4 h-4 text-[#111111]/30 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#111111] text-white rounded-xl font-semibold hover:bg-black/90 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-6"
            >
              {loading ? 'Verifying...' : 'Request Reset Link'}
            </button>

            <p className="text-center text-xs text-[#111111]/50 mt-6 font-medium">
              Remember your password?{' '}
              <button 
                type="button" 
                onClick={() => { setScreen('login'); setError(''); setSuccessMsg(''); }}
                className="font-bold text-[#111111] hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          </form>
        )}

        {/* SCREEN 4: VERIFY EMAIL */}
        {screen === 'verify' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-[#B8E3A1]/35 text-emerald-800 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-6">✓</div>
            <h3 className="text-2xl font-extrabold tracking-tight mb-2">Registration Complete!</h3>
            <p className="text-sm text-[#111111]/60 max-w-sm mx-auto mb-8 leading-relaxed">
              We have successfully dispatched a verification code to <strong>{email}</strong>. 
              Please verify your email address to unlock all customer operations modules.
            </p>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-3.5 bg-[#111111] text-white rounded-full font-semibold hover:bg-black/90 transition text-sm flex items-center gap-2 mx-auto btn-pill shadow-lg"
            >
              Go to Workspace Dashboard <Check className="w-4.5 h-4.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

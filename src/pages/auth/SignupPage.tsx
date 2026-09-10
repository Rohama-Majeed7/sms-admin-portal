import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Building2 } from 'lucide-react';
import { signUp } from '../../apis/auth/auth.service';

const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await signUp(fullName, email, password);
      localStorage.setItem('isVerified', 'false');
      navigate('/verify-email', { state: { email } });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.22) 0%, rgba(15,23,42,0.98) 65%, #020617 100%)',
        padding: '1.25rem'
      }}
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-[-10%] left-[25%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[25%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Auth Card Container */}
      <div
        className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-indigo-500/20 rounded-3xl shadow-2xl shadow-slate-950 flex flex-col gap-6 z-20 my-auto"
        style={{ padding: '2.25rem 2rem' }}
      >
        {/* Card Header & Icon */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3 shadow-inner p-3">
            <Building2 className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create an Account</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Sign up to get started with your school management portal.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 animate-pulse" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Name Field */}
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 absolute left-4 text-slate-400 pointer-events-none z-10" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Sarah Mitchell"
                required
                style={{ paddingLeft: '3rem', paddingRight: '1rem', paddingTop: '0.85rem', paddingBottom: '0.85rem' }}
                className="w-full bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 absolute left-4 text-slate-400 pointer-events-none z-10" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                style={{ paddingLeft: '3rem', paddingRight: '1rem', paddingTop: '0.85rem', paddingBottom: '0.85rem' }}
                className="w-full bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 absolute left-4 text-slate-400 pointer-events-none z-10" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingLeft: '3rem', paddingRight: '3rem', paddingTop: '0.85rem', paddingBottom: '0.85rem' }}
                className="w-full bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-200 transition p-1.5 rounded-lg hover:bg-slate-800/60 z-10 cursor-pointer"
                aria-label="Toggle Password Visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{ paddingTop: '0.9rem', paddingBottom: '0.9rem' }}
            className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign Up <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Redirect Link */}
        <p className="text-center text-xs sm:text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

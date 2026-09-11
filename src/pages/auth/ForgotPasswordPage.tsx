import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  ArrowRight,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  RotateCw,
  AlertCircle,
} from 'lucide-react';
import {
  sendOtp,
  verifyOtp,
  resetPassword,
} from '../../apis/auth/auth.service';

type Step = 'email' | 'otp' | 'reset';

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<Step>('email');

  // Step 1 – Email
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Step 2 – OTP
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(120);

  // Step 3 – New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Shared
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // OTP countdown timer
  useEffect(() => {
    if (step !== 'otp') return;
    if (resendTimer <= 0) return;

    const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your work email address.');
      return;
    }

    setEmailLoading(true);

    try {
      await sendOtp(email.trim());
      setResendTimer(120);
      setStep('otp');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to send verification code. Please check your email.',
      );
    } finally {
      setEmailLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResend = async () => {
    if (resendTimer > 0 || resendLoading) return;

    setError('');
    setResendLoading(true);

    try {
      await sendOtp(email.trim());
      setResendTimer(120);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  // OTP Handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pasted)) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the code.');
      return;
    }

    setOtpLoading(true);

    try {
      await verifyOtp(email.trim(), code);
      setStep('reset');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Invalid or expired code. Please try again.',
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setResetLoading(true);

    try {
      await resetPassword(email.trim(), newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to reset password. Please try again.',
      );
    } finally {
      setResetLoading(false);
    }
  };

  const stepsList: { key: Step; label: string; num: number }[] = [
    { key: 'email', label: 'Email', num: 1 },
    { key: 'otp', label: 'Verify Code', num: 2 },
    { key: 'reset', label: 'New Password', num: 3 },
  ];

  const currentStepNum = step === 'email' ? 1 : step === 'otp' ? 2 : 3;

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 text-white items-center justify-center shadow-md shadow-indigo-600/20 mb-1">
            <KeyRound size={24} strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            Recover administrator access to your School Management Portal.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-6">
          {/* Progress Stepper */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            {stepsList.map((s, idx) => (
              <React.Fragment key={s.key}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStepNum > s.num
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : currentStepNum === s.num
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {currentStepNum > s.num ? <CheckCircle2 size={14} /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      currentStepNum === s.num
                        ? 'text-slate-900 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full ${
                      currentStepNum > idx + 1 ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm animate-in fade-in"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success ? (
            <div className="text-center py-6 space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={26} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Password Reset Complete!</h2>
              <p className="text-xs text-slate-500">
                Your password has been successfully updated. Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <>
              {/* STEP 1: Enter Email */}
              {step === 'email' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reset-email"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    >
                      Administrator Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        id="reset-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@school.edu"
                        className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      We will send a 6-digit security code to this address.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                  >
                    {emailLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Security Code</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Verify 6-digit OTP */}
              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-2 text-center">
                    <p className="text-xs text-slate-500">
                      We sent a 6-digit code to <strong className="text-slate-800">{email}</strong>
                    </p>
                    <div className="flex justify-center gap-2 sm:gap-2.5 pt-2" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            inputRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-11 h-12 text-center text-lg font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend Action & Timer */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>
                      Code expires in: <strong className="text-slate-700">{formatTimer(resendTimer)}</strong>
                    </span>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || resendLoading}
                      onClick={handleResend}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold disabled:text-slate-300 disabled:cursor-not-allowed inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw size={12} className={resendLoading ? 'animate-spin' : ''} />
                      <span>Resend Code</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                  >
                    {otpLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 3: Enter New Password */}
              {step === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="new-pwd"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        id="new-pwd"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full h-11 pl-10 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirm-pwd"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        id="confirm-pwd"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your new password"
                        className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                  >
                    {resetLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Password</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Back to Login Link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>

        {/* Security Note */}
        <p className="text-center text-xs text-slate-400">
          School Management System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  MailCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RotateCw,
  AlertCircle,
} from 'lucide-react';
import { sendOtp, verifyOtp } from '../../apis/auth/auth.service';

const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const emailFromState =
    (location.state as { email?: string })?.email || '';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(120);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Auto-send OTP when page loads if email is passed
  useEffect(() => {
    if (emailFromState) {
      sendOtp(emailFromState).catch(() => {
        // OTP may have already been dispatched by signup — ignore
      });
    }
  }, [emailFromState]);

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || resendLoading) return;

    setError('');
    setResendLoading(true);

    try {
      await sendOtp(emailFromState);
      setResendTimer(120);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to resend verification code. Please try again.',
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);

    try {
      await verifyOtp(emailFromState, code);

      // Mark email as verified locally
      localStorage.setItem('isVerified', 'true');
      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Invalid or expired code. Please request a new one.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 text-white items-center justify-center shadow-md shadow-indigo-600/20 mb-1">
            <MailCheck size={24} strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            {emailFromState ? (
              <>
                A 6-digit code has been sent to{' '}
                <strong className="text-slate-800 font-semibold">{emailFromState}</strong>
              </>
            ) : (
              'Enter the 6-digit verification code sent to your registered email.'
            )}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-6">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm animate-in fade-in"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-6 space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={26} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Email Verified Successfully!</h2>
              <p className="text-xs text-slate-500">
                Your institutional account is now verified. Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 6-Digit OTP Inputs */}
              <div className="space-y-2 text-center">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Security Code
                </label>
                <div
                  className="flex justify-center gap-2 sm:gap-2.5 pt-1"
                  onPaste={handlePaste}
                >
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
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Resend and Timer Bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  Code expires in:{' '}
                  <strong className="text-slate-700 font-semibold">
                    {formatTimer(resendTimer)}
                  </strong>
                </span>
                <button
                  type="button"
                  disabled={resendTimer > 0 || resendLoading}
                  onClick={handleResendCode}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold disabled:text-slate-300 disabled:cursor-not-allowed inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw
                    size={12}
                    className={resendLoading ? 'animate-spin' : ''}
                  />
                  <span>Resend Code</span>
                </button>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Continue</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
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

        {/* Security Trust Note */}
        <p className="text-center text-xs text-slate-400">
          School Management System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

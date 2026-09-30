import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  AlertCircle,
} from "lucide-react";
import { login } from "../../apis/auth/auth.service";
import { validateEmail, validatePassword } from "../../utils/validation";

interface FieldErrors {
  email?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const navigate = useNavigate();

  const hasActiveSchool = () => {
    const user = localStorage.getItem("user") || undefined;
    const schoolStatus = user ? JSON.parse(user).schoolAdmin?.status : null;
    if (schoolStatus === "PENDING") {
      return false;
    }
    if (schoolStatus === "INACTIVE") {
      return false;
    }
    return schoolStatus;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errors: FieldErrors = {};

    const emailValidation = validateEmail(email, "Work Email Address");
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }

    const passwordValidation = validatePassword(password, "Password");
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    try {
      setLoading(true);
      const res = await login(email.trim(), password);
      // localStorage.setItem('isVerified', JSON.stringify(res?.data?.isVerified));
      localStorage.setItem("user", JSON.stringify(res?.data));
      if (res?.data?.isVerified === false) {
        navigate("/verify-email", { state: { email: email.trim() } });
        return;
      }
      if (hasActiveSchool()) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed. Please check your credentials.");
      if (err?.response?.data?.message?.includes("not verified")) {
        setTimeout(() => {
          navigate("/verify-email", { state: { email: email.trim() } });
        }, 1000);
      }
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
            <Shield size={24} strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Sign in to SMS Portal
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-6">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm animate-in fade-in"
            >
              <AlertCircle
                size={16}
                className="shrink-0 mt-0.5 text-rose-600"
              />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Work Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="admin@school.edu"
                  className={`w-full h-11 pl-10 pr-4 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.email
                      ? "border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="Enter your account password"
                  className={`w-full h-11 pl-10 pr-11 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.password
                      ? "border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer transition-colors"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Registration Redirect */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Don't have an account? </span>
            <Link
              to="/signup"
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Create Administrator Account
            </Link>
          </div>
        </div>

        {/* Security Trust Note */}
        <p className="text-center text-xs text-slate-400">
          Secure, encrypted School Management System &copy;{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

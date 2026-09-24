import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  User,
  Mail,
  Shield,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import type { School, SchoolStatus } from "../../types/school";

import { logout } from "../../apis/auth/auth.service";
import { createSchool, updateSchool } from "../../apis/school/school.api";
import { toast } from "react-toastify";
import { validatePakistaniMobileNumber } from "../../utils/phoneValidation";
import PakistaniPhoneInput from "../../components/shared/PakistaniPhoneInput";

const SchoolOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const adminSchool = user?.schoolAdmin || null;
  const [name, setName] = useState(adminSchool?.name || "");
  const [address, setAddress] = useState(adminSchool?.address || "");
  const [ownerName, setOwnerName] = useState(adminSchool?.ownerName || "");
  const [ownerPhone, setOwnerPhone] = useState(adminSchool?.ownerPhone || "");
  const [ownerEmail, setOwnerEmail] = useState(adminSchool?.ownerEmail || "");
  const [status, setStatus] = useState<SchoolStatus>(
    adminSchool?.status || "ACTIVE",
  );
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      adminSchool?.status === "PENDING"
    ) {
      setWarning(
        "Your school is currently pending . Please active your school to access the dashboard.",
      );
    } else if (adminSchool?.status === "INACTIVE") {
      setWarning(
        "Your school is currently inactive. Please activate your school to access the dashboard.",
      );
    } else {
      setWarning("");
    }
  }, [adminSchool]);

  const handleSignOut = async () => {
    try {
      if (user?.email) {
        await logout(user.email);
      }
    } catch {
      /* ignore */
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validations
    if (!name.trim()) {
      setError("Please provide the school name.");
      return;
    }
    if (!ownerName.trim()) {
      setError("Please provide the school owner / admin name.");
      return;
    }
    if (!ownerPhone.trim()) {
      setError("Please provide the owner mobile / phone number.");
      return;
    }

    const phoneCheck = validatePakistaniMobileNumber(ownerPhone);
    if (!phoneCheck.isValid) {
      setError(phoneCheck.error || "Please enter a valid Pakistani mobile number.");
      return;
    }

    if (!ownerEmail.trim()) {
      setError("Please provide the owner email address.");
      return;
    }

    setLoading(true);

    const schoolData: School = {
      name: name.trim(),
      address: address.trim() || undefined,
      ownerName: ownerName.trim(),
      ownerPhone: phoneCheck.formatted || ownerPhone.trim(),
      ownerEmail: ownerEmail.trim(),
      status: status,
      adminId: user?.id,
    };

    try {
      if (
        adminSchool?.status === "PENDING" ||
        adminSchool?.status === "INACTIVE"
      ) {
        const updatedSchoolData = {
          ...schoolData,
        };
        const data = await updateSchool(adminSchool.id, updatedSchoolData);
        
        if (data.success === true) {
          localStorage.setItem("user", JSON.stringify({ ...user, schoolAdmin: data.data }));
          toast.success(data.message);
          setLoading(false);
          if (data.data.status === "ACTIVE") {
            navigate("/dashboard");
            return;
          } else {
            setWarning(
              "Your school is currently pending. Please activate it to access the dashboard.",
            );
          }
        }
        return;
      }
      const data = await createSchool(schoolData);
      if (data.success === true) {
        localStorage.setItem("user", JSON.stringify({ ...user, schoolAdmin: data.data }));
        toast.success(data.message);
        setLoading(false);
        if (data.data.status === "ACTIVE") {
          navigate("/dashboard");
        } else {
          setWarning(
            "Your school is currently pending. Please activate it to access the dashboard.",
          );
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Shield size={18} strokeWidth={2.2} />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900">SMS Admin</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60">
              Onboarding
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800">
              {user?.name || "Administrator"}
            </p>
            <p className="text-[11px] text-slate-400">
              {user?.email || "admin@school.edu"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl space-y-6">
          {/* Welcome / Instruction Card */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 items-center justify-center border border-indigo-100 shadow-xs mb-1">
              <Building2 size={24} strokeWidth={2.2} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Register Your School
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Welcome to the School Management System. Please set up your
              institution details below. An <strong>Active</strong> school
              status is required to access the administrative dashboard.
            </p>
          </div>

          {warning && (
            <div
              role="alert"
              className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs sm:text-sm animate-in fade-in"
            >
              <AlertTriangle
                size={16}
                className="shrink-0 mt-0.5 text-amber-600"
              />
              <span className="leading-snug">{warning}</span>
            </div>
          )}

          {/* Form Card */}
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Institution Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Sparkles size={16} className="text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Institution Details
                  </h3>
                </div>

                {/* School Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="schoolName"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    School Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="schoolName"
                      type="text"
                      required
                      placeholder="e.g. St. Christopher International School"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Address (Optional) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="schoolAddress"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    School Address{" "}
                    <span className="text-slate-400 text-[11px] font-normal">
                      (Optional)
                    </span>
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="schoolAddress"
                      type="text"
                      placeholder="e.g. Sector F-8/4, Islamabad, Pakistan"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Owner / Contact Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User size={16} className="text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Owner & Administrative Contact
                  </h3>
                </div>

                {/* Owner Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="ownerName"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    Owner / Administrator Name{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="ownerName"
                      type="text"
                      required
                      placeholder="e.g. Muhammad Ali"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Owner Phone */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="ownerPhone"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    >
                      Owner Mobile / Phone <span className="text-rose-500">*</span>
                    </label>
                    <PakistaniPhoneInput
                      id="ownerPhone"
                      required
                      value={ownerPhone}
                      onChange={(fullPhone) => setOwnerPhone(fullPhone)}
                    />
                    <p className="text-[11px] text-slate-400">
                      +92 is persistent. Enter 10 digits (e.g. <code className="font-semibold text-slate-600">3000000000</code>).
                    </p>
                  </div>

                  {/* Owner Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="ownerEmail"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    >
                      Owner Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        id="ownerEmail"
                        type="email"
                        required
                        placeholder="owner@school.edu.pk"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    School Status <span className="text-rose-500">*</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Active status unlocks dashboard access
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Active Option */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      status === "ACTIVE"
                        ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="ACTIVE"
                      checked={status === "ACTIVE"}
                      onChange={() => setStatus("ACTIVE")}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Full immediate dashboard access
                      </p>
                    </div>
                  </label>

                  {/* Pending Option */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      status === "PENDING"
                        ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="PENDING"
                      checked={status === "PENDING"}
                      onChange={() => setStatus("PENDING")}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-amber-600" />
                        <span className="text-xs font-bold text-slate-900">
                          Pending
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Awaiting administrative approval
                      </p>
                    </div>
                  </label>

                  {/* Inactive Option */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      status === "INACTIVE"
                        ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="INACTIVE"
                      checked={status === "INACTIVE"}
                      onChange={() => setStatus("INACTIVE")}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-900">
                          Inactive
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Suspended or disabled
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Saving School...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {status === "ACTIVE"
                          ? "Complete Onboarding & Access Dashboard"
                          : "Save School Record"}
                      </span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-400">
            School Management System &copy; {new Date().getFullYear()} • Secure
            Institutional Portal
          </p>
        </div>
      </main>
    </div>
  );
};

export default SchoolOnboardingPage;

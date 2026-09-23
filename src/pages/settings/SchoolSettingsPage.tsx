import React, { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  Shield,
  Edit3,
  Check,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Info,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import type { SchoolStatus } from "../../types/school";
import { getSchoolById, updateSchool } from "../../apis/school/school.api";
import { validatePakistaniMobileNumber } from "../../utils/phoneValidation";
import PakistaniPhoneInput from "../../components/shared/PakistaniPhoneInput";

interface FormErrors {
  name?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  address?: string;
}

const SchoolSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const school =
    JSON.parse(localStorage.getItem("user") || "{}").schoolAdmin || null;
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch school details on mount (modularized for future backend GET integration)
  useEffect(() => {
    const fetchSchoolDetails = async () => {
      try {
        const data = await getSchoolById(school?.id);
        const schoolData = data?.data;
        setFormData({
          name: schoolData.name || "",
          address: schoolData.address || "",
          ownerName: schoolData.ownerName || "",
          ownerPhone: schoolData.ownerPhone || "",
          ownerEmail: schoolData.ownerEmail || "",
        });
      } catch (err) {
        console.error("Failed to fetch school details:", err);
        toast.error("An error occurred while fetching school details.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchoolDetails();
  }, []);

  const handleStartEdit = () => {
    if (!school) return;
    setFormData({
      name: school.name || "",
      address: school.address || "",
      ownerName: school.ownerName || "",
      ownerPhone: school.ownerPhone || "",
      ownerEmail: school.ownerEmail || "",
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (school) {
      // Revert back to current school data
      setFormData({
        name: school.name || "",
        address: school.address || "",
        ownerName: school.ownerName || "",
        ownerPhone: school.ownerPhone || "",
        ownerEmail: school.ownerEmail || "",
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "School name is required.";
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = "Owner / Administrator name is required.";
    }

    if (!formData.ownerPhone.trim()) {
      newErrors.ownerPhone = "Owner phone / mobile number is required.";
    } else {
      const phoneCheck = validatePakistaniMobileNumber(formData.ownerPhone);
      if (!phoneCheck.isValid) {
        newErrors.ownerPhone = phoneCheck.error;
      }
    }

    if (!formData.ownerEmail.trim()) {
      newErrors.ownerEmail = "Owner email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail.trim())) {
      newErrors.ownerEmail = "Please enter a valid email address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    // const phoneCheck = validatePakistaniMobileNumber(formData.ownerPhone);

    try {
      setIsSaving(true);

      const data = await updateSchool(school?.id, {
        name: formData.name.trim(),
        address: formData.address.trim(),
        ownerName: formData.ownerName.trim(),
        ownerPhone: formData.ownerPhone.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        status: school.status, // Preserve current status
        adminId: school.adminId, // Preserve admin ID
      });
      if (data.success === true) {
        setIsEditing(false);
        toast.success(data.message || "School details updated successfully.");
        localStorage.setItem("user", JSON.stringify({ ...JSON.parse(localStorage.getItem("user") || "{}"), schoolAdmin: data.data }));
        setFormData({
          name: data.data.name || "",
          address: data.data.address || "",
          ownerName: data.data.ownerName || "",
          ownerPhone: data.data.ownerPhone || "",
          ownerEmail: data.data.ownerEmail || "",
        });
      }
    } catch (err) {
      console.error("Failed to update school details:", err);
      toast.error("An error occurred while saving school details.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderStatusBadge = (status: SchoolStatus = "ACTIVE") => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Active</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
            <Clock size={13} className="text-amber-600" />
            <span>Pending Approval</span>
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
            <AlertCircle size={13} className="text-rose-600" />
            <span>Inactive</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="h-4 bg-slate-100 rounded-md w-1/2" />
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6">
          <div className="h-6 bg-slate-200 rounded-md w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-20 bg-slate-100 rounded-xl" />
            <div className="h-20 bg-slate-100 rounded-xl" />
            <div className="h-20 bg-slate-100 rounded-xl" />
            <div className="h-20 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link
              to="/dashboard"
              className="hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            School Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View and manage institutional credentials, contact details, and
            status.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all hover:shadow-md cursor-pointer"
            >
              <Edit3 size={15} />
              <span>Edit School Details</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={15} />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Main Content Form / View */}
      <form onSubmit={handleSave}>
        <div className="space-y-6">
          {/* Card 1: Institutional Information */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Institution Profile
                  </h2>
                  <p className="text-xs text-slate-500">
                    Primary school name and official campus location
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* School Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="schoolName"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  School Name{" "}
                  {isEditing && <span className="text-rose-500">*</span>}
                </label>
                {isEditing ? (
                  <div>
                    <div className="relative">
                      <Building2
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        id="schoolName"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. Greenwood Academy"
                        className={`w-full h-11 pl-10 pr-4 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.name
                            ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                            : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                    <Building2 size={16} className="text-slate-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {school?.name || "Not specified"}
                    </span>
                  </div>
                )}
              </div>

              {/* School Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="schoolAddress"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Address
                </label>
                {isEditing ? (
                  <div>
                    <div className="relative">
                      <MapPin
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        id="schoolAddress"
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="e.g. 104 Academic Avenue, Nairobi, Kenya"
                        className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    {errors.address && (
                      <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.address}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                    <MapPin size={16} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-800 truncate">
                      {school?.address || "No address provided"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Administrative Contact Details */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Owner & Administrative Contact
                </h2>
                <p className="text-xs text-slate-500">
                  Official representative and authorized institutional contacts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Owner Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="ownerName"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Owner Name{" "}
                  {isEditing && <span className="text-rose-500">*</span>}
                </label>
                {isEditing ? (
                  <div>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        id="ownerName"
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ownerName: e.target.value,
                          })
                        }
                        placeholder="e.g. Dr. Alex Morgan"
                        className={`w-full h-11 pl-10 pr-4 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.ownerName
                            ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                            : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                        }`}
                      />
                    </div>
                    {errors.ownerName && (
                      <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.ownerName}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                    <User size={16} className="text-slate-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {school?.ownerName || "Not specified"}
                    </span>
                  </div>
                )}
              </div>

              {/* Owner Phone */}
              <div className="space-y-1.5">
                <label
                  htmlFor="ownerPhone"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Owner Mobile / Phone{" "}
                  {isEditing && <span className="text-rose-500">*</span>}
                </label>
                {isEditing ? (
                  <div>
                    <PakistaniPhoneInput
                      id="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={(fullPhone) =>
                        setFormData({ ...formData, ownerPhone: fullPhone })
                      }
                      hasError={!!errors.ownerPhone}
                    />
                    {errors.ownerPhone ? (
                      <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.ownerPhone}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Enter 10 digits (e.g.{" "}
                        <code className="font-semibold text-slate-600">
                          3000000000
                        </code>
                        ).
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                    <Phone size={16} className="text-slate-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {school?.ownerPhone || "Not specified"}
                    </span>
                  </div>
                )}
              </div>

              {/* Owner Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="ownerEmail"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Owner Email{" "}
                  {isEditing && <span className="text-rose-500">*</span>}
                </label>
                {isEditing ? (
                  <div>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        id="ownerEmail"
                        type="email"
                        value={formData.ownerEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ownerEmail: e.target.value,
                          })
                        }
                        placeholder="admin@school.edu"
                        className={`w-full h-11 pl-10 pr-4 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.ownerEmail
                            ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                            : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                        }`}
                      />
                    </div>
                    {errors.ownerEmail && (
                      <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.ownerEmail}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                    <Mail size={16} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-800 truncate">
                      {school?.ownerEmail || "Not specified"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Status & Institutional Access (Read-Only) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Institutional Status
                </h2>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                {renderStatusBadge(school?.status)}
                <div className="text-xs text-slate-600">
                  {school?.status === "PENDING" && (
                    <span>
                      Awaiting administrative verification and activation.
                    </span>
                  )}
                  {school?.status === "INACTIVE" && (
                    <span>
                      School services are currently disabled or suspended.
                    </span>
                  )}
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium shrink-0">
                <Info size={14} className="text-slate-400" />
                <span>Status is managed system-wide</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SchoolSettingsPage;

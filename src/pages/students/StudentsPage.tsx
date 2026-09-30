import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  X,
  Mail,
  AlertCircle,
} from "lucide-react";
import type { Student, StudentStatus } from "../../types/student";
import { getSchoolById } from "../../apis/school/school.api";
import {
  validatePersonName,
  validateEmail,
  validatePakistaniMobileNumber,
  validateRequired,
} from "../../utils/validation";
import PakistaniPhoneInput from "../../components/shared/PakistaniPhoneInput";

const statusBadge = (status: StudentStatus) => {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
        <CheckCircle2 size={12} className="text-emerald-500" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <XCircle size={12} className="text-slate-400" />
      Inactive
    </span>
  );
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
};

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | StudentStatus>(
    "All",
  );
  const [classFilter, setClassFilter] = useState<string>("All");
  const school =
    JSON.parse(localStorage.getItem("user") || "{}")?.schoolAdmin || null;

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    email: "",
    phone: "",
    guardianName: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchStudents = async () => {
      const response = await getSchoolById(school?.id);
      if (response?.success) {
        const studentsData = response?.data?.users?.filter(
          (user: any) => user.role === "STUDENT",
        );
        setStudents(studentsData || []);
      }
    };
    fetchStudents();
  }, []);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    const nameRes = validatePersonName(formData.name, "Student name");
    if (!nameRes.isValid) errors.name = nameRes.error || "Invalid student name.";

    const idRes = validateRequired(formData.studentId, "Student ID");
    if (!idRes.isValid) errors.studentId = idRes.error || "Student ID is required.";

    const emailRes = validateEmail(formData.email);
    if (!emailRes.isValid) errors.email = emailRes.error || "Invalid email address.";

    const phoneRes = validatePakistaniMobileNumber(formData.phone);
    if (!phoneRes.isValid) errors.phone = phoneRes.error || "Invalid phone number.";

    const guardianRes = validatePersonName(formData.guardianName, "Guardian name");
    if (!guardianRes.isValid) errors.guardianName = guardianRes.error || "Invalid guardian name.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const newStudent: Student = {
      id: Date.now(),
      studentId: formData.studentId.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      isVerified: true,
    };

    setStudents([newStudent, ...students]);
    setFormData({
      name: "",
      studentId: "",
      email: "",
      phone: "",
      guardianName: "",
    });
    setFieldErrors({});
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Students
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View student directory, track class enrollment, and manage pupil
            profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFieldErrors({});
            setIsAddModalOpen(true);
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all hover:shadow-md cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.4} />
          <span>Add Student</span>
        </button>
      </section>

      {/* KPI Metrics */}
      {/* <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 truncate">
                  {m.label}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${m.color}`}
                >
                  <Icon size={14} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {m.value}
              </p>
            </div>
          );
        })}
      </section> */}

      {/* Search & Filter Toolbar */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by student name, ID, or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs & Class Dropdown */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            {(["All", "Active", "Inactive"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Students Table / Cards */}
      <section className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing{" "}
            <strong className="text-slate-800 font-semibold">
              {students?.length}
            </strong>{" "}
            students
          </span>
          {statusFilter !== "All" || classFilter !== "All" || search ? (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("All");
                setClassFilter("All");
                setSearch("");
              }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              Reset filters
            </button>
          ) : null}
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-5">Student Name</th>
                <th className="py-3 px-4"> Email</th>
                {/* <th className="py-3 px-4">Class & Sec</th> */}
                {/* <th className="py-3 px-4">Contact</th> */}
                {/* <th className="py-3 px-4">Gender</th> */}
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {students?.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    <GraduationCap
                      size={32}
                      className="mx-auto text-slate-300 mb-2"
                    />
                    <p className="font-semibold text-slate-700">
                      No students found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting your search criteria or active filters.
                    </p>
                  </td>
                </tr>
              ) : (
                students?.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                     <td className="py-3.5 px-4 text-xs font-mono font-medium text-slate-600">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {student?.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(student.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm leading-tight">
                            {student.name}
                          </p>
                        </div>
                      </div>
                    </td>
                   
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px]">
                            {student?.email}
                          </span>
                        </div>
                        
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {statusBadge(student?.isVerified ? "Active" : "Inactive")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {students?.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <GraduationCap
                size={32}
                className="mx-auto text-slate-300 mb-2"
              />
              <p className="font-semibold text-slate-700">No students found</p>
            </div>
          ) : (
            students?.map((student) => (
              <div key={student.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(student.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {student.name}
                      </p>
                    </div>
                  </div>
                  {statusBadge(student?.isVerified ? "Active" : "Inactive")}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">
                      Student ID:
                    </span>
                    <span className="font-mono font-semibold text-slate-800">
                      {student?.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Email:</span>
                    <span className="text-slate-700 truncate max-w-[190px]">
                      {student?.email}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Student</h3>
                <p className="text-xs text-slate-500">Register a new pupil profile with verified records</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddStudent} noValidate className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ali Ahmed"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.name
                      ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
                      : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.name}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Student ID / Roll No *
                </label>
                <input
                  type="text"
                  placeholder="e.g. STU-2024-001"
                  value={formData.studentId}
                  onChange={(e) => {
                    setFormData({ ...formData, studentId: e.target.value });
                    if (fieldErrors.studentId) setFieldErrors((prev) => ({ ...prev, studentId: "" }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.studentId
                      ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
                      : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                  }`}
                />
                {fieldErrors.studentId && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.studentId}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.email
                      ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
                      : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Pakistani Mobile Number *
                </label>
                <PakistaniPhoneInput
                  value={formData.phone}
                  onChange={(val: string) => {
                    setFormData({ ...formData, phone: val });
                    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  hasError={Boolean(fieldErrors.phone)}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tariq Ahmed"
                  value={formData.guardianName}
                  onChange={(e) => {
                    setFormData({ ...formData, guardianName: e.target.value });
                    if (fieldErrors.guardianName) setFieldErrors((prev) => ({ ...prev, guardianName: "" }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.guardianName
                      ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
                      : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                  }`}
                />
                {fieldErrors.guardianName && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.guardianName}</span>
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-indigo-600/30 cursor-pointer"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;

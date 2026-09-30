import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  X,
  Trash2,
  Edit2,
  Eye,
  Mail,
  AlertCircle,
} from "lucide-react";
import type { Teacher } from "../../types/teacher";
import { getSchoolById } from "../../apis/school/school.api";
import {
  validatePersonName,
  validateEmail,
  validatePakistaniMobileNumber,
  validateRequired,
} from "../../utils/validation";
import PakistaniPhoneInput from "../../components/shared/PakistaniPhoneInput";

const statusBadge = (status?: boolean) => {
  if (status) {
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

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | boolean>("All");
  const [subjectFilter, setSubjectFilter] = useState<string>("All");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [deleteCandidate, setDeleteCandidate] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    email: "",
    phone: "",
    subject: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const school =
    JSON.parse(localStorage.getItem("user") || "{}")?.schoolAdmin || null;
  useEffect(() => {
    const fetchStudents = async () => {
      const response = await getSchoolById(school?.id);
      if (response?.success) {
        const teachersData = response?.data?.users?.filter(
          (user: any) => user.role === "TEACHER",
        );
        setTeachers(teachersData || []);
      }
    };
    fetchStudents();
  }, []);

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ id: 0, name: "", email: "", phone: "", subject: "" });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setModalMode("edit");
    setFormData({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: (teacher as any).phone || "",
      subject: (teacher as any).subject || "",
    });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    const nameRes = validatePersonName(formData.name, "Teacher name");
    if (!nameRes.isValid) errors.name = nameRes.error || "Invalid teacher name.";

    const emailRes = validateEmail(formData.email);
    if (!emailRes.isValid) errors.email = emailRes.error || "Invalid email address.";

    const phoneRes = validatePakistaniMobileNumber(formData.phone);
    if (!phoneRes.isValid) errors.phone = phoneRes.error || "Invalid phone number.";

    const subjectRes = validateRequired(formData.subject, "Subject / Department");
    if (!subjectRes.isValid) errors.subject = subjectRes.error || "Subject is required.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (modalMode === "add") {
      const newTeacher: Teacher = {
        id: Date.now(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        isVerified: true,
      };
      setTeachers([newTeacher, ...teachers]);
    } else {
      setTeachers(
        teachers.map((t) =>
          t.id === formData.id
            ? { ...t, name: formData.name.trim(), email: formData.email.trim() }
            : t
        )
      );
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Teachers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage academic faculty, monitor course assignments, and maintain
            instructor records.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all hover:shadow-md cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.4} />
          <span>Add Teacher</span>
        </button>
      </section>

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
            placeholder="Search by name, email, or subject..."
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

        {/* Status Filter Tabs & Subject Dropdown */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            {(["All", "Active", "Inactive"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setStatusFilter(
                    status === "All" ? "All" : status === "Active",
                  )
                }
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

      {/* Teachers Table / Cards */}
      <section className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing{" "}
            <strong className="text-slate-800 font-semibold">
              {teachers?.length}
            </strong>{" "}
            teachers
          </span>
          {statusFilter !== "All" || subjectFilter !== "All" || search ? (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("All");
                setSubjectFilter("All");
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
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {teachers?.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    <Users size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">
                      No teachers found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting your search criteria or active filters.
                    </p>
                  </td>
                </tr>
              ) : (
                teachers?.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(teacher.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm leading-tight">
                            {teacher.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px]">
                            {teacher.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {statusBadge(teacher?.isVerified)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingTeacher(teacher)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(teacher)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Teacher"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(teacher)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Teacher"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {teachers?.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Users size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No teachers found</p>
            </div>
          ) : (
            teachers?.map((teacher) => (
              <div key={teacher.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(teacher.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {teacher.name}
                      </p>
                      <p className="text-xs text-slate-500">{teacher.email}</p>
                    </div>
                  </div>
                  {statusBadge(teacher?.isVerified)}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openEditModal(teacher)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteCandidate(teacher)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Add / Edit Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {modalMode === "add" ? "Add New Teacher" : "Edit Teacher Profile"}
                </h3>
                <p className="text-xs text-slate-500">
                  {modalMode === "add"
                    ? "Register an academic faculty member into the institution"
                    : "Update instructor records and departmental details"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleTeacherSubmit} noValidate className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Teacher Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Asim Qureshi"
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
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="teacher@example.com"
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
                  Subject / Department *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, subject: e.target.value });
                    if (fieldErrors.subject) setFieldErrors((prev) => ({ ...prev, subject: "" }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.subject
                      ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
                      : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                  }`}
                />
                {fieldErrors.subject && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.subject}</span>
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-indigo-600/30 cursor-pointer"
                >
                  {modalMode === "add" ? "Save Teacher" : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Remove Teacher?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong className="text-slate-800">{deleteCandidate.name}</strong> from the faculty directory?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeachers(teachers.filter((t) => t.id !== deleteCandidate.id));
                  setDeleteCandidate(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs shadow-rose-600/30 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Teacher Details Modal */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Teacher Details</h3>
              <button
                type="button"
                onClick={() => setViewingTeacher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center shrink-0">
                {getInitials(viewingTeacher.name)}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base">{viewingTeacher.name}</p>
                <p className="text-xs text-slate-500">{viewingTeacher.email}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <span>{statusBadge(viewingTeacher.isVerified)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Record ID</span>
                <span className="font-mono text-slate-800">{viewingTeacher.id}</span>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingTeacher(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersPage;

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Users,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  X,
  Mail,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import type { Teacher } from "../../types/teacher";
import {
  validatePersonName,
  validateEmail,
  validateRequired,
} from "../../utils/validation";
import {
  getSchoolTeachers,
  deleteSchoolTeacher,
  addSchoolTeacher,
} from "../../apis/school/school.api";
import Pagination from "../../components/shared/Pagination";
const statusBadge = (status?: string | boolean) => {
  const isActive = status === "Active" || status === true;
  if (isActive) {
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

const LIMIT = 10;

const TeachersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query parameters
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const statusFilter = searchParams.get("status") || "All";
  const searchParam = searchParams.get("search") || "";

  // Local state
  const [search, setSearch] = useState(searchParam);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const school = JSON.parse(localStorage.getItem("user") ?? "{}").schoolAdmin;

  // Sync URL search params helper
  const updateUrlParams = (newParams: {
    page?: number;
    status?: string;
    search?: string;
  }) => {
    const nextParams = new URLSearchParams(searchParams);
    const nextPage = newParams.page !== undefined ? newParams.page : 1;
    nextParams.set("page", String(nextPage));
    nextParams.set("limit", String(LIMIT));

    if (newParams.status !== undefined) {
      nextParams.set("status", newParams.status);
    } else if (!nextParams.has("status")) {
      nextParams.set("status", "All");
    }

    if (newParams.search !== undefined) {
      if (newParams.search.trim()) {
        nextParams.set("search", newParams.search.trim());
      } else {
        nextParams.delete("search");
      }
    }

    setSearchParams(nextParams);
  };

  // Ensure default URL query parameters are present on initial load
  useEffect(() => {
    const hasPage = searchParams.has("page");
    const hasLimit = searchParams.has("limit");
    const hasStatus = searchParams.has("status");
    if (!hasPage || !hasLimit || !hasStatus) {
      const nextParams = new URLSearchParams(searchParams);
      if (!hasPage) nextParams.set("page", "1");
      if (!hasLimit) nextParams.set("limit", String(LIMIT));
      if (!hasStatus) nextParams.set("status", "All");
      setSearchParams(nextParams, { replace: true });
    }
  }, []);

  // Sync local search input when URL search changes (e.g. back/forward navigation)
  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam]);

  // Debounce search input to update URL params
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim() !== searchParam.trim()) {
        updateUrlParams({ search, page: 1 });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Add Teacher Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    qualification: "MSc",
    employeeNumber: "",
    specialization: "",
    joiningDate: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Open Add Teacher Modal
  const openAddModal = () => {
    setFormData({
      name: "",
      email: "",
      employeeNumber: "",
      qualification: "MSc",
      specialization: "",
      joiningDate: "",
    });
    setFieldErrors({});
    setIsAddModalOpen(true);
  };

  // Handle Add Teacher Form Submission
  const handleAddTeacher = async () => {
    const errors: Record<string, string> = {};
    if (!validatePersonName(formData.name)) {
      errors.name = "Please enter a valid name.";
    }
    if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!validateRequired(formData.employeeNumber)) {
      errors.employeeNumber = "Employee number is required.";
    }
    if (!validateRequired(formData.qualification)) {
      errors.qualification = "Qualification is required.";
    }
    if (!validateRequired(formData.specialization)) {
      errors.specialization = "Specialization is required.";
    }
    if (!validateRequired(formData.joiningDate)) {
      errors.joiningDate = "Joining date is required.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsAddModalOpen(false);
    } else {
      console.log("Form validation errors:", errors);
      return;
    }

    try {
      const res = await addSchoolTeacher({
        ...formData,
        schoolId: school?.id || 1,
      });
      if (res?.success) {
        toast.success(res.message || "Teacher added successfully.");
        setIsAddModalOpen(false);
        setRefetchTrigger((prev) => prev + 1);
      }
    } catch (error) {
      toast.error("Failed to add teacher. Please try again.");
      console.error("Error adding teacher:", error);
    }
  };

  // Delete Teacher Function
  const deleteTeacher = async (id: number) => {
    try {
      const schoolId = school?.id || 1;
      const res = await deleteSchoolTeacher(schoolId, Number(id));
      if (res?.success) {
        toast.success(res.message || "Teacher deleted successfully.");
        setRefetchTrigger((prev) => prev + 1);
      }
    } catch (error: unknown) {
      const message =
        error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response &&
          error.response.data &&
          typeof error.response.data === "object" &&
          "message" in error.response.data &&
          typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Failed to delete teacher.";
      toast.error(message);
    }
  };

  // Fetch teachers with backend pagination, status, and search
  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
      try {
        const schoolId = school?.id || 1;
        const response = await getSchoolTeachers(schoolId, {
          status: statusFilter,
          search: searchParam,
          page: currentPage,
          limit: LIMIT,
        });

        if (response?.success) {
          const rawData = response;
          let list: Teacher[] = [];

          if (Array.isArray(rawData)) {
            list = rawData;
          } else if (rawData && typeof rawData === "object") {
            const possibleList =
              rawData.teachers || rawData.items || rawData.data || [];
            list = Array.isArray(possibleList) ? possibleList : [];
          }

          const rawTotal = response?.pagination?.total;

          const rawTotalPages = response?.pagination?.totalPages;

          // If backend returned more than LIMIT items in one call (fallback client-side pagination)
          if (list.length > LIMIT) {
            const actualTotal = rawTotal ?? list.length;
            setTotalItems(actualTotal);
            setTotalPages(Math.max(1, Math.ceil(actualTotal / LIMIT)));
            const startIndex = (currentPage - 1) * LIMIT;
            setTeachers(list.slice(startIndex, startIndex + LIMIT));
          } else {
            const actualTotal =
              rawTotal ??
              (currentPage === 1
                ? list.length
                : (currentPage - 1) * LIMIT + list.length);
            const calculatedPages =
              rawTotalPages ?? Math.max(1, Math.ceil(actualTotal / LIMIT));
            setTotalItems(actualTotal);
            setTotalPages(calculatedPages);
            setTeachers(list);
          }
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setTeachers([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, [statusFilter, searchParam, currentPage, refetchTrigger]);

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
            placeholder="Search by name, email, subject, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateUrlParams({ search: "", page: 1 });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            {(["All", "Active", "Inactive"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => updateUrlParams({ status, page: 1 })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${statusFilter === status
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
              {totalItems > 0 ? (currentPage - 1) * LIMIT + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong className="text-slate-800 font-semibold">
              {Math.min(currentPage * LIMIT, totalItems)}
            </strong>{" "}
            of{" "}
            <strong className="text-slate-800 font-semibold">
              {totalItems}
            </strong>{" "}
            teachers
          </span>
          {statusFilter !== "All" || searchParam ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateUrlParams({ status: "All", search: "", page: 1 });
              }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              Reset filters
            </button>
          ) : null}
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
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
                          {getInitials(teacher?.name)}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[170px]">
                          {teacher?.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {statusBadge(teacher?.isVerified)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/teachers/${teacher.id}`)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details Page"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTeacher(teacher?.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          <Trash2 size={13} />
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
              <div key={teacher?.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(teacher?.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {teacher?.name}
                      </p>
                    </div>
                  </div>
                  {statusBadge(teacher?.isVerified)}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Email:</span>
                    <span className="text-slate-700 truncate max-w-[190px]">
                      {teacher.email}
                    </span>
                  </div>
                </div>

                {/* Mobile Actions: View, Edit, Delete */}
                <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate(`/teachers/${teacher.id}`)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    // onClick={() => setEditingTeacher(teacher)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTeacher(teacher?.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reusable Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={LIMIT}
          itemLabel="teachers"
          onPageChange={(page) => updateUrlParams({ page })}
          disabled={isLoading}
        />
      </section>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add New Teacher
                </h3>
                <p className="text-xs text-slate-500">
                  Register an academic faculty member into the institution
                </p>
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
            <form
              onSubmit={handleAddTeacher}
              noValidate
              className="p-6 space-y-4 overflow-y-auto"
            >
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
                    if (fieldErrors.name)
                      setFieldErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${fieldErrors.name
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
                    if (fieldErrors.email)
                      setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${fieldErrors.email
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
                  Employee Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. EMP12345"
                  value={formData.employeeNumber}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      employeeNumber: e.target.value,
                    });
                    if (fieldErrors.employeeNumber)
                      setFieldErrors((prev) => ({
                        ...prev,
                        employeeNumber: "",
                      }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${fieldErrors.employeeNumber
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
                    : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                />
                {fieldErrors.employeeNumber && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.employeeNumber}</span>
                  </p>
                )}
              </div>

              {/* Additional form fields for qualification, specialization, joining date can be added here */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Qualification *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MSc in Computer Science"
                  value={formData.qualification}
                  onChange={(e) => {
                    setFormData({ ...formData, qualification: e.target.value });
                    if (fieldErrors.qualification)
                      setFieldErrors((prev) => ({
                        ...prev,
                        qualification: "",
                      }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${fieldErrors.qualification
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
                    : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                />
                {fieldErrors.qualification && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.qualification}</span>
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Specialization *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence"
                  value={formData.specialization}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      specialization: e.target.value,
                    });
                    if (fieldErrors.specialization)
                      setFieldErrors((prev) => ({
                        ...prev,
                        specialization: "",
                      }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${fieldErrors.specialization
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
                    : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                />
                {fieldErrors.specialization && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.specialization}</span>
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Joining Date *
                </label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => {
                    setFormData({ ...formData, joiningDate: e.target.value });
                    if (fieldErrors.joiningDate)
                      setFieldErrors((prev) => ({
                        ...prev,
                        joiningDate: "",
                      }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${fieldErrors.joiningDate
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
                    : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                />
                {fieldErrors.joiningDate && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.joiningDate}</span>
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
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
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersPage;

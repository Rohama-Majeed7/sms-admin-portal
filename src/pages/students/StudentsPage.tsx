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
  Eye,
  Trash2,
} from "lucide-react";
import type { StudentStatus } from "../../types/student";
import {
  addSchoolStudent,
  deleteSchoolStudent,
  getSchoolStudents,
} from "../../apis/school/school.api";
import {
  validatePersonName,
  validateEmail,
  validatePakistaniMobileNumber,
} from "../../utils/validation";
import PakistaniPhoneInput from "../../components/shared/PakistaniPhoneInput";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "../../components/shared/Pagination";

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

const LIMIT = 10;

const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query parameters
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const statusFilter = searchParams.get("status") || "All";
  const searchParam = searchParams.get("search") || "";

  // Local state
  const [search, setSearch] = useState(searchParam);
  const [students, setStudents] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const school =
    JSON.parse(localStorage.getItem("user") || "{}")?.schoolAdmin || null;

  // Sync URL search params helper
  const updateUrlParams = (newParams: {
    page?: number;
    status?: string;
    search?: string;
  }) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("gender");
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
    const hasGender = searchParams.has("gender");
    if (!hasPage || !hasLimit || !hasStatus || hasGender) {
      const nextParams = new URLSearchParams(searchParams);
      if (!hasPage) nextParams.set("page", "1");
      if (!hasLimit) nextParams.set("limit", String(LIMIT));
      if (!hasStatus) nextParams.set("status", "All");
      if (hasGender) nextParams.delete("gender");
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

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    guardianName: "",
    guardianPhone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isFormFilled = Boolean(
    formData.name.trim() &&
    formData.email.trim() &&
    formData.guardianPhone.trim() &&
    formData.guardianName.trim() &&
    formData.address.trim() &&
    ["MALE", "FEMALE", "OTHER"].includes(formData.gender) &&
    formData.dateOfBirth
  );

  const deleteStudent = async (id: number) => {
    try {
      const schoolId = school?.id || 1;
      const res = await deleteSchoolStudent(schoolId, Number(id));
      if (res?.success) {
        toast.success(res.message || "Student deleted successfully.");
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
          : "Failed to delete student.";
      toast.error(message);
    }
  };

  // Fetch students with backend pagination, status, and search
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const schoolId = school?.id || 1;
        const response = await getSchoolStudents(schoolId, {
          status: statusFilter,
          search: searchParam,
          page: currentPage,
          limit: LIMIT,
        });

        console.log("Students API response:", response);

        if (response?.success) {
          const rawData = response?.data;
          let list: any[] = [];

          if (Array.isArray(rawData)) {
            list = rawData;
          } else if (Array.isArray(response?.students)) {
            list = response.students;
          } else if (rawData && typeof rawData === "object") {
            if (Array.isArray(rawData.students)) {
              list = rawData.students;
            } else if (Array.isArray(rawData.items)) {
              list = rawData.items;
            } else if (Array.isArray(rawData.data)) {
              list = rawData.data;
            } else if (rawData.id) {
              list = [rawData];
            }
          }

          const rawTotal =
            response?.total ??
            response?.totalCount ??
            response?.count ??
            response?.meta?.total ??
            response?.pagination?.total ??
            rawData?.total ??
            rawData?.totalCount ??
            rawData?.count ??
            rawData?.meta?.total ??
            rawData?.pagination?.total;

          const rawTotalPages =
            response?.totalPages ??
            response?.meta?.totalPages ??
            response?.pagination?.totalPages ??
            rawData?.totalPages ??
            rawData?.meta?.totalPages ??
            rawData?.pagination?.totalPages;

          // If backend returned more than LIMIT items in one call (fallback client-side pagination)
          if (list.length > LIMIT) {
            const actualTotal = rawTotal ?? list.length;
            setTotalItems(actualTotal);
            setTotalPages(Math.max(1, Math.ceil(actualTotal / LIMIT)));
            const startIndex = (currentPage - 1) * LIMIT;
            setStudents(list.slice(startIndex, startIndex + LIMIT));
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
            setStudents(list);
          }
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [statusFilter, searchParam, currentPage, refetchTrigger]);

  const handleAddStudent = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!isFormFilled) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    const errors: Record<string, string> = {};

    const nameRes = validatePersonName(formData.name, "Student name");
    if (!nameRes.isValid)
      errors.name = nameRes.error || "Invalid student name.";

    const emailRes = validateEmail(formData.email);
    if (!emailRes.isValid)
      errors.email = emailRes.error || "Invalid email address.";

    const phoneRes = validatePakistaniMobileNumber(formData.guardianPhone);
    if (!phoneRes.isValid)
      errors.guardianPhone = phoneRes.error || "Invalid phone number.";

    const guardianRes = validatePersonName(
      formData.guardianName,
      "Guardian name",
    );
    if (!guardianRes.isValid)
      errors.guardianName = guardianRes.error || "Invalid guardian name.";

    if (!formData.gender || !["MALE", "FEMALE", "OTHER"].includes(formData.gender)) {
      errors.gender = "Gender is required.";
    }
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required.";
    }
    if (!formData.address.trim()) {
      errors.address = "Address is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await addSchoolStudent({ ...formData, schoolId: school?.id });
      if (res?.success) {
        toast.success(res?.message || "Student added successfully.");
        setRefetchTrigger((prev) => prev + 1);
        setFormData({
          name: "",
          email: "",
          guardianName: "",
          address: "",
          dateOfBirth: "",
          gender: "",
          guardianPhone: "",
        });
        setFieldErrors({});
        setIsAddModalOpen(false);
      } else {
        toast.error(res?.message || "Failed to add student.");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add student.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Students Table / Cards */}
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
            students
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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
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
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details Page"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteStudent(student.id)}
                          className="p-1.5  text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Delete Student"
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

        {/* Reusable Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={LIMIT}
          itemLabel="students"
          onPageChange={(page) => updateUrlParams({ page })}
          disabled={isLoading}
        />
      </section>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add New Student
                </h3>
                <p className="text-xs text-slate-500">
                  Register a new pupil profile with verified records
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
              onSubmit={(e) => {
                e.preventDefault();
                handleAddStudent();
              }}
              noValidate
              className="p-6 space-y-4"
            >
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
                  placeholder="student@example.com"
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
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    setFormData({ ...formData, dateOfBirth: e.target.value });
                    if (fieldErrors.dateOfBirth)
                      setFieldErrors((prev) => ({ ...prev, dateOfBirth: "" }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 transition-all ${fieldErrors.dateOfBirth
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
                    : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                />
                {fieldErrors.dateOfBirth && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.dateOfBirth}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Gender *</label>
                <div className="flex flex-wrap gap-6 sm:gap-8 items-center pt-1">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="MALE"
                      checked={formData.gender === "MALE"}
                      onChange={(e) => {
                        setFormData({ ...formData, gender: e.target.value });
                        if (fieldErrors.gender)
                          setFieldErrors((prev) => ({ ...prev, gender: "" }));
                      }}
                      className="accent-indigo-600 cursor-pointer"
                    />
                    Male
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="FEMALE"
                      checked={formData.gender === "FEMALE"}
                      onChange={(e) => {
                        setFormData({ ...formData, gender: e.target.value });
                        if (fieldErrors.gender)
                          setFieldErrors((prev) => ({ ...prev, gender: "" }));
                      }}
                      className="accent-indigo-600 cursor-pointer"
                    />
                    Female
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="OTHER"
                      checked={formData.gender === "OTHER"}
                      onChange={(e) => {
                        setFormData({ ...formData, gender: e.target.value });
                        if (fieldErrors.gender)
                          setFieldErrors((prev) => ({ ...prev, gender: "" }));
                      }}
                      className="accent-indigo-600 cursor-pointer"
                    />
                    Other
                  </label>
                </div>
                {fieldErrors.gender && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.gender}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Address *</label>
                <input type="text" placeholder="Enter Address" value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (fieldErrors.address)
                      setFieldErrors((prev) => ({ ...prev, address: "" }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${fieldErrors.address
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
                    : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                />
                {fieldErrors.address && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.address}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Guardian Contact Number *
                </label>
                <PakistaniPhoneInput
                  value={formData.guardianPhone}
                  onChange={(val: string) => {
                    setFormData({ ...formData, guardianPhone: val });
                    if (fieldErrors.guardianPhone)
                      setFieldErrors((prev) => ({ ...prev, guardianPhone: "" }));
                  }}
                  hasError={Boolean(fieldErrors.guardianPhone)}
                />
                {fieldErrors.guardianPhone && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{fieldErrors.guardianPhone}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Guardian Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tariq Ahmed"
                  value={formData.guardianName}
                  onChange={(e) => {
                    setFormData({ ...formData, guardianName: e.target.value });
                    if (fieldErrors.guardianName)
                      setFieldErrors((prev) => ({ ...prev, guardianName: "" }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${fieldErrors.guardianName
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
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFieldErrors({});
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddStudent}
                  disabled={!isFormFilled || isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-xs shadow-indigo-600/30 cursor-pointer transition-all"
                >
                  {isSubmitting ? "Saving..." : "Save Student"}
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

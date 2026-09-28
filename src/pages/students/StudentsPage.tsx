import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  X,
  
  Mail,
} from "lucide-react";
import type { Student, StudentStatus } from "../../types/student";
import { initialStudents } from "../../data/mockStudents";
import { getSchoolById } from "../../apis/school/school.api";
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
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | StudentStatus>(
    "All",
  );
  const [classFilter, setClassFilter] = useState<string>("All");
  const school =
    JSON.parse(localStorage.getItem("user") || "{}")?.schoolAdmin || null;
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
          // onClick={() => {
          //   setFormError('');
          //   setIsAddModalOpen(true);
          // }}
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
    </div>
  );
};

export default StudentsPage;

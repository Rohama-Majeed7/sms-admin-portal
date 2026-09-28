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
  
} from "lucide-react";
import type { Teacher} from "../../types/teacher";
import { initialTeachers } from "../../data/mockTeachers";
import { getSchoolById } from "../../apis/school/school.api";

const statusBadge = (status: boolean) => {
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
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | boolean>(
    "All",
  );
  const [subjectFilter, setSubjectFilter] = useState<string>("All");

  const school =
    JSON.parse(localStorage.getItem("user") || "{}")?.schoolAdmin || null;
  useEffect(() => {
    const fetchStudents = async () => {
      const response = await getSchoolById(school?.id);
      if (response?.success) {
        const studentsData = response?.data?.users?.filter(
          (user: any) => user.role === "TEACHER",
        );
        setTeachers(studentsData || []);
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
            Teachers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage academic faculty, monitor course assignments, and maintain
            instructor records.
          </p>
        </div>

        <button
          type="button"
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
                onClick={() => setStatusFilter(status === "All" ? "All" : status === "Active")}
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
                          // onClick={() => setViewingTeacher(teacher)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          // onClick={() => setEditingTeacher({ ...teacher })}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Teacher"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
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
                      
                    </div>
                  </div>
                  {statusBadge(teacher?.isVerified)}
                </div>

                

               
              </div>
            ))
          )}
        </div>
      </section>

     

      

     

     
    </div>
  );
};

export default TeachersPage;

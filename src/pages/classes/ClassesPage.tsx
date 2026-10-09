import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Search,
  X,
  Layers,
  GraduationCap,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
  FileEdit,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import type { ClassItem } from "../../types/class";
import {
  deleteClassFromStorage,
} from "./classesMockData";
import { getAllClasses } from "../../apis/class/api.class";

const statusBadge = (status?: string) => {
  const isPublished =
    status?.toUpperCase() === "PUBLISHED" ||
    status?.toUpperCase() === "PUBLISH" ||
    status === "Active";

  if (isPublished) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
        <CheckCircle2 size={12} className="text-emerald-500" />
        PUBLISHED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
      <FileText size={12} className="text-amber-500" />
      DRAFT
    </span>
  );
};

const ClassesPage: React.FC = () => {
  const navigate = useNavigate();

  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "PUBLISHED" | "DRAFT">("All");
  const school = JSON.parse(localStorage.getItem("user") || "{}");
  const schoolId = school?.schoolAdmin?.id;
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await getAllClasses(Number(schoolId));
        if (response?.success) {
          setClassesList(response?.data || []);
        }
      } catch (error: any) {
        console.error(error?.response?.data?.message);
      }
    }
    fetchClasses();
  }, []);

  const handleDeleteClass = (id: string | number | undefined, name: string) => {
    if (!id) return;
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const updated = deleteClassFromStorage(String(id));
      setClassesList(updated);
      toast.success(`${name} deleted successfully!`);
    }
  };

  // Filtered classes
  const filteredClasses = classesList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.code || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.academicYear || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "PUBLISHED"
        ? item.status?.toUpperCase() === "PUBLISHED" ||
          item.status?.toUpperCase() === "PUBLISH" ||
          item.status === "Active"
        : !item.status ||
          item.status?.toUpperCase() === "DRAFT" ||
          item.status === "Inactive";

    return matchesSearch && matchesStatus;
  });

  // Calculate quick stats
  const totalClasses = classesList.length;
  const totalSections = classesList.reduce(
    (acc, curr) => acc + (curr.sections?.length || 0),
    0
  );
  const totalSubjects = classesList.reduce(
    (acc, curr) => acc + (curr.subjects?.length || 0),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Classes
            </h1>

          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage school classes, sections, subjects, and timetables.
          </p>
        </div>

        {/* Create Class Button */}
        <button
          type="button"
          onClick={() => navigate("/classes/create")}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all hover:shadow-md cursor-pointer active:scale-95"
        >
          <Plus size={16} strokeWidth={2.4} />
          <span>Create Class</span>
        </button>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Classes</p>
            <p className="text-xl font-bold text-slate-900">{totalClasses}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Sections</p>
            <p className="text-xl font-bold text-slate-900">{totalSections}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Configured Subjects</p>
            <p className="text-xl font-bold text-slate-900">{totalSubjects}</p>
          </div>
        </div>
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
            placeholder="Search by class name, code, or academic year..."
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

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            {(["All", "PUBLISHED", "DRAFT"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
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

      {/* Created Classes Table */}
      <section className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            <h2 className="font-bold text-slate-900 text-sm">
              Created Classes Directory
            </h2>
            <span className="text-xs text-slate-400">
              ({filteredClasses.length} shown)
            </span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-5">Class Name</th>
                <th className="py-3 px-5">School</th>
                {/* <th className="py-3 px-4">Sections</th> */}
                {/* <th className="py-3 px-4">Subjects</th> */}
                {/* <th className="py-3 px-4">Timetable Slots</th> */}
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No classes found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click the &ldquo;Create Class&rdquo; button above to add a new class.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClasses.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Class Name */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">

                        <div>
                          <p className="font-semibold text-slate-900 text-sm leading-tight">
                            {item.name}
                          </p>

                        </div>
                      </div>
                    </td>

                    {/* School */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">

                        <div>
                          <p className="font-semibold text-slate-900 text-sm leading-tight">
                            {school?.schoolAdmin?.name}
                          </p>

                        </div>
                      </div>
                    </td>

                    {/* Academic Year */}


                    {/* Sections */}
                    {/* <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {item.sections && item.sections.length > 0 ? (
                          item.sections.map((sec) => (
                            <span
                              key={sec.id || sec.name}
                              className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-100 font-medium text-[11px]"
                              title={
                                sec.inchargeName
                                  ? `Incharge: ${sec.inchargeName}`
                                  : sec.room
                                    ? `Room: ${sec.room} | Capacity: ${sec.capacity}`
                                    : sec.name
                              }
                            >
                              {sec.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            No sections
                          </span>
                        )}
                      </div>
                    </td> */}

                    {/* Subjects */}
                    {/* <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                          <GraduationCap size={13} className="text-indigo-500" />
                          {item.subjects?.length || 0} Subjects
                        </span>
                        <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                          {item.subjects?.map((s) => s.name).join(", ") || "-"}
                        </div>
                      </div>
                    </td> */}

                    {/* Timetable slots */}
                    {/* <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <Clock size={13} className="text-amber-500" />
                        <span>{item.timetables?.length || 0} Scheduled</span>
                      </div>
                    </td> */}

                    {/* Status */}
                    <td className="py-3.5 px-4">{statusBadge(item.status)}</td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1">
                        {(!item.status || item.status.toUpperCase() === "DRAFT" || item.status === "Inactive") ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/classes/edit/${item.id}`)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Draft Class - Click to Edit"
                          >
                            <FileEdit size={15} />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(`/classes/view/${item.id}`)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="View Class"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/classes/edit/${item.id}`)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Class"
                            >
                              <Edit3 size={15} />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteClass(item.id, item.name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Class"
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
          {filteredClasses.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No classes found</p>
            </div>
          ) : (
            filteredClasses.map((item) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {item.code || item.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {item.academicYear} • {item.code}
                      </p>
                    </div>
                  </div>
                  {statusBadge(item.status)}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">
                      Sections:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.sections?.map((sec) => (
                        <span
                          key={sec.id}
                          className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium text-[11px]"
                        >
                          {sec.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">
                      Subjects: {item.subjects?.length || 0}
                    </span>
                    <span className="text-slate-500">
                      Timetables: {item.timetables?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-2 pt-1">
                  {(!item.status || item.status.toUpperCase() === "DRAFT" || item.status === "Inactive") ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/classes/edit/${item.id}`)}
                      className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium px-2.5 py-1.5 rounded-lg hover:bg-amber-50 cursor-pointer"
                      title="Draft Class - Click to Edit"
                    >
                      <FileEdit size={13} />
                      <span>Draft</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate(`/classes/view/${item.id}`)}
                        className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="View Class"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/classes/edit/${item.id}`)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 cursor-pointer"
                        title="Edit Class"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteClass(item.id, item.name)}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium px-2.5 py-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default ClassesPage;

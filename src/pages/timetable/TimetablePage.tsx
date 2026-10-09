import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Layers,
  BookOpen,
  Plus,
  Save,
  Trash2,
  Edit2,
  RefreshCw,
  AlertCircle,
  Users,
  Grid,
  ListFilter,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";

import type { ClassItem, ClassSection, SubjectItem } from "../../types/class";
import type { Teacher } from "../../types/teacher";
import type {
  TimetableEntry,
  DayOfWeek,
  DraftPeriodRow,
} from "../../types/timetable";
import { DAYS_OF_WEEK } from "../../types/timetable";

import { getAllClasses, getClassById } from "../../apis/class/api.class";
import { getSchoolTeachers } from "../../apis/school/school.api";
import {
  getSectionTimetable,
  createSectionTimetable,
} from "../../apis/timetable/timetable.api";
import {
  timeStringToMinutes,
  minutesToTimeString,
  formatMinutesTo12Hour,
  formatDuration,
  findIntraDayOverlap,
  isOverlapping,
} from "../../utils/timetableTime";
import { DeletePeriodModal } from "./DeletePeriodModal";
import { EditPeriodModal } from "./EditPeriodModal";



// Fallback teachers if backend teachers list is not yet populated
const FALLBACK_TEACHERS: Teacher[] = [
  { id: 101, name: "Mr. Tariq Mehmood", email: "tariq.mehmood@school.edu", role: "TEACHER", specialization: "Mathematics" },
  { id: 102, name: "Mrs. Fatima Zahra", email: "fatima.zahra@school.edu", role: "TEACHER", specialization: "English" },
  { id: 103, name: "Dr. Farooq Shah", email: "farooq.shah@school.edu", role: "TEACHER", specialization: "Physics" },
  { id: 104, name: "Ms. Sana Javed", email: "sana.javed@school.edu", role: "TEACHER", specialization: "Chemistry" },
  { id: 105, name: "Mr. Usman Ali", email: "usman.ali@school.edu", role: "TEACHER", specialization: "Computer Science" },
  { id: 106, name: "Ms. Ayesha Siddiqa", email: "ayesha.siddiqa@school.edu", role: "TEACHER", specialization: "Biology" },
];

const TimetablePage: React.FC = () => {
  // ---------------------------------------------------------------------------
  // 1. Current user & School Context
  // ---------------------------------------------------------------------------
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const school = user?.schoolAdmin;
  const schoolId: number = Number(school?.id) || 1;
  const schoolName: string = school?.schoolName || school?.name || "School Portal";

  // ---------------------------------------------------------------------------
  // 2. Data State: Classes, Sections, Subjects, Teachers, Saved Timetable
  // ---------------------------------------------------------------------------
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(true);

  const [selectedClassId, setSelectedClassId] = useState<string | number>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string | number>("");

  const [currentClass, setCurrentClass] = useState<ClassItem | null>(null);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState<boolean>(true);

  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [isLoadingTimetable, setIsLoadingTimetable] = useState<boolean>(false);

  // Active day in day selector tabs (e.g. MONDAY)
  const [activeDay, setActiveDay] = useState<DayOfWeek>("MONDAY");

  // View mode for weekly schedule: grid or list
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // ---------------------------------------------------------------------------
  // 3. Draft Period Editor Rows State
  // ---------------------------------------------------------------------------
  const [draftRows, setDraftRows] = useState<DraftPeriodRow[]>([
    {
      id: "draft-1",
      day: "MONDAY",
      startTime: "09:00",
      endTime: "10:00",
      subjectId: "",
      teacherId: "",
    },
  ]);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 4. Edit & Delete Modals State
  // ---------------------------------------------------------------------------
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<TimetableEntry | null>(null);

  // ---------------------------------------------------------------------------
  // 5. Fetch Initial Classes & Teachers
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingClasses(true);
      setIsLoadingTeachers(true);

      try {
        const [classesRes, teachersRes] = await Promise.allSettled([
          getAllClasses(schoolId),
          getSchoolTeachers(schoolId),
        ]);

        // Process Classes
        if (classesRes.status === "fulfilled" && classesRes.value?.success) {
          const list: ClassItem[] = classesRes.value.data || [];
          setClassesList(list);

          // Auto-select first class if available
          if (list.length > 0) {
            const firstCls = list[0];
            setSelectedClassId(firstCls.id ?? "");
          }
        }

        // Process Teachers
        if (teachersRes.status === "fulfilled" && teachersRes.value?.success) {
          const list: Teacher[] =
            teachersRes.value.teachers ||
            teachersRes.value.items ||
            teachersRes.value.data ||
            [];
          if (Array.isArray(list) && list.length > 0) {
            setTeachers(list);
          } else {
            setTeachers(FALLBACK_TEACHERS);
          }
        } else {
          setTeachers(FALLBACK_TEACHERS);
        }
      } catch (err) {
        console.error("Failed to load initial timetable data:", err);
        setTeachers(FALLBACK_TEACHERS);
      } finally {
        setIsLoadingClasses(false);
        setIsLoadingTeachers(false);
      }
    };

    fetchInitialData();
  }, [schoolId]);

  // ---------------------------------------------------------------------------
  // 6. When Selected Class Changes: Load its details (Sections & Subjects)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedClassId) {
      setCurrentClass(null);
      setSections([]);
      setSubjects([]);
      setSelectedSectionId("");
      return;
    }

    const loadClassDetails = async () => {
      // Find from cached list first
      const found = classesList.find(
        (c) => String(c.id) === String(selectedClassId)
      );

      if (found && Array.isArray(found.sections) && Array.isArray(found.subjects)) {
        setCurrentClass(found);
        setSections(found.sections || []);
        setSubjects(found.subjects || []);
        if (found.sections.length > 0) {
          setSelectedSectionId(found.sections[0].id ?? "");
        } else {
          setSelectedSectionId("");
        }
      } else {
        // Fetch via getClassById if full sections/subjects are needed
        try {
          const res = await getClassById(selectedClassId, schoolId);
          if (res?.success && res.data) {
            setCurrentClass(res.data);
            setSections(res.data.sections || []);
            setSubjects(res.data.subjects || []);
            if (res.data.sections?.length > 0) {
              setSelectedSectionId(res.data.sections[0].id ?? "");
            } else {
              setSelectedSectionId("");
            }
          }
        } catch (err) {
          console.error("Failed to fetch class details:", err);
        }
      }
    };

    loadClassDetails();
  }, [selectedClassId, classesList, schoolId]);

  // ---------------------------------------------------------------------------
  // 7. When Selected Section Changes: Fetch its Timetable
  // ---------------------------------------------------------------------------
  const fetchSectionTimetable = useCallback(async () => {
    if (!selectedSectionId) {
      setTimetableEntries([]);
      return;
    }

    setIsLoadingTimetable(true);
    try {
      const res = await getSectionTimetable(selectedSectionId);
      if (res.success) {
        const raw = res.data || [];
        const normalized: TimetableEntry[] = raw.map((item: any) => {
          const startMin =
            typeof item.startMinute === "number" && !isNaN(item.startMinute)
              ? item.startMinute
              : timeStringToMinutes(item.startTime);
          const endMin =
            typeof item.endMinute === "number" && !isNaN(item.endMinute)
              ? item.endMinute
              : timeStringToMinutes(item.endTime);

          return {
            ...item,
            startMinute: startMin,
            endMinute: endMin,
            startTime: formatMinutesTo12Hour(startMin),
            endTime: formatMinutesTo12Hour(endMin),
          };
        });
        setTimetableEntries(normalized);
      }
    } catch (err: any) {
      console.warn("Could not load section timetable:", err?.response?.data || err);
      setTimetableEntries([]);
    } finally {
      setIsLoadingTimetable(false);
    }
  }, [selectedSectionId]);

  useEffect(() => {
    fetchSectionTimetable();
  }, [fetchSectionTimetable]);

  // ---------------------------------------------------------------------------
  // 8. Synchronize Active Day with Draft Rows
  // ---------------------------------------------------------------------------
  // When activeDay changes, ensure rows default to this day
  useEffect(() => {
    setDraftRows((prev) =>
      prev.map((row) => ({
        ...row,
        day: activeDay,
      }))
    );
  }, [activeDay]);

  // ---------------------------------------------------------------------------
  // 9. Draft Rows Handlers
  // ---------------------------------------------------------------------------
  const handleAddRow = (presetStart?: string, presetEnd?: string) => {
    let nextStart = presetStart || "09:00";
    let nextEnd = presetEnd || "10:00";

    // Auto-increment time if we already have rows
    if (!presetStart && draftRows.length > 0) {
      const lastRow = draftRows[draftRows.length - 1];
      const lastEndMin = timeStringToMinutes(lastRow.endTime);
      nextStart = minutesToTimeString(lastEndMin);
      nextEnd = minutesToTimeString(lastEndMin + 45); // default 45m interval
    }

    const newRow: DraftPeriodRow = {
      id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      day: activeDay,
      startTime: nextStart,
      endTime: nextEnd,
      subjectId: subjects.length > 0 ? subjects[0].id ?? "" : "",
      teacherId: "",
    };

    setDraftRows((prev) => [...prev, newRow]);
    setSaveError(null);
  };

  const handleUpdateRow = (
    rowId: string,
    field: keyof DraftPeriodRow,
    value: any
  ) => {
    setDraftRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return { ...row, [field]: value };
        }
        return row;
      })
    );
    setSaveError(null);
  };

  const handleRemoveRow = (rowId: string) => {
    if (draftRows.length === 1) {
      // If only 1 row left, reset it rather than leaving 0 rows
      setDraftRows([
        {
          id: `draft-${Date.now()}`,
          day: activeDay,
          startTime: "09:00",
          endTime: "10:00",
          subjectId: "",
          teacherId: "",
        },
      ]);
      return;
    }
    setDraftRows((prev) => prev.filter((r) => r.id !== rowId));
    setSaveError(null);
  };

  // ---------------------------------------------------------------------------
  // 10. Save Timetable Submission (POST /sections/:sectionId/timetable)
  // ---------------------------------------------------------------------------
  const handleSaveTimetable = async () => {
    setSaveError(null);

    // 1. Class & Section selection validation
    if (!selectedClassId) {
      const msg = "Please select a Class before saving.";
      setSaveError(msg);
      toast.warning(msg);
      return;
    }

    if (!selectedSectionId) {
      const msg = "Please select a Section to schedule periods.";
      setSaveError(msg);
      toast.warning(msg);
      return;
    }

    // 2. Draft rows check
    if (draftRows.length === 0) {
      const msg = "Please add at least one period before saving.";
      setSaveError(msg);
      toast.warning(msg);
      return;
    }

    // 3. Row field requirements & time validity
    const processedPeriods: Array<{
      day: DayOfWeek;
      subjectId: number;
      teacherId: number;
      startMinute: number;
      endMinute: number;
      label: string;
    }> = [];

    for (let i = 0; i < draftRows.length; i++) {
      const row = draftRows[i];
      const rowNumber = i + 1;

      if (!row.subjectId) {
        const msg = `Period #${rowNumber}: Please choose a curriculum subject.`;
        setSaveError(msg);
        toast.warning(msg);
        return;
      }

      if (!row.teacherId) {
        const msg = `Period #${rowNumber}: Please assign a teacher.`;
        setSaveError(msg);
        toast.warning(msg);
        return;
      }

      const startMin = timeStringToMinutes(row.startTime);
      const endMin = timeStringToMinutes(row.endTime);

      if (startMin >= endMin) {
        const msg = `Period #${rowNumber}: Start time (${formatMinutesTo12Hour(startMin)}) must be earlier than End time (${formatMinutesTo12Hour(endMin)}).`;
        setSaveError(msg);
        toast.error(msg);
        return;
      }

      processedPeriods.push({
        day: row.day,
        subjectId: Number(row.subjectId),
        teacherId: Number(row.teacherId),
        startMinute: startMin,
        endMinute: endMin,
        label: `Period #${rowNumber}`,
      });
    }

    // 4. Overlap validation within newly added draft rows for the same day
    const intraDayConflict = findIntraDayOverlap(processedPeriods);
    if (intraDayConflict) {
      const msg = `Scheduling Conflict: ${intraDayConflict.message}`;
      setSaveError(msg);
      toast.error(msg);
      return;
    }

    // 5. Overlap validation with already existing saved periods in this section on this day
    const existingDayPeriods = timetableEntries.filter(
      (e) => e.day === activeDay
    );

    for (const newP of processedPeriods) {
      for (const savedP of existingDayPeriods) {
        if (
          isOverlapping(
            newP.startMinute,
            newP.endMinute,
            savedP.startMinute,
            savedP.endMinute
          )
        ) {
          const subName = savedP.subject?.name || savedP.subjectName || "Subject";
          const msg = `Time Overlap Warning: Period (${formatMinutesTo12Hour(newP.startMinute)} - ${formatMinutesTo12Hour(newP.endMinute)}) overlaps with an already scheduled ${subName} period (${formatMinutesTo12Hour(savedP.startMinute)} - ${formatMinutesTo12Hour(savedP.endMinute)}) on ${activeDay}.`;
          setSaveError(msg);
          toast.error(msg);
          return;
        }
      }
    }

    // 6. Build Payload according to strict specification:
    // POST /sections/:sectionId/timetable
    // { entries: [ { day, subjectId, teacherId, startMinute, endMinute } ] }
    const payload = {
      entries: processedPeriods.map((p) => ({
        day: p.day,
        subjectId: p.subjectId,
        teacherId: p.teacherId,
        startTime: formatMinutesTo12Hour(p.startMinute),
        endTime: formatMinutesTo12Hour(p.endMinute),
      })),
    };

    setIsSaving(true);

    try {
      const res = await createSectionTimetable(selectedSectionId, payload);
      toast.success(res?.message || `${payload.entries.length} period(s) scheduled successfully!`);

      // Refresh timetable from server
      await fetchSectionTimetable();

      // Reset draft editor to 1 fresh row on success
      setDraftRows([
        {
          id: `draft-${Date.now()}`,
          day: activeDay,
          startTime: "09:00",
          endTime: "10:00",
          subjectId: subjects.length > 0 ? subjects[0].id ?? "" : "",
          teacherId: "",
        },
      ]);
      setSaveError(null);
    } catch (err: any) {
      // Backend is final authority for teacher scheduling conflicts
      const rawMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save timetable entries.";


      // Preserve user's unsaved form data and show prominent error
      setSaveError(rawMessage);
      toast.error(rawMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 11. Calculated statistics & helpers
  // ---------------------------------------------------------------------------
  const activeSection = useMemo(() => {
    return sections.find((s) => String(s.id) === String(selectedSectionId));
  }, [sections, selectedSectionId]);

  // Counts of periods per day of the week
  const dayPeriodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DAYS_OF_WEEK.forEach((d) => {
      counts[d.key] = timetableEntries.filter((e) => e.day === d.key).length;
    });
    return counts;
  }, [timetableEntries]);

  // Periods for the currently selected day
  const activeDayEntries = useMemo(() => {
    return timetableEntries
      .filter((e) => e.day === activeDay)
      .sort((a, b) => a.startMinute - b.startMinute);
  }, [timetableEntries, activeDay]);

  // Distinct subjects scheduled
  const scheduledSubjectsCount = useMemo(() => {
    const set = new Set<string | number>();
    timetableEntries.forEach((e) => {
      if (e.subjectId) set.add(e.subjectId);
    });
    return set.size;
  }, [timetableEntries]);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER & CONTEXT BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5">
              <Calendar size={12} />
              <span>Academic Timetable</span>
            </span>
            <span className="text-xs font-medium text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Campus: <span className="font-semibold text-slate-700">{schoolName}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Timetable Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure section-based weekly period schedules, subjects, and teacher assignments.
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Scheduled</p>
            <p className="text-sm font-extrabold text-slate-900 font-mono">
              {timetableEntries.length} Periods
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Subjects</p>
            <p className="text-sm font-extrabold text-emerald-600 font-mono">
              {scheduledSubjectsCount} Taught
            </p>
          </div>

          <button
            type="button"
            onClick={fetchSectionTimetable}
            disabled={isLoadingTimetable || !selectedSectionId}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Timetable"
          >
            <RefreshCw
              size={16}
              className={isLoadingTimetable ? "animate-spin text-indigo-600" : ""}
            />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FILTER BAR: CLASS & SECTION SELECTORS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Layers size={16} className="text-indigo-600" />
            <span>Select Class & Section to Schedule</span>
          </div>

          {classesList.length === 0 && !isLoadingClasses && (
            <Link
              to="/classes/create"
              className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1"
            >
              <span>+ Create First Class</span>
              <ChevronRight size={13} />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* 1. Class Dropdown */}
          <div className="lg:col-span-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-600" />
              <span>Select Class</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={isLoadingClasses || classesList.length === 0}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all disabled:opacity-50"
            >
              <option value="">
                {isLoadingClasses
                  ? "Loading classes..."
                  : classesList.length === 0
                    ? "No classes found"
                    : "-- Choose Class --"}
              </option>
              {classesList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.sections?.length || 0} Sections, {cls.subjects?.length || 0} Subjects)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Section Dropdown (Filtered by selected class) */}
          <div className="lg:col-span-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Layers size={14} className="text-violet-600" />
              <span>Select Section</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              disabled={!selectedClassId || sections.length === 0}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 cursor-pointer transition-all disabled:opacity-50"
            >
              <option value="">
                {!selectedClassId
                  ? "Select a class first"
                  : sections.length === 0
                    ? "No sections in this class"
                    : "-- Choose Section --"}
              </option>
              {sections.map((sec) => (
                <option key={sec.id || sec.name} value={sec.id}>
                  {sec.name} {sec.incharge?.name ? `(Incharge: ${sec.incharge.name})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Section Summary Pill */}
          <div className="lg:col-span-2">
            <div className="h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px] text-slate-400 font-medium">Subjects:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {subjects.length} Available
              </span>
            </div>
          </div>
        </div>

        {/* Warning if selected class lacks sections or subjects */}
        {selectedClassId && (
          <>
            {sections.length === 0 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-600 shrink-0" />
                  <span>
                    This class currently has no sections. Add a section to begin building its timetable.
                  </span>
                </div>
                <Link
                  to={`/classes/edit/${selectedClassId}`}
                  className="font-bold text-amber-900 underline hover:text-amber-700"
                >
                  Manage Sections →
                </Link>
              </div>
            )}

            {subjects.length === 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>
                    This class currently has no subjects configured. Please add curriculum subjects first.
                  </span>
                </div>
                <Link
                  to={`/classes/edit/${selectedClassId}`}
                  className="font-bold text-rose-900 underline hover:text-rose-700"
                >
                  Add Subjects →
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DAY SELECTOR TABS (Monday through Sunday) */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={14} className="text-indigo-600" />
            <span>Select Day of the Week:</span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">
            Periods scheduled on {activeDay}: {dayPeriodCounts[activeDay] || 0}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((dayItem) => {
            const isSelected = activeDay === dayItem.key;
            const count = dayPeriodCounts[dayItem.key] || 0;

            return (
              <button
                key={dayItem.key}
                type="button"
                onClick={() => setActiveDay(dayItem.key)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${isSelected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 ring-2 ring-indigo-600/20"
                  : "bg-white text-slate-700 border-slate-200/90 hover:border-indigo-300 hover:bg-slate-50/80"
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-indigo-200" : "text-slate-400"
                      }`}
                  >
                    {dayItem.short}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ${isSelected
                      ? "bg-white/20 text-white"
                      : count > 0
                        ? "bg-indigo-50 text-indigo-700"
                        : "bg-slate-100 text-slate-500"
                      }`}
                  >
                    {count} {count === 1 ? "slot" : "slots"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-extrabold truncate">
                  {dayItem.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PERIOD EDITOR: MULTI-ROW ADD / CONFIGURE SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Editor Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Add Periods for</span>
                <span className="text-indigo-600 font-extrabold">
                  {activeDay}
                </span>
                {activeSection && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                    {activeSection.name}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                Add multiple period slots for this day.
              </p>
            </div>
          </div>


        </div>

        {/* Validation / Server Error Banner */}
        {saveError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">

              <p className="text-rose-700 leading-relaxed">{saveError}</p>

            </div>
          </div>
        )}

        {/* Editable Period Rows */}
        <div className="space-y-3">
          <div className="hidden md:grid md:grid-cols-12 gap-3 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-1">Slot #</div>
            <div className="col-span-2">Start Time</div>
            <div className="col-span-2">End Time</div>
            <div className="col-span-1 text-center">Duration</div>
            <div className="col-span-3">Curriculum Subject</div>
            <div className="col-span-2">Assigned Teacher</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {draftRows.map((row, index) => {
            const startMin = timeStringToMinutes(row.startTime);
            const endMin = timeStringToMinutes(row.endTime);
            const isRangeValid = startMin < endMin;
            const duration = isRangeValid ? formatDuration(startMin, endMin) : "Invalid";

            return (
              <div
                key={row.id}
                className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 md:p-3 hover:border-indigo-300 transition-all"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Slot Number */}
                  <div className="md:col-span-1 flex items-center justify-between md:justify-start gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center font-mono">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 md:hidden capitalize">
                      {row.day.toLowerCase()}
                    </span>
                  </div>

                  {/* Start Time */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 md:hidden">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={row.startTime}
                      onChange={(e) => handleUpdateRow(row.id, "startTime", e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-medium"
                      required
                    />
                    {/* <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      {formatMinutesTo12Hour(startMin)}
                    </span> */}
                  </div>

                  {/* End Time */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 md:hidden">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={row.endTime}
                      onChange={(e) => handleUpdateRow(row.id, "endTime", e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-medium"
                      required
                    />
                    {/* <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      {formatMinutesTo12Hour(endMin)}
                    </span> */}
                  </div>

                  {/* Duration Pill */}
                  <div className="md:col-span-1 flex items-center justify-center">
                    <span
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg font-mono ${isRangeValid
                        ? "bg-slate-200/70 text-slate-700"
                        : "bg-rose-100 text-rose-700"
                        }`}
                    >
                      {duration}
                    </span>
                  </div>

                  {/* Subject Dropdown */}
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 md:hidden">
                      Subject
                    </label>
                    <select
                      value={row.subjectId}
                      onChange={(e) => handleUpdateRow(row.id, "subjectId", e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-medium"
                      required
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.map((sub) => (
                        <option key={sub.id || sub.name} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Teacher Dropdown */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 md:hidden">
                      Teacher
                    </label>
                    <select
                      value={row.teacherId}
                      onChange={(e) => handleUpdateRow(row.id, "teacherId", e.target.value)}
                      disabled={isLoadingTeachers}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-medium disabled:opacity-50"
                      required
                    >
                      <option value="">
                        {isLoadingTeachers ? "Loading teachers..." : "-- Choose Teacher --"}
                      </option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Remove Button */}
                  <div className="md:col-span-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove Row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Editor Actions Bottom Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => handleAddRow()}
            disabled={!selectedSectionId}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/50 text-indigo-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus size={16} />
            <span>Add Another Period Row</span>
          </button>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleSaveTimetable}
              disabled={isSaving || !selectedSectionId || draftRows.length === 0}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 hover:shadow-md transition-all cursor-pointer active:scale-95"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Saving Timetable...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>
                    Save Timetable ({draftRows.length} Period{draftRows.length !== 1 ? "s" : ""})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SAVED WEEKLY TIMETABLE DISPLAY */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Weekly Schedule</span>
                {activeSection && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
                    {currentClass?.name} — {activeSection.name}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                {timetableEntries.length} total period slots saved across the week.
              </p>
            </div>
          </div>

          {/* View Toggle (Grid / List) */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <Grid size={14} />
                <span>Weekly Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === "list"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <ListFilter size={14} />
                <span>Schedule List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Requirement Notice: Select section first */}
        {!selectedSectionId ? (
          <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
              <Clock size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800">
              No Section Selected
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Please choose a Class and Section above to view and manage its weekly timetable.
            </p>
          </div>
        ) : timetableEntries.length === 0 ? (
          <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mx-auto">
              <Calendar size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800">
              No Timetable Periods Configured Yet
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No period slots have been scheduled for {activeSection?.name}. Use the Period Editor above to assign subjects, teachers, and timings for each day.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* ========================================================= */
          /* WEEKLY MATRIX GRID VIEW */
          /* ========================================================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3 items-start">
            {DAYS_OF_WEEK.map((dayItem) => {
              const daySlots = timetableEntries
                .filter((slot) => slot.day === dayItem.key)
                .sort((a, b) => a.startMinute - b.startMinute);

              const isCurrentActiveDay = activeDay === dayItem.key;

              return (
                <div
                  key={dayItem.key}
                  className={`bg-slate-50/80 border rounded-2xl overflow-hidden flex flex-col transition-all ${isCurrentActiveDay
                    ? "border-indigo-400 ring-2 ring-indigo-500/10 shadow-xs"
                    : "border-slate-200/90"
                    }`}
                >
                  {/* Day Column Header */}
                  <div
                    onClick={() => setActiveDay(dayItem.key)}
                    className={`px-3.5 py-2.5 border-b flex items-center justify-between cursor-pointer transition-colors ${isCurrentActiveDay
                      ? "bg-indigo-50 border-indigo-200"
                      : "bg-slate-100/70 border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">
                        {dayItem.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {daySlots.length} period{daySlots.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDay(dayItem.key);
                      }}
                      className="p-1 text-indigo-600 hover:bg-indigo-100/60 rounded-md transition-colors"
                      title="Schedule for this day"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Day Slot Cards */}
                  <div className="p-2 space-y-2 flex-1 min-h-[140px]">
                    {daySlots.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[11px] text-slate-400 italic">
                        <span>No periods</span>

                      </div>
                    ) : (
                      daySlots.map((slot) => {
                        const subName = slot.subject?.name || slot.subjectName || "Subject";
                        const tName =
                          slot.teacher?.name ||
                          slot.teacher?.user?.name ||
                          slot.teacherName ||
                          "Teacher";

                        const timeRange = `${formatMinutesTo12Hour(slot.startMinute)} - ${formatMinutesTo12Hour(slot.endMinute)}`;
                        const duration = formatDuration(slot.startMinute, slot.endMinute);

                        return (
                          <div
                            key={slot.id}
                            className="bg-white border border-slate-200/90 rounded-xl p-2.5 hover:border-indigo-400 hover:shadow-xs transition-all space-y-2 relative group"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-xs text-indigo-700 truncate block">
                                {subName}
                              </span>

                              <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => setEditingEntry(slot)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                                  title="Edit period"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingEntry(slot)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                  title="Delete period"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            <p className="text-[10px] font-mono text-slate-600 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Clock size={11} className="text-slate-400" />
                                <span>{timeRange}</span>
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 font-semibold">
                                {duration}
                              </span>
                            </p>

                            <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 pt-0.5 border-t border-slate-100">
                              <Users size={11} className="text-slate-400" />
                              <span className="truncate">{tName}</span>
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================= */
          /* SCHEDULE LIST VIEW (Day-grouped clean table) */
          /* ========================================================= */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">
                Scheduled Periods for <span className="text-indigo-600">{activeDay}</span> ({activeDayEntries.length})
              </p>
              <span className="text-[11px] text-slate-400 font-medium">
                Chronologically ordered by Start Time
              </span>
            </div>

            {activeDayEntries.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                No periods scheduled for {activeDay} yet. Use the editor above to add periods.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Assigned Teacher</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeDayEntries.map((slot, idx) => {
                      const subName = slot.subject?.name || slot.subjectName || "Subject";
                      const tName =
                        slot.teacher?.name ||
                        slot.teacher?.user?.name ||
                        slot.teacherName ||
                        "Teacher";
                      const timeRange = `${formatMinutesTo12Hour(slot.startMinute)} - ${formatMinutesTo12Hour(slot.endMinute)}`;
                      const duration = formatDuration(slot.startMinute, slot.endMinute);

                      return (
                        <tr key={slot.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-500">
                            #{idx + 1}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock size={12} className="text-slate-400" />
                              {timeRange}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                              {duration}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg text-xs inline-block">
                              {subName}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium">
                            <span className="inline-flex items-center gap-1.5">
                              <Users size={13} className="text-slate-400" />
                              {tName}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingEntry(slot)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit period"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingEntry(slot)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete period"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* EDIT PERIOD MODAL (PATCH /timetable/:entryId) */}
      {/* ------------------------------------------------------------- */}
      <EditPeriodModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        entry={editingEntry}
        subjects={subjects}
        teachers={teachers}
        onSuccess={fetchSectionTimetable}
      />

      {/* ------------------------------------------------------------- */}
      {/* DELETE PERIOD CONFIRMATION MODAL (DELETE /timetable/:entryId) */}
      {/* ------------------------------------------------------------- */}
      <DeletePeriodModal
        isOpen={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        entry={deletingEntry}
        onSuccess={fetchSectionTimetable}
      />
    </div>
  );
};

export default TimetablePage;

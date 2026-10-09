import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Layers,
  GraduationCap,
  Calendar,
  Clock,
  UserCheck,
  Edit3,
  Mail,
  Grid,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  School,
  RefreshCw,
  Users,
  ExternalLink,
  Plus,
} from "lucide-react";
import type {
  ClassItem,
  ClassSection,
  SubjectItem,
  TimetableSlot,
} from "../../types/class";
import type { Teacher } from "../../types/teacher";
import { getClassById } from "../../apis/class/api.class";
import { getSchoolTeachers } from "../../apis/school/school.api";
import { getSectionTimetable } from "../../apis/timetable/timetable.api";
import {
  formatMinutesTo12Hour,
  timeStringToMinutes,
  formatDuration,
} from "../../utils/timetableTime";
import { INITIAL_CLASSES } from "./classesMockData";

// Days of the week configuration (1 = Monday ... 7 = Sunday)
const DAYS_CONFIG = [
  { day: 1, name: "Monday", short: "Mon", key: "MONDAY" },
  { day: 2, name: "Tuesday", short: "Tue", key: "TUESDAY" },
  { day: 3, name: "Wednesday", short: "Wed", key: "WEDNESDAY" },
  { day: 4, name: "Thursday", short: "Thu", key: "THURSDAY" },
  { day: 5, name: "Friday", short: "Fri", key: "FRIDAY" },
  { day: 6, name: "Saturday", short: "Sat", key: "SATURDAY" },
  { day: 7, name: "Sunday", short: "Sun", key: "SUNDAY" },
];

const ViewClassPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [classNotFound, setClassNotFound] = useState<boolean>(false);

  // User & School context
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const school = user?.schoolAdmin;
  const schoolId: number = Number(school?.id) || 1;
  const schoolName: string = school?.schoolName || school?.name || "Campus";

  // Data states
  const [className, setClassName] = useState<string>("");
  const [classStatus, setClassStatus] = useState<string>("PUBLISHED");
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [timetables, setTimetables] = useState<TimetableSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // UI state for timetable section tab & view mode
  const [activeTimetableSectionId, setActiveTimetableSectionId] = useState<string | number>("");
  const [timetableViewMode, setTimetableViewMode] = useState<"grid" | "list">("grid");

  // Fetch school teachers for fallback mapping
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await getSchoolTeachers(schoolId);
        if (response?.success) {
          const list = response.teachers || response.items || response.data || [];
          if (Array.isArray(list)) {
            setTeachers(list);
          }
        }
      } catch (err) {
        console.warn("Failed to load school teachers:", err);
      }
    };
    fetchTeachers();
  }, [schoolId]);

  // Fetch class data
  const loadClassData = async () => {
    if (!id) return;
    setIsLoading(true);
    setClassNotFound(false);

    try {
      const numericId = Number(id);
      if (!isNaN(numericId) && numericId > 0) {
        const res = await getClassById(numericId, schoolId);
        if (res?.success && res.data) {
          setClassName(res.data.name || "Untitled Class");
          setClassStatus(res.data.status || "PUBLISHED");
          setSubjects(res.data.subjects || []);

          // Normalize sections and incharge object
          const rawSections = res.data.sections || [];
          const normalizedSections: ClassSection[] = rawSections.map((sec: any) => {
            const inchargeObj = sec.incharge;
            const inchargeId = sec.inchargeId ?? inchargeObj?.id ?? null;
            const inchargeName =
              inchargeObj?.name ??
              inchargeObj?.user?.name ??
              sec.inchargeName ??
              "";
            const inchargeEmail =
              inchargeObj?.email ??
              inchargeObj?.user?.email ??
              sec.inchargeEmail ??
              "";

            return {
              ...sec,
              inchargeId: inchargeId ? Number(inchargeId) : null,
              inchargeName: inchargeName || undefined,
              inchargeEmail: inchargeEmail || undefined,
              incharge: inchargeObj || null,
            };
          });
          setSections(normalizedSections);

          // Fetch timetables for all sections of this class concurrently
          const fetchedSlots: TimetableSlot[] = [];
          if (normalizedSections.length > 0) {
            const timetablePromises = normalizedSections.map(async (sec) => {
              if (!sec.id) return [];
              try {
                const ttRes = await getSectionTimetable(sec.id);
                if (ttRes?.success && Array.isArray(ttRes.data)) {
                  return ttRes.data.map((entry: any, index: number) => {
                    let dayNum = Number(entry.day);
                    if (isNaN(dayNum) && typeof entry.day === "string") {
                      const foundDay = DAYS_CONFIG.find(
                        (d) =>
                          d.name.toLowerCase() === entry.day.toLowerCase() ||
                          d.key?.toLowerCase() === entry.day.toLowerCase()
                      );
                      dayNum = foundDay ? foundDay.day : 1;
                    }

                    const startMin =
                      typeof entry.startTime === "number"
                        ? entry.startTime
                        : typeof entry.startMinute === "number"
                          ? entry.startMinute
                          : timeStringToMinutes(entry.startTime);

                    const endMin =
                      typeof entry.endTime === "number"
                        ? entry.endTime
                        : typeof entry.endMinute === "number"
                          ? entry.endMinute
                          : timeStringToMinutes(entry.endTime);

                    const startStr =
                      typeof entry.startTime === "string" && (entry.startTime.includes("AM") || entry.startTime.includes("PM"))
                        ? entry.startTime
                        : formatMinutesTo12Hour(startMin);

                    const endStr =
                      typeof entry.endTime === "string" && (entry.endTime.includes("AM") || entry.endTime.includes("PM"))
                        ? entry.endTime
                        : formatMinutesTo12Hour(endMin);

                    return {
                      id: entry.id || `tt-${sec.id}-${index}`,
                      sectionId: sec.id ?? "",
                      sectionName: sec.name,
                      day: dayNum || 1,
                      dayKey: typeof entry.day === "string" ? entry.day.toUpperCase() : undefined,
                      startTime: startStr,
                      endTime: endStr,
                      startMinute: startMin,
                      endMinute: endMin,
                      subjectId: entry.subjectId || entry.subject?.id,
                      subjectName: entry.subject?.name || entry.subjectName || "Subject",
                      teacherId: entry.teacherId || entry.teacher?.id,
                      teacherName:
                        entry.teacher?.name ||
                        entry.teacher?.user?.name ||
                        entry.teacherName ||
                        "Teacher",
                    };
                  });
                }
              } catch (err) {
                console.warn(`Could not load timetable for section ${sec.name}:`, err);
              }
              return [];
            });

            const results = await Promise.all(timetablePromises);
            results.forEach((slots) => {
              fetchedSlots.push(...slots);
            });
          }

          if (fetchedSlots.length > 0) {
            setTimetables(fetchedSlots);
            // Default active timetable section to first section that HAS slots
            const firstWithSlots = normalizedSections.find((sec) =>
              fetchedSlots.some((s) => s.sectionId === sec.id)
            );
            if (firstWithSlots) {
              setActiveTimetableSectionId(firstWithSlots.id ?? firstWithSlots.name);
            } else if (normalizedSections.length > 0) {
              setActiveTimetableSectionId(normalizedSections[0].id ?? normalizedSections[0].name);
            }
          } else {
            // Fallback to class-level timetables (mock / legacy)
            const loadedTimetable = res.data.timetables || res.data.timeTable || [];
            const normalizedTimetable: TimetableSlot[] = loadedTimetable.map(
              (slot: any, index: number) => {
                let dayNum = Number(slot.day);
                if (isNaN(dayNum) && typeof slot.day === "string") {
                  const foundDay = DAYS_CONFIG.find(
                    (d) =>
                      d.name.toLowerCase() === (slot.day as string).toLowerCase() ||
                      d.key?.toLowerCase() === (slot.day as string).toLowerCase()
                  );
                  dayNum = foundDay ? foundDay.day : 1;
                }
                const startMin = timeStringToMinutes(slot.startTime);
                const endMin = timeStringToMinutes(slot.endTime);
                return {
                  ...slot,
                  id: slot.id || `tt-${index}`,
                  day: dayNum || 1,
                  dayKey: typeof slot.day === "string" ? slot.day.toUpperCase() : undefined,
                  startTime: formatMinutesTo12Hour(startMin),
                  endTime: formatMinutesTo12Hour(endMin),
                  startMinute: startMin,
                  endMinute: endMin,
                  subjectName: slot.subjectName || slot.subject || "Subject",
                  teacherName: slot.teacherName || slot.teacher || "Teacher",
                  sectionName: slot.sectionName || "Section",
                };
              }
            );
            setTimetables(normalizedTimetable);
            if (normalizedSections.length > 0) {
              setActiveTimetableSectionId(normalizedSections[0].id ?? normalizedSections[0].name);
            }
          }
          setIsLoading(false);
          return;
        }
      }

      // Fallback: check localStorage & INITIAL_CLASSES
      const stored = localStorage.getItem("sms_classes");
      const list: ClassItem[] = stored ? JSON.parse(stored) : INITIAL_CLASSES;
      const found = list.find((c) => String(c.id) === String(id));

      if (found) {
        setClassName(found.name);
        setClassStatus(found.status || "PUBLISHED");
        setSections(found.sections || []);
        setSubjects(found.subjects || []);
        const tt = found.timetables || found.timeTable || [];
        setTimetables(tt);
        if (found.sections?.length) {
          setActiveTimetableSectionId(found.sections[0].id ?? found.sections[0].name);
        }
      } else {
        setClassNotFound(true);
      }
    } catch (err) {
      console.error("Failed to load class:", err);
      // Try local fallback
      const stored = localStorage.getItem("sms_classes");
      const list: ClassItem[] = stored ? JSON.parse(stored) : INITIAL_CLASSES;
      const found = list.find((c) => String(c.id) === String(id));
      if (found) {
        setClassName(found.name);
        setClassStatus(found.status || "PUBLISHED");
        setSections(found.sections || []);
        setSubjects(found.subjects || []);
        setTimetables(found.timetables || found.timeTable || []);
        if (found.sections?.length) {
          setActiveTimetableSectionId(found.sections[0].id ?? found.sections[0].name);
        }
      } else {
        setClassNotFound(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClassData();
  }, [id, schoolId]);

  // Synchronize incharge details from teachers list if missing from incharge object
  useEffect(() => {
    if (teachers.length > 0 && sections.length > 0) {
      setSections((prev) =>
        prev.map((sec) => {
          const inchargeId = sec.inchargeId ?? sec.incharge?.id;
          if (inchargeId && (!sec.incharge?.name || !sec.incharge?.email)) {
            const matchedTeacher = teachers.find((t) => t.id === Number(inchargeId));
            if (matchedTeacher) {
              return {
                ...sec,
                inchargeId: Number(inchargeId),
                incharge: sec.incharge || {
                  id: matchedTeacher.id,
                  name: matchedTeacher.name,
                  email: matchedTeacher.email,
                },
              };
            }
          }
          return sec;
        })
      );
    }
  }, [teachers]);

  // Helper to match slot with day
  const isSlotOnDay = (slotDay: any, dayConfig: (typeof DAYS_CONFIG)[0]) => {
    if (typeof slotDay === "string") {
      const s = slotDay.toUpperCase().trim();
      return s === dayConfig.key || s === dayConfig.name.toUpperCase();
    }
    return Number(slotDay) === dayConfig.day;
  };

  // Active section for timetable filtering
  const activeSection =
    sections.find(
      (s) => s.id === activeTimetableSectionId || s.name === activeTimetableSectionId
    ) || sections[0];

  const activeSectionSlots = useMemo(() => {
    return timetables.filter(
      (t) =>
        t.sectionId === activeTimetableSectionId ||
        t.sectionId === activeSection?.id ||
        (activeSection?.name && t.sectionName === activeSection.name)
    );
  }, [timetables, activeTimetableSectionId, activeSection]);

  // Status helper
  const isPublished = classStatus.toUpperCase() === "PUBLISHED" || classStatus === "Active";

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading class details...</p>
      </div>
    );
  }

  if (classNotFound) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Class Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md">
          The requested class could not be loaded or may have been deleted.
        </p>
        <button
          type="button"
          onClick={() => navigate("/classes")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Classes</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER & ACTIONS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/classes")}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Back to Classes"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {className}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPublished
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
              >
                {isPublished ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <Clock size={13} className="text-amber-600" />
                    <span>Draft</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <School size={13} className="text-slate-400" />
              <span>{schoolName}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadClassData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh details"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to={`/classes/edit/${id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Edit3 size={14} />
            <span>Edit Class</span>
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUMMARY STATS BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sections Metric */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
            <Layers size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sections
            </p>
            <p className="text-lg font-bold text-slate-900">
              {sections.length}{" "}
              <span className="text-xs font-normal text-slate-500">
                Section{sections.length !== 1 ? "s" : ""}
              </span>
            </p>
          </div>
        </div>

        {/* Subjects Metric */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <GraduationCap size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Curriculum
            </p>
            <p className="text-lg font-bold text-slate-900">
              {subjects.length}{" "}
              <span className="text-xs font-normal text-slate-500">
                Subject{subjects.length !== 1 ? "s" : ""}
              </span>
            </p>
          </div>
        </div>

        {/* Timetable Slots Metric */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Calendar size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Schedule
            </p>
            <p className="text-lg font-bold text-slate-900">
              {timetables.length}{" "}
              <span className="text-xs font-normal text-slate-500">
                Period{timetables.length !== 1 ? "s" : ""} / wk
              </span>
            </p>
          </div>
        </div>

        {/* Incharges Metric */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <UserCheck size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Incharges
            </p>
            <p className="text-lg font-bold text-slate-900">
              {sections.filter((s) => s.inchargeId || s.incharge?.id).length}
              <span className="text-xs font-normal text-slate-500">
                {" "}
                / {sections.length} Assigned
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTIONS & INCHARGES */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Class Sections & Assigned Incharges
              </h2>
              <p className="text-xs text-slate-500">
                All sections under {className} and their designated class teachers.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
            {sections.length} Section{sections.length !== 1 ? "s" : ""}
          </span>
        </div>

        {sections.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
            No sections registered for this class.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((sec, index) => {
              const inchargeName =
                sec.incharge?.name ||
                (sec.inchargeId && teachers.find((t) => t.id === Number(sec.inchargeId))?.name);

              const inchargeEmail =
                sec.incharge?.email ||
                (sec.inchargeId && teachers.find((t) => t.id === Number(sec.inchargeId))?.email);

              const secSlotCount = timetables.filter(
                (t) => t.sectionId === sec.id || t.sectionName === sec.name
              ).length;

              return (
                <div
                  key={sec.id || `sec-${index}`}
                  className="bg-slate-50/70 border border-slate-200 rounded-xl p-4.5 space-y-3.5 hover:border-violet-300 transition-all"
                >
                  {/* Section Title Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                      <h3 className="font-bold text-sm text-slate-900">
                        {sec.name}
                      </h3>
                    </div>
                    {secSlotCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTimetableSectionId(sec.id ?? sec.name);
                          document
                            .getElementById("weekly-timetable-section")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Click to view timetable"
                      >
                        <CheckCircle2 size={11} className="text-emerald-600" />
                        <span>{secSlotCount} period{secSlotCount !== 1 ? "s" : ""}</span>
                      </button>
                    ) : (
                      <Link
                        to="/timetable"
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors flex items-center gap-1"
                        title="Configure timetable in portal"
                      >
                        <Clock size={11} className="text-slate-400" />
                        <span>No timetable</span>
                      </Link>
                    )}
                  </div>

                  {/* Incharge Details Card */}
                  <div className="bg-white border border-slate-200/90 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Class Incharge
                    </p>

                    {inchargeName ? (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {inchargeName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {inchargeName}
                          </p>
                          {inchargeEmail ? (
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <Mail size={11} className="text-slate-400 shrink-0" />
                              <span className="truncate">{inchargeEmail}</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">No email</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-700 bg-amber-50/60 border border-amber-200/60 px-2.5 py-1.5 rounded-lg text-xs">
                        <AlertCircle size={13} className="shrink-0" />
                        <span className="italic font-medium">No incharge assigned</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* CURRICULUM SUBJECTS CATALOG */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <GraduationCap size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Curriculum Subjects Catalog
              </h2>
              <p className="text-xs text-slate-500">
                Subjects taught under the curriculum for {className}.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            {subjects.length} Subject{subjects.length !== 1 ? "s" : ""}
          </span>
        </div>

        {subjects.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
            No subjects assigned to this curriculum.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {subjects.map((sub, index) => {
              const subSlotCount = timetables.filter(
                (t) =>
                  t.subjectId === sub.id ||
                  t.subjectName?.toLowerCase() === sub.name?.toLowerCase()
              ).length;

              return (
                <div
                  key={sub.id || `sub-${index}`}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:bg-emerald-50/40 hover:border-emerald-200 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                      <BookOpen size={14} />
                    </div>
                    <span className="font-bold text-xs text-slate-800 truncate">
                      {sub.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span>Weekly</span>
                    <span className="font-semibold text-emerald-700">
                      {subSlotCount} slot{subSlotCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* TIMETABLE & WEEKLY SCHEDULE */}
      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* TIMETABLE & WEEKLY SCHEDULE */}
      {/* ------------------------------------------------------------- */}
      <section
        id="weekly-timetable-section"
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Weekly Timetable & Schedule
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {sections.filter((sec) => timetables.some((t) => t.sectionId === sec.id || t.sectionName === sec.name)).length} of {sections.length} Sections Scheduled
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Period schedules mapped per day and subject for each section.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <Link
              to="/timetable"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200/80 transition-all cursor-pointer"
              title="Open full timetable portal to edit or add periods"
            >
              <ExternalLink size={13} />
              <span>Timetable Portal</span>
            </Link>

            {/* View mode toggle: Grid vs List */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTimetableViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${timetableViewMode === "grid"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Grid size={13} />
                <span>Weekly Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setTimetableViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${timetableViewMode === "list"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <ListFilter size={13} />
                <span>List View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section Tabs Switcher */}
        {sections.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Select Section:</span>
              <span className="text-[11px] text-slate-400">
                Active: <span className="font-bold text-slate-700">{activeSection?.name || "None"}</span> ({activeSectionSlots.length} periods)
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {sections.map((sec) => {
                const isSelected =
                  sec.id === activeTimetableSectionId ||
                  sec.name === activeTimetableSectionId ||
                  (!activeTimetableSectionId && sec.id === activeSection?.id);

                const slotCount = timetables.filter(
                  (t) => t.sectionId === sec.id || t.sectionName === sec.name
                ).length;

                return (
                  <button
                    key={sec.id || sec.name}
                    type="button"
                    onClick={() => setActiveTimetableSectionId(sec.id ?? sec.name)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                  >
                    <span>{sec.name}</span>
                    {slotCount > 0 ? (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${isSelected
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-700 font-semibold"
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                        {slotCount} {slotCount === 1 ? "period" : "periods"}
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-normal ${isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                          }`}
                      >
                        No schedule
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Timetable Content */}
        {activeSectionSlots.length === 0 ? (
          <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center space-y-3 bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mx-auto">
              <Calendar size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">
                No timetable scheduled for {activeSection?.name || "this section"} yet
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                This section currently has no periods configured. You can build and customize its weekly timetable in the Timetable Portal.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/timetable"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Configure {activeSection?.name || "Section"} Timetable</span>
              </Link>
            </div>
          </div>
        ) : timetableViewMode === "grid" ? (
          /* Weekly Grid View */
          <div className="overflow-x-auto pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 min-w-[700px]">
              {DAYS_CONFIG.slice(0, 6).map((dayConfig) => {
                const daySlots = activeSectionSlots
                  .filter((t) => isSlotOnDay(t.day || t.dayKey, dayConfig))
                  .sort((a, b) => (a.startMinute ?? 0) - (b.startMinute ?? 0));

                return (
                  <div
                    key={dayConfig.day}
                    className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col"
                  >
                    {/* Day Column Header */}
                    <div className="bg-slate-100/90 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">
                        {dayConfig.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white text-slate-500 font-mono font-medium">
                        {daySlots.length}
                      </span>
                    </div>

                    {/* Day Periods */}
                    <div className="p-2 space-y-2 flex-1 min-h-[140px]">
                      {daySlots.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center p-3 text-[11px] text-slate-400 italic">
                          No periods
                        </div>
                      ) : (
                        daySlots.map((slot) => {
                          const duration = formatDuration(
                            slot.startMinute ?? timeStringToMinutes(slot.startTime),
                            slot.endMinute ?? timeStringToMinutes(slot.endTime)
                          );
                          return (
                            <div
                              key={slot.id}
                              className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5 shadow-2xs hover:border-indigo-300 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-bold text-xs text-indigo-700 block truncate">
                                  {slot.subjectName}
                                </span>
                                {duration && duration !== "0m" && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono font-semibold shrink-0">
                                    {duration}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                <Clock size={10} className="text-slate-400 shrink-0" />
                                <span>
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </p>
                              <p className="text-[10px] text-slate-600 truncate flex items-center gap-1">
                                <Users size={10} className="text-slate-400 shrink-0" />
                                <span className="truncate">{slot.teacherName}</span>
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
          </div>
        ) : (
          /* List / Table View */
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Day</th>
                  <th className="py-2.5 px-4">Time Slot</th>
                  <th className="py-2.5 px-4">Duration</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Teacher</th>
                  <th className="py-2.5 px-4">Section</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSectionSlots
                  .slice()
                  .sort((a, b) => {
                    const dayA = DAYS_CONFIG.find((d) => isSlotOnDay(a.day || a.dayKey, d))?.day ?? 1;
                    const dayB = DAYS_CONFIG.find((d) => isSlotOnDay(b.day || b.dayKey, d))?.day ?? 1;
                    if (dayA !== dayB) return dayA - dayB;
                    return (a.startMinute ?? 0) - (b.startMinute ?? 0);
                  })
                  .map((slot) => {
                    const dayObj = DAYS_CONFIG.find((d) => isSlotOnDay(slot.day || slot.dayKey, d));
                    const duration = formatDuration(
                      slot.startMinute ?? timeStringToMinutes(slot.startTime),
                      slot.endMinute ?? timeStringToMinutes(slot.endTime)
                    );
                    return (
                      <tr key={slot.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                          {dayObj?.name || `Day ${slot.day}`}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {duration}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded text-[11px]">
                            {slot.subjectName}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 font-medium">
                          <span className="inline-flex items-center gap-1.5">
                            <Users size={12} className="text-slate-400" />
                            {slot.teacherName}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {activeSection?.name || slot.sectionName || "Section"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ViewClassPage;

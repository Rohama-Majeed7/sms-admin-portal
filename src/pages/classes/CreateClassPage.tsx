import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Layers,
  GraduationCap,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  UserCheck,
  AlertCircle,
  Check,
  ChevronRight,
  School,
  UserMinus,
} from "lucide-react";
import { toast } from "react-toastify";
import type {
  ClassSection,
  SubjectItem,
} from "../../types/class";
import type { Teacher } from "../../types/teacher";
import { createClass, publishClass, getAllClasses } from "../../apis/class/api.class";
import { getSchoolTeachers } from "../../apis/school/school.api";

// Quick suggestion chips for class names
const CLASS_NAME_SUGGESTIONS = [
  "Grade 10",
  "Grade 9",
  "Grade 8",
  "Grade 7",
  "Grade 6",
  "Grade 5",
  "Matriculation",
];

// Quick suggestion chips for common curriculum subjects
const POPULAR_SUBJECTS = [
  "Mathematics",
  "English",
  "Urdu",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "General Science",
  "Islamic Studies",
  "Pakistan Studies",
  "Social Studies",
  "Arts",
];

// Fallback teachers if backend is empty or unavailable
const FALLBACK_TEACHERS: Teacher[] = [
  { id: 101, name: "Mr. Tariq Mehmood", email: "tariq.mehmood@school.edu", role: "TEACHER", specialization: "Mathematics" },
  { id: 102, name: "Mrs. Fatima Zahra", email: "fatima.zahra@school.edu", role: "TEACHER", specialization: "English" },
  { id: 103, name: "Dr. Farooq Shah", email: "farooq.shah@school.edu", role: "TEACHER", specialization: "Physics" },
  { id: 104, name: "Ms. Sana Javed", email: "sana.javed@school.edu", role: "TEACHER", specialization: "Chemistry" },
  { id: 105, name: "Mr. Usman Ali", email: "usman.ali@school.edu", role: "TEACHER", specialization: "Computer Science" },
  { id: 106, name: "Ms. Ayesha Siddiqa", email: "ayesha.siddiqa@school.edu", role: "TEACHER", specialization: "Biology" },
];

const CreateClassPage: React.FC = () => {
  const navigate = useNavigate();

  // Active step in stepper: 1 (Class Info), 2 (Sections), 3 (Subjects)
  const [activeStep, setActiveStep] = useState<number>(1);

  // ---------------------------------------------------------------------------
  // School and Teachers context
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
  const schoolName: string = school?.schoolName || school?.name || "Primary Campus";

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState<boolean>(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await getSchoolTeachers(schoolId);
        if (response?.success) {
          const list = response.teachers || response.items || response.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setTeachers(list);
          } else {
            setTeachers(FALLBACK_TEACHERS);
          }
        } else {
          setTeachers(FALLBACK_TEACHERS);
        }
      } catch {
        setTeachers(FALLBACK_TEACHERS);
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, [schoolId]);

  // ---------------------------------------------------------------------------
  // 1b. Fetch All School Classes (for cross-class incharge conflict validation)
  // ---------------------------------------------------------------------------
  const [allSchoolClasses, setAllSchoolClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllClasses = async () => {
      try {
        const response = await getAllClasses(Number(schoolId));
        if (response?.success) {
          setAllSchoolClasses(response.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch all classes for incharge verification", err);
      }
    };
    fetchAllClasses();
  }, [schoolId]);

  // ---------------------------------------------------------------------------
  // 1. CLASS INFO (model Class { name: String, schoolId: Int })
  // ---------------------------------------------------------------------------
  const [className, setClassName] = useState<string>("");
  const [isClassSavedOnServer, setIsClassSavedOnServer] = useState<boolean>(false);
  const [isSavingClass, setIsSavingClass] = useState<boolean>(false);
  const [serverClassId, setServerClassId] = useState<number | null>(null);

  const handleSaveClassInfo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!className.trim()) {
      toast.error("Please enter a valid class name");
      return;
    }

    setIsSavingClass(true);
    try {

      const response = await createClass({ name: className.trim(), schoolId });


      if (response?.success) {
        setIsClassSavedOnServer(true);
        if (response?.data?.id) {
          setServerClassId(response?.data?.id);
          navigate(`/classes/edit/${response.data.id}`);
        }
        toast.success(response?.message || `Class "${className}" registered successfully!`);
      }
    } catch (err: any) {
      toast.info(err?.response?.data?.message);
    } finally {
      setIsSavingClass(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. SECTIONS (model Section { name: String, inchargeId: Int? @unique, classId: Int })
  // ---------------------------------------------------------------------------
  const [sections, setSections] = useState<ClassSection[]>([]);

  const [newSectionName, setNewSectionName] = useState<string>("");
  const [newSectionInchargeId, setNewSectionInchargeId] = useState<string>("");

  // Map of currently assigned incharge IDs (for @unique validation across all school classes)
  const assignedInchargeMap = useMemo(() => {
    const map = new Map<number, string>();

    // 1. Incharges from other classes in the school
    allSchoolClasses.forEach((cls: any) => {
      const clsName = cls.name || `Class #${cls.id}`;
      (cls.sections || []).forEach((sec: any) => {
        const incId = sec.inchargeId ?? sec.incharge?.id;
        if (incId) {
          map.set(Number(incId), `${clsName} (${sec.name})`);
        }
      });
    });

    // 2. Incharges from current class sections in local state
    sections.forEach((sec) => {
      if (sec.inchargeId) {
        map.set(Number(sec.inchargeId), `Section ${sec.name}`);
      }
    });

    return map;
  }, [allSchoolClasses, sections]);

  const handleAddSection = async () => {
    const trimmed = newSectionName.trim();
    if (!trimmed) {
      toast.error("Please enter a section name");
      return;
    }

    // Duplicate section name check
    if (sections.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning(`Section "${trimmed}" already exists in this class`);
      return;
    }

    const inchargeNum = newSectionInchargeId ? Number(newSectionInchargeId) : null;

    // Check @unique constraint on inchargeId
    if (inchargeNum && assignedInchargeMap.has(inchargeNum)) {
      const conflictLocation = assignedInchargeMap.get(inchargeNum);
      toast.error(
        `This teacher is already the Incharge for ${conflictLocation}. According to schema, a teacher can be incharge of only one section.`
      );
      return;
    }


    const matchedTeacher = teachers.find((t) => t.id === inchargeNum);

    const newSec: ClassSection = {
      name: trimmed,
      inchargeId: inchargeNum,
      incharge: matchedTeacher
        ? {
          id: matchedTeacher.id,
          name: matchedTeacher.name,
          email: matchedTeacher.email,
        }
        : null,
      classId: serverClassId,
    };

    const payload = {
      name: className,
      schoolId,
      sections: [...sections, newSec]
    }
    try {
      let response = await createClass(payload);
      if (response?.success) {
        setSections((prev) => [...prev, newSec]);
        setNewSectionName("");
        setNewSectionInchargeId("");
        toast.success(`Section "${trimmed}" added!`);

      }
    } catch (error) {
      console.log(error);
      toast.error(`Failed to add section "${trimmed}"`);
    }

  };

  const handleRemoveSection = (sectionId: string | number) => {
    const sec = sections.find((s) => s.id === sectionId);
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    toast.info(`Removed ${sec?.name || "section"}`);
  };

  const handleUpdateSectionIncharge = (sectionId: string | number, newInchargeId: number | null) => {
    const targetSec = sections.find((s) => s.id === sectionId);
    const currentInchargeId = targetSec?.inchargeId ?? targetSec?.incharge?.id;

    if (newInchargeId && newInchargeId !== currentInchargeId && assignedInchargeMap.has(newInchargeId)) {
      const conflictLocation = assignedInchargeMap.get(newInchargeId);
      toast.error(`This teacher is already Incharge of ${conflictLocation}!`);
      return;
    }

    const matchedTeacher = teachers.find((t) => t.id === newInchargeId);

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            inchargeId: newInchargeId,
            inchargeName: matchedTeacher?.name,
            inchargeEmail: matchedTeacher?.email,
            incharge: matchedTeacher
              ? {
                id: matchedTeacher.id,
                name: matchedTeacher.name,
                email: matchedTeacher.email,
              }
              : null,
            classTeacher: matchedTeacher?.name || "Unassigned",
          };
        }
        return sec;
      })
    );
    toast.success("Section Incharge updated");
  };

  // ---------------------------------------------------------------------------
  // 3. SUBJECTS (model Subject { name: String, classId: Int })
  // ---------------------------------------------------------------------------
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  const [newSubjectName, setNewSubjectName] = useState<string>("");

  const handleAddSubject = async (nameToAdd?: string) => {
    const name = (nameToAdd || newSubjectName).trim();
    if (!name) {
      toast.error("Please enter a subject name");
      return;
    }

    if (subjects.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.warning(`Subject "${name}" is already in this class`);
      return;
    }

    const newSub: SubjectItem = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name,
      classId: serverClassId
    };

    const payload = {
      name: className,
      schoolId,
      subjects: [...subjects, newSub]
    }
    try {
      let response = await createClass(payload);
      if (response?.success) {
        setSubjects((prev) => [...prev, newSub]);
        setNewSubjectName("");
      }
    } catch (error) {
      console.log(error);
      toast.error(`Failed to add subject "${name}"`);
    }
    toast.success(`Added ${name}`);
  };

  const handleRemoveSubject = (subId: string | number) => {
    const sub = subjects.find((s) => s.id === subId);
    setSubjects((prev) => prev.filter((s) => s.id !== subId));
    toast.info(`Removed ${sub?.name || "subject"}`);
  };

  // ---------------------------------------------------------------------------
  // COMPLETION & PUBLISH
  // ---------------------------------------------------------------------------
  const [isSubmittingAll, setIsSubmittingAll] = useState<boolean>(false);

  const handleCompleteClassCreation = async () => {
    if (!className.trim()) {
      toast.error("Class Name is required");
      return;
    }
    if (sections.length === 0) {
      toast.error("Please add at least one section before finishing");
      return;
    }
    if (subjects.length === 0) {
      toast.error("Please add at least one subject to this class");
      return;
    }

    setIsSubmittingAll(true);

    try {
      if (!serverClassId) {
        toast.error("Please save class basic information first");
        return;
      }
      const res = await publishClass(serverClassId);
      if (res?.success) {
        toast.success("Class created successfully");
        navigate("/classes");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    } finally {
      setIsSubmittingAll(false);
    }
  };

  const isClassInfoValid = !!className.trim();
  const isSectionsValid = sections.length > 0;
  const isSubjectsValid = subjects.length > 0;

  const completionPercentage = useMemo(() => {
    let score = 0;
    if (isClassInfoValid) score += 34;
    if (isSectionsValid) score += 33;
    if (isSubjectsValid) score += 33;
    return score;
  }, [isClassInfoValid, isSectionsValid, isSubjectsValid]);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER & BREADCRUMBS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div>
          <Link
            to="/classes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Classes Directory</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Create Class
            </h1>

            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              <School size={12} />

              {schoolName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build Class, assign Section Incharges, and define Subjects curriculum.
          </p>
        </div>

        {/* Global Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/classes"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleCompleteClassCreation}
            disabled={isSubmittingAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 hover:shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Save size={16} />
            <span>{isSubmittingAll ? "Saving Class..." : "Publish  Class"}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* INTERACTIVE STEPPER / NAVIGATION TABS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1 */}
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${activeStep === 1
            ? "bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs"
            : "bg-white border-slate-200/90 hover:border-slate-300"
            }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isClassInfoValid
              ? "bg-indigo-600 text-white"
              : "bg-indigo-100 text-indigo-700"
              }`}
          >
            {isClassInfoValid ? <Check size={18} /> : <BookOpen size={18} />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Step 1</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">Class Identity</p>
            <p className="text-[11px] text-slate-500 truncate">{className || "Set class name"}</p>
          </div>
        </button>

        {/* Step 2 */}
        <button
          type="button"
          disabled={!isClassSavedOnServer}
          onClick={() => {
            if (!isClassSavedOnServer) {
              toast.warning("Please save class basic information first");
              return;
            }
            setActiveStep(2);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${!isClassSavedOnServer
            ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200"
            : activeStep === 2
              ? "bg-violet-50/70 border-violet-400 ring-2 ring-violet-500/20 shadow-xs cursor-pointer"
              : "bg-white border-slate-200/90 hover:border-slate-300 cursor-pointer"
            }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSectionsValid
              ? "bg-violet-600 text-white"
              : "bg-violet-100 text-violet-700"
              }`}
          >
            {isSectionsValid ? <Check size={18} /> : <Layers size={18} />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Step 2</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">Sections & Incharges</p>
            <p className="text-[11px] text-slate-500 truncate">{sections.length} Section{sections.length !== 1 ? "s" : ""}</p>
          </div>
        </button>

        {/* Step 3 */}
        <button
          type="button"
          disabled={!isClassSavedOnServer || sections.length === 0}
          onClick={() => {
            if (!isClassSavedOnServer) {
              toast.warning("Please save class basic information first");
              return;
            }
            if (sections.length === 0) {
              toast.warning("Please add at least one section in Step 2 first");
              return;
            }
            setActiveStep(3);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${!isClassSavedOnServer || sections.length === 0
            ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200"
            : activeStep === 3
              ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs cursor-pointer"
              : "bg-white border-slate-200/90 hover:border-slate-300 cursor-pointer"
            }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSubjectsValid
              ? "bg-emerald-600 text-white"
              : "bg-emerald-100 text-emerald-700"
              }`}
          >
            {isSubjectsValid ? <Check size={18} /> : <GraduationCap size={18} />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Step 3</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">Subjects Catalog</p>
            <p className="text-[11px] text-slate-500 truncate">{subjects.length} Subject{subjects.length !== 1 ? "s" : ""}</p>
          </div>
        </button>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Main Container: Step Content + Architecture Blueprint Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: ACTIVE STEP FORM (Col span 8) */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: CLASS IDENTITY */}
          {activeStep === 1 && (
            <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Class Basic Information
                    </h2>

                  </div>
                </div>
                {isClassSavedOnServer && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 size={13} />
                    Registered
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveClassInfo} className="space-y-5">
                {/* Class Name Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Class Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grade 10, Class 9, O-Levels Prep"
                    value={className}
                    onChange={(e) => {
                      setClassName(e.target.value);
                      setIsClassSavedOnServer(false);
                    }}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    required
                  />

                </div>

                {/* Quick Suggestion Pills */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-2">
                    Quick Preset Names:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {CLASS_NAME_SUGGESTIONS.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          setClassName(sug);
                          setIsClassSavedOnServer(false);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${className === sug
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>



                {/* Form Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSavingClass}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <Save size={14} />
                    <span>{isSavingClass ? "Saving Info..." : "Register Class Info"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isClassSavedOnServer}
                    onClick={() => {
                      if (!isClassSavedOnServer) {
                        toast.warning("Please save class basic information first");
                        return;
                      }
                      setActiveStep(2);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <span>Next: Add Sections</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* STEP 2: SECTIONS & INCHARGES */}
          {activeStep === 2 && (
            <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Sections & Incharge Teachers
                    </h2>

                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                  {sections.length} Section{sections.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Add New Section Form */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4.5 space-y-4">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-violet-600" />
                  <p className="text-xs font-bold text-slate-800">Add New Section</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Section Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Section Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Section A, Section Rose, Green"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    />
                  </div>

                  {/* Section Incharge Select */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                    </label>
                    <select
                      value={newSectionInchargeId}
                      onChange={(e) => setNewSectionInchargeId(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 cursor-pointer"
                    >
                      <option value="">
                        {isLoadingTeachers ? "Loading teachers..." : "No Incharge / Assign Later"}
                      </option>
                      {teachers.map((teacher) => {
                        const isAssigned = assignedInchargeMap.has(teacher.id);
                        const assignedTo = assignedInchargeMap.get(teacher.id);
                        return (
                          <option
                            key={teacher.id}
                            value={teacher.id}
                            disabled={isAssigned}
                          >
                            {teacher.name} ({teacher.email})
                            {isAssigned ? ` — Already Incharge of ${assignedTo}` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Quick Add Section Name suggestions */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">Suggestions:</span>
                    {["Section A", "Section B", "Section C", "Section D", "Rose", "Tulip"].map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setNewSectionName(name)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        +{name}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <Plus size={14} />
                    <span>Add Section</span>
                  </button>
                </div>
              </div>

              {/* Sections List Cards */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-700">
                  Class Sections ({sections.length})
                </p>

                {sections.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                    <Layers size={32} className="mx-auto text-slate-300" />
                    <p className="text-xs font-semibold text-slate-700">No sections added yet</p>
                    <p className="text-[11px] text-slate-400">
                      Add at least one section above to configure students.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {sections.map((sec) => (
                      <div
                        key={sec.name}
                        className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-violet-300 transition-all shadow-2xs space-y-3 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 border border-violet-100 font-bold text-xs flex items-center justify-center">
                              {sec.name.replace(/Section\s*/i, "").trim().slice(0, 2) || "S"}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">{sec.name}</h3>
                              <span className="text-[10px] text-slate-400 font-medium">
                                Class: {className}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sec.id || sec.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove section"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Incharge Teacher Info */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-500 flex items-center gap-1">
                              <UserCheck size={12} className="text-violet-600" />
                              Section Incharge:
                            </span>
                            {sec.inchargeId ? (
                              <span className="font-mono text-[10px] text-slate-400">
                                ID: #{sec.inchargeId}
                              </span>
                            ) : null}
                          </div>

                          {sec.inchargeId ? (
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {sec.incharge?.name || "Assigned Teacher"}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {sec.incharge?.email || "teacher@school.edu"}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleUpdateSectionIncharge(sec.id || sec.name, null)}
                                className="text-[10px] text-rose-600 hover:underline p-1 cursor-pointer flex items-center gap-0.5"
                                title="Unassign incharge"
                              >
                                <UserMinus size={11} />
                                <span>Unassign</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-amber-700 italic font-medium">
                                No Incharge Assigned
                              </span>
                              {/* Quick incharge assignment picker */}
                              <select
                                onChange={(e) =>
                                  handleUpdateSectionIncharge(
                                    sec.id || sec.name,
                                    e.target.value ? Number(e.target.value) : null
                                  )
                                }
                                className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 cursor-pointer"
                              >
                                <option value="">Assign Now</option>
                                {teachers.map((t) => {
                                  const isAssigned = assignedInchargeMap.has(t.id);
                                  const assignedTo = assignedInchargeMap.get(t.id);
                                  return (
                                    <option
                                      key={t.id}
                                      value={t.id}
                                      disabled={isAssigned}
                                    >
                                      {t.name}
                                      {isAssigned ? ` (Incharge of ${assignedTo})` : ""}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ← Back to Class Identity
                </button>

                <button
                  type="button"
                  disabled={!isClassSavedOnServer || sections.length === 0}
                  onClick={() => {
                    if (!isClassSavedOnServer) {
                      toast.warning("Please save class basic information first");
                      return;
                    }
                    if (sections.length === 0) {
                      toast.warning("Please add at least one section in Step 2 first");
                      return;
                    }
                    setActiveStep(3);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <span>Next: Add Subjects</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </section>
          )}

          {/* STEP 3: SUBJECTS CATALOG */}
          {activeStep === 3 && (
            <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Curriculum Subjects Catalog
                    </h2>

                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {subjects.length} Subject{subjects.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Add Subject Input & 1-Click Suggestions */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4.5 space-y-4">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-emerald-600" />
                  <p className="text-xs font-bold text-slate-800">Add Subject to Curriculum</p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter subject name (e.g. Mathematics, Physics, Islamic Studies)"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubject();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSubject()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
                  >
                    <Plus size={14} />
                    <span>Add Subject</span>
                  </button>
                </div>

                {/* Popular Subjects 1-Click Pills */}
                <div>

                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SUBJECTS.map((subName) => {
                      const isAdded = subjects.some(
                        (s) => s.name.toLowerCase() === subName.toLowerCase()
                      );
                      return (
                        <button
                          key={subName}
                          type="button"
                          onClick={() => {
                            if (!isAdded) handleAddSubject(subName);
                          }}
                          disabled={isAdded}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${isAdded
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 opacity-60 cursor-default"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-emerald-300"
                            }`}
                        >
                          {isAdded && <Check size={11} />}
                          <span>{subName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Configured Subjects Grid */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-700">
                  Configured Subjects for {className} ({subjects.length})
                </p>

                {subjects.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                    <GraduationCap size={32} className="mx-auto text-slate-300" />
                    <p className="text-xs font-semibold text-slate-700">No subjects configured</p>
                    <p className="text-[11px] text-slate-400">
                      Add subjects above. These subjects will define the curriculum for this class.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {subjects.map((sub, idx) => (
                      <div
                        key={sub.id}
                        className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex items-center justify-between gap-2 hover:bg-white hover:border-emerald-300 hover:shadow-2xs transition-all group"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono text-slate-400 block">
                            #{idx + 1}
                          </span>
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {sub.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(sub.id ?? "")}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer shrink-0"
                          title="Remove subject"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ← Back to Sections
                </button>

                <button
                  type="button"
                  onClick={handleCompleteClassCreation}
                  disabled={isSubmittingAll}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Save size={15} />
                  <span>{isSubmittingAll ? "Saving Class..." : "Finish & Save Class"}</span>
                </button>
              </div>
            </section>
          )}


        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: ARCHITECTURE BLUEPRINT SIDEBAR (Col span 4) */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-5">
          {/* Architecture Blueprint Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Class Blueprint</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {completionPercentage}% Ready
              </span>
            </div>

            {/* Class Identity Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                  Class Name
                </span>

              </div>
              <p className="text-base font-extrabold text-slate-900 tracking-tight">
                {className || "Unnamed Class"}
              </p>

            </div>

            {/* Sections Blueprint */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers size={14} className="text-violet-600" />
                  Sections ({sections.length})
                </span>

              </div>

              {sections.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No sections created</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {sections.map((sec) => (
                    <div
                      key={sec.name}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800">{sec.name}</span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        {sec?.incharge?.name ? `Incharge: ${sec.incharge.name}` : "No incharge"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subjects Blueprint */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-emerald-600" />
                  Subjects ({subjects.length})
                </span>

              </div>

              {subjects.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No subjects added</p>
              ) : (
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                  {subjects.map((sub) => (
                    <span
                      key={sub.id}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium"
                    >
                      {sub.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Live Readiness Checklist */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Readiness Checklist:
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  {isClassInfoValid ? (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle size={14} className="text-slate-300 shrink-0" />
                  )}
                  <span className={isClassInfoValid ? "text-slate-800" : "text-slate-400"}>
                    Class Name provided
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  {isSectionsValid ? (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle size={14} className="text-slate-300 shrink-0" />
                  )}
                  <span className={isSectionsValid ? "text-slate-800" : "text-slate-400"}>
                    At least 1 Section created
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  {isSubjectsValid ? (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle size={14} className="text-slate-300 shrink-0" />
                  )}
                  <span className={isSubjectsValid ? "text-slate-800" : "text-slate-400"}>
                    Curriculum Subjects added
                  </span>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClassPage;

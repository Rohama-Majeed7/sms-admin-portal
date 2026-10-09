import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import type { SubjectItem } from "../../types/class";
import type { Teacher } from "../../types/teacher";
import type {
  TimetableEntry,
  DayOfWeek,
  UpdateTimetableEntryPayload,
} from "../../types/timetable";
import { DAYS_OF_WEEK } from "../../types/timetable";
import {
  timeStringToMinutes,
  minutesToTimeString,
  formatMinutesTo12Hour,
  formatDuration,
} from "../../utils/timetableTime";
import { updateTimetableEntry } from "../../apis/timetable/timetable.api";

interface EditPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TimetableEntry | null;
  subjects: SubjectItem[];
  teachers: Teacher[];
  onSuccess: () => void;
}



export const EditPeriodModal: React.FC<EditPeriodModalProps> = ({
  isOpen,
  onClose,
  entry,
  subjects,
  teachers,
  onSuccess,
}) => {
  const [day, setDay] = useState<DayOfWeek>("MONDAY");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [subjectId, setSubjectId] = useState<string | number>("");
  const [teacherId, setTeacherId] = useState<string | number>("");

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync state whenever active entry changes
  useEffect(() => {
    if (entry) {
      setDay(entry.day);
      setStartTime(minutesToTimeString(entry.startMinute || entry.startTime));
      setEndTime(minutesToTimeString(entry.endMinute || entry.endTime));
      setSubjectId(entry.subjectId || entry.subject?.id || "");
      setTeacherId(entry.teacherId || entry.teacher?.id || "");
      setFormError(null);
    }
  }, [entry]);

  if (!isOpen || !entry) return null;

  const startMin = timeStringToMinutes(startTime);
  const endMin = timeStringToMinutes(endTime);
  const durationText = formatDuration(startMin, endMin);
  const isValidDuration = endMin > startMin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!subjectId) {
      setFormError("Please select a subject.");
      return;
    }
    if (!teacherId) {
      setFormError("Please select a teacher.");
      return;
    }
    if (!isValidDuration) {
      setFormError("Period End Time must be strictly after Start Time.");
      return;
    }
    if (endMin - startMin < 15) {
      setFormError("Period duration must be at least 15 minutes.");
      return;
    }

    setIsUpdating(true);
    try {
      const payload: UpdateTimetableEntryPayload = {
        day,
        subjectId: Number(subjectId),
        teacherId: Number(teacherId),
        startTime: formatMinutesTo12Hour(startMin),
        endTime: formatMinutesTo12Hour(endMin),
      };

      const res = await updateTimetableEntry(entry.id, payload);
      toast.success(res?.message || "Timetable period updated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update timetable period.";
      const formatted = Array.isArray(msg) ? msg.join(", ") : String(msg);
      setFormError(formatted);
      toast.error(formatted);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Edit Timetable Period
              </h3>
              <p className="text-xs text-slate-500">
                Update day, timing, subject, or assigned teacher
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error notification */}
        {formError && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="font-medium">{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day of Week */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              Day of Week
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = day === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDay(d.key)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer ${isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
          </div>



          {/* Start and End Time Inputs */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Start Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                End Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-between text-[11px] px-1">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock size={12} className="text-slate-400" />
                Duration:
              </span>
              <span
                className={`font-semibold ${isValidDuration ? "text-indigo-600" : "text-rose-600"
                  }`}
              >
                {isValidDuration ? durationText : "Invalid (End <= Start)"}
              </span>
            </div>
          </div>

          {/* Subject Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <BookOpen size={13} className="text-slate-400" />
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="">-- Select Subject --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Users size={13} className="text-slate-400" />
              Assigned Teacher
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.specialization ? `(${t.specialization})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Save size={14} />
              <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import type { TimetableEntry } from "../../types/timetable";
import { formatMinutesTo12Hour } from "../../utils/timetableTime";
import { deleteTimetableEntry } from "../../apis/timetable/timetable.api";

interface DeletePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TimetableEntry | null;
  onSuccess: () => void;
}

export const DeletePeriodModal: React.FC<DeletePeriodModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !entry) return null;

  const subjectName = entry.subject?.name || entry.subjectName || "Subject";
  const teacherName =
    entry.teacher?.name ||
    entry.teacher?.user?.name ||
    entry.teacherName ||
    "Teacher";
  const timeRange = `${formatMinutesTo12Hour(entry.startMinute)} - ${formatMinutesTo12Hour(entry.endMinute)}`;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteTimetableEntry(entry.id);
      toast.success(res?.message || "Timetable period deleted successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete timetable period.";
      const formatted = Array.isArray(msg) ? msg.join(", ") : String(msg);
      toast.error(formatted);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle size={24} />
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

        <div>
          <h3 className="text-base font-bold text-slate-900">
            Delete Timetable Period?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to delete this scheduled period? This action cannot be undone.
          </p>
        </div>

        {/* Period Details Card (No DB IDs shown) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Day:</span>
            <span className="font-bold text-slate-800 capitalize">
              {entry.day.toLowerCase()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Time Slot:</span>
            <span className="font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              {timeRange}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Subject:</span>
            <span className="font-semibold text-slate-800">{subjectName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Teacher:</span>
            <span className="font-semibold text-slate-800">{teacherName}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Trash2 size={14} />
            <span>{isDeleting ? "Deleting..." : "Delete Period"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

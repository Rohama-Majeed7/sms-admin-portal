export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface CreateTimetableEntryPayload {
  day: DayOfWeek;
  subjectId: number;
  teacherId: number;
  startTime: string | number;
  endTime: string | number;
  startMinute?: number;
  endMinute?: number;
}

export interface CreateTimetablePayload {
  entries: CreateTimetableEntryPayload[];
}

export interface UpdateTimetableEntryPayload {
  day?: DayOfWeek;
  subjectId?: number;
  teacherId?: number;
  startTime?: string | number;
  endTime?: string | number;
  startMinute?: number;
  endMinute?: number;
}

export interface TimetableEntry {
  id: number | string;
  sectionId?: number | string;
  subjectId: number;
  teacherId: number;
  day: DayOfWeek;
  startMinute: number;
  endMinute: number;
  subject?: {
    id: number;
    name: string;
    code?: string;
  };
  teacher?: {
    id: number;
    name: string;
    email?: string;
    user?: {
      name?: string;
      email?: string;
    };
  };
  section?: {
    id: number;
    name: string;
    classId?: number;
    class?: {
      id: number;
      name: string;
    };
  };
  // Fallbacks if backend flattens them
  subjectName?: string;
  teacherName?: string;
  sectionName?: string;
  className?: string;
  startTime?: string;
  endTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DraftPeriodRow {
  id: string; // client temporary id
  day: DayOfWeek;
  startTime: string; // "09:00" (24h)
  endTime: string;   // "10:00" (24h)
  subjectId: number | string;
  teacherId: number | string;
}

export const DAYS_OF_WEEK: Array<{
  key: DayOfWeek;
  label: string;
  short: string;
  color: string;
}> = [
    { key: "MONDAY", label: "Monday", short: "Mon", color: "text-blue-600 bg-blue-50 border-blue-200" },
    { key: "TUESDAY", label: "Tuesday", short: "Tue", color: "text-purple-600 bg-purple-50 border-purple-200" },
    { key: "WEDNESDAY", label: "Wednesday", short: "Wed", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { key: "THURSDAY", label: "Thursday", short: "Thu", color: "text-amber-600 bg-amber-50 border-amber-200" },
    { key: "FRIDAY", label: "Friday", short: "Fri", color: "text-teal-600 bg-teal-50 border-teal-200" },
    { key: "SATURDAY", label: "Saturday", short: "Sat", color: "text-rose-600 bg-rose-50 border-rose-200" },
    { key: "SUNDAY", label: "Sunday", short: "Sun", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  ];

export interface ClassSection {
  id?: number | string;
  name: string;
  inchargeId?: number | null;

  incharge?: {
    id?: number;
    name?: string;
    email?: string;
    user?: {
      name?: string;
      email?: string;
    };
    [key: string]: any;
  } | null;
  classId?: number | null;
  studentsCount?: number;
  // Mock compatibility
  room?: string;
  capacity?: number;
  classTeacher?: string;
}

export interface SubjectItem {
  id?: number | string;
  name: string;
  classId?: number | null;
  code?: string;
  type?: string;
  // Mock compatibility
  weeklyPeriods?: number;
}

export interface TimetableSlot {
  id: number | string;
  teacherId?: number;
  sectionId?: number | string;
  subjectId?: number | string;
  day: number | string; // 1 = Monday ... 7 = Sunday
  startTime: string;
  endTime: string;
  // Display & UI helpers
  startMinute?: number;
  endMinute?: number;
  dayKey?: string;
  subjectName?: string;
  teacherName?: string;
  sectionName?: string;
  // Mock compatibility
  subject?: string;
  teacher?: string;
  room?: string;
}

export interface ClassItem {
  id?: number | string;
  name: string;
  schoolId?: number;
  sections: ClassSection[];
  subjects: SubjectItem[];
  timetables?: TimetableSlot[];
  timeTable?: TimetableSlot[];
  // Mock / Directory display fields
  code?: string;
  academicYear?: string;
  numericGrade?: number;
  description?: string;
  status?: "Active" | "Inactive" | string;
  createdAt?: string;
}

export interface UpdateClassPayload {
  name?: string;
  status?: "DRAFT" | "PUBLISHED" | string;
  schoolId?: number;
  sections?: Array<{
    name: string;
    classId?: number | null;
    inchargeId?: number | null;
  }>;
  subjects?: Array<{
    name: string;
    classId?: number | null;

  }>;
  timetables?: Array<{
    teacherId: number;
    sectionId: number | string;
    subjectId: number | string;
    day: number;
    startTime: string;
    endTime: string;
  }>;
}

import type { ClassItem } from "../../types/class";

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: "cls-1",
    name: "Grade 10",
    code: "G-10",
    academicYear: "2026-2027",
    numericGrade: 10,
    description: "Matriculation Science group preparation with advanced STEM curriculum.",
    status: "Active",
    sections: [
      {
        id: "sec-10-a",
        name: "Section A",
        room: "Room 101",
        capacity: 35,
        classTeacher: "Mr. Tariq Mehmood",
      },
      {
        id: "sec-10-b",
        name: "Section B",
        room: "Room 102",
        capacity: 35,
        classTeacher: "Mrs. Fatima Zahra",
      },
    ],
    subjects: [
      { id: "sub-1", name: "Mathematics", code: "MTH-101", type: "Core", weeklyPeriods: 6 },
      { id: "sub-2", name: "Physics", code: "PHY-102", type: "Core", weeklyPeriods: 5 },
      { id: "sub-3", name: "Chemistry", code: "CHM-103", type: "Core", weeklyPeriods: 5 },
      { id: "sub-4", name: "English Literature", code: "ENG-104", type: "Core", weeklyPeriods: 5 },
      { id: "sub-5", name: "Computer Science", code: "CSC-105", type: "Elective", weeklyPeriods: 4 },
    ],
    timetables: [
      {
        id: "tt-1",
        sectionId: "sec-10-a",
        day: "Monday",
        startTime: "08:30 AM",
        endTime: "09:15 AM",
        subject: "Mathematics",
        teacher: "Mr. Tariq Mehmood",
        room: "Room 101",
      },
      {
        id: "tt-2",
        sectionId: "sec-10-a",
        day: "Monday",
        startTime: "09:20 AM",
        endTime: "10:05 AM",
        subject: "Physics",
        teacher: "Dr. Farooq Shah",
        room: "Physics Lab",
      },
      {
        id: "tt-3",
        sectionId: "sec-10-a",
        day: "Tuesday",
        startTime: "08:30 AM",
        endTime: "09:15 AM",
        subject: "Chemistry",
        teacher: "Ms. Sana Javed",
        room: "Chem Lab",
      },
      {
        id: "tt-4",
        sectionId: "sec-10-b",
        day: "Monday",
        startTime: "08:30 AM",
        endTime: "09:15 AM",
        subject: "English Literature",
        teacher: "Mrs. Fatima Zahra",
        room: "Room 102",
      },
    ],
    createdAt: "2026-09-01",
  },
  {
    id: "cls-2",
    name: "Grade 9",
    code: "G-09",
    academicYear: "2026-2027",
    numericGrade: 9,
    description: "Introductory high school curriculum focusing on foundational sciences.",
    status: "Active",
    sections: [
      {
        id: "sec-9-a",
        name: "Section A",
        room: "Room 201",
        capacity: 32,
        classTeacher: "Mr. Usman Ali",
      },
      {
        id: "sec-9-b",
        name: "Section B",
        room: "Room 202",
        capacity: 32,
        classTeacher: "Ms. Ayesha Siddiqa",
      },
    ],
    subjects: [
      { id: "sub-6", name: "Mathematics", code: "MTH-901", type: "Core", weeklyPeriods: 6 },
      { id: "sub-7", name: "Biology", code: "BIO-902", type: "Core", weeklyPeriods: 5 },
      { id: "sub-8", name: "English Language", code: "ENG-903", type: "Core", weeklyPeriods: 5 },
      { id: "sub-9", name: "Urdu Literature", code: "URD-904", type: "Core", weeklyPeriods: 4 },
      { id: "sub-10", name: "Pakistan Studies", code: "PKS-905", type: "Core", weeklyPeriods: 3 },
    ],
    timetables: [
      {
        id: "tt-5",
        sectionId: "sec-9-a",
        day: "Monday",
        startTime: "08:30 AM",
        endTime: "09:15 AM",
        subject: "Mathematics",
        teacher: "Mr. Usman Ali",
        room: "Room 201",
      },
      {
        id: "tt-6",
        sectionId: "sec-9-a",
        day: "Tuesday",
        startTime: "09:20 AM",
        endTime: "10:05 AM",
        subject: "Biology",
        teacher: "Ms. Ayesha Siddiqa",
        room: "Bio Lab",
      },
    ],
    createdAt: "2026-09-01",
  },
  {
    id: "cls-3",
    name: "Grade 8",
    code: "G-08",
    academicYear: "2026-2027",
    numericGrade: 8,
    description: "Middle school curriculum emphasizing STEM and language arts.",
    status: "Active",
    sections: [
      {
        id: "sec-8-rose",
        name: "Section Rose",
        room: "Room 301",
        capacity: 30,
        classTeacher: "Mr. Bilal Ahmad",
      },
      {
        id: "sec-8-tulip",
        name: "Section Tulip",
        room: "Room 302",
        capacity: 30,
        classTeacher: "Mrs. Nida Raza",
      },
    ],
    subjects: [
      { id: "sub-11", name: "General Science", code: "SCI-801", type: "Core", weeklyPeriods: 5 },
      { id: "sub-12", name: "Mathematics", code: "MTH-802", type: "Core", weeklyPeriods: 5 },
      { id: "sub-13", name: "English", code: "ENG-803", type: "Core", weeklyPeriods: 5 },
      { id: "sub-14", name: "Geography & History", code: "SOC-804", type: "Core", weeklyPeriods: 4 },
    ],
    timetables: [
      {
        id: "tt-7",
        sectionId: "sec-8-rose",
        day: "Monday",
        startTime: "08:30 AM",
        endTime: "09:15 AM",
        subject: "General Science",
        teacher: "Mr. Bilal Ahmad",
        room: "Room 301",
      },
    ],
    createdAt: "2026-09-02",
  },
  {
    id: "cls-4",
    name: "Grade 7",
    code: "G-07",
    academicYear: "2026-2027",
    numericGrade: 7,
    description: "Junior high foundational classes and co-curricular programs.",
    status: "Active",
    sections: [
      {
        id: "sec-7-alpha",
        name: "Section Alpha",
        room: "Room 401",
        capacity: 28,
        classTeacher: "Mr. Hamza Sheikh",
      },
    ],
    subjects: [
      { id: "sub-15", name: "Science", code: "SCI-701", type: "Core", weeklyPeriods: 5 },
      { id: "sub-16", name: "Mathematics", code: "MTH-702", type: "Core", weeklyPeriods: 5 },
      { id: "sub-17", name: "English", code: "ENG-703", type: "Core", weeklyPeriods: 5 },
      { id: "sub-18", name: "Computer Basics", code: "CSC-704", type: "Elective", weeklyPeriods: 3 },
    ],
    timetables: [],
    createdAt: "2026-09-03",
  },
];

const STORAGE_KEY = "sms_classes_data_v1";

export const getStoredClasses = (): ClassItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CLASSES));
      return INITIAL_CLASSES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CLASSES;
  } catch {
    return INITIAL_CLASSES;
  }
};

export const saveClassesToStorage = (classes: ClassItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
  } catch (error) {
    console.error("Failed to persist classes in localStorage", error);
  }
};

export const addClassToStorage = (newClass: ClassItem) => {
  const current = getStoredClasses();
  const updated = [newClass, ...current];
  saveClassesToStorage(updated);
  return updated;
};

export const deleteClassFromStorage = (id: string) => {
  const current = getStoredClasses();
  const updated = current.filter((c) => String(c.id) !== String(id));
  saveClassesToStorage(updated);
  return updated;
};

export const updateClassInStorage = (updatedClass: ClassItem) => {
  const current = getStoredClasses();
  const index = current.findIndex((c) => String(c.id) === String(updatedClass.id));
  if (index !== -1) {
    current[index] = { ...current[index], ...updatedClass };
  } else {
    current.unshift(updatedClass);
  }
  saveClassesToStorage(current);
  return current;
};

export const getClassByIdFromStorage = (id: string | number): ClassItem | undefined => {
  const current = getStoredClasses();
  return current.find((c) => String(c.id) === String(id));
};


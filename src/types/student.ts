export type StudentStatus = "Active" | "Inactive";

export interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  isVerified?: boolean;
  phone?: string;
  class?: string;
  section?: string;
  gender?: string;
  status?: StudentStatus;
  rollNo?: string;
  guardianName?: string;
  admissionDate?: string;
}

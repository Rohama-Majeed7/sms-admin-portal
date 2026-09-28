export type StudentStatus = "Active" | "Inactive";

export interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  isVerified: boolean;
}

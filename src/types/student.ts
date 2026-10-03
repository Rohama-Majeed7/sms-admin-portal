export type StudentStatus = "Active" | "Inactive";

export interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  isVerified?: boolean;
  userId: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
} 

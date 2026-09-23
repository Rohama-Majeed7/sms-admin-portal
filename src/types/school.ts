export type SchoolStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';

export interface School {
  name: string;
  address?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  status: SchoolStatus;
  adminId: number; 
  createdAt?: string;
}

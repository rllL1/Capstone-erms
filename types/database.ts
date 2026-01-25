export type UserRole = 'admin' | 'teacher';
export type UserStatus = 'active' | 'archived';

export interface Profile {
  id: string;
  role: UserRole;
  fullname: string;
  employee_id: string;
  department: string;
  status: UserStatus;
  created_at: string;
  email?: string;
}

export interface CreateTeacherData {
  email: string;
  password: string;
  fullname: string;
  employee_id: string;
  department: string;
}

export interface DashboardStats {
  totalTeachers: number;
  activeTeachers: number;
  archivedTeachers: number;
}

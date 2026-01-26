export type UserRole = 'admin' | 'teacher' | 'student';
export type UserStatus = 'active' | 'archived' | 'pending' | 'rejected';

export interface Profile {
  id: string;
  role: UserRole;
  fullname: string;
  employee_id?: string;
  student_id?: string;
  department?: string;
  status: UserStatus;
  created_at: string;
  email?: string;
  profile_picture?: string;
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

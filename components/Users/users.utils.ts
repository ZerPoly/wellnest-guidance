import { CounselorRecord, StudentRecord } from '@/lib/api/admin/management.types';

/**
 * UI-specific shape for Counselors in the table.
 * We flatten or rename fields here to make the TableComponent cleaner.
 */
export interface CounselorRow {
  id: string;            // Aliased from user_id for table keys
  user_id: string;
  name: string;          // Aliased from user_name
  email: string;
  department: string;    // Aliased from department_name
  department_id: string;
  status: 'Active' | 'Inactive';
  year: string;          // Kept for interface compatibility
}

/**
 * UI-specific shape for Students in the table.
 */
export interface StudentRow {
  id: string;
  user_id: string;
  name: string;
  email: string;
  department: string;    // Aliased from program_id
  status: 'Active' | 'Inactive';
  year_level: string;
  year: string;          // Used for filtering
}

// Discriminated Union for the Table component
export type AppRow = CounselorRow | StudentRow;

/**
 * Type Guard: helps TypeScript understand if a row is a Student.
 * This is "safer" than just checking for a property string.
 */
export function isStudentRow(row: AppRow): row is StudentRow {
  return (row as StudentRow).year_level !== undefined;
}
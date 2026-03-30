import { CounselorRow, StudentRow } from '@/components/Users/users.utils';
import { CounselorRecord, StudentRecord } from '@/lib/api/admin/management.types';

export function mapCounselor(c: CounselorRecord): CounselorRow {
  return {
    id: c.user_id,
    user_id: c.user_id,
    name: c.user_name,
    email: c.email,
    department: c.department_name,
    department_id: c.department_id,
    status: 'Active',
    year: '',
  };
}

export function mapStudent(s: StudentRecord): StudentRow {
  return {
    id: s.user_id,
    user_id: s.user_id,
    name: s.user_name,
    email: s.email,
    department: s.program_id,
    status: s.is_deleted ? 'Inactive' : 'Active',
    year_level: s.year_level,
    year: s.year_level,
  };
}

export function formatYearLevel(raw: string): string {
  const map: Record<string, string> = {
    '1': '1st Year',
    '2': '2nd Year',
    '3': '3rd Year',
    '4': '4th Year',
  };
  return map[raw] ?? raw;
}
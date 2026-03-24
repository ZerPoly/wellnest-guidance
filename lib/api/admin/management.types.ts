export interface CounselorRecord {
  user_id: string;
  user_name: string;
  email: string;
  department_id: string;
  department_name: string;
  created_at: string;
  updated_at: string;
}

export interface StudentRecord {
  user_id: string;
  user_name: string;
  email: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  finished_onboarding: boolean;
  program_id: string;
  cor_school_year: string;
  year_level: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: {
    [key: string]: T[] | any; // Dynamic key for 'students' or 'counselors'
    hasMore: boolean;
    nextCursor: string | null;
  };
}
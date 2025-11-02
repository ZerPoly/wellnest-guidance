export type ClassificationStatus = "InCrisis" | "Struggling" | "Thriving" | "Excelling";

export interface ClassificationProbabilities {
  InCrisis: number;
  Thriving: number;
  Excelling: number;
  Struggling: number;
}

export interface MoodCheckIn {
  check_in_id: string;
  user_id: string;
  mood_1: string;
  mood_2: string;
  mood_3: string;
  checked_in_at: string;
}

export interface StudentProfileData {
  classification_id: string;
  student_id: string;
  classification: ClassificationStatus;
  classification_probabilities: ClassificationProbabilities;
  classified_at: string;
  user_name: string;
  email: string;
  department_id: string;
  program_name: string;
  department_name: string;
  mood_check_ins: MoodCheckIn[];
}

export interface StudentProfileResponse {
  success: boolean;
  code: string;
  message: string;
  data: StudentProfileData | undefined;
}
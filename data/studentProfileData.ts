// ============================================
// TYPES
// ============================================

export interface MoodCheckIn {
  date: string;
  mood: string;
}

export interface StudentProfile {
  student_id: string;
  full_name: string;
  email: string;
  program: string;
  department: string;
  latest_classification: {
    status: string;
    is_flagged: boolean;
    classified_at: string;
  };
  recent_moods: MoodCheckIn[];
}

export interface DetailCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  colorClass: string;
}

// ============================================
// CONSTANTS
// ============================================

export const ALL_EMOTIONS = [
  'Motivated', 'Restless', 'Sad', 'Energized', 'Peaceful', 'Hopeless', 'Angry', 
  'Relaxed', 'Excited', 'Calm', 'Exhausted', 'Content', 'Stressed', 'Depressed', 
  'Anxious', 'Happy'
];

export const EMOTION_COLOR_MAP: Record<string, { label: string; color: string }> = {
  'Motivated': { label: 'Motivated', color: '#10b981' },
  'Happy': { label: 'Happy', color: '#3b82f6' },
  'Excited': { label: 'Excited', color: '#22d3ee' },
  'Energized': { label: 'Energized', color: '#a855f7' },
  'Calm': { label: 'Calm', color: '#14b8a6' },
  'Peaceful': { label: 'Peaceful', color: '#84cc16' },
  'Content': { label: 'Content', color: '#f97316' },
  'Relaxed': { label: 'Relaxed', color: '#facc15' },
  'Restless': { label: 'Restless', color: '#e879f9' },
  'Stressed': { label: 'Stressed', color: '#f43f5e' },
  'Anxious': { label: 'Anxious', color: '#dc2626' },
  'Tired': { label: 'Tired/Struggling', color: '#6366f1' },
  'Exhausted': { label: 'Exhausted', color: '#78716c' },
  'Sad': { label: 'Sad', color: '#0f172a' },
  'Depressed': { label: 'Depressed', color: '#4c1d95' },
  'Hopeless': { label: 'Hopeless', color: '#1e40af' },
  'Angry': { label: 'Angry', color: '#b91c1c' },
};

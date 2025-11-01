import { format, subDays } from "date-fns";
import { StudentApiData } from "@/lib/api/studentClassificationByID";
import { ALL_EMOTIONS, MoodCheckIn, StudentProfile } from "@/data/studentProfileData";

// ============================================
// API DATA TO PROFILE
// ============================================

export const mapApiDataToProfile = (apiData: StudentApiData): StudentProfile => {
  const moods: MoodCheckIn[] = apiData.mood_check_ins.flatMap(checkin => {
    const rawMoods = [checkin.mood_1, checkin.mood_2, checkin.mood_3];

    return rawMoods
      .filter(mood => !!mood && mood.toLowerCase() !== 'n/a')
      .map(mood => ({
        date: format(new Date(checkin.checked_in_at), 'yyyy-MM-dd'),
        mood: mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase(),
      }));
  });

  return {
    student_id: apiData.student_id,
    full_name: apiData.user_name,
    email: apiData.email,
    program: apiData.program_name,
    department: apiData.department_name,
    latest_classification: {
      status: apiData.classification,
      is_flagged: apiData.is_flagged,
      classified_at: apiData.classified_at,
    },
    recent_moods: moods,
  };
};

// ============================================
// MOOD AGGREGATION
// ============================================

export const aggregateMoodData = (moods: MoodCheckIn[]) => {
  const dailyData: Record<string, any> = {};

  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayKey = format(date, 'yyyy-MM-dd');
    const label = format(date, 'MMM d');

    dailyData[dayKey] = { day: label, total: 0 };
    ALL_EMOTIONS.forEach(emotion => (dailyData[dayKey][emotion] = 0));
  }

  moods.forEach(checkin => {
    const mood = checkin.mood;
    if (dailyData[checkin.date] && ALL_EMOTIONS.includes(mood)) {
      dailyData[checkin.date][mood] += 1;
      dailyData[checkin.date].total += 1;
    }
  });

  return Object.values(dailyData);
};

// ============================================
// STATUS COLOR CLASS GENERATOR
// ============================================

export const getStatusClasses = (status: string, isFlagged: boolean) => {
  if (isFlagged || status === "Struggling" || status === "InCrisis") {
    return "text-red-600 bg-red-50 border-red-300";
  }
  if (status === "Excelling" || status === "Thriving") {
    return "text-green-600 bg-green-50 border-green-300";
  }
  return "text-gray-600 bg-gray-50 border-gray-300";
};

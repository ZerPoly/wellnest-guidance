"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  IoBookOutline,
  IoSchoolOutline,
  IoChatbubblesOutline,
  IoCheckmarkDoneOutline,
  IoRepeatOutline,
} from "react-icons/io5";
import {
  AiOutlineUser,
  AiOutlineArrowLeft,
  AiOutlineMail,
  AiOutlineBank,
} from "react-icons/ai";

import { EMOTION_COLOR_MAP, ALL_EMOTIONS } from "@/data/studentProfileData";
import {
  aggregateMoodData,
  getStatusClasses,
  mapApiDataToProfile,
} from "@/data/studentProfileHelpers";

import BentoDetailCard from "./BentoDetailCard";
import MoodCheckInOverview from "./DailyMoodCheckIn";
import MentalWellBeingStatus from "./MentalWellBeingStatus";
import AppointmentHistory from "./AppointmentHistory";

// types
interface StudentProfileClientProps {
  studentId: string;
}

// reusable components
const CustomMoodTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  const total = payload.reduce(
    (sum: number, entry: any) => sum + entry.value,
    0
  );
  if (total === 0) return null;

  return (
    <div className="p-3 bg-[var(--card)] border border-[var(--line)] rounded-lg shadow-xl text-sm">
      <p className="font-bold text-[var(--title)] mb-1">{label}</p>
      <p className="text-xs text-[var(--foreground-muted)] mb-2">Total Check-ins: {total}</p>
      {payload
        .filter((p: any) => p.value > 0)
        .map((entry: any, index: number) => (
          <p
            key={index}
            style={{ color: entry.color }}
            className="text-xs font-medium"
          >
            {entry.name}: {entry.value}
          </p>
        ))}
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col justify-center items-center h-96 space-y-4">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--cyan)]" />
    <p className="text-lg text-[var(--foreground-muted)] font-medium">
      Loading student profile...
    </p>
  </div>
);

const ErrorState = ({
  error,
  onBack,
}: {
  error: string;
  onBack: () => void;
}) => (
  <div className="p-8 bg-red-50 border-l-4 border-red-500 rounded-lg">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
        <span className="text-red-600 text-xl font-bold">!</span>
      </div>
      <h3 className="text-lg font-bold text-red-800">Unable to Load Profile</h3>
    </div>
    <p className="text-red-700 mb-4">{error}</p>
    <button
      onClick={onBack}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
    >
      Back to Students
    </button>
  </div>
);

export default function StudentProfileClient({
  studentId,
}: StudentProfileClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudentProfile = async () => {
      if (status === "loading") return;
      if (status === "unauthenticated") {
        router.push("/auth");
        return;
      }

      const accessToken = session?.user?.accessToken;
      if (!accessToken) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      const cacheKey = `student_${studentId}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        try {
          const apiData = JSON.parse(cachedData);
          setProfile(mapApiDataToProfile(apiData));
          setLoading(false);
        } catch (e) {
          setError("Failed to parse student data.");
          setLoading(false);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        const retryData = sessionStorage.getItem(cacheKey);
        if (retryData) {
          try {
            setProfile(mapApiDataToProfile(JSON.parse(retryData)));
            setLoading(false);
          } catch (e) {
            setError("Failed to parse student data.");
            setLoading(false);
          }
        } else {
          setError("Student data not found.");
          setLoading(false);
          setTimeout(() => router.push("/students"), 2000);
        }
      }
    };
    loadStudentProfile();
  }, [studentId, session, status, router]);

  const chartData = useMemo(() => (profile ? aggregateMoodData(profile.recent_moods) : []), [profile]);
  const maxCheckIns = Math.max(...chartData.map((d) => d.total), 1);
  const activeMoods = useMemo(() => ALL_EMOTIONS.filter((mood) => chartData.some((day: any) => day[mood] > 0)), [chartData]);

  if (status === "loading" || loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onBack={() => router.push("/students")} />;
  if (!profile) return <ErrorState error="Profile data missing." onBack={() => router.push("/students")} />;

  const handleSendEmail = () => {
    if (!profile?.email) return;
    const subject = encodeURIComponent(`Follow-up: ${profile.full_name}'s Well-being`);
    const bodyText = encodeURIComponent(`Dear ${profile.full_name}, ...`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${profile.email}&su=${subject}&body=${bodyText}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <header className="pb-4 border-b border-[var(--line)]">
        <button
          onClick={() => router.push("/students")}
          className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--cyan)] transition mb-4 font-medium"
        >
          <AiOutlineArrowLeft size={18} />
          Back to Students
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[var(--cyan)] rounded-full flex items-center justify-center">
            <AiOutlineUser size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--title)]">
              {profile.full_name}
            </h1>
            <p className="text-sm text-[var(--foreground-muted)]">
              Student ID: {profile.student_id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSendEmail}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--cyan)] hover:bg-[var(--cyan-dark)] text-white text-sm rounded-lg font-medium transition shadow"
          >
            <AiOutlineMail size={16} />
            Send Email
          </button>
        </div>
      </header>

      <div className="p-6 bg-[var(--card)] rounded-2xl shadow-md border-l-4 border-[var(--cyan)] border border-[var(--line)]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <IoBookOutline size={24} className="text-[var(--cyan)]" />
            <div>
              <p className="text-sm font-medium text-[var(--foreground-muted)]">
                Current Classification
              </p>
              <span
                className={`inline-block px-4 py-2 rounded-full text-lg font-bold border mt-1 ${getStatusClasses(
                  profile.latest_classification.status,
                  profile.latest_classification.is_flagged
                )}`}
              >
                {profile.latest_classification.status === "InCrisis" ? "In-Crisis" : profile.latest_classification.status}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-[var(--foreground-muted)]">Classified On</p>
            <p className="text-sm font-semibold text-[var(--title)]">{format(new Date(profile.latest_classification.classified_at), "MMM d, yyyy")}</p>
            <p className="text-xs text-[var(--foreground-muted)]">{format(new Date(profile.latest_classification.classified_at), "h:mm a")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ICON COLORS PRESERVED AS PER ORIGINAL CODE */}
        <BentoDetailCard icon={AiOutlineMail} title="Email" value={profile.email} colorClass="text-teal-600" />
        <BentoDetailCard icon={AiOutlineBank} title="Department" value={profile.department} colorClass="text-purple-600" />
        <BentoDetailCard icon={IoSchoolOutline} title="Program" value={profile.program} colorClass="text-blue-600" />
        <BentoDetailCard icon={IoChatbubblesOutline} title="Consultations Attended" value={String(profile.consultations_count || 0)} colorClass="text-indigo-600" />
        <BentoDetailCard icon={IoCheckmarkDoneOutline} title="Routine Attended" value={String(profile.routine_count || 0)} colorClass="text-emerald-600" />
        <BentoDetailCard icon={IoRepeatOutline} title="Follow-ups Attended" value={String(profile.followup_count || 0)} colorClass="text-orange-600" />
      </div>

      <MoodCheckInOverview 
        profile={profile}
        chartData={chartData}
        maxCheckIns={maxCheckIns}
        activeMoods={activeMoods}
        emotionColorMap={EMOTION_COLOR_MAP}
        customTooltip={CustomMoodTooltip}
      />

      <AppointmentHistory studentId={profile.student_id} />

      <MentalWellBeingStatus profile={profile} />
    </div>
  );
}
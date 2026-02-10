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
    <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-xl text-sm">
      <p className="font-bold text-gray-800 mb-1">{label}</p>
      <p className="text-xs text-gray-500 mb-2">Total Check-ins: {total}</p>
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
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#460F9D]" />
    <p className="text-lg text-gray-700 font-medium">
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
      const accessToken = session?.user?.accessToken;
      const userEmail = session?.user?.email;

      if (!userEmail || !accessToken) {
        setError("Authentication error: User session expired or missing data.");
        setLoading(false);
        return;
      }

      const cachedData = sessionStorage.getItem(`student_${studentId}`);

      if (cachedData) {
        try {
          const apiData = JSON.parse(cachedData);
          const mappedProfile = mapApiDataToProfile(apiData);
          setProfile(mappedProfile);
          setLoading(false);
          return;
        } catch (e) {
          setError("An unexpected error occurred while loading the profile.");
        } finally {
          setLoading(false);
        }
      }

      router.push("/students");
    };

    if (status === "authenticated") loadStudentProfile();
  }, [studentId, session, status, router]);

  const chartData = useMemo(
    () => (profile ? aggregateMoodData(profile.recent_moods) : []),
    [profile]
  );

  const maxCheckIns = Math.max(...chartData.map((d) => d.total), 1);
  
  const activeMoods = useMemo(
    () =>
      ALL_EMOTIONS.filter((mood) =>
        chartData.some((day: any) => day[mood] > 0)
      ),
    [chartData]
  );

  if (status === "loading" || loading) return <LoadingState />;
  if (error)
    return <ErrorState error={error} onBack={() => router.push("/students")} />;
  if (!profile)
    return (
      <ErrorState
        error="Profile data is missing or access was denied."
        onBack={() => router.push("/students")}
      />
    );

  const handleSendEmail = () => {
    if (!profile?.email) {
      alert("No email address found for this student.");
      return;
    }

    const subject = encodeURIComponent(
      `Follow-up: ${profile.full_name}'s Well-being Classification`
    );
    const bodyText = encodeURIComponent(
      `Dear ${profile.full_name},\n\n` +
        `This message is to reach out regarding your recent well-being classification result, ` +
        `which indicated a status of "${profile.latest_classification.status}".\n\n` +
        `If you need assistance or would like to discuss further, you may reach out to the Guidance Office. ` +
        `We are here to support you in maintaining your academic and emotional well-being.\n\n` +
        `Best regards,\n` +
        `University Guidance Office`
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${profile.email}&su=${subject}&body=${bodyText}`;

    try {
      window.open(gmailUrl, "_blank");
    } catch (error) {
      console.error("Gmail compose could not be opened:", error);
      alert(
        `Unable to open Gmail. You can manually email the student at: ${profile.email}`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <header className="pb-4 border-b border-gray-200">
        <button
          onClick={() => router.push("/students")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#460F9D] transition mb-4 font-medium"
        >
          <AiOutlineArrowLeft size={18} />
          Back to Students
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#460F9D] rounded-full flex items-center justify-center">
            <AiOutlineUser size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">
              {profile.full_name}
            </h1>
            <p className="text-sm text-gray-500">
              Student ID: {profile.student_id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSendEmail}
            className="flex items-center gap-2 px-4 py-2 bg-[#460F9D] hover:bg-[#5E1BC6] text-white text-sm rounded-lg font-medium transition"
          >
            <AiOutlineMail size={16} />
            Send Email
          </button>
        </div>
      </header>

      {/* current classification badge */}
      <div className="p-6 bg-white rounded-2xl shadow-md border-l-4 border-l-[#460F9D]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <IoBookOutline size={24} className="text-[#460F9D]" />
            <div>
              <p className="text-sm font-medium text-gray-600">
                Current Classification
              </p>
              <span
                className={`inline-block px-4 py-2 rounded-full text-lg font-bold border mt-1 ${getStatusClasses(
                  profile.latest_classification.status,
                  profile.latest_classification.is_flagged
                )}`}
              >
                {profile.latest_classification.status === "InCrisis"
                  ? "In-Crisis"
                  : profile.latest_classification.status}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">
              Classified On
            </p>
            <p className="text-sm font-semibold text-gray-700">
              {format(
                new Date(profile.latest_classification.classified_at),
                "MMM d, yyyy"
              )}
            </p>
            <p className="text-xs text-gray-500">
              {format(
                new Date(profile.latest_classification.classified_at),
                "h:mm a"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BentoDetailCard
          icon={AiOutlineMail}
          title="Email"
          value={profile.email}
          colorClass="text-teal-600"
        />
        <BentoDetailCard
          icon={AiOutlineBank}
          title="Department"
          value={profile.department}
          colorClass="text-purple-600"
        />
        <BentoDetailCard
          icon={IoSchoolOutline}
          title="Program"
          value={profile.program}
          colorClass="text-blue-600"
        />
        <BentoDetailCard
          icon={IoChatbubblesOutline}
          title="Consultations Attended"
          value={String(profile.consultations_count || 0)}
          colorClass="text-indigo-600"
        />
        <BentoDetailCard
          icon={IoCheckmarkDoneOutline}
          title="Routine Attended"
          value={String(profile.routine_count || 0)}
          colorClass="text-emerald-600"
        />
        <BentoDetailCard
          icon={IoRepeatOutline}
          title="Follow-ups Attended"
          value={String(profile.followup_count || 0)}
          colorClass="text-orange-600"
        />
      </div>

      {/* mood checkin section */}
      <MoodCheckInOverview 
        profile={profile}
        chartData={chartData}
        maxCheckIns={maxCheckIns}
        activeMoods={activeMoods}
        emotionColorMap={EMOTION_COLOR_MAP}
        customTooltip={CustomMoodTooltip}
      />

      {/* appointment history of the student */}
      <AppointmentHistory studentId={profile.student_id} />

      {/* classification trend section */}
      <MentalWellBeingStatus profile={profile} />
    </div>
  );
}
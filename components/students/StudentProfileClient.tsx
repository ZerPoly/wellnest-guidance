"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";
import {
  IoBookOutline,
  IoCalendarOutline,
  IoSchoolOutline,
} from "react-icons/io5";
import {
  AiOutlineUser,
  AiOutlineArrowLeft,
  AiOutlineMail,
  AiOutlineBank,
} from "react-icons/ai";

import {
  fetchStudentClassificationByID,
  StudentApiData,
} from "@/lib/api/studentClassificationByID";
import { ALL_EMOTIONS, EMOTION_COLOR_MAP } from "@/data/studentProfileData";
import {
  aggregateMoodData,
  getStatusClasses,
  mapApiDataToProfile,
} from "@/data/studentProfileHelpers";

// ============================================
// TYPES
// ============================================

interface StudentProfileClientProps {
  studentId: string;
}

interface DetailCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  colorClass: string;
}

// ============================================
// REUSABLE COMPONENTS
// ============================================

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

const BentoDetailCard: React.FC<DetailCardProps> = ({
  icon: Icon,
  title,
  value,
  colorClass,
}) => {
  const getIconBgClass = (className: string) =>
    className.replace("text-", "bg-").replace("-600", "-100");

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-sm border border-gray-200">
      <div
        className={`p-3 rounded-full ${getIconBgClass(
          colorClass
        )} ${colorClass} flex-shrink-0`}
      >
        <Icon size={20} />
      </div>

      <div className="flex flex-col justify-center flex-grow">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {title}
        </p>
        <p className={`font-bold text-base ${colorClass} break-words`}>
          {value}
        </p>
      </div>
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

// ============================================
// MAIN COMPONENT
// ============================================

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
      console.log(userEmail);

      const DUMMY_PASSWORD = "VerifiedByToken!";

      if (!userEmail || !accessToken) {
        setError("Authentication error: User session expired or missing data.");
        setLoading(false);
        return;
      }

      try {
        const apiData = await fetchStudentClassificationByID(
          studentId,
          { email: userEmail, password: DUMMY_PASSWORD },
          accessToken
        );

        if (apiData) {
          const mappedProfile = mapApiDataToProfile(apiData);
          setProfile(mappedProfile);
        } else {
          setError(
            "Failed to load profile: Insufficient permissions or data error."
          );
        }
      } catch (err: any) {
        console.error("❌ Profile fetch error:", err);
        setError("An unexpected error occurred while loading the profile.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") loadStudentProfile();
  }, [studentId, session, status]);

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

  // --- Send Email Function ---
  const handleSendEmail = () => {
    if (!profile?.email) {
      alert("No email address found for this student.");
      return;
    }

    const subject = encodeURIComponent(
      `Follow-up: ${profile.full_name}'s Well-being Classification`
    );
    const body = encodeURIComponent(
      `Dear ${profile.full_name},\n\n` +
        `This message is to reach out regarding your recent well-being classification result, ` +
        `which indicated a status of "${profile.latest_classification.status}".\n\n` +
        `If you need assistance or would like to discuss further, you may reach out to the Guidance Office. ` +
        `We are here to support you in maintaining your academic and emotional well-being.\n\n` +
        `Best regards,\n` +
        `University Guidance Office`
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${profile.email}&su=${subject}&body=${body}`;

    try {
      window.open(gmailUrl, "_blank");
    } catch (error) {
      console.error("Gmail compose could not be opened:", error);
      alert(
        `Unable to open Gmail. You can manually email the student at: ${profile.email}`
      );
    }
  };

  const classificationMessages: Record<string, string> = {
    InCrisis:
      "We noticed that your latest classification indicates you may be in crisis. Please know that we are here to help and encourage you to schedule an appointment with the Guidance Office as soon as possible.",
    Struggling:
      "Your latest classification shows you might be struggling. Our team would like to offer support and resources to help you improve your well-being.",
    Thriving:
      "Congratulations on maintaining a positive well-being status. Keep up the good work and continue practicing healthy habits.",
    Excelling:
      "Your performance and well-being are outstanding. Continue to be a role model for your peers.",
  };

  const message =
    classificationMessages[profile.latest_classification.status] || "";

  const body = encodeURIComponent(
    `Dear ${profile.full_name},\n\n${message}\n\nBest regards,\nUniversity Guidance Office`
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Status Badge */}
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
            <p className="text-xs text-gray-500 uppercase tracking-wide">
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

      {/* Details Grid */}
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
      </div>

      {/* Mood Chart */}
      <div className="p-6 bg-white rounded-2xl shadow-md">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <IoCalendarOutline size={24} className="text-[#460F9D]" />
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              7-Day Mood Check-In Overview
            </h3>
            <p className="text-sm text-gray-500">
              Daily mood frequency tracking
            </p>
          </div>
        </div>

        {profile.recent_moods.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No mood check-ins recorded</p>
            <p className="text-sm mt-1">
              This student hasn’t logged any moods in the past 7 days.
            </p>
          </div>
        ) : (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#e5e7eb"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="day"
                  stroke="#6b7280"
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#6b7280"
                  tickLine={false}
                  axisLine={false}
                  domain={[0, maxCheckIns]}
                  allowDecimals={false}
                  width={40}
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  content={<CustomMoodTooltip />}
                  cursor={{ fill: "#f3f4f6" }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "16px" }}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: "#4b5563", fontSize: "13px" }}>
                      {" "}
                      {EMOTION_COLOR_MAP[
                        value as keyof typeof EMOTION_COLOR_MAP
                      ]?.label || value}{" "}
                    </span>
                  )}
                />
                {activeMoods.map((moodKey) => (
                  <Bar
                    key={moodKey}
                    dataKey={moodKey}
                    name={EMOTION_COLOR_MAP[moodKey]?.label || moodKey}
                    stackId="a"
                    fill={EMOTION_COLOR_MAP[moodKey]?.color || "#ccc"}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

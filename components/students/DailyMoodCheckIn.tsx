'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { IoCalendarOutline } from "react-icons/io5";

// types
interface DailyMoodCheckInProps {
  profile: any;
  chartData: any[];
  maxCheckIns: number;
  activeMoods: string[];
  emotionColorMap: Record<string, { label: string; color: string }>;
  customTooltip: React.ComponentType<any>;
}

const DailyMoodCheckIn: React.FC<DailyMoodCheckInProps> = ({
  profile,
  chartData,
  maxCheckIns,
  activeMoods,
  emotionColorMap,
  customTooltip: CustomMoodTooltip,
}) => {
  return (
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
                    {emotionColorMap[value]?.label || value}{" "}
                  </span>
                )}
              />
              {activeMoods.map((moodKey) => (
                <Bar
                  key={moodKey}
                  dataKey={moodKey}
                  name={emotionColorMap[moodKey]?.label || moodKey}
                  stackId="a"
                  fill={emotionColorMap[moodKey]?.color || "#ccc"}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DailyMoodCheckIn;
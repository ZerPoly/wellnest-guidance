'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { IoCalendarOutline, IoTrendingUpOutline } from "react-icons/io5";
import { AiOutlineFilter } from "react-icons/ai";

const TEXT_MAP: Record<number, string> = {
  1: 'In-Crisis',
  2: 'Struggling',
  3: 'Thriving',
  4: 'Excelling',
};

const STATUS_COLORS: Record<string, string> = {
  InCrisis: "hsl(0, 80%, 55%)",
  Struggling: "hsl(31, 100%, 61%)",
  Thriving: "hsl(180, 70%, 50%)",
  Excelling: "hsl(141, 86%, 46%)",
};

const MentalWellBeingStatus = ({ profile }: { profile: any }) => {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dailyData = [
    { day: 'Feb 5', level: 1, status: 'InCrisis' },
    { day: 'Feb 6', level: 1, status: 'InCrisis' },
    { day: 'Feb 7', level: 2, status: 'Struggling' },
  ];

  const weeklyData = [
    { day: 'Week 1 (Feb 1-7)', level: 2, status: 'Struggling' },
    { day: 'Week 2 (Feb 8-14)', level: 3, status: 'Thriving' },
    { day: 'Week 3 (Feb 15-21)', level: 3, status: 'Thriving' },
    { day: 'Week 4 (Feb 22-28)', level: 4, status: 'Excelling' },
  ];

  const monthlyData = [
    { day: 'Jan', level: 2, status: 'Struggling' },
    { day: 'Feb', level: 3, status: 'Thriving' },
    { day: 'Mar', level: 4, status: 'Excelling' },
  ];

  const yearlyData = [
    { day: '2024', level: 2, status: 'Struggling' },
    { day: '2025', level: 3, status: 'Thriving' },
    { day: '2026', level: 4, status: 'Excelling' },
  ];

  const currentData = useMemo(() => {
    if (view === 'Daily') return dailyData;
    if (view === 'Weekly') return weeklyData;
    if (view === 'Monthly') return monthlyData;
    return yearlyData;
  }, [view]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-xl text-sm">
          <p className="font-bold text-gray-800 mb-1">{data.day}</p>
          <p className="font-medium" style={{ color: STATUS_COLORS[data.status] }}>
            Status: {TEXT_MAP[data.level]}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!mounted) return null;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <IoTrendingUpOutline size={24} className="text-[#460F9D]" />
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Well-Being Classification Trends
            </h3>
            <p className="text-sm text-gray-500">
              Daily change of the student classification
            </p>
          </div>
        </div>

        {/* filter dropdown selection */}
        <div className="relative self-end sm:self-auto">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl transition-all shadow-sm hover:border-purple-400"
          >
            <AiOutlineFilter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">
              Filter: {view}
            </span>
            <svg 
              className={`w-4 h-4 ml-1 transition-transform ${showFilter ? 'rotate-180' : ''}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFilter && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 overflow-hidden">
                {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setView(option);
                      setShowFilter(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                      view === option ? "bg-purple-50 text-purple-700 font-bold" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {option}
                    {view === option && <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentData}
            margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
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
              dy={10}
            />
            <YAxis
              stroke="#6b7280"
              tickLine={false}
              axisLine={false}
              domain={[0, 4]}
              ticks={[1, 2, 3, 4]}
              tickFormatter={(value) => TEXT_MAP[value]}
              width={80}
              style={{ fontSize: "11px", fontWeight: 600 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#f3f4f6", opacity: 0.4 }}
            />
            <Bar 
              dataKey="level" 
              radius={[6, 6, 0, 0]}
              barSize={120} 
            >
              {currentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MentalWellBeingStatus;
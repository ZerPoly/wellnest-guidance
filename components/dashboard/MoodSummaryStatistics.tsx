'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const MOOD_COLORS: Record<string, string> = {
  Anxious: "#E11D48",
  Stressed: "#FB7185",
  Exhausted: "#71717A",
};

const MoodSummaryStatistics = () => {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Mock Data Generation ---
  const weeklyData = useMemo(() => [
    { name: 'Feb 5', Anxious: 12, Stressed: 8, Exhausted: 5 },
    { name: 'Feb 6', Anxious: 10, Stressed: 15, Exhausted: 7 },
    { name: 'Feb 7', Anxious: 5, Stressed: 10, Exhausted: 12 },
    { name: 'Feb 8', Anxious: 2, Stressed: 4, Exhausted: 3 },
    { name: 'Feb 9', Anxious: 15, Stressed: 20, Exhausted: 10 },
    { name: 'Feb 10', Anxious: 18, Stressed: 12, Exhausted: 14 },
    { name: 'Feb 11', Anxious: 22, Stressed: 18, Exhausted: 15 },
  ], []);

  const monthlyData = useMemo(() => [
    { name: 'Week 1', Anxious: 45, Stressed: 30, Exhausted: 20 },
    { name: 'Week 2', Anxious: 55, Stressed: 40, Exhausted: 25 },
    { name: 'Week 3', Anxious: 30, Stressed: 50, Exhausted: 40 },
    { name: 'Week 4', Anxious: 60, Stressed: 45, Exhausted: 35 },
  ], []);

  const currentData = view === 'weekly' ? weeklyData : monthlyData;

  if (!mounted) return <div className="min-h-[350px] animate-pulse bg-gray-100 rounded-2xl" />;

  return (
    <div className="flex flex-col border border-(--outline) bg-(--bg) p-6 rounded-2xl shadow-md min-h-[350px]">
      {/* Header with Filter */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-(--text-muted)">Student Sentiment</h2>
          <p className="text-sm text-gray-500">
            {view === 'weekly' ? 'Daily frequency tracking' : 'Monthly aggregate volume'}
          </p>
        </div>

        {/* --- Filter Toggle --- */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button 
            onClick={() => setView('weekly')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              view === 'weekly' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setView('monthly')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              view === 'monthly' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--outline)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#888' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#888' }} 
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
            
            <Bar dataKey="Anxious" stackId="a" fill={MOOD_COLORS.Anxious} />
            <Bar dataKey="Stressed" stackId="a" fill={MOOD_COLORS.Stressed} />
            <Bar dataKey="Exhausted" stackId="a" fill={MOOD_COLORS.Exhausted} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MoodSummaryStatistics;
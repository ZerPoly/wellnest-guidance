'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { getCounselorConfirmedAppointments } from '@/lib/api/appointments/counselorAppointments';
import { Appointment } from '@/lib/api/appointments/types';

interface ConsultationStatisticsProps {
    timeFilter?: string;
}

interface DayData {
    day: string;
    date: string; // e.g., "Feb 9"
    total: number;
}

const CHART_TITLE = "Total Weekly Consultation Volume";
const CHART_HEIGHT = 325;
const MAX_CONSULTATIONS = 6;

const getCurrentWeekDates = (): DayData[] => {
  const today = new Date();
  const currentDay = today.getDay(); 
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const weekDays: DayData[] = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + mondayOffset + i);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const dayNumber = date.getDate();
    
    weekDays.push({
      day: dayNames[i],
      date: `${monthName} ${dayNumber}`,
      total: 0,
    });
  }
  return weekDays;
};

const getWeekRange = (): { start: Date; end: Date } => {
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);
  return { start: monday, end: friday };
};

const ConsultationStatistics: React.FC<ConsultationStatisticsProps> = ({ timeFilter = 'Weekly' }) => {
  const { data: session } = useSession();
  const accessToken = session?.counselorToken || session?.adminToken;

  const [chartData, setChartData] = useState<DayData[]>(getCurrentWeekDates());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      fetchWeeklyData();
    }
  }, [accessToken, timeFilter]);

  const fetchWeeklyData = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);

    try {
      const { start, end } = getWeekRange();
      const result = await getCounselorConfirmedAppointments(
        accessToken,
        start.toISOString(),
        end.toISOString()
      );

      if (result.success && result.data) {
        const weekStructure = getCurrentWeekDates();
        result.data.forEach((appointment: Appointment) => {
          const appointmentDate = new Date(appointment.start_time);
          const dayOfWeek = appointmentDate.getDay(); 
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const dayIndex = dayOfWeek - 1; 
            if (weekStructure[dayIndex].total < MAX_CONSULTATIONS) {
              weekStructure[dayIndex].total++;
            }
          }
        });
        setChartData(weekStructure);
      } else {
        setError(result.message || 'Failed to load consultation data');
      }
    } catch (err) {
      setError('Failed to load consultation data');
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Branding color updated to Cyan
  const brandingColor = "var(--cyan)";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-[var(--card)] border border-[var(--line)] rounded-lg shadow-xl text-sm">
          <p className="font-bold text-[var(--text)] mb-1">{data.date} ({label})</p>
          <p className="font-bold" style={{ color: brandingColor }}>
            {`Total Volume: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 border border-[var(--line)] h-full bg-[var(--card)] p-4 rounded-2xl shadow-md flex flex-col">
      
      {/* Title - Fixed color variable */}
      <h2 className="text-xl font-bold text-[var(--foreground-muted)] mb-4">{CHART_TITLE}</h2>
      
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-full">
          <p className="text-[var(--foreground-muted)] animate-pulse">Loading consultation data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500 font-bold">{error}</p>
        </div>
      )}
      
      {/* Chart */}
      {!loading && !error && (
        <div style={{ width: '100%', height: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid 
                vertical={false} 
                stroke="var(--line)" 
                strokeDasharray="3 3" 
              />
              
              <XAxis 
                dataKey="date" 
                stroke="var(--foreground-muted)"
                tickLine={false} 
                axisLine={false} 
                padding={{ left: 20, right: 20 }}
                tick={{ fontSize: 12, fontWeight: 600 }}
              />
              
              <YAxis 
                dataKey="total"
                stroke="var(--foreground-muted)"
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}`}
                domain={[0, MAX_CONSULTATIONS]}
                tick={{ fontSize: 12, fontWeight: 600 }}
              />

              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'var(--card-dark)', opacity: 0.4 }} 
              />

              <Bar 
                dataKey="total" 
                name="Total Volume" 
                fill={brandingColor} 
                radius={[4, 4, 0, 0]}
                minPointSize={5}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ConsultationStatistics;
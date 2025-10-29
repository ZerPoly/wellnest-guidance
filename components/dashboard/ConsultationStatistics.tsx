'use client';

import React, { useMemo } from 'react';
// Imports for Recharts components (used by Shadcn pattern)
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
    // Removed: Legend (since we show total only)
} from 'recharts';

interface ConsultationStatisticsProps {}

// --- Chart Data Definition ---

// NOTE: Data structure simplified to show only the total count per day.
interface DayData {
    day: string;
    total: number; // New field representing combined consultation volume
}

const mockChartData: DayData[] = [
    { day: 'Mon', total: 23 }, // 15 + 8
    { day: 'Tue', total: 25 }, // 20 + 5
    { day: 'Wed', total: 22 }, // 10 + 12
    { day: 'Thu', total: 24 }, // 18 + 6
    { day: 'Fri', total: 40 }, // 25 + 15
];

const CHART_TITLE = "Total Weekly Consultation Volume";
const CHART_HEIGHT = 382;

/**
 * A reusable "bento box" component rendering a Bar Chart using the Recharts/Shadcn pattern.
 */
const ConsultationStatistics: React.FC<ConsultationStatisticsProps> = () => {

    // Define color using Tailwind standard or CSS variables
    const primaryColor = "hsl(263, 83%, 34%)"; // Deep Purple

    // Custom Tooltip component for a cleaner look
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-3 bg-[var(--bg-light)] border border-[var(--border)] rounded-lg shadow-xl text-sm">
                    <p className="font-bold text-[var(--title)] mb-1">{label}</p>
                    <p style={{ color: primaryColor }}>
                        {`Total Volume: ${payload[0].value}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex-1 border border-[var(--outline)] h-full bg-[var(--bg)] p-4 rounded-2xl shadow-md flex flex-col"> 
            
            {/* Title */}
            <h2 className="text-xl font-bold text-[var(--text-muted)] mb-4">{CHART_TITLE}</h2>
            
            {/* Responsive Chart Container */}
            <div style={{ width: '100%', height: CHART_HEIGHT }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={mockChartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        style={{ fontFamily: 'Metropolis, sans-serif' }} 
                    >
                        {/* Grid lines (light and minimal) */}
                        <CartesianGrid 
                            vertical={false} 
                            stroke="var(--outline)" 
                            strokeDasharray="3 3" 
                        />
                        
                        {/* X-Axis (Days) */}
                        <XAxis 
                            dataKey="day" 
                            stroke="var(--text-muted)"
                            tickLine={false} 
                            axisLine={false} 
                            padding={{ left: 20, right: 20 }}
                        />
                        
                        {/* Y-Axis (Volume) */}
                        <YAxis 
                            dataKey="total" // Use the total field for Y-axis scaling
                            stroke="var(--text-muted)"
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => `${value}`}
                        />

                        {/* Custom Tooltip */}
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-light)', opacity: 0.5 }} />

                        {/* Single Bar: Total Consultation Volume */}
                        <Bar 
                            dataKey="total" 
                            name="Total Volume" 
                            fill={primaryColor} 
                            radius={[4, 4, 0, 0]} // Rounded corners
                            minPointSize={5} // Ensure tiny bars are visible
                        />
                        
                        {/* Removed the second <Bar> component */}

                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ConsultationStatistics;

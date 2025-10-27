'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PieChart, PieSeriesType } from "@mui/x-charts";

// Import API fetcher and types
import { 
    fetchStudents, 
    StudentClassification,
    FetchStudentsResponse 
} from '@/lib/api/studentClassification'; 

// Renamed the interface to match the new component name
interface FlaggedStudentsProps {}

// --- Configuration ---

// Map classification names to colors for consistency across the app
const CLASSIFICATION_COLORS: Record<StudentClassification['classification'], string> = {
    'InCrisis': 'hsl(0, 80%, 55%)',    // Red/Crimson for high alert
    'Struggling': 'hsl(31, 100%, 61%)', // Orange/Amber
    'Thriving': 'hsl(180, 70%, 50%)',   // Cyan/Teal
    'Excelling': 'hsl(141, 86%, 46%)',  // Green
};

const CHART_TITLE = "Student Classification Summary";
const CHART_HEIGHT = 350; 
const CHART_WIDTH = 280;  

/**
 * Helper function to transform raw API data into MUI Pie Chart format.
 * Focuses only on Flagged Students for the pie chart.
 * @param classifications Array of student classification records.
 * @returns PieSeriesType data structure.
 */
const aggregateDataForPie = (classifications: StudentClassification[]): PieSeriesType['data'] => {
    // 1. Filter only students marked as flagged
    // NOTE: This now counts ALL students (flagged or not) to provide the full classification overview.
    // If you only want Flagged: classifications.filter(s => s.is_flagged);
    const studentsToCount = classifications; 
    
    // 2. Aggregate counts by classification type
    const counts = studentsToCount.reduce((acc, entry) => {
        acc[entry.classification] = (acc[entry.classification] || 0) + 1;
        return acc;
    }, {} as Record<StudentClassification['classification'], number>);

    // 3. Transform aggregated counts into MUI Pie Data format
    return Object.entries(counts)
        .map(([label, value], index) => ({
            id: index,
            value: value,
            label: label,
            color: CLASSIFICATION_COLORS[label as StudentClassification['classification']],
        }))
        // Filter out zero-value slices
        .filter(item => item.value > 0);
};

/**
 * A self-contained "bento box" component that fetches and renders the student classification Pie Chart.
 */
export default function FlaggedStudents() {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;

    const [pieData, setPieData] = useState<PieSeriesType['data']>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Calculate total students (memoized)
    const TOTAL_STUDENTS = useMemo(() => {
        return pieData.reduce((sum, item) => sum + item.value, 0);
    }, [pieData]);

    const chartCenterX = CHART_WIDTH / 2;
    const chartCenterY = CHART_HEIGHT / 2;

    // --- Data Fetching Effect ---
    const fetchData = useCallback(async () => {
        if (!token) {
            setIsLoading(false);
            setError("Authentication token not available. Please ensure you are logged in.");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            // Fetch data (limit: 500 records for the aggregated chart view)
            const result: FetchStudentsResponse = await fetchStudents(token, { limit: 500 });

            if (result.success && result.data?.classifications) {
                // Transform and set the state
                setPieData(aggregateDataForPie(result.data.classifications));
            } else {
                console.error("FlaggedStudents Fetch API Error:", result);
                setError(result.message || "Failed to load student data.");
            }
        } catch (err) {
            console.error("FlaggedStudents Network Error:", err);
            setError("Network Error: Could not connect to the API server.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Loading and Error States ---

    if (isLoading) {
        return (
            <div className="flex-1 border border-[var(--outline)] h-full bg-[var(--bg)] p-4 rounded-2xl shadow-md flex items-center justify-center min-h-[350px]">
                <p className="text-gray-500 font-medium">Loading Classification Data...</p>
            </div>
        );
    }

    if (error) {
         return (
            <div className="flex-1 border border-red-400 h-full bg-red-50 p-4 rounded-2xl shadow-md flex flex-col items-center justify-center min-h-[350px] text-red-700">
                <p className="font-bold">Error loading data:</p>
                <p className="text-sm text-center mb-4">{error}</p>
                <button
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // --- Main Render (Chart or No Data) ---

    return (
        <div className="flex-1 border border-[var(--outline)] h-full bg-[var(--bg)] p-4 rounded-2xl shadow-md flex flex-col relative"> 
            
            {/* Title: Left-align the title */}
            <h2 className="text-xl font-bold text-[var(--text-muted)] mb-4">{CHART_TITLE}</h2>
            
            {TOTAL_STUDENTS === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[300px] text-gray-500 font-medium">
                    No student data available to visualize.
                </div>
            ) : (
                <div className="flex items-center justify-center w-full">
                    <PieChart
                        series={[
                            {
                                data: pieData, 
                                innerRadius: 80, 
                                outerRadius: 100, 
                                paddingAngle: 5, 
                                cornerRadius: 5, 
                                startAngle: -90, 
                                endAngle: 270,   
                                cx: chartCenterX, 
                                cy: chartCenterY, 
                            },
                        ]}
                        height={CHART_HEIGHT}
                        width={CHART_WIDTH} 
                        
                        sx={{
                            ".MuiChartsLegend-label, .MuiChartsAxis-tick, .MuiChartsAxis-label": {
                                fontFamily: "Metropolis, sans-serif !important",
                            },
                            "text": {
                                fontFamily: "Metropolis, sans-serif !important",
                                fill: 'var(--text-muted)',
                            }
                        }}
                        slotProps={{
                            legend: {
                                direction: 'row',
                                position: { vertical: 'bottom', horizontal: 'middle' },
                                padding: { top: 10, bottom: 0, left: 10, right: 10 },
                                itemMark: {
                                    width: 10,
                                    height: 10,
                                },
                            },
                        }}
                        margin={{ top: 5, bottom: 20, left: 5, right: 5 }} 
                    >
                        {/* Custom total label in the center of the donut */}
                        <text 
                          x={chartCenterX} 
                          y={chartCenterY + 5} 
                          textAnchor="middle" 
                          dominantBaseline="middle" 
                          className="text-3xl font-bold fill-[var(--text-color)]" 
                          style={{ fontFamily: "Metropolis, sans-serif" }} 
                        >
                          {TOTAL_STUDENTS}
                        </text>
                    </PieChart>
                </div>
            )}
        </div>
    );
}

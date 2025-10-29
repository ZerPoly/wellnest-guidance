'use client';

import * as React from "react"
import { useSession } from "next-auth/react";
// Recharts Imports
import { Label, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { TrendingUp } from "lucide-react"; 

// Import API fetcher and types
import { 
    fetchStudents, 
    StudentClassification,
    FetchStudentsResponse
} from '@/lib/api/studentClassification'; 

// --- Configuration ---

// Map classification names to explicit HSL colors (stable)
const CLASSIFICATION_COLORS: Record<StudentClassification['classification'], string> = {
    'InCrisis': "hsl(0, 80%, 55%)",    // Red
    'Struggling': "hsl(31, 100%, 61%)", // Orange
    'Thriving': "hsl(180, 70%, 50%)",   // Cyan
    'Excelling': "hsl(141, 86%, 46%)",  // Green
};

const CHART_TITLE = "Student Classification Summary";
const CHART_HEIGHT = 350; 
const CHART_WIDTH = 280; 

// Recharts formatted data type
interface ChartDataPoint {
    name: string;
    value: number;
    fill: string;
}

/**
 * Helper function to transform raw API data into Recharts format.
 */
const aggregateDataForPie = (classifications: StudentClassification[]): ChartDataPoint[] => {
    const studentsToCount = classifications; 
    
    const counts = studentsToCount.reduce((acc, entry) => {
        acc[entry.classification] = (acc[entry.classification] || 0) + 1;
        return acc;
    }, {} as Record<StudentClassification['classification'], number>);

    return Object.entries(counts)
        .map(([classification, count], index) => ({
            name: classification,
            value: count,
            fill: CLASSIFICATION_COLORS[classification as keyof typeof CLASSIFICATION_COLORS] || "hsl(0 0% 50%)",
        }))
        .filter(item => item.value > 0);
};

// --- Custom Tooltip (Functional Component) ---
// This component replaces the complex ChartTooltipContent wrapper 
// to ensure the tooltip renders correctly without missing Shadcn files.
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        // Use standard Tailwind classes, avoiding CSS variables for stability
        return (
            <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-md text-sm text-gray-700">
                <p className="font-bold mb-1" style={{ color: item.fill }}>{item.name}</p>
                <p>{`Students: ${item.value.toLocaleString()}`}</p>
            </div>
        );
    }
    return null;
};


// --- Main Component ---
export default function FlaggedStudents() {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;

    const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Calculate total students (memoized)
    const TOTAL_STUDENTS = React.useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.value, 0);
    }, [chartData]);

    // --- Data Fetching ---
    const fetchData = React.useCallback(async () => {
        if (!token) {
            setLoading(false);
            setError("Authentication token not available.");
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const result: FetchStudentsResponse = await fetchStudents(token, { limit: 500 });

            if (result.success && result.data?.classifications) {
                const formatted = aggregateDataForPie(result.data.classifications);
                setChartData(formatted);
            } else {
                setError(result.message || "Failed to load student data.");
            }
        } catch (err) {
            setError("Network Error: Could not connect to the API server.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Loading and Error States (Simplified) ---

    if (loading) {
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

    // --- Main Render (Chart) ---
    return (
        <div className="flex flex-col flex-1 border border-[var(--outline)] h-full bg-[var(--bg)] p-4 rounded-2xl shadow-md">
            
            {/* Header (replicates CardHeader content) */}
            <header className="flex items-center justify-between pb-0">
                <div className="grid gap-1">
                    <h2 className="text-xl font-bold text-[var(--text-muted)]">{CHART_TITLE}</h2>
                    <p className="text-sm text-[var(--text-muted)]">Total: {TOTAL_STUDENTS.toLocaleString()} Students</p>
                </div>
            </header>

            <div className="flex-1 pb-0 flex justify-center">
                
                {TOTAL_STUDENTS === 0 ? (
                    <div className="flex items-center justify-center min-h-[300px] text-gray-500 font-medium">
                        No student data available to visualize.
                    </div>
                ) : (
                    // Recharts Container
                    <div className="mx-auto aspect-square w-full max-w-[300px]" style={{ height: CHART_HEIGHT }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                {/* TOOLTIP FIX: Using standard Recharts Tooltip with CustomTooltip content */}
                                <Tooltip
                                    cursor={false}
                                    content={<CustomTooltip />}
                                />
                                
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={80}
                                    outerRadius={100}
                                    strokeWidth={1}
                                    paddingAngle={2}
                                    startAngle={90}
                                    endAngle={450}
                                >
                                    {/* Map Cell components to apply colors */}
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                    
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                const centerY = (viewBox.cy || 0) - 10; 
                                                
                                                return (
                                                    <text x={viewBox.cx} y={centerY} textAnchor="middle" dominantBaseline="middle">
                                                        <tspan x={viewBox.cx} y={centerY} 
                                                               style={{ fontSize: '32px', fontFamily: 'Metropolis, sans-serif', fontWeight: 700, fill: 'var(--title)' }}
                                                        >
                                                            {TOTAL_STUDENTS.toLocaleString()}
                                                        </tspan>
                                                        <tspan x={viewBox.cx} y={centerY + 24} 
                                                               style={{ fontSize: '14px', fontFamily: 'Metropolis, sans-serif', fill: 'var(--text-muted)' }}
                                                        >
                                                            Total Students
                                                        </tspan>
                                                    </text>
                                                )
                                            }
                                            return null;
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Footer (replicates CardFooter content) */}
            <div className="flex flex-col gap-2 text-sm pt-4 border-t border-[var(--outline)]">
                <div className="flex items-center gap-2 leading-none font-medium text-[var(--text-muted)]">
                    Aggregated data from {TOTAL_STUDENTS} students.
                    <TrendingUp className="h-4 w-4" /> 
                </div>
                <Legend
                    iconType="circle"
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="left"
                    payload={chartData.map(item => ({
                        value: item.name, 
                        type: 'circle', 
                        color: item.fill 
                    }))}
                    formatter={(value) => (
                        <span className="text-[var(--text-muted)] text-xs" style={{ fontFamily: 'Metropolis, sans-serif' }}>
                            {value}
                        </span>
                    )}
                />
            </div>
        </div>
    );
}

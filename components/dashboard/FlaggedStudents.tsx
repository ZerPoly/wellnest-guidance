'use client';

import * as React from "react"
import { useSession } from "next-auth/react";
import { Label, Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react"; 
import { 
  fetchStudents, 
  StudentClassification,
  FetchStudentsResponse
} from '@/lib/api/studentClassification'; 

const CLASSIFICATION_COLORS: Record<StudentClassification['classification'], string> = {
  'InCrisis': "hsl(0, 80%, 55%)",
  'Struggling': "hsl(31, 100%, 61%)",
  'Thriving': "hsl(180, 70%, 50%)",
  'Excelling': "hsl(141, 86%, 46%)",
};

const CHART_TITLE = "Student Classification Summary";
const CHART_HEIGHT = 350; 

interface ChartDataPoint {
  name: string;
  value: number;
  fill: string;
}

const aggregateDataForPie = (classifications: StudentClassification[]): ChartDataPoint[] => {
  const counts = classifications.reduce((acc, entry) => {
    acc[entry.classification] = (acc[entry.classification] || 0) + 1;
    return acc;
  }, {} as Record<StudentClassification['classification'], number>);

  return Object.entries(counts)
    .map(([classification, count]) => ({
      name: classification,
      value: count,
      fill: CLASSIFICATION_COLORS[classification as keyof typeof CLASSIFICATION_COLORS] || "hsl(0 0% 50%)",
    }))
    .filter(item => item.value > 0);
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-md text-sm text-gray-700">
        <p className="font-bold mb-1" style={{ color: item.payload.fill }}>{item.name}</p>
        <p>{`Students: ${item.value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

export default function FlaggedStudents() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;

  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const TOTAL_STUDENTS = React.useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const fetchData = React.useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result: FetchStudentsResponse = await fetchStudents(token, { limit: 500 });
      if (result.success && result.data?.classifications) {
        setChartData(aggregateDataForPie(result.data.classifications));
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

  if (loading) {
    return (
      <div className="flex-1 border border-[var(--outline)] bg-[var(--bg)] p-4 rounded-2xl shadow-md flex items-center justify-center min-h-[350px]">
        <p className="text-gray-500 font-medium">Loading Classification Data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 border border-[var(--outline)] bg-[var(--bg)] p-6 rounded-2xl shadow-md min-h-[350px]">
      <header className="mb-2">
        <h2 className="text-xl font-bold text-[var(--text-muted)]">{CHART_TITLE}</h2>
        <p className="text-sm text-[var(--text-muted)]">Total: {TOTAL_STUDENTS.toLocaleString()} Students</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        {TOTAL_STUDENTS === 0 ? (
          <p className="text-gray-500 font-medium italic">No student data available to visualize.</p>
        ) : (
          <>
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      position="center"
                      content={({ viewBox }: any) => {
                        const { cx, cy } = viewBox;
                        return (
                          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                            <tspan x={cx} y={cy - 5} className="fill-[var(--title)] text-3xl font-bold">
                              {TOTAL_STUDENTS}
                            </tspan>
                            <tspan x={cx} y={cy + 20} className="fill-[var(--text-muted)] text-sm font-medium">
                              Total Students
                            </tspan>
                          </text>
                        );
                      }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-2">
              {chartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3.5 h-3.5 rounded-full" 
                    style={{ backgroundColor: entry.fill }} 
                  />
                  <span 
                    className="text-sm font-semibold text-[var(--text-muted)]"
                  >
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="pt-4 mt-4 border-t border-[var(--outline)]">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
          <span>Aggregated data from {TOTAL_STUDENTS} students.</span>
          <TrendingUp className="h-4 w-4" /> 
        </div>
      </footer>
    </div>
  );
}
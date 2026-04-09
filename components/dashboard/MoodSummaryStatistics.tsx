'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { HiOutlineDownload } from 'react-icons/hi';
import { useToastContext } from '@/lib/providers/ToastProvider';

// Import your API functions
import { getDepartmentStatistics, downloadStatisticsFile } from '@/lib/api/statistics';

const CLASSIFICATION_COLORS: Record<string, string> = {
  'Excelling': "#10B981", 
  'Thriving': "#3B82F6",  
  'Struggling': "#F59E0B", 
  'In Crisis': "#EF4444", 
  'Unclassified': "#9CA3AF", 
};

const MoodSummaryStatistics = () => {
  const { data: session } = useSession();
  const { error: showErrorToast, success: showSuccessToast } = useToastContext();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [departmentName, setDepartmentName] = useState<string>("Department");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch chart data on load
  useEffect(() => {
    const fetchStats = async () => {
      const token = (session as any)?.counselorToken || (session as any)?.adminToken;
      if (!token) return;

      try {
        setLoading(true);
        const stats = await getDepartmentStatistics(token);

        let aggregatedData;
        let displayDepartmentName = "Department";

        // --- FIXED: Admin Array vs Counselor Object Logic ---
        if (Array.isArray(stats)) {
          // It's an admin! Add up all the counts from every department
          displayDepartmentName = "All Departments (University Wide)";
          aggregatedData = {
            excelling_count: stats.reduce((sum, dept) => sum + (dept.excelling_count || 0), 0),
            thriving_count: stats.reduce((sum, dept) => sum + (dept.thriving_count || 0), 0),
            struggling_count: stats.reduce((sum, dept) => sum + (dept.struggling_count || 0), 0),
            in_crisis_count: stats.reduce((sum, dept) => sum + (dept.in_crisis_count || 0), 0),
            not_classified_count: stats.reduce((sum, dept) => sum + (dept.not_classified_count || 0), 0),
          };
        } else {
          // It's a counselor! Use the single object directly
          displayDepartmentName = stats.department_name;
          aggregatedData = stats;
        }

        setDepartmentName(displayDepartmentName);

        const formattedData = [
          { name: 'Excelling', count: aggregatedData.excelling_count },
          { name: 'Thriving', count: aggregatedData.thriving_count },
          { name: 'Struggling', count: aggregatedData.struggling_count },
          { name: 'In Crisis', count: aggregatedData.in_crisis_count },
          { name: 'Unclassified', count: aggregatedData.not_classified_count },
        ];

        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch department statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchStats();
  }, [session]);

  // Handle Export Download (CSV or JSON)
  const handleDownload = async (format: 'csv' | 'raw') => {
    const token = (session as any)?.counselorToken || (session as any)?.adminToken;
    if (!token) {
      if (showErrorToast) showErrorToast("Authentication missing.");
      return;
    }

    if (chartData.length === 0) {
      if (showErrorToast) showErrorToast("No data to export yet.");
      return;
    }

    try {
      setIsDownloading(true);
      
      const blob = await downloadStatisticsFile(token, format);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const safeFileName = departmentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const extension = format === 'raw' ? 'json' : 'csv';
      
      a.download = `statistics_${safeFileName}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      
      a.remove();
      window.URL.revokeObjectURL(url);
      
      if (showSuccessToast) showSuccessToast(`Successfully exported ${extension.toUpperCase()}!`);
    } catch (error: any) {
      console.error(error);
      if (showErrorToast) showErrorToast(`Failed to download ${format.toUpperCase()}.`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!mounted) return <div className="min-h-[350px] animate-pulse bg-[var(--card-dark)] rounded-2xl" />;

  return (
    <div className="flex flex-col border border-[var(--line)] bg-[var(--card)] p-6 rounded-2xl shadow-md min-h-[350px]">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--title)]">Student Classifications</h2>
          <p className="text-sm text-[var(--foreground-muted)] uppercase tracking-wider font-bold mt-1">
            {departmentName}
          </p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex items-center bg-[var(--background-dark)] border border-[var(--line)] rounded-xl p-1">
          <div className="px-3 py-1.5 flex items-center gap-2 border-r border-[var(--line)] text-sm font-bold text-[var(--foreground-muted)]">
            {isDownloading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--cyan)]"></div>
            ) : (
              <HiOutlineDownload size={16} />
            )}
            <span className="hidden md:inline">Export</span>
          </div>
          
          <button
            onClick={() => handleDownload('csv')}
            disabled={loading || isDownloading}
            className="px-4 py-1.5 text-sm font-bold text-[var(--foreground-muted)] hover:text-[var(--cyan)] hover:bg-[var(--card)] rounded-lg transition-all disabled:opacity-50"
          >
            CSV
          </button>
          
          <button
            onClick={() => handleDownload('raw')}
            disabled={loading || isDownloading}
            className="px-4 py-1.5 text-sm font-bold text-[var(--foreground-muted)] hover:text-[var(--cyan)] hover:bg-[var(--card)] rounded-lg transition-all disabled:opacity-50"
          >
            JSON
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-[250px]">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--foreground-muted)]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--cyan)] mb-4"></div>
            <p className="font-bold text-sm">Loading statistics...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-[var(--foreground-muted)] text-sm font-bold border-2 border-dashed border-[var(--line)] rounded-xl">
            No classification data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: 'var(--foreground-muted)', fontWeight: 'bold' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: 'var(--foreground-muted)' }} 
                allowDecimals={false}
              />
              <Tooltip 
                cursor={{ fill: 'var(--card-dark)', opacity: 0.4 }}
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  borderRadius: '12px', 
                  border: '1px solid var(--line)', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  color: 'var(--foreground)'
                }}
                itemStyle={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--title)' }}
                labelStyle={{ color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase' }}
                formatter={(value: number) => [value, 'Students']}
              />
              
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CLASSIFICATION_COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MoodSummaryStatistics;
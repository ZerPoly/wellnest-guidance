'use client';

import React from 'react';
// Import the necessary component and types directly from MUI X Charts
import { BarChart as MuiBarChart, BarSeriesType } from '@mui/x-charts';

interface ConsultationStatisticsProps {}

// --- Chart Data Definition ---

interface ChartData {
  series: BarSeriesType[];
  xAxisData: string[];
}

const mockChartData: ChartData = {
  series: [
    {
      data: [15, 20, 10, 18, 25],
      label: 'Individual Counseling',
      color: 'hsl(263, 83%, 34%)',
      type: 'bar',
      // Added property for rounded corners on the bars
      barRadius: 5, 
      stack: 'total', // Use stack property if needed for grouped bars
    }
  ],
  xAxisData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
};

const CHART_TITLE = "Consultation Statistics";
const CHART_HEIGHT = 350;

/**
 * A self-contained "bento box" component that directly renders the MUI X Bar Chart.
 * It provides the card styling (background, border, shadow) and the chart content.
 */
const ConsultationStatistics: React.FC<ConsultationStatisticsProps> = () => {
  return (
    <div className="flex-1 border border-[var(--outline)] h-full bg-[var(--bg)] p-4 rounded-2xl shadow-md"> 
        
        {/* Title */}
        <h2 className="text-xl font-bold text-[var(--text-muted)] mb-4">{CHART_TITLE}</h2>
        
        {/* Direct MUI X Bar Chart Implementation */}
        <MuiBarChart
            series={mockChartData.series}
            xAxis={[{ data: mockChartData.xAxisData, scaleType: 'band' }]}
            height={CHART_HEIGHT}
            
            // FIX 1: Apply custom styling to the internal SVG text elements (Font fix)
            // Assumes 'Metropolis' is defined in your global CSS.
            sx={{
                ".MuiChartsAxis-tick, .MuiChartsAxis-label, .MuiChartsLegend-label": {
                    fontFamily: "Metropolis, sans-serif !important",
                },
                // Ensure text elements on the X and Y axis use your font
                "text": {
                    fontFamily: "Metropolis, sans-serif !important",
                }
            }}
            
            slotProps={{
                // FIX 2: Explicitly define legend position to satisfy strict TypeScript definitions
                legend: {
                    direction: 'row',
                    position: { 
                      vertical: 'bottom', 
                      horizontal: 'middle' 
                    },
                    padding: { top: 10, bottom: 0, left: 10, right: 10 }
                }
            }}
            margin={{ top: 20, bottom: 50, left: 40, right: 20 }}
        />
    </div>
  );
};

export default ConsultationStatistics;

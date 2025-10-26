'use client';

import React from 'react';
// Import the necessary component and types directly from MUI X Charts
import { PieChart, PieSeriesType } from '@mui/x-charts';

// Renamed the interface to match the new component name
interface FlaggedStudentsProps {}

// --- Chart Data Definition ---
const mockPieData = [
  { id: 0, value: 5, label: 'In-Crisis', color: 'hsl(180, 70%, 50%)' }, 
  { id: 1, value: 15, label: 'Struggling', color: 'hsl(263, 83%, 34%)' }, 
];

const CHART_TITLE = "Flagged Students";
const CHART_HEIGHT = 350; // INCREASED height for a larger chart
const CHART_WIDTH = 300;  // INCREASED width
const TOTAL_STUDENTS = mockPieData.reduce((sum, item) => sum + item.value, 0);

/**
 * A self-contained "bento box" component that directly renders the MUI X Pie Chart
 * for flagged student statistics.
 */
const FlaggedStudents: React.FC<FlaggedStudentsProps> = () => {
  // Calculate the center point based on CHART_WIDTH and CHART_HEIGHT
  const chartCenterX = CHART_WIDTH / 2;
  const chartCenterY = CHART_HEIGHT / 2;

  return (
    <div className="flex-1 border border-[var(--outline)] h-full bg-[var(--bg)] p-4 rounded-2xl shadow-md flex flex-col relative"> 
        
        {/* Title: Left-align the title */}
        <h2 className="text-xl font-bold text-[var(--text-muted)] mb-4">{CHART_TITLE}</h2>
        
        <div className="flex items-center justify-center w-full">
            {/* Direct MUI X Pie Chart Implementation */}
            <PieChart
                series={[
                    {
                        data: mockPieData,
                        innerRadius: 80, // INCREASED inner radius (from 60)
                        outerRadius: 100, // INCREASED outer radius (from 80)
                        paddingAngle: 5, 
                        cornerRadius: 5, 
                        startAngle: -90, 
                        endAngle: 270,   
                        // Set cx/cy relative to chart dimensions
                        cx: chartCenterX, 
                        cy: chartCenterY, 
                    },
                ]}
                height={CHART_HEIGHT}
                width={CHART_WIDTH} // Use increased fixed width
                
                // Apply custom styling to the internal SVG text elements (Font fix)
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
                        itemMarkWidth: 10,
                        itemMarkHeight: 10,
                    },
                }}
                // Reduced margins to allow better centering within the small space
                margin={{ top: 5, bottom: 20, left: 5, right: 5 }} 
            >
                {/* Custom total label in the center of the donut */}
                <text 
                  x={chartCenterX} // Use calculated center X
                  y={chartCenterY + 5} // Use calculated center Y (added slight offset for vertical alignment)
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="text-3xl font-bold fill-[var(--text-color)]" // Increased font size for better visibility
                  style={{ fontFamily: "Metropolis, sans-serif" }} 
                >
                  {TOTAL_STUDENTS}
                </text>
            </PieChart>
        </div>
    </div>
  );
};

export default FlaggedStudents;

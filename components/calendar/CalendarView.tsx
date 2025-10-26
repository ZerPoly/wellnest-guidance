'use client';

import React, { useState } from 'react';
import { DateCalendar, PickersDay, DateCalendarProps } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { styled } from '@mui/material/styles';
import { Badge } from '@mui/material';
import { format } from 'date-fns';

// --- Mock Data ---

interface CalendarEvent {
    id: number;
    date: Date;
    type: 'counseling' | 'interview' | 'holiday';
}

// REMOVED time zone library dependency. Dates are now created using standard JS Date constructor.
const getMockDate = (dateString: string) => {
    // Format: YYYY-MM-DDTHH:MM:SS
    // When using this format without Z or UTC offset, JS treats it as local time.
    return new Date(dateString);
};

// Generate mock event dates
const mockEvents: CalendarEvent[] = [
    { id: 1, date: getMockDate('2025-10-26T10:00:00'), type: 'counseling' },
    { id: 2, date: getMockDate('2025-10-27T14:30:00'), type: 'interview' },
    { id: 3, date: getMockDate('2025-11-01T08:00:00'), type: 'holiday' },
    { id: 4, date: getMockDate('2025-11-05T16:00:00'), type: 'counseling' },
    { id: 5, date: getMockDate('2025-11-05T17:00:00'), type: 'counseling' },
    { id: 6, date: getMockDate('2025-11-09T11:00:00'), type: 'interview' },
];

// Map event type to color
const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
        case 'counseling':
            return '#14b8a6'; // Tailwind teal-500 (light cyan)
        case 'interview':
            return '#6d28d9'; // Tailwind violet-700 (deep purple)
        case 'holiday':
            return '#ef4444'; // Tailwind red-500
        default:
            return '#a3a3a3'; // Tailwind gray-400
    }
};

// --- Custom Day Renderer Component ---

const ServerDay = styled(PickersDay)(({ theme }) => ({
    // Inherit standard MUI styling
}));

interface CustomDayProps extends DateCalendarProps<Date> {
    day: Date;
    outsideCurrentMonth: boolean;
    // other props omitted for brevity
}

/**
 * Renders the day cell with event indicators (dots below the date).
 */
function DayWithEvents(props: CustomDayProps) {
    const { day, outsideCurrentMonth, ...other } = props;

    if (outsideCurrentMonth) {
        return <ServerDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />;
    }
    
    // Find events matching this date (checking YYYY-MM-DD only)
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayEvents = mockEvents.filter(event => format(event.date, 'yyyy-MM-dd') === dayKey);

    // If there are no events, render the default day
    if (dayEvents.length === 0) {
        return <ServerDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />;
    }

    // --- Custom Event Dots Logic ---
    const eventDots = dayEvents.slice(0, 3).map((event, index) => (
        <span
            key={index}
            style={{
                backgroundColor: getEventColor(event.type),
                width: 5,
                height: 5,
                borderRadius: '50%',
                margin: '0 1px',
            }}
        />
    ));

    return (
        <Badge
            key={props.day.toString()}
            overlap="circular"
            badgeContent={
                <div style={{ display: 'flex', position: 'absolute', top: 35 }}>
                    {eventDots}
                </div>
            }
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            // Remove native MUI padding/positioning conflicts
            style={{ padding: 0 }}
        >
            <ServerDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
        </Badge>
    );
}

// --- Main Component ---

interface CalendarViewProps {}

const CalendarView: React.FC<CalendarViewProps> = () => {
    const [value, setValue] = useState<Date | null>(new Date());

    return (
        <div className="flex-1 border border-[var(--outline)] h-full bg-[var(--bg)] p-6 rounded-2xl shadow-xl flex flex-col">
            <h2 className="text-2xl font-extrabold text-[var(--title)] mb-4">Calendar</h2>
            
            <div className="flex justify-center w-full">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateCalendar
                        value={value}
                        onChange={(newValue) => setValue(newValue)}
                        slots={{ day: DayWithEvents }}
                        sx={{
                            width: '100%', 
                            '.MuiTypography-root, .MuiSvgIcon-root': {
                                fontFamily: 'Metropolis, sans-serif !important',
                            },
                            '.MuiPickersCalendarHeader-root': {
                                paddingX: 0
                            },
                            '.MuiDayCalendar-weekDayLabel': {
                                color: 'var(--text-muted)' 
                            },
                            '.MuiButtonBase-root': {
                                margin: '4px 0', 
                            },
                            '.MuiDayCalendar-header': {
                                marginBottom: 1
                            }
                        }}
                    />
                </LocalizationProvider>
            </div>
            
            {/* Legend Section */}
            <div className="mt-4 p-3 border-t border-zinc-200 flex flex-wrap justify-center gap-x-4 text-sm">
                <div className="flex items-center space-x-1 text-[var(--text)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                    <span>Counseling</span>
                </div>
                <div className="flex items-center space-x-1 text-[var(--text)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-700"></span>
                    <span>Interview</span>
                </div>
                <div className="flex items-center space-x-1 text-[var(--text)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span>Holiday</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;

// data/data.ts
// -------------------------------
// Types

export type Consultation = {
  email: string;
  type: string;
  time: string;
  date: string;
};

export type Notification = {
  message: string;
  time: string;
};

export type PerformanceDataPoint = {
  name: string;
  value: number;
};

export type Student = {
  id: number;
  name: string;
  email: string;
  course: string;
  status: "Excelling" | "Thriving" | "Struggling" | "In-Crisis";
  enrollmentDate: string;
  graduationDate: string;
};

export type AgendaData = {
  title: string;
  date: string;
  time: string;
  type: string;
};

// -------------------------------
// Dashboard Data

// Data for the stacked bar chart in Consultation Statistics
export const stackedChartData = [
    { name: 'Mon', 'Current Week': 165, 'Last Week': 33 },
    { name: 'Tues', 'Current Week': 85, 'Last Week': 13 },
    { name: 'Wed', 'Current Week': 105, 'Last Week': 60 },
    { name: 'Thu', 'Current Week': 80, 'Last Week': 65 },
    { name: 'Fri', 'Current Week': 205, 'Last Week': 25 },
];

// Data for the "Flagged Students" donut chart
export const flaggedStudentsChartData: PerformanceDataPoint[] = [
  { name: "In-Crisis", value: 15 },
  { name: "Struggling", value: 5 },
];
// Total for the center of the donut chart
export const flaggedStudentsTotal = 20;

//Data for the "Classified Students" donut chart
export const ClassifiedStudentsChartData: PerformanceDataPoint[] = [
  { name: "Thriving", value: 40},
  { name: "Excelling", value: 10 },
];
// Total for the center of the donut chart
export const classifiedStudentsTotal = 50;

export const consultations: Consultation[] = [
  { email: "johndelacruz@umak.edu.ph", type: "Counseling", time: "1:30 AM", date: "08/16/2025" },
  { email: "isabellacruz@umak.edu.ph", type: "Routine Interview", time: "4:30 PM", date: "08/18/2025" },
  { email: "ramonvillanueva@umak.edu.ph", type: "Routine Interview", time: "7:30 AM", date: "08/21/2025" },
  { email: "clarissedelarosa@umak.edu.ph", type: "Counseling", time: "3:00 PM", date: "08/24/2025" },
  { email: "miguelsantos@umak.edu.ph", type: "Counseling", time: "1:00 PM", date: "08/25/2025" },
  { email: "jasminemercado@umak.edu.ph", type: "Counseling", time: "11:30 AM", date: "08/28/2025" },
];

export const previousConsultations: Consultation[] = [
  { email: "alicebrown@gmail.com", type: "Meeting", time: "1:00 PM - 2:00 PM", date: "2025-10-10" },
  { email: "bobgreen@gmail.com", type: "Consultation", time: "2:00 PM - 3:00 PM", date: "2025-10-12" },
];


export const notifications: Notification[] = [
  { message: "New consultation scheduled", time: "2 mins ago" },
  { message: "Student flagged for review", time: "1 hour ago" },
  { message: "Monthly report is ready", time: "1 day ago" },
];

// -------------------------------
// Students Data

export const students: Student[] = [
  { id: 1, name: "John Doe", email: "johndoe@example.com", course: "BSCS", status: "Excelling", enrollmentDate: "2020-06-01", graduationDate: "2024-06-01" },
  { id: 2, name: "Jane Smith", email: "janesmith@example.com", course: "BSIT", status: "Thriving", enrollmentDate: "2021-06-01", graduationDate: "2025-06-01" },
  { id: 3, name: "Alice Brown", email: "alicebrown@example.com", course: "BSIT", status: "Struggling", enrollmentDate: "2019-06-01", graduationDate: "2023-06-01" },
  { id: 4, name: "Bob Green", email: "bobgreen@example.com", course: "BSCS", status: "In-Crisis", enrollmentDate: "2018-06-01", graduationDate: "2022-06-01" },
  { id: 5, name: "Sara White", email: "sarawhite@example.com", course: "BSCS", status: "In-Crisis", enrollmentDate: "2022-06-01", graduationDate: "2026-06-01" },
];

// -------------------------------
// Schedule / Agenda Data (Optional initial)
export const agendas: AgendaData[] = [
  {
    title: "Project Consultation",
    date: "2025-10-18",
    startTime: "9:00 AM",
    endTime: "10:00 AM",
    type: "Meeting",
    location: "Online",
    description: "Discuss project requirements and milestones.",
  },
  {
    title: "Routine Interview",
    date: "2025-10-19",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    type: "Routine Interview",
    location: "Face to Face",
    description: "Interview session with candidate.",
  },
];

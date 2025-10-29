export interface AgendaData {
  id: number;
  title: string;
  date: string;
  type: string;
  startTime: string;
  endTime: string;
}

export type AgendaForm = Omit<AgendaData, 'id'>;

export const agendaColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'Counseling': { 
    bg: 'bg-blue-50', 
    border: 'border-blue-300', 
    text: 'text-blue-700', 
    dot: 'bg-blue-500' 
  },
  'Routine Interview': { 
    bg: 'bg-green-50', 
    border: 'border-green-300', 
    text: 'text-green-700', 
    dot: 'bg-green-500' 
  },
  'Meeting': { 
    bg: 'bg-purple-50', 
    border: 'border-purple-300', 
    text: 'text-purple-700', 
    dot: 'bg-purple-500' 
  },
  'Event': { 
    bg: 'bg-orange-50', 
    border: 'border-orange-300', 
    text: 'text-orange-700', 
    dot: 'bg-orange-500' 
  },
};
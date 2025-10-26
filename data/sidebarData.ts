import { 
  AiOutlineDashboard, 
  AiOutlineCalendar, 
  AiOutlineTeam, 
  AiOutlineSetting,
  AiOutlineTool
} from 'react-icons/ai';

// Define the shape of a navigation item for type safety
export interface NavItem {
  name: "Dashboard" | "Schedule" | "Students" | "Settings" | "Admin Tools";
  icon: React.ElementType; // The component type for the React Icon
  roles: Array<'admin' | 'counselor' | 'super_admin'>;
  href: string; // The Next.js route path
}

// Navigation Links with role restrictions
export const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", icon: AiOutlineDashboard, roles: ['admin', 'counselor', 'super_admin'], href: '/dashboard' },
  { name: "Students", icon: AiOutlineTeam, roles: ['admin', 'counselor', 'super_admin'], href: '/students' },
  { name: "Schedule", icon: AiOutlineCalendar, roles: ['counselor', 'super_admin'], href: '/schedule' },
  { name: "Admin Tools", icon: AiOutlineTool, roles: ['admin', 'super_admin'], href: '/admin' },
  { name: "Settings", icon: AiOutlineSetting, roles: ['admin', 'counselor', 'super_admin'], href: '/settings' },
];

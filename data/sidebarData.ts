import { 
  AiOutlineDashboard, 
  AiOutlineCalendar, 
  AiOutlineTeam, 
  AiOutlineSetting,
  AiOutlineTool
} from 'react-icons/ai';

// Define the shape of a navigation item for type safety
export interface NavItem {
  name: "Dashboard" | "Calendar" | "Students" | "Settings" | "Admin Dashboard" | "Users";
  icon: React.ElementType; // The component type for the React Icon
  roles: Array<'admin' | 'counselor' | 'super_admin'>;
  href: string; // The Next.js route path
}

// Navigation Links with role restrictions
export const NAV_ITEMS: NavItem[] = [
  // guidance module
  { name: "Dashboard", icon: AiOutlineDashboard, roles: ['counselor'], href: '/dashboard' },
  { name: "Calendar", icon: AiOutlineCalendar, roles: ['counselor'], href: '/calendar' },
  { name: "Students", icon: AiOutlineTeam, roles: ['counselor'], href: '/students' },

  // admin module
  { name: "Admin Dashboard", icon: AiOutlineDashboard, roles: ['admin', 'super_admin'], href: '/adminDashboard' },
  { name: "Users", icon: AiOutlineTeam, roles: ['admin', 'super_admin'], href: '/users' },
  // { name: "Settings", icon: AiOutlineSetting, roles: ['admin', 'counselor', 'super_admin'], href: '/settings' },
];

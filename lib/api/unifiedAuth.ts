import { adminOrCounselorLogin, AuthResponse as AdminAuthResponse } from './guidanceAndAdmin';
import { guidanceLogin, AuthResponse as GuidanceAuthResponse } from './guidanceAuth';
import { jwtDecode } from 'jwt-decode';

export interface AuthResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
  };
}

interface JWTPayload {
  role?: string;
  user_type?: string;
  [key: string]: any;
}

export function extractRoleFromToken(token: string): 'admin' | 'counselor' | 'super_admin' | null {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const role = (decoded.role || decoded.user_type || decoded.user_role || decoded.userType || '').toString().toLowerCase();

    if (!role) return null;

    if (role.includes('admin')) return 'admin';
    if (role.includes('counselor') || role.includes('guidance')) return 'counselor';
    if (role.includes('super_admin')) return 'super_admin';
    return null;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export async function unifiedLogin(email: string, password: string): Promise<AuthResponse> {
  // Try admin login first
  const userResult = await adminOrCounselorLogin(email, password);
  
  if (userResult.success && userResult.data) {
    const role = extractRoleFromToken(userResult.data.access_token);
    return {
      ...userResult,
      data: {
        ...userResult.data,
      },
    };
  }

  // If admin login failed, try guidance login
  const guidanceResult = await guidanceLogin(email, password);
  if (guidanceResult.success && guidanceResult.data) {
    const role = extractRoleFromToken(guidanceResult.data.access_token);
    return {
      ...guidanceResult,
      data: {
        ...guidanceResult.data,
      },
    };
  }

  // Return the most relevant error message
  if (userResult.code === 'NETWORK_ERROR' || userResult.code === 'NETWORK_ERROR') {
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to authentication server',
    };
  }

  // Return guidance error as it was the last attempt
  if (userResult.data) {
    const role = extractRoleFromToken(userResult.data.access_token) || 'counselor';
    return {
      success: userResult.success,
      code: userResult.code,
      message: userResult.message,
      data: {
        ...userResult.data,
      },
    };
  }

  return {
    success: userResult.success,
    code: userResult.code,
    message: userResult.message,
  };
}
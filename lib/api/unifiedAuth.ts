import { adminLogin, AuthResponse as AdminAuthResponse } from './adminAuth';
import { guidanceLogin, AuthResponse as GuidanceAuthResponse } from './guidanceAuth';
import { jwtDecode } from 'jwt-decode';

export interface AuthResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    role: 'admin' | 'counselor';
  };
}

interface JWTPayload {
  role?: string;
  user_type?: string;
  [key: string]: any;
}

function extractRoleFromToken(token: string): 'admin' | 'counselor' | null {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const role = decoded.role || decoded.user_type;
    
    if (role === 'admin' || role === 'administrator') {
      return 'admin';
    }
    if (role === 'counselor' || role === 'guidance') {
      return 'counselor';
    }
    
    return null;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export async function unifiedLogin(email: string, password: string): Promise<AuthResponse> {
  // Try admin login first
  const adminResult = await adminLogin(email, password);
  
  if (adminResult.success && adminResult.data) {
    const role = extractRoleFromToken(adminResult.data.access_token);
    return {
      ...adminResult,
      data: {
        ...adminResult.data,
        role: role || 'admin',
      },
    };
  }

  // If admin login fails, try counselor login
  const guidanceResult = await guidanceLogin(email, password);
  
  if (guidanceResult.success && guidanceResult.data) {
    const role = extractRoleFromToken(guidanceResult.data.access_token);
    return {
      ...guidanceResult,
      data: {
        ...guidanceResult.data,
        role: role || 'counselor',
      },
    };
  }

  // Return the most relevant error message
  if (adminResult.code === 'NETWORK_ERROR' || guidanceResult.code === 'NETWORK_ERROR') {
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to authentication server',
    };
  }

  // Return guidance error as it was the last attempt
  return guidanceResult;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_HW_AUTH_API;

export interface AdminLoginRequest {
  admin_email: string;
  admin_password: string;
}

export interface AuthResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
  };
}

export async function adminOrCounselorLogin(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        code: data.code || 'AUTH_ERROR',
        message: data.message || 'Authentication failed',
      };
    }

    return data;
  } catch (error) {
    console.error('Admin login error:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to authentication server',
    };
  }
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export interface GuidanceLoginRequest {
  counselor_email: string;
  counselor_password: string;
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

export async function guidanceLogin(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}}/api/v1/auth/counselor/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        counselor_email: email,
        counselor_password: password,
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
    console.error('Guidance login error:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to authentication server',
    };
  }
}
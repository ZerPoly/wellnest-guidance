const API_BASE_URL = process.env.NEXT_PUBLIC_HW_AUTH_API;

export interface RefreshResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
  };
}

/**
 * Unified function to refresh tokens for Admin or Counselor
 * @param role - 'admin' | 'counselor' | 'super_admin'
 * @param userId - The user's UUID
 * @param refreshToken - The current refresh token
 */
export async function refreshPortalToken(
  role: string,
  userId: string,
  refreshToken: string
): Promise<RefreshResponse> {
  // Determine endpoint based on role
  // (Assuming super_admin uses the admin refresh endpoint)
  const endpoint = (role === 'admin' || role === 'super_admin') 
    ? '/api/v1/auth/admin/refresh' 
    : '/api/v1/auth/counselor/refresh';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Log the specific error code from your OAS docs (e.g., INVALID_REFRESH_TOKEN)
      console.error(`Token Refresh Error [${data.code}]:`, data.message);
    }

    return data;
  } catch (error) {
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Could not connect to the authentication server.",
    };
  }
}

/**
 * Logout function for Portal users
 */
export async function logoutPortalUser(role: string, token: string) {
  const endpoint = (role === 'admin' || role === 'super_admin') 
    ? '/api/v1/auth/admin/logout' 
    : '/api/v1/auth/counselor/logout';

  return await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}
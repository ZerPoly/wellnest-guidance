const API_BASE_URL = process.env.NEXT_PUBLIC_HW_AUTH_API || '';

export async function verifyAccessPassword(
  token: string,
  password: string
): Promise<{ success: boolean; message: string; code?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Identifies the user from the current session
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }), // Sends the password for comparison
      cache: 'no-store',
    });

    const data = await response.json();
    
    // Check for success status (200 OK) AND the success flag in the body
    if (response.ok && data.success) {
      return { success: true, message: 'Password successfully verified.' };
    } else {
      // Handle incorrect password or server error
      return {
        success: false,
        message: data.message || 'Incorrect password or verification failed.',
        code: data.code,
      };
    }
  } catch (error) {
    return { success: false, message: 'Unable to connect to the authentication server.' };
  }
}
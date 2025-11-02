const API_BASE_URL = process.env.NEXT_PUBLIC_HW_AUTH_API || '';
const ENDPOINT_PATH = '/api/v1/auth/counselor/refresh';

// --- Type Definitions ---

export interface RefreshPayload {
    user_id: string;
    refresh_token: string;
}

export interface RefreshResponseData {
    access_token: string;
    refresh_token: string;
}

export interface RefreshResponse {
    success: boolean;
    code: string;
    message: string;
    data?: RefreshResponseData;
}

// --- Main Refresh Function ---

export async function refreshCounselorToken(
    userId: string,
    refreshToken: string
): Promise<RefreshResponse> {
    try {
        if (!API_BASE_URL) {
            // FIX: Corrected typo in console log
            console.error('❌ NEXT_PUBLIC_HW_AUTH_API is not set.'); 
            throw new Error('API base URL is not configured.');
        }

        const url = `${API_BASE_URL.replace(/\/$/, '')}${ENDPOINT_PATH}`;
        
        const payload: RefreshPayload = {
            user_id: userId,
            refresh_token: refreshToken,
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
            cache: 'no-store',
        });

        // Use response.text() to safely read the body once
        const responseBody = await response.text();

        if (!response.ok) {
            console.error('🔴 Token Refresh API HTTP Error:', response.status, responseBody);
            let errorMsg = `Token refresh failed with status ${response.status}.`;
            try {
                const errorJson = JSON.parse(responseBody);
                errorMsg = errorJson.message || errorMsg;
            } catch (e) {
                // Body was not JSON, stick with default message
            }
            // THROW error to be caught by NextAuth
            throw new Error(errorMsg); 
        }

        // Handle successful 200 response
        const data: RefreshResponse = JSON.parse(responseBody);

        if (data.success && data.data) {
            return data;
        } else {
            // Handle 200 OK but refresh failure (e.g., invalid token)
            console.error('🔴 Token Refresh Logic Error:', data.message);
            // THROW error to be caught by NextAuth
            throw new Error(data.message || 'Token refresh failed.');
        }

    } catch (error: any) {
        console.error('❌ Network Error during token refresh:', error);
        // Re-throw the error so NextAuth knows the refresh failed
        throw new Error(error.message || 'Network error during token refresh.');
    }
}

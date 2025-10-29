const API_BASE_URL = process.env.NEXT_PUBLIC_HW_AUTH_API || '';
// FIX: Updated ENDPOINT_PATH to reflect a common authentication API structure, 
// using '/auth/admin/refresh' instead of '/admin/refresh'.
const ENDPOINT_PATH = '/api/v1/auth/admin/refresh'; 

// --- Type Definitions ---

export interface RefreshPayload {
    user_id: string;
    refresh_token: string;
}

export interface RefreshResponseData {
    access_token: string;
    refresh_token: string;
    // The decoded token will provide the new expiration time
}

export interface RefreshResponse {
    success: boolean;
    code: string;
    message: string;
    data?: RefreshResponseData;
}

// --- Main Refresh Function ---

/**
 * Communicates with the backend to rotate the Admin's refresh token
 * and issue a new access token.
 * @param userId - The user's unique ID.
 * @param refreshToken - The currently held refresh token.
 * @returns A promise resolving to RefreshResponse containing new tokens or an error.
 */
export async function refreshAdminToken(
    userId: string,
    refreshToken: string
): Promise<RefreshResponse> {
    try {
        if (!API_BASE_URL) {
            console.error('❌ NEXT_PUBLIC_HW_USERS_API is not set.');
            return {
                success: false,
                code: 'CONFIG_ERROR',
                message: 'API base URL is not configured.',
            };
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

        const errorText = await response.text();

        if (!response.ok) {
            console.error('🔴 Admin Token Refresh API HTTP Error:', response.status, errorText);

            try {
                const data = JSON.parse(errorText);
                return {
                    success: false,
                    code: data.code || 'HTTP_ERROR',
                    message: data.message || `Token refresh failed with status ${response.status}.`,
                };
            } catch {
                return {
                    success: false,
                    code: 'PARSE_ERROR',
                    message: `Token refresh failed. Server returned status ${response.status}.`,
                };
            }
        }

        // Handle successful 200 response
        const data: RefreshResponse = JSON.parse(errorText);

        if (data.success) {
            return data;
        } else {
             // Handle cases where status is 200 but body reports failure
            return {
                success: false,
                code: data.code || 'REFRESH_FAILURE',
                message: data.message || 'Token refresh failed.',
            };
        }

    } catch (error: any) {
        console.error('❌ Network Error during Admin token refresh:', error);
        return {
            success: false,
            code: 'NETWORK_ERROR',
            message: `Network error: ${error.message}`,
        };
    }
}

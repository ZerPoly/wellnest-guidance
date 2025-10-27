const API_BASE_URL = process.env.NEXT_PUBLIC_HW_USERS_API || '';

export type ClassificationType = "Excelling" | "Thriving" | "Struggling" | "InCrisis";

export interface StudentClassification {
  classification_id: string;
  student_id: string;
  classification: ClassificationType;
  is_flagged: boolean;
  classified_at: string;
  email: string;
  department_name: string;
}

export interface FetchStudentsResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    classifications: StudentClassification[];
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export interface FetchStudentsParams {
  classification?: ClassificationType;
  isFlagged?: boolean;
  limit?: number;
  cursor?: string;
}

export async function fetchStudents(
  token: string,
  params?: FetchStudentsParams
): Promise<FetchStudentsResponse> {
  try {
    if (!API_BASE_URL) {
      console.error('❌ NEXT_PUBLIC_HW_USERS_API is not set in .env.local');
      return {
        success: false,
        code: 'CONFIG_ERROR',
        message: 'API base URL is not configured. Please check your .env.local file.',
      };
    }

    const queryParams = new URLSearchParams();
    
    if (params?.classification) {
      queryParams.append('classification', params.classification);
    }
    
    if (params?.isFlagged !== undefined) {
      queryParams.append('isFlagged', params.isFlagged.toString());
    }
    
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    if (params?.cursor) {
      queryParams.append('cursor', params.cursor);
    }

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/api/v1/users/students${queryString ? `?${queryString}` : ''}`;
    
    console.log('🔵 Fetching students:');
    console.log('   - URL:', url);
    console.log('   - Params:', params);
    console.log('   - Token exists:', !!token);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('🔵 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API Error:', errorText);
      
      try {
        const data = JSON.parse(errorText);
        
        // Provide more helpful error messages
        let userMessage = data.message || 'Failed to fetch students';
        
        if (response.status === 500) {
          userMessage = 'The backend server is experiencing issues. Please try again later or contact support.';
        } else if (response.status === 401) {
          userMessage = 'Your session has expired. Please log in again.';
        } else if (response.status === 403) {
          userMessage = 'You do not have permission to view student data.';
        }
        
        return {
          success: false,
          code: data.code || 'FETCH_ERROR',
          message: userMessage,
        };
      } catch {
        return {
          success: false,
          code: 'FETCH_ERROR',
          message: response.status === 500 
            ? 'The backend server is experiencing issues. Please try again later.'
            : `API returned ${response.status}`,
        };
      }
    }

    const data: FetchStudentsResponse = await response.json();
    console.log('✅ Students fetched:', data.data?.classifications?.length || 0);

    return data;
  } catch (error: any) {
    console.error('❌ Network error:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: `Unable to connect to the server. Please check your internet connection.`,
    };
  }
}

export function getClassificationColor(classification: ClassificationType): string {
  const colorMap: Record<ClassificationType, string> = {
    'Excelling': 'bg-green-100 text-green-800',
    'Thriving': 'bg-blue-100 text-blue-800',
    'Struggling': 'bg-yellow-100 text-yellow-800',
    'InCrisis': 'bg-red-100 text-red-800',
  };
  return colorMap[classification] || 'bg-gray-100 text-gray-800';
}

export function formatClassificationDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
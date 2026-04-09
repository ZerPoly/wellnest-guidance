const API_BASE_URL = process.env.NEXT_PUBLIC_HW_USERS_API;

// --- Types ---

export interface DepartmentStatistics {
  department_name: string;
  total_students: number;
  excelling_count: number;
  thriving_count: number;
  struggling_count: number;
  in_crisis_count: number;
  not_classified_count: number;
  excelling_percentage: number;
  thriving_percentage: number;
  struggling_percentage: number;
  in_crisis_percentage: number;
  not_classified_percentage: number;
}

export interface DepartmentStatisticsResponse {
  success: boolean;
  code: string;
  message: string;
  // FIXED: Tell TS this can be an array for admins!
  data: DepartmentStatistics | DepartmentStatistics[]; 
}

// --- API Functions ---

export async function getDepartmentStatistics(token: string): Promise<DepartmentStatistics | DepartmentStatistics[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/departments/statistics`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Unauthorized: Invalid or missing authentication token.");
    if (response.status === 404) throw new Error("Department Not Found: No statistics found for your assigned department.");
    if (response.status === 400) throw new Error("Bad Request: Missing department information.");
    
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to fetch department statistics.");
  }

  const json: DepartmentStatisticsResponse = await response.json();
  
  return json.data;
}

export async function downloadStatisticsFile(token: string, format: 'csv' | 'raw'): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/departments/statistics?format=${format}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': format === 'csv' ? 'text/csv' : 'application/json', 
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${format.toUpperCase()}.`);
  }

  return await response.blob();
}
import { CounselorRecord, StudentRecord, PaginatedResponse } from "./management.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_HW_USERS_API;

/**
 * Fetch all counselors (Admin only)
 */
export async function getCounselors(
  token: string,
  limit: number = 10,
  cursor?: string
): Promise<PaginatedResponse<CounselorRecord>> {
  const url = new URL(`${API_BASE_URL}/api/v1/users/management/counselors`);
  url.searchParams.append("limit", limit.toString());
  if (cursor) url.searchParams.append("cursor", cursor);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch counselors");
  return data;
}

/**
 * Fetch all students (Admin only)
 */
export async function getStudents(
  token: string,
  limit: number = 10,
  cursor?: string
): Promise<PaginatedResponse<StudentRecord>> {
  const url = new URL(`${API_BASE_URL}/api/v1/users/management/students`);
  url.searchParams.append("limit", limit.toString());
  if (cursor) url.searchParams.append("cursor", cursor);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch students");
  return data;
}
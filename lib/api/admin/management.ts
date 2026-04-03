import { CounselorRecord, StudentRecord, AdminRecord, PaginatedResponse } from "./management.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_HW_USERS_API;

// get: counselors 
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
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch counselors");
  return data;
}

// get: students
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
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch students");
  return data;
}

// get: admins
export async function getAdmins(
  token: string,
  limit: number = 10,
  cursor?: string
): Promise<PaginatedResponse<AdminRecord>> {
  const url = new URL(`${API_BASE_URL}/api/v1/users/management/admins`);
  url.searchParams.append("limit", limit.toString());
  if (cursor) url.searchParams.append("cursor", cursor);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch admins");
  return data;
}

// get: departments
export interface Department {
  department_id:   string;
  department_name: string;
  is_deleted:      boolean;
  created_at:      string;
  updated_at:      string;
}

export async function getDepartments(token: string): Promise<Department[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/management/departments`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch departments");

  // filter out soft-deleted departments
  return (data.data as Department[]).filter((d) => !d.is_deleted);
}

// get: programs
export interface Program {
  program_id:            string;
  program_name:          string;
  college_department_id: string;
  department_name:       string;
  is_deleted:            boolean;
  created_at:            string;
  updated_at:            string;
}

export async function getPrograms(token: string): Promise<Program[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/management/programs`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch programs");
  return (data.data as Program[]).filter((p) => !p.is_deleted);
}

export async function getProgramsByDepartment(
  token:        string,
  departmentId: string
): Promise<Program[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/management/programs/department/${departmentId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch programs for department");
  return (data.data as Program[]).filter((p) => !p.is_deleted);
}

// post: create counselor 
export interface CreateCounselorPayload {
  user_name:     string;
  email:         string;
  password:      string;
  department_id: string;
}

export interface CreateCounselorResponse {
  success: boolean;
  code:    string;
  message: string;
  data?: {
    user_id:       string;
    user_name:     string;
    email:         string;
    is_deleted:    boolean;
    department_id: string;
    created_at:    string;
    updated_at:    string;
  };
}

export async function createCounselor(
  token:   string,
  payload: CreateCounselorPayload
): Promise<CreateCounselorResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/management/counselors`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data: CreateCounselorResponse = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create counselor");
  return data;
}

// post: create admin
export interface CreateAdminPayload {
  user_name:      string;
  email:          string;
  password:       string;
  is_super_admin: boolean;
}

export interface CreateAdminResponse {
  success: boolean;
  code:    string;
  message: string;
  data?: {
    user_id:        string;
    user_name:      string;
    email:          string;
    is_super_admin: boolean;
    is_deleted:     boolean;
    created_at:     string;
    updated_at:     string;
  };
}

export async function createAdmin(
  token:   string,
  payload: CreateAdminPayload
): Promise<CreateAdminResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/management/admins`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data: CreateAdminResponse = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create admin");
  return data;
}

// patch: update admin basic info
export interface UpdateAdminPayload {
  user_name?: string;
  email?:     string;
}

export async function updateAdmin(
  token:   string,
  adminId: string,
  payload: UpdateAdminPayload
) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/management/admins/${adminId}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update admin");
  return data;
}

// patch: update admin password
export interface UpdatePasswordPayload {
  new_password:       string;
  previous_password?: string;
}

export async function updateAdminPassword(
  token:   string,
  adminId: string,
  payload: UpdatePasswordPayload
) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/management/admins/${adminId}/password`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update admin password");
  return data;
}

// patch: update counselor basic info
export interface UpdateCounselorPayload {
  user_name?:     string;
  email?:         string;
  department_id?: string;
}

export async function updateCounselor(
  token:       string,
  counselorId: string,
  payload:     UpdateCounselorPayload
) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/management/counselors/${counselorId}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update counselor");
  return data;
}

// patch: update counselor password
export async function updateCounselorPassword(
  token:       string,
  counselorId: string,
  payload:     UpdatePasswordPayload
) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/management/counselors/${counselorId}/password`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update counselor password");
  return data;
}

// delete: soft delete counselor
export async function deleteCounselor(
  token:       string,
  counselorId: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/management/counselors/${counselorId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete counselor");
  return data;
}
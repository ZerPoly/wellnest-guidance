// lib/api/studentClassification.ts
export type StudentClassificationRecord = {
  classification_id: string;
  student_id: string;
  classification: "Excelling" | "Thriving" | "Struggling" | "InCrisis" | string;
  is_flagged: boolean;
  classified_at: string;
  email?: string; // anonymized form per API
  department_name?: string;
};

export type StudentClassificationResponse = {
  success: boolean;
  code: string;
  message: string;
  data?: {
    classifications: StudentClassificationRecord[];
    hasMore: boolean;
    nextCursor: string | null;
  };
};

export type StudentClassificationQuery = {
  classification?: string;
  isFlagged?: boolean;
  limit?: number;
  cursor?: string;
};

// small exponential backoff retry helper
const withRetry = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      const delay = Math.pow(2, i) * 500;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Retries exhausted");
};

const API_BASE = process.env.NEXT_PUBLIC_HW_USERS_API;
const ENDPOINT = "/api/v1/users/students";

if (!API_BASE) {
  console.warn(
    "NEXT_PUBLIC_HW_USERS_API is not set. studentClassification requests will fail."
  );
}

/**
 * Fetch student classification records.
 * @param accessToken - Bearer token from NextAuth session (session.user.accessToken)
 * @param query - query params (classification, isFlagged, limit, cursor)
 */
export async function fetchStudentClassifications(
  accessToken: string,
  query: StudentClassificationQuery = {}
): Promise<StudentClassificationResponse> {
  if (!API_BASE) {
    return {
      success: false,
      code: "CONFIG_ERROR",
      message: "NEXT_PUBLIC_HW_USERS_API is not configured",
    };
  }

  if (!accessToken) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Missing access token",
    };
  }

  const url = new URL(`${API_BASE}${ENDPOINT}`);

  if (query.classification) url.searchParams.append("classification", query.classification);
  if (typeof query.isFlagged === "boolean") url.searchParams.append("isFlagged", String(query.isFlagged));
  if (query.limit) url.searchParams.append("limit", String(query.limit));
  if (query.cursor) url.searchParams.append("cursor", query.cursor);

  try {
    const response = await withRetry(() =>
      fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })
    );

    // handle 304 if server uses caching (unlikely for GET /students but safe)
    if (response.status === 304) {
      return {
        success: true,
        code: "NOT_MODIFIED",
        message: "Not modified",
        data: { classifications: [], hasMore: false, nextCursor: null },
      };
    }

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return (
        body || {
          success: false,
          code: "HTTP_ERROR",
          message: `Failed to fetch students (status ${response.status})`,
        }
      );
    }

    return body as StudentClassificationResponse;
  } catch (error: any) {
    console.error("fetchStudentClassifications error:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: error?.message || "Network error while fetching classifications",
    };
  }
}

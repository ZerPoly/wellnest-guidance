// lib/api/admin/promotional.ts

const API_BASE_URL = `${process.env.NEXT_PUBLIC_HW_USERS_API}/api/v1/users`;

export async function createPromotionalContent(
  token: string,
  formData: FormData
): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/management/content-management`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 413) throw new Error("Image file is too large.");
    if (response.status === 403) throw new Error("Forbidden: You do not have permission to create content.");
    if (response.status === 401) throw new Error("Unauthorized: Session expired.");
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to create promotional content.");
  }

  return true;
}

export async function getAllPromotionalContent(token: string): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/management/content-management`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 400) throw new Error("Bad request: Missing user info.");
    if (response.status === 401) throw new Error("Unauthorized: Session expired.");
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to fetch promotional content.");
  }

  return response.json();
}

export async function updatePromotionalContent(
  token: string,
  contentId: string,
  formData: FormData
): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/management/content-management/${contentId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 413) throw new Error("Image file is too large.");
    if (response.status === 404) throw new Error("Content not found.");
    if (response.status === 403) throw new Error("Forbidden: You do not have permission to edit content.");
    if (response.status === 401) throw new Error("Unauthorized: Session expired.");
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to update promotional content.");
  }

  return true;
}

export async function deletePromotionalContent(
  token: string,
  contentId: string
): Promise<boolean> {
  // 1. Prevent bad requests: Check if ID is completely missing or malformed
  if (!contentId || typeof contentId !== 'string' || contentId === 'undefined') {
    throw new Error(`Invalid contentId passed to API: ${contentId}`);
  }

  // Debugging: This will print exactly what we are sending to the server
  console.log(`Attempting to delete promotion with UUID: ${contentId}`);

  const response = await fetch(`${API_BASE_URL}/management/content-management/${contentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
      // Removed "Content-Type": "application/json" because there is no body
    },
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error("Content not found.");
    if (response.status === 403) throw new Error("Forbidden: You do not have permission to delete content.");
    if (response.status === 401) throw new Error("Unauthorized: Session expired.");
    if (response.status === 400) throw new Error("Bad request: Missing content ID or user info.");
    
    // Attempt to grab the exact error message from the server if it exists
    const errorText = await response.text(); 
    console.error("Backend Error Response:", errorText);
    
    throw new Error(`Failed to delete promotional content (Status ${response.status})`);
  }

  return true;
}
import type { ApiResponse } from "@monmate/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { token?: string }
): Promise<ApiResponse<T>> {
  if (!apiBaseUrl) {
    return {
      success: false,
      error: {
        code: "API_URL_NOT_CONFIGURED",
        message: "NEXT_PUBLIC_API_URL is not configured"
      }
    };
  }

  const headers = new Headers(init?.headers);

  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (init?.token) {
    headers.set("Authorization", `Bearer ${init.token}`);
  }

  const response = await fetch(`${apiBaseUrl}/${path.replace(/^\//, "")}`, {
    ...init,
    headers
  });

  return response.json() as Promise<ApiResponse<T>>;
}

export function getApiBaseUrl() {
  return apiBaseUrl;
}

export const IMAGE_UPLOAD_MAX_SIZE = 2 * 1024 * 1024; // 2MB
export const IMAGE_UPLOAD_ACCEPT = "image/png,image/jpeg,image/webp";

export async function uploadImage(file: File, token: string): Promise<ApiResponse<{ url: string }>> {
  if (file.size > IMAGE_UPLOAD_MAX_SIZE) {
    return {
      success: false,
      error: { code: "FILE_TOO_LARGE", message: "圖片大小不能超過 2MB" }
    };
  }
  const form = new FormData();
  form.append("file", file);
  return apiFetch<{ url: string }>("/uploads/image", { method: "POST", token, body: form });
}

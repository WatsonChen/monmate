import type { ApiResponse } from "@monmate/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

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
  headers.set("Content-Type", "application/json");

  if (init?.token) {
    headers.set("Authorization", `Bearer ${init.token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers
  });

  return response.json() as Promise<ApiResponse<T>>;
}

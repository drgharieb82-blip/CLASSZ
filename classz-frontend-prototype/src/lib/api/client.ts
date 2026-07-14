const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const REFRESH_PATH = "/api/auth/refresh";

/** Resolves an uploaded-file path (e.g. "/uploads/material/...") returned by
 * the backend into a fetchable URL. Works whether VITE_API_BASE_URL is unset
 * (same-origin, relies on the dev/prod proxy) or points at an absolute
 * backend origin.
 *
 * Course-material files (`/uploads/material/...`) are served by an
 * authenticated route, not a plain static mount — `<img>`/`<video>` tags
 * can't send an Authorization header, so the current access token is
 * appended as a `?token=` query param instead. Every other upload category
 * (identity/photo/certification) is still a plain public static file and is
 * returned unchanged. */
export function resolveFileUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  if (path.startsWith("/uploads/material/")) {
    const token = localStorage.getItem("classz-auth-token");
    if (token) {
      const separator = path.includes("?") ? "&" : "?";
      return `${API_BASE}${path}${separator}token=${encodeURIComponent(token)}`;
    }
  }

  return `${API_BASE}${path}`;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: unknown,
  ) {
    super(`API ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

function clearSessionAndRedirect(): void {
  localStorage.removeItem("classz-auth-token");
  localStorage.removeItem("classz-refresh-token");
  localStorage.removeItem("classz-auth");
  window.location.href = "/login";
}

// Deduplicates concurrent refresh attempts — if several requests 401 at the
// same time, only one refresh call fires and the rest await its result,
// since each refresh rotates (invalidates) the previous refresh token.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const currentRefreshToken = localStorage.getItem("classz-refresh-token");
  if (!currentRefreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}${REFRESH_PATH}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: currentRefreshToken }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        localStorage.setItem("classz-auth-token", data.access_token);
        localStorage.setItem("classz-refresh-token", data.refresh_token);
        return data.access_token as string;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const token = localStorage.getItem("classz-auth-token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (!isRetry && path !== REFRESH_PATH) {
      const newToken = await refreshAccessToken();
      if (newToken) return request<T>(path, options, true);
    }
    clearSessionAndRedirect();
    throw new ApiError(res.status, res.statusText, null);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, res.statusText, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// Separate from `api` above: file uploads need multipart/form-data (the browser
// sets its own Content-Type with boundary) rather than the JSON body every
// other call in this client sends - reuses the same base URL / auth-token /
// 401-handling logic as `request()`, just without forcing a JSON content type.
export async function uploadFile<T>(path: string, formData: FormData, isRetry = false): Promise<T> {
  const token = localStorage.getItem("classz-auth-token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (res.status === 401) {
    if (!isRetry) {
      const newToken = await refreshAccessToken();
      if (newToken) return uploadFile<T>(path, formData, true);
    }
    clearSessionAndRedirect();
    throw new ApiError(res.status, res.statusText, null);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, res.statusText, body);
  }

  return res.json();
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

type RequestOptions = RequestInit & { token?: string };

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(fetchOptions.headers || {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new Error(`Cannot reach the API at ${API_URL}. Start the Laravel server and check NEXT_PUBLIC_API_URL.`);
  }

  const contentType = response.headers.get("content-type") || "";
  const data: unknown = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    if (typeof data === "object" && data !== null) {
      const validationErrors = "errors" in data ? data.errors : null;
      if (validationErrors && typeof validationErrors === "object") {
        throw new Error(Object.values(validationErrors as Record<string, string[]>).flat().join(" "));
      }
      throw new Error((data as { message?: string }).message || `Request failed with HTTP ${response.status}.`);
    }
    throw new Error(typeof data === "string" ? data : `Request failed with HTTP ${response.status}.`);
  }

  // Laravel create/update actions return { message, data }. Keep the frontend
  // API consistent with the GET endpoints by returning data directly.
  if (typeof data === "object" && data !== null && "data" in data && "message" in data) {
    return (data as { data: T }).data;
  }
  return data as T;
}

export const api = {
  get<T>(endpoint: string, options?: RequestOptions) { return request<T>(endpoint, { ...options, method: "GET" }); },
  post<T>(endpoint: string, body: unknown, options?: RequestOptions) { return request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }); },
  put<T>(endpoint: string, body: unknown, options?: RequestOptions) { return request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }); },
  delete<T>(endpoint: string, options?: RequestOptions) { return request<T>(endpoint, { ...options, method: "DELETE" }); },
};

export { API_URL };

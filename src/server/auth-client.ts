// Authentication backend API client (port 8081)
const AUTH_API_URL = "http://localhost:8081/api";

export async function authFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = `${AUTH_API_URL}${path}`;
  
  // localStorage에서 토큰 가져오기 (필요한 경우)
  const userJson = localStorage.getItem("user");
  let token = null;
  
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      token = user.token;
    } catch {
      // ignore
    }
  }

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}


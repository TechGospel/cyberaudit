import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "analyst";
  createdAt: string;
  lastLogin: string | null;
  isActive: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const data = await response.json();
    
    // Store token in localStorage
    localStorage.setItem("token", data.token);
    
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } finally {
      localStorage.removeItem("token");
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiRequest("GET", "/api/auth/me");
    return await response.json();
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};

// Add token to API requests
const originalApiRequest = apiRequest;
export const authenticatedApiRequest = async (
  method: string,
  url: string,
  data?: unknown
): Promise<Response> => {
  const token = authApi.getToken();
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
};

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/auth`; // Adjust to FastAPI port

export type AuthPayload = {
  email: string;
  password?: string;
  confirm_password?: string;
};

export type ResetPasswordPayload = {
  token: string;
  new_password: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
};

// Generic fetch wrapper to handle errors consistently
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Something went wrong.");
  }
  return data;
}

export async function loginUser(data: AuthPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(res);
}

export async function registerUser(data: AuthPayload): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password, // Send it to FastAPI
      }),
    });
    return handleResponse<void>(res);
  }

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ message: string }>(res);
}
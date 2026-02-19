const API_BASE = "http://localhost:4000";

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
) {
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? {Authorization: `Bearer ${token}`}: {})
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || "Request failed");
    }

    return data;
}
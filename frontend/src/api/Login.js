// src/api/Login.js
const API_URL = import.meta.env.VITE_API_URL || "/api"; // fallback for proxy

export async function loginAdmin(email, password) {
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // Network-level failure (e.g., server unreachable)
    if (!response) {
      throw new Error("Unable to reach server. Check backend URL or network.");
    }

    // HTTP errors
    if (!response.ok) {
      let message = `Login failed (${response.status})`;

      try {
        const data = await response.json();
        if (data?.message) message = data.message;
      } catch {
        // Ignore JSON parse errors
      }

      throw new Error(message);
    }

    // Success
    const data = await response.json();
    return data;
  } catch (err) {
    // Detect CORS error
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error(
        "Cannot reach server. Possible CORS issue or server is down."
      );
    }

    throw err;
  }
}

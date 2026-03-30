import { auth } from "@/lib/firebase/client";

/**
 * Enhanced fetch wrapper that automatically attaches the Firebase ID Token.
 * Use this for all Admin API calls.
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  
  // Try to get token if user is signed in
  let token: string | null = null;
  if (user) {
    token = await user.getIdToken();
  }

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Ensure content-type is set for JSON bodies if not provided
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

"use client";

import { useAuth } from "@/src/hooks/useAuth";

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
) {
  const { logout } = useAuth();
  
  let res = await fetch(url, {
    ...options,
    credentials: "include", 
  });

  if (res.status === 401) {
    const refresh = await fetch("/services/account/user/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!refresh.ok) {
      logout
      return res;
    }

    // retry original request
    res = await fetch(url, {
      ...options,
      credentials: "include",
    });
  }

  return res;
}

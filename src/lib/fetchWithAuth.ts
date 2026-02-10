"use client";

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
) {
  let res = await fetch(url, {
    ...options,
    credentials: "include", 
  });

  if (res.status === 401) {
    const refresh = await fetch("/services/account/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!refresh.ok) {
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

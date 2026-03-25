"use client";

let refreshPromise: Promise<boolean> | null = null;

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
) {
  let res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (res.status !== 401) {
    return res;
  }

  // ---- SINGLE FLIGHT REFRESH ----
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh = await fetch("/services/account/user/refresh", {
        method: "POST",
        credentials: "include",
      });

      refreshPromise = null;
      return refresh.ok;
    })();
  }

  const refreshOk = await refreshPromise;

  if (!refreshOk) {
    await fetch("/services/account/user/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.replace("/");
    throw new Error("Session expired");
  }

  // retry original request
  return fetch(url, {
    ...options,
    credentials: "include",
  });
}
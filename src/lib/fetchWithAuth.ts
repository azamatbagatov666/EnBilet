"use client";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let refreshPromise: Promise<boolean> | null = null;

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let res: Response;

  // NETWORK ERROR HANDLING
  try {
    res = await fetch(url, {
      ...options,
      credentials: "include",
    });
  } catch {
    throw new Error("Bağlantı sorunu.");
  }

  // NORMAL SUCCESS
  if (res.status !== 401) {
    if (!res.ok) {
      let message = "Sunucu hatası.";

      try {
        const data = await res.json();
        if (data?.message) {
          message = data.message;
        }
      } catch {
        // response body empty
      }

      throw new ApiError(message, res.status);
    }

    return res;
  }

  // ---- REFRESH TOKEN ----

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refresh = await fetch("/services/account/user/refresh", {
          method: "POST",
          credentials: "include",
        });

        return refresh.ok;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  const refreshOk = await refreshPromise;

  if (!refreshOk) {
    await fetch("/services/account/user/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.replace("/");
    throw new Error("Oturum süresi doldu.");
  }

  // RETRY ORIGINAL REQUEST

  try {
    res = await fetch(url, {
      ...options,
      credentials: "include",
    });
  } catch {
    throw new Error("Bağlantı sorunu.");
  }

  if (!res.ok) {
    let message = "Bir hata oluştu.";

    try {
      const data = await res.json();
      if (data?.message) {
        message = data.message;
      }
    } catch {}

    throw new ApiError(message, res.status);
  }

  return res;
}

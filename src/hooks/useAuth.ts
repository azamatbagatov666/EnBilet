"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    const res = await fetch("/services/account/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("LOGIN_FAILED");
      return false;
    }

    router.push("/");
    return true;
  };

  const logout = async () => {
    await fetch("/services/account/actions/logout", { method: "POST" });
    router.push("/login");
  };

  return {
    login,
    logout,
    loading,
    error,
  };
}

import { useRouter, usePathname } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();

  const login = async (username: string, password: string) => {
    const res = await fetch("/services/account/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      return res.status;
    }

    router.refresh();

    if (pathname !== "/") {
      router.push("/");
    }

    router.refresh(); //  ALWAYS LAST
  };

  const logout = async () => {
    await fetch("/services/account/user/logout", { method: "POST" });
    if (pathname !== "/") {
      router.push("/");
    }

    router.refresh(); //  ALWAYS LAST
  };

  return { login, logout };
}


import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  const login = async (username: string, password: string) => {

    const res = await fetch("/services/account/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });


    if (!res.ok) {
      return false;
    }

    router.push("/");
    return true;
  };

  const logout = async () => {
    await fetch("/services/account/logout", { method: "POST" });
    router.push("/");
  };

  return { login, logout};
}

"use client";

import { redirect } from "next/navigation";


export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
) {
  
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
      // hard logout 
      await fetch("/services/account/user/logout", {
        method: "POST",
        credentials: "include",
      });

      window.location.replace("/");
    }
    // retry original request
    res = await fetch(url, {
      ...options,
      credentials: "include",
    });
  }

  return res;
}

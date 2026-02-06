"use client";

import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

export default function NavBar() {

    const router = useRouter();





  return (
    <>
<div className="navbar bg-base-100 shadow-sm">
  <div className="">
    <a className="btn btn-ghost text-xl" onClick={() => router.push("/")}>Çocuk Aklı</a>
  </div>
  <div className="flex-none">
    <ul className="menu menu-horizontal px-1">
      <li><a>Link</a></li>
      <li>
        <details>
          <summary>Menü</summary>
          <ul className="bg-base-100 rounded-t-none p-2">
            <li onClick={() => router.push("/account/events")}><a>Etkinlikler</a></li>
            <li><a>Link 2</a></li>
          </ul>
        </details>
      </li>
    </ul>
  </div>
</div>
    </>
  );
}

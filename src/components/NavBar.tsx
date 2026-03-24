"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import ThemeToggle from "@/src/components/ThemeToggle"




export default function NavBar() {
    const { logout } = useAuth();
  

    const router = useRouter();





  return (
    <>
<div className="navbar bg-base-100 shadow-sm dark:shadow-white">
  <div className="">
    <a className="btn btn-ghost text-xl" onClick={() => router.push("/")}>Çocuk Aklı</a>
  </div>
  <div className="w-full flex justify-between px-2">
  <div className="dropdown dropdown-hover">
  <div  className="btn btn-ghost">
    Menü {'\u25BC'}
  </div>

  <ul
    
    className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow border"
  >
        <li onClick={() => router.push("/account/")}>
      <a>Giriş Yap</a>
    </li>
    <li onClick={() => router.push("/account/events")}>
      <a>Etkinlik Ekle/Düzenle</a>
    </li>
    <li onClick={() => router.push("/account/venues")}>
      <a>Salonlar</a>
    </li>
    <li><a>Link 2</a></li>
    <li onClick={logout}>
      <a>Çıkış Yap</a>
    </li>
  </ul>
</div>
  <ThemeToggle></ThemeToggle>

  </div>
</div>
    </>
  );
}

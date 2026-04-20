"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import ThemeToggle from "@/src/components/navBar/ThemeToggle";

export default function NavBar() {
  const { logout } = useAuth();

  const router = useRouter();

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm dark:shadow-white">
        <div className="">
          <a className="btn btn-ghost text-xl" href="/">
            Çocuk Aklı
          </a>
        </div>
        <div className="w-full flex justify-between px-2">
          <div className="dropdown dropdown-hover">
            <div className="btn btn-ghost">Menü {"\u25BC"}</div>

            <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow border">
              <li>
                <a href="/account/">Giriş Yap</a>
              </li>
              <li>
                <a href="/account/events">Etkinlik Ekle/Düzenle</a>
              </li>
              <li>
                <a href="/account/venues">Salonlar</a>
              </li>
              <li>
                <a href="/account/shows">Gösteriler</a>
              </li>
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

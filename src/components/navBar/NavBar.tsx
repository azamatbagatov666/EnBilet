"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import ThemeToggle from "@/src/components/navBar/ThemeToggle";
import Link from "next/link";

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
                <Link href="/account/">Giriş Yap</Link>
              </li>
              <li>
                <Link href="/account/events">Etkinlik Ekle/Düzenle</Link>
              </li>
              <li>
                <Link href="/account/venues">Salonlar</Link>
              </li>
              <li>
                <Link href="/account/shows">Gösteriler</Link>
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

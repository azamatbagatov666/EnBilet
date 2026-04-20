"use client";


import { useAuth } from "@/src/hooks/useAuth";
import ThemeToggle from "@/src/components/navBar/ThemeToggle";
import Link from "next/link";
import { useState } from "react";


type Props = {
  isLoggedIn: boolean;
};

export default function NavBar({ isLoggedIn }: Props) {
  const { logout } = useAuth();

    const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

    const toggleDropdown = (
    e: React.MouseEvent,
    type: "regular" | "admin"
  ) => {
    const isEnter = e.type === "mouseenter";
    const isLeaveOrClick =
      e.type === "mouseleave" || e.type === "click";

    if (type === "regular") {
      if (isEnter) setMenuOpen(true);
      if (isLeaveOrClick) setMenuOpen(false);
    }

    if (type === "admin") {
      if (isEnter) setAdminOpen(true);
      if (isLeaveOrClick) setAdminOpen(false);
    }
  };


  return (
    <>
      <div className="navbar bg-base-100 shadow-sm dark:shadow-white sticky top-0 z-[55]">
        <div className="">
          <link className="btn btn-ghost text-xl" href="/">
            Çocuk Aklı
          </link>
        </div>
        <div className="w-full flex justify-between px-2">
          <div className="flex">
                       <div 
                       
                         onMouseEnter={(e) => toggleDropdown(e, "regular")}
  onMouseLeave={(e) => toggleDropdown(e, "regular")}
  className=" dropdown dropdown-hover">
            <div  className="btn btn-ghost">Menü {"\u25BC"}</div>
  {menuOpen && 
            <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow border">
              <li>
                <Link href="/account/">Giriş Yap</Link>
              </li>

            </ul> }
            </div>
           {isLoggedIn &&  <>
           <div className="dropdown dropdown-hover "                          onMouseEnter={(e) => toggleDropdown(e, "admin")}
  onMouseLeave={(e) => toggleDropdown(e, "admin")}>
            <div className="btn btn-ghost">Yönetici {"\u25BC"}</div>
 {adminOpen && 
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
            </ul> }
            </div>
            </> }
          </div>
          <ThemeToggle></ThemeToggle>
        </div>
      </div>
    </>
  );
}

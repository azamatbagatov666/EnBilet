"use client";

import { useAuth } from "@/src/hooks/useAuth";
import ThemeToggle from "@/src/components/layout/ThemeToggle";
import Link from "next/link";
import { useState } from "react";

type Props = {
  isLoggedIn: boolean;
};

export default function NavBar({ isLoggedIn }: Props) {
  const { logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);


  const toggleDropdown = (e: React.MouseEvent, type: "regular" | "admin") => {
    const isEnter = e.type === "mouseover";
    const isLeaveOrClick = e.type === "mouseleave" || e.type === "click";

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
      <div className="max-lg:collapse bg-base-200  shadow-sm w-full  dark:shadow-white sticky top-0 z-56 rounded-none">
        <label
          className="fixed inset-0 hidden max-lg:peer-checked:block"
        ></label>
        <div className="collapse-title navbar justify-between !py-0 !min-h-auto h-12">
          <div className="navbar-start h-full">
            <label
              className="btn btn-ghost lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
            <Link className="btn btn-ghost text-xl w-max" href="/">
              EnBilet
            </Link>
            <div className="w-full hidden lg:flex h-full  px-2">
              <div
                onMouseOver={(e) => toggleDropdown(e, "regular")}
                onMouseLeave={(e) => toggleDropdown(e, "regular")}
                className=" dropdown dropdown-hover h-full w-48 group"
              >
                <div
                      className={`btn btn-ghost h-full w-full rounded-none  group-hover:bg-error`}
                >
                  Menü {"\u25BC"}
                </div>
                {menuOpen && (
                  <ul className="dropdown-content menu bg-base-100 rounded-b-lg border border-t-0 z-[1] w-full p-2 ">
                    <li>
                      <Link href="/account/">Giriş Yap</Link>
                    </li>
                  </ul>
                )}
              </div>
              {isLoggedIn && (
                <>
                  <div
                    className="dropdown dropdown-hover h-full w-52 group "
                    onMouseOver={(e) => toggleDropdown(e, "admin")}
                    onMouseLeave={(e) => toggleDropdown(e, "admin")}
                  >
                    <div
                      className={`btn btn-ghost h-full w-full rounded-none  group-hover:bg-error`}
                    >
                      Yönetici {"\u25BC"}
                    </div>
                    {adminOpen && (
                      <ul className="dropdown-content menu bg-base-100 rounded-b-lg border border-t-0 z-[1] w-full p-2 ">
                        <li>
                          <Link href="/account/events">
                            Etkinlik Ekle/Düzenle
                          </Link>
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
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="navbar-center hidden lg:flex"></div>
          <div className="navbar-end">
            <ThemeToggle></ThemeToggle>
          </div>
        </div>

      
      </div>
      {mobileOpen &&         <div className="absolute collapse-content bg-base-200 w-full lg:hidden z-999" style={{contentVisibility:"visible"}}>
          <div className="menu">
            <li>
              <div>Menü</div>
              <ul>
                <li onClick={() => {setMobileOpen(false)}}>
                  <Link href="/account/">Giriş Yap</Link>
                </li>
              </ul>
            </li>

                      {isLoggedIn && (          <li>
              <div>Yönetici</div>
              <ul>
                <li onClick={() => {setMobileOpen(false)}}>
                  <Link href="/account/events">Etkinlik Ekle/Düzenle</Link>
                </li>
                <li onClick={() => {setMobileOpen(false)}}>
                  <Link href="/account/venues">Salonlar</Link>
                </li>
                <li onClick={() => {setMobileOpen(false)}}>
                  <Link href="/account/shows">Gösteriler</Link>
                </li>
                <li onClick={() => {{logout(); setMobileOpen(false)}}}>
                  <a>Çıkış Yap</a>
                </li>
              </ul>
            </li>)}

  
          </div>
        </div>}

    </>
  );
}

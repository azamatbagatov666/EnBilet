"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { titleConfig } from "@/src/hooks/config/titleConfig";



export default function Breadcrumbs() {



  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((s) => !/^\d+$/.test(s)); // ignore ID

const crumbs = segments
  .map((segment, index) => {
    const config = titleConfig[segment];
    if (!config) return null;

    const href =
      "/" +
      segments
        .slice(0, index + 1)
        .filter((s) => titleConfig[s])
        .join("/");

    return {
      label: config.label,
      href,
    };
  })
  .filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="breadcrumbs text-sm px-4 mb-1 font-semibold">
      <ul className="" >
        {crumbs.map((c, i) => (
          <li key={c.href} >
            {i === crumbs.length - 1 ? (
              <span >{c.label}</span>
            ) : (
              <Link className="  " href={c.href}>{c.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
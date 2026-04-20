"use client";

import { usePathname } from "next/navigation";
import { titleConfig } from "@/src/hooks/config/titleConfig";



export default function PageTitle() {



  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((s) => !/^\d+$/.test(s)); // ignore ID

const pageTitle =
  [...segments]
    .reverse()
    .map((segment) => titleConfig[segment]?.title)
    .find(Boolean) ?? "Uygulama";

    


  return (
    <div className="flex justify-center">
<h1 className="text-2xl md:text-3xl pl-2 my-2 border-l-8  font-sans font-bold border-teal-400  dark:text-gray-200">
    {pageTitle}
</h1></div>
  );
}
"use client";

import { useEffect, useRef, ReactNode } from "react";

type Props = {
  children?: ReactNode;
  title?: string;
};

export default function FormContainer({ children, title }: Props) {



  return (
    <div className="flex justify-center px-2">
          <div className=" grid gap-2 w-[500px] rounded-xl  px-2 py-4 bg-slate-200 dark:bg-slate-700">
          <div className="flex justify-center text-lg font-bold "> <span className="bg-red-600 text-white rounded-xl p-2 dark:text-white duration-150"> {title}</span></div>
        {children} 
        </div>
    </div>
  );
}
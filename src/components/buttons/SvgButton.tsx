"use client";

import { ReactNode } from "react";


type DialogModalProps = {
  children?: ReactNode;
className?: string;
  onClick?: () => Promise<void> | void;
};

export default function SvgButton({
  children,
  onClick,
  className = "",
}: DialogModalProps) {
  
    

  

  return (

        <button
          onClick={() => onClick?.()}
          className={`bg-white dark:bg-zinc-700 p-1 rounded-md hover:bg-red-500! duration-300
             transition-colors border border-black ${className}`}
        >
          {children}
        </button>
  );
}

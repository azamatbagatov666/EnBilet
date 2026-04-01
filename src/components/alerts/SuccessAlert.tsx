"use client";

import { useEffect, useRef, ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function SuccessAlert({ open, onClose, children }: Props) {

useEffect(() => {
  if (!open) return;

  const t = setTimeout(() => {
    onClose();
  }, 4000);

  return () => clearTimeout(t);
}, [open, onClose]);

  return (
    <div className="flex justify-center">
    <div
      className={`fixed bottom-6 font-bold w-full sm:w-3/5 px-4 border-none bg-transparent transition-all duration-300 ease-out ${open
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-2 pointer-events-none"}`}
    >
      <div role="alert" className="alert alert-success !text-white shadow-lg flex justify-left">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {children}
      </div>
    </div>
    </div>
  );
}
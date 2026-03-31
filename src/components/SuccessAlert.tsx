"use client";

import { useEffect, useRef, ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function SuccessAlert({ open, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.show();

      const t = setTimeout(() => {
        dialog.close();
        onClose();
      }, 3000);

      return () => clearTimeout(t);
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed bottom-6 font-bold w-full sm:w-3/5 px-4 border-none bg-transparent"
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
    </dialog>
  );
}
"use client";

import { useEffect, useRef, ReactNode } from "react";

type DialogModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function DialogModal({
  open,
  onClose,
  children,
}: DialogModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Autofocus + show dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
        dialog.showModal();
    } else {
        dialog.close();
    }
  }, [open]);

  // ESC handling
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault(); // prevent native close
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="modal outline-none"
      onClose={onClose}
    >
      {/* Modal Box */}
      <div className="modal-box w-96   border">
        <button
          className="outline-none btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>


        <div className="mt-5 flex font-bold text-lg  justify-center text-center">
          {children}
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="modal-backdrop"
        onClick={onClose}
      />
    </dialog>
  );
}
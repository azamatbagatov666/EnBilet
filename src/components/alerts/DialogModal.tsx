"use client";

import { useEffect, useRef, ReactNode } from "react";

type DialogModalProps = {
  open: boolean;
  disableClose?: boolean;
  onClose: () => void;
  children: ReactNode;
  dialogueText?: string,
  width?: number,
};

export default function DialogModal({
  open,
  onClose,
  children,
  disableClose,
  dialogueText,
  width,
}: DialogModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Autofocus + show dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();

  requestAnimationFrame(() => {
      const target = dialog.querySelector<HTMLElement>(
        "[data-focus-target]"
      );

      if (target instanceof HTMLElement) {
        target.focus();

        // optional: select text if it's an input
        if (target instanceof HTMLInputElement) {
          target.select();
        }
      }
    });
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open || !disableClose) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, disableClose]);

  // ESC handling
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || disableClose) return;

    const handleCancel = (e: Event) => {
      e.preventDefault(); // prevent native close
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  

  return (
    <dialog ref={dialogRef} className="modal outline-none" onClose={onClose}>
      {/* Modal Box */}
      <div className={`modal-box ${width? `w-[${width}px] max-w-max` : "w-96"} border`}>
        <button
          className={`outline-none btn btn-sm btn-circle btn-ghost absolute right-2 top-2 ${
            disableClose ? "pointer-events-none  blur-sm opacity-35" : ""
          }`}
          onClick={onClose}
        >
          ✕
        </button>

        <div
          className={`mt-5 flex font-bold text-lg  justify-center text-center ${
            disableClose
              ? "pointer-events-none blur-sm opacity-35 select-none"
              : ""
          }`}
        >
          {dialogueText}
          {children}
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="modal-backdrop"
        onClick={() => {
          if (!disableClose) onClose();
        }}
      />


      {disableClose && (     <span className="loading loading-spinner loading-lg absolute top-2/4"></span>

          )}
      
    </dialog>
  );
}

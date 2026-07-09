"use client";

import { ReactNode } from "react";
import styles from "./FormContainer.module.css";

type Props = {
  children?: ReactNode;
  title?: string;
  inProgress?: boolean;
};

export default function FormContainer({ children, title, inProgress }: Props) {
  return (
    <div
      className={`flex justify-center  relative`}
    >
      <div
        className={`${styles.label} grid gap-2 w-[500px] rounded-xl  px-2 py-4 bg-slate-200 dark:bg-slate-700  ${
        inProgress ? "pointer-events-none blur-xs opacity-35 select-none" : ""
      }`}
      >
        <div className="flex justify-center text-lg font-bold ">
          <span className="bg-red-600 text-white rounded-xl p-2 dark:text-white duration-150">
            {title}
          </span>
        </div>

        {children}
      </div>

      {inProgress && (
        <span className="loading loading-spinner loading-lg absolute top-2/4"></span>
      )}
    </div>
  );
}

"use client";

import { forwardRef } from "react";

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  ({ value, onChange, onEnter, autoFocus, disabled }, ref) => {
    const handleChange = (raw: string) => {
      let val = raw.replace(",", ".");

      if (val === "") {
        onChange("");
        return;
      }

      if (!/^\d*\.?\d*$/.test(val)) return;

      const [, decimals] = val.split(".");
      if (decimals && decimals.length > 2) return;

      onChange(val);
    };

    const handleBlur = () => {
      if (!value) return;
      onChange(Number(value).toFixed(2));
    };

    return (
      <div className="flex gap-1 input input-accent font-bold h-9 w-32 outline-none!">
        <input
          data-focus-target
          ref={ref}
          className="outline-none! w-20 text-right bg-transparent"
          inputMode="decimal"
          placeholder="0,00"
          value={value.replace(".", ",")}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onEnter?.();
            }
          }}
        />
        <span className="self-center text-lg select-none">₺</span>
      </div>
    );
  }
);

PriceInput.displayName = "PriceInput";

export default PriceInput;
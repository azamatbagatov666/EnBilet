import type { SeatCell } from "@/src/models/seatMap/SeatCell";
import PriceInput from "@/src/components/forms/PriceInput";

import { useState, useEffect, useRef } from "react";
import DialogModal from "@/src/components/alerts/DialogModal";
import { createPortal } from "react-dom";
import type { seatState } from "@/src/models/seatMap/seatState";
import HandiSvg from "@/src/components/svg/HandiSvg";
import { formatPrice } from "@/src/lib/formatPrice";

import { stat } from "fs";

interface Props {
  cell: SeatCell;
  rowLabel: string;
  seatState?: seatState;
  onClick?: () => void;
  setSeatPrice: (seatID: string, price: number) => void;
}

export function Cell({
  cell,
  rowLabel,
  seatState,
  onClick,
  setSeatPrice,
}: Props) {
  const isSeat = cell.type === "seat";
  const isHandicapped = cell.seatKind === "handicapped";
  const [menuOpen, setMenuOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [desiredPrice, setDesiredPrice] = useState("");

  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });

  const ref = useRef<HTMLUListElement | null>(null);

  const status = seatState?.status;

  const isAvailable = status === "available";
  const isBlocked = status === "blocked";
  const isReserved = status === "reserved";
  const isSold = status === "sold";

  const statusTr = {
    available: "Müsait",
    blocked: "Kapalı",
    reserved: "Rezerve",
    sold: "Satıldı",
  };

  const formatPriceTR = (price: number) =>
    price.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleSavePrices = () => {
    const price = Number(desiredPrice.replace(",", "."));

    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Lütfen geçerli bir fiyat giriniz.");
      return;
    }
    setSeatPrice(cell.id, Number(desiredPrice));
    setDesiredPrice("");
    setDialogueOpen(false);
  };

  useEffect(() => {
    const handleOutSideClick = (event: Event) => {
      if (
        event.target instanceof Node &&
        !ref.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutSideClick);

    return () => {
      window.removeEventListener("mousedown", handleOutSideClick);
    };
  }, [ref]);

  const openDialogue = () => {
    setFormError("");
    setMenuOpen(false);
    setDesiredPrice(formatPrice(Number(seatState?.price)));
    setDialogueOpen(true);
  };

  const bgClass = menuOpen
    ? "border-black  bg-gray-400  !border-b-8 "
    : isBlocked
      ? "bg-gray-600 !border-gray-400 text-white !border-b-8 line-through decoration-[1.5px]"
      : isSold
        ? "bg-red-600 border-red-800 text-white cursor-not-allowed !border-b-8"
        : isReserved
          ? "bg-yellow-400 border-yellow-600 !text-black cursor-not-allowed !border-b-8"
          : isHandicapped
            ? "bg-blue-500 border-blue-700 text-white !border-b-8"
            : isAvailable
              ? "bg-gray-300 !text-black border-neutral-500 border-b-8"
              : "!bg-transparent border-none";

  return (
    <>
      <div className="relative ml-3">
        <div className="tooltip">
          <div className="tooltip-content">
            {seatState && (
              <div>
                <div>{statusTr[status!]}</div>
                <div>{formatPriceTR(seatState.price)}₺</div>
              </div>
            )}
          </div>
          <button
            onClick={isAvailable || isBlocked ? onClick : undefined}
            disabled={isSold || isReserved || !isSeat}
            aria-label={
              isHandicapped
                ? `Engelli koltuğu ${rowLabel}${cell.label}`
                : `Koltuk ${rowLabel}${cell.label}`
            }
            onContextMenu={
              isAvailable || isBlocked
                ? (e) => {
                    e.preventDefault();
                    setContextPos({
                      x: e.pageX,
                      y: e.pageY,
                    });
                    setMenuOpen(true);
                  }
                : undefined
            }
            className={`
  w-10 h-10 text-xs rounded border-2 
  flex items-center justify-center 
  transition-colors duration-200  text-black dark:text-neutral-100 border-black
  
${isAvailable || isBlocked ? "hover:border-black!  hover:bg-gray-400! " : ""}

  ${bgClass}
`}
          >
            <span className="font-bold text-xs">
              {isSeat ? rowLabel + cell.label : ""}
            </span>

            {seatState && (
              <span
                className={`
        absolute top-10 font-bold text-[11px] text-ellipsis max-w-[51px]  overflow-hidden
        ${isAvailable ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400 line-through"}
      `}
              >
                {formatPriceTR(seatState.price)}₺
              </span>
            )}

            {isHandicapped && !menuOpen && <HandiSvg></HandiSvg>}
          </button>
        </div>

        {menuOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}
        {menuOpen &&
          createPortal(
            <ul
              style={{
                top: contextPos.y,
                left: contextPos.x,
              }}
              className="menu bg-base-200 rounded-box w-56 top-11  absolute z-9999 border-2 border-black dark:border-gray-500"
              ref={ref}
            >
              <li
                onClick={() => {
                  openDialogue();
                }}
              >
                <a>Koltuk Fiyatını Düzenle</a>
              </li>
            </ul>,
            document.body,
          )}
      </div>

      <DialogModal
        open={dialogueOpen}
        onClose={() => {
          setDialogueOpen(false);
        }}
      >
        <div className="flex justify-center">
          <div>
            <span>Lütfen bu koltuk için bir fiyat belirleyin.</span>
            <div className="flex justify-center mt-4">
              <PriceInput
                value={desiredPrice}
                onChange={setDesiredPrice}
                onEnter={handleSavePrices}
                autoFocus
              />
            </div>
            <div className="flex justify-center mt-4">
              <button
                className="btn btn-success text-white"
                onClick={() => {
                  handleSavePrices();
                }}
              >
                Kaydet
              </button>
            </div>
            <div className={" font-bold text-red-500 h-4 px-1"}>
              {formError}
            </div>
          </div>
        </div>
      </DialogModal>
    </>
  );
}

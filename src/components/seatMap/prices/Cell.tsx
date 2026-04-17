import type { SeatCell } from "@/src/models/seatMap/SeatCell";
import { useState, useEffect, useRef } from "react";
import DialogModal from "@/src/components/alerts/DialogModal";
import { createPortal } from "react-dom";
import type { seatState } from "@/src/models/seatMap/seatState";

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

  const [modalMode, setModalMode] = useState("");

  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [desiredPrice, setDesiredPrice] = useState("");

  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });

  const ref = useRef<HTMLUListElement | null>(null);

  const status = seatState?.status;

const isAvailable = status === "available";
const isBlocked   = status === "blocked";
const isReserved  = status === "reserved";
const isSold      = status === "sold";

const formatPriceTR = (price: number) =>
  price.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });


  const handlePriceChange = (value: string) => {
    value = value.replace(".", ".");

    if (value === "") {
      setDesiredPrice("");
      return;
    }

    if (!/^\d*\.?\d*$/.test(value)) return;

    const [, decimals] = value.split(".");
    if (decimals && decimals.length > 2) return;

    setDesiredPrice(value);
  };

  const handleSavePrices = () => {
    if (desiredPrice.trim() != "" && desiredPrice.trim() != "0.00") {
      setSeatPrice(cell.id, Number(desiredPrice));
      setDesiredPrice("");
      setDialogueOpen(false);
    }
    else {
      setFormError("Lütfen geçerli bir fiyat giriniz.")
    }
  };

  const priceInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (!dialogueOpen) return;

    priceInputRef.current?.focus();
    priceInputRef.current?.select();

}, [dialogueOpen]);

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

  const openDialogue = (menuName: string) => {
    setFormError("");
    setModalMode(menuName);
    setDialogueOpen(true);
    setMenuOpen(false);
  };

const bgClass = menuOpen
  ? "border-black  bg-gray-400  !border-b-8 "
  : isBlocked
    ? "bg-gray-600 !border-gray-400 text-white !border-b-8 line-through decoration-[1.5px]"
    : isSold
      ? "bg-red-600 border-red-800 text-white cursor-not-allowed !border-b-8"
      : isReserved
        ? "bg-yellow-400 border-yellow-600 text-black cursor-not-allowed !border-b-8"
        : isHandicapped
          ? "bg-blue-500 border-blue-700 text-white !border-b-8"
          : isAvailable
            ? "bg-gray-300 dark:bg-neutral-700  border-neutral-500 border-b-8"
            : "!bg-transparent border-none";

  return (
    <>
      <div className="relative ml-3">
        <button
          onClick={isAvailable || isBlocked ? onClick : undefined}
            disabled={isSold || isReserved || !isSeat}

          aria-label={
            isHandicapped
              ? `Engelli koltuğu ${rowLabel}${cell.label}`
              : `Koltuk ${rowLabel}${cell.label}`
          }

            onContextMenu={isAvailable || isBlocked ? (e) => {
            e.preventDefault();
            setContextPos({
              x: e.pageX,
              y: e.pageY,
            });
            setMenuOpen(true);
          } : undefined}


       
          className={`
  w-10 h-10 text-xs rounded border-2 
  flex items-center justify-center 
  transition-colors duration-200  text-black dark:text-neutral-100 border-black
  
${isAvailable || isBlocked ? "hover:!border-black  hover:!bg-gray-400 " : ""}

  ${bgClass}
`}
        >
          <span className="font-bold text-xs">
            {isSeat ? rowLabel + cell.label : ""}
          </span>

          {seatState && (
            <span
              className={`
        absolute top-10 font-bold text-[11px] 
        ${isAvailable ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400 line-through"}
      `}
            >
            

              {formatPriceTR(seatState.price)}₺

            </span>
          )}

          {isHandicapped && !menuOpen && (
            <span className="absolute bottom-1 inset-0 flex items-center justify-center pointer-events-none opacity-35">
              <svg
                fill="white"
                width="26px"
                height="26px"
                viewBox="0 0 512 512"
              >
                <path d="M496.101 385.669l14.227 28.663c3.929 7.915.697 17.516-7.218 21.445l-65.465 32.886c-16.049 7.967-35.556 1.194-43.189-15.055L331.679 320H192c-15.925 0-29.426-11.71-31.679-27.475C126.433 55.308 128.38 70.044 128 64c0-36.358 30.318-65.635 67.052-63.929 33.271 1.545 60.048 28.905 60.925 62.201.868 32.933-23.152 60.423-54.608 65.039l4.67 32.69H336c8.837 0 16 7.163 16 16v32c0 8.837-7.163 16-16 16H215.182l4.572 32H352a32 32 0 0 1 28.962 18.392L438.477 396.8l36.178-18.349c7.915-3.929 17.517-.697 21.446 7.218zM311.358 352h-24.506c-7.788 54.204-54.528 96-110.852 96-61.757 0-112-50.243-112-112 0-41.505 22.694-77.809 56.324-97.156-3.712-25.965-6.844-47.86-9.488-66.333C45.956 198.464 0 261.963 0 336c0 97.047 78.953 176 176 176 71.87 0 133.806-43.308 161.11-105.192L311.358 352z" />
              </svg>
            </span>
          )}
        </button>

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
              className="menu bg-base-200 rounded-box w-56 top-11  absolute z-[9999] border-2 border-black dark:border-gray-500"
              ref={ref}
            >
              <li
                onClick={() => {
                  setMenuOpen(false)
                  setDesiredPrice(Number(seatState?.price.toString()).toFixed(2))
                  setDialogueOpen(true);
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
            <div className="flex gap-1 input input-accent h-9 w-32 !outline-none ">
              <input
              ref={priceInputRef}
                className="!outline-none w-20 text-right"
                inputMode="decimal"
                placeholder="0,00"
                autoFocus
  value={desiredPrice.replace(".", ",")}
  onChange={(e) =>
    handlePriceChange(e.target.value.replace(",", "."))
  }
  onBlur={() => {
    if (!desiredPrice) return;
    setDesiredPrice(Number(desiredPrice).toFixed(2));
  }}
                 onKeyDown={(e) => {
                      if (e.key === "Enter") handleSavePrices();
                    }}
              />
              <span className=" self-center text-lg select-none">₺</span>
            </div>
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

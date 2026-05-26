import type { SeatCell } from "@/src/models/seatMap/SeatCell";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import HandiSvg from "@/src/components/svg/HandiSvg";
import DialogModal from "@/src/components/alerts/DialogModal";


const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface Props {
  cell: SeatCell;
  onToggle: () => void;
  ID: string;
  deleteTheCell: (cellId: string) => void;
  updateSeatLabel: (cellId: string, newLabel: string) => boolean;
  renumerateFromCell: (
    cellId: string,
    step: number,
    selectedIncrement: string,
  ) => string;
  addCellToLeft: (cellId: string) => void;
  toggleHandicappedSeat: (cellId: string) => void;
}

export function Cell({
  cell,
  onToggle,
  ID,
  deleteTheCell,
  updateSeatLabel,
  renumerateFromCell,
  addCellToLeft,
  toggleHandicappedSeat,
}: Props) {
  const isSeat = cell.type === "seat";
  const isHandicapped = cell.seatKind === "handicapped";
  const [menuOpen, setMenuOpen] = useState(false);
  const [desiredLabel, setDesiredLabel] = useState("");
  const [steps, SetSteps] = useState<number>(1);
  const [renumerateError, setRenumerateError] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedIncrement, setSelectedIncrement] = useState<"up" | "down">(
    "up",
  );

  const [modalMode, setModalMode] = useState("");

  const [dialogueOpen, setDialogueOpen] = useState(false);

  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const [contextPos, setContextPos] = useState({ x: -9999, y: -9999 });

  const ref = useRef<HTMLUListElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!menuOpen || !ref.current) return;

    const panelRect = ref.current.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;

    let left = clickPos.x;

    if (left - window.scrollX + panelRect.width > viewportWidth) {
      left = viewportWidth + window.scrollX - panelRect.width - 12;
    }

    if (left < window.scrollX + 8) {
      left = window.scrollX + 8;
    }

    setContextPos({ x: left, y: clickPos.y });
  }, [menuOpen, clickPos]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleOutSideClick = (event: Event) => {
      if (
        event.target instanceof Node &&
        !ref.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleScroll = (event: Event) => {
      if (
        event.target instanceof Node &&
        ref.current?.contains(event.target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    window.addEventListener("mousedown", handleOutSideClick);
    window.addEventListener("touchstart", handleOutSideClick);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("mousedown", handleOutSideClick);
      window.removeEventListener("touchstart", handleOutSideClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [menuOpen, ref]);

  const openDialogue = (menuName: string) => {
    setFormError("");
    setModalMode(menuName);

    setDialogueOpen(true);
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!dialogueOpen) return;

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [dialogueOpen, modalMode]);

  const handleSave = () => {
    if (desiredLabel.trim() != "") {
      const success = updateSeatLabel(cell.id, desiredLabel);
      if (success) {
        setDialogueOpen(false);
      } else {
        setFormError("Bu sırada aynı isimde başka bir koltuk bulunuyor.");
      }
    } else {
      setFormError("Koltuk ismi boş olamaz.");
    }
  };

  const handleNumarete = () => {
    if (!renumerateError) {
      const success = renumerateFromCell(cell.id, steps, selectedIncrement);
      if (success == "") {
        setDialogueOpen(false);
        SetSteps(1);
      } else if (success == "NUMBER_BELOW_ONE") {
        setFormError(
          "Hücre numarası eksiye düşüyor, lütfen sırada yeterli sayıda hücre olduğundan emin olun.",
        );
      } else if (success == "DUPLICATE_NUMBER") {
        setFormError(
          "Oluşturmaya çalıştığınız isimde bir hücre zaten bulunuyor.",
        );
      }
    }
  };

  useEffect(() => {
    if (typeof cell.label === "string" && !Number.isNaN(Number(cell.label))) {
      setRenumerateError(false);
    } else {
      setRenumerateError(true);
    }
  }, [cell.label]);

  const inputRef = useRef<HTMLInputElement>(null);

  const bgClass = menuOpen
    ? isSeat
      ? "!bg-red-600 !dark:bg-red-600 !border-red-400 !text-white !border-b-8"
      : "!bg-red-600 !dark:bg-red-600 !text-white !border-none"
    : isHandicapped
      ? "bg-blue-500 border-blue-700  dark:bg-blue-500 dark:!border-blue-700 [@media(hover:hover)_and_(pointer:fine)]:dark:hover:border-neutral-500 [@media(hover:hover)_and_(pointer:fine)]:dark:hover:bg-neutral-400 [@media(hover:hover)_and_(pointer:fine)]:dark:hover:!border-neutral-500 !border-b-8"
      : isSeat
        ? "bg-gray-300 dark:bg-neutral-700 [@media(hover:hover)_and_(pointer:fine)]:dark:hover:bg-neutral-400 dark:border-neutral-500 border-b-8"
        : "bg-transparent [@media(hover:hover)_and_(pointer:fine)]:hover:bg-neutral-400 border-none";

  return (
    <>
      <div className="relative">
        <button
          aria-label={
            isHandicapped
              ? `Engelli koltuğu ${ID}${cell.label}`
              : `Koltuk ${ID}${cell.label}`
          }

          onClick={(e) => {
            setClickPos({
              x: e.pageX,
              y: e.pageY,
            });
            setContextPos({
              x: -9999,
              y: e.pageY,
            });
            setMenuOpen(true);
          }}
          className={`
  w-10 h-10 text-xs rounded border-2
  flex items-center justify-center [@media(hover:hover)_and_(pointer:fine)]:hover:border-black
  transition-colors duration-200 text-black dark:text-neutral-100 border-black
  [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-500


  ${bgClass}
`}
        >
          <span
            className={`z-20 font-bold 

              ${isHandicapped && "text-white"}
          `}
          >
            {isSeat ? ID + cell.label : ""}
          </span>

          {isHandicapped && !menuOpen && <HandiSvg></HandiSvg>}
        </button>

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
                      
              <li onClick={() => {onToggle(); setMenuOpen(false);}  }>
                <a>Hücreyi {isSeat ? "Boşluğa" : "Koltuğa"} Çevir</a>
              </li>
              <li onClick={() => deleteTheCell(cell.id)}>
                <a>Hücreyi Sil</a>
              </li>
              <li
                onClick={() => {
                  addCellToLeft(cell.id);
                  setMenuOpen(false);
                }}
              >
                <a>Soluna Hücre Ekle</a>
              </li>

              {isSeat && (
                <>
                  <li
                    onClick={() => {
                      openDialogue("rename");

                      setDesiredLabel(cell.label ?? "");
                    }}
                  >
                    <a>Yeniden İsimlendir</a>
                  </li>
                  <li
                    onClick={() => {
                      openDialogue("renumerate");
                    }}
                  >
                    <a>Sağa Doğru Numaralandır</a>
                  </li>
                  <li
                    onClick={() => {
                      toggleHandicappedSeat(cell.id);
                      setMenuOpen(false);
                    }}
                  >
                    <a className="flex justify-between">
                      <span>Engelli Koltuğu</span>
                      {isHandicapped && (
                        <span className="font-bold text-[25px] text-green-500">
                          {"\u2713"}
                        </span>
                      )}
                    </a>
                  </li>
                </>
              )}
            </ul>,
            document.body,
          )}
      </div>

      <DialogModal
        open={dialogueOpen}
        onClose={() => {
          setDialogueOpen(false);
        }}
        width={340}
      >
        {modalMode === "rename" && (
          <div className="grid gap-4 w-80">
            <div className="flex justify-between gap-2 items-center">
              <span>Yeni İsim:</span>
              <input
                value={desiredLabel}
                onChange={(e) => setDesiredLabel(e.target.value)}
                className="w-16 h-6 rounded-md px-1 border border-gray-500 input"
                ref={inputRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
              />
            </div>
            <div className={" font-bold h-12 text-red-500 "}>{formError}</div>

            <button className="btn btn-accent h-8" onClick={handleSave}>
              Değiştir
            </button>
          </div>
        )}

        {modalMode === "renumerate" && (
          <div className="grid gap-2  w-80">
            <div className="flex justify-between items-center">
              <span>Başlangıç:</span>
              <span
                className={`w-12 ${renumerateError ? "border-red-500 border-2 text-red-500 px-1" : ""}`}
              >
                {cell.label}
              </span>
            </div>
            {renumerateError && (
              <div className="text-red-500 font-bold text-xs">
                Numaralandırmaya başlayacağınız hücre, sadece rakamlardan
                oluşmalıdır.
              </div>
            )}
            <div className="text-start">
              <label className="flex gap-2">
                <input
                  type="radio"
                  value="up"
                  checked={selectedIncrement === "up"}
                  onChange={() => setSelectedIncrement("up")}
                />
                Artarak
              </label>
              <label className="flex gap-2">
                <input
                  type="radio"
                  value="down"
                  checked={selectedIncrement === "down"}
                  onChange={() => setSelectedIncrement("down")}
                />
                Azalarak
              </label>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span>Basamak:</span>
              <input
                type="number"
                value={steps}
                onChange={(e) => SetSteps(+e.target.value)}
                max={50}
                min={1}
                ref={inputRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNumarete();
                }}
                className="w-12 h-8 text-black dark:text-white rounded-md px-1 border-2"
              />
            </div>
            <div className={" font-bold text-red-500 h-[72px]"}>
              {formError}
            </div>
            <button
              className="btn btn-accent h-8 text-white"
              onClick={handleNumarete}
            >
              Numaralandır
            </button>
          </div>
        )}
      </DialogModal>
    </>
  );
}

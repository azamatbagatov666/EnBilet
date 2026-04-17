import type { SeatCell } from "@/src/models/seatMap/SeatCell";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
  import HandiSvg from "@/src/components/svg/HandiSvg";

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
  const [selectedIncrement, setSelectedIncrement] = useState<"up" | "down">("up");

  const [modalMode, setModalMode] = useState("");

  const [dialogueOpen, setDialogueOpen] = useState(false);

  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });

  const ref = useRef<HTMLUListElement | null>(null);

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
      ? "bg-blue-500 border-blue-700  dark:bg-blue-500 dark:!border-blue-700 dark:hover:border-neutral-500 dark:hover:bg-neutral-400 dark:hover:!border-neutral-500 !border-b-8"
      : isSeat
        ? "bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-400 dark:border-neutral-500 border-b-8"
        : "bg-transparent hover:bg-neutral-400 border-none";

  return (
    <>
      <div className="relative">
        <button
          aria-label={
            isHandicapped
              ? `Engelli koltuğu ${ID}${cell.label}`
              : `Koltuk ${ID}${cell.label}`
          }
onContextMenu={(e) => {
  e.preventDefault();
  setContextPos({
    x: e.pageX,
    y: e.pageY,
  });
  setMenuOpen(true);
}}
          onClick={onToggle}
          className={`
  w-10 h-10 text-xs rounded border-2
  flex items-center justify-center hover:border-black
  transition-colors duration-200 text-black dark:text-neutral-100 border-black
  hover:bg-gray-500


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

          {isHandicapped && !menuOpen && (
<HandiSvg></HandiSvg>
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

      {dialogueOpen && (
        <dialog
          open
          className="modal modal-open outline-none"
          onClose={() => setDialogueOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDialogueOpen(false);
            }
          }}
        >
          <div className="modal-box max-w-72 border">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setDialogueOpen(false)}
            >
              ✕
            </button>

            {modalMode === "rename" && (
              <div className="grid gap-4 mt-9">
                <div className="flex justify-between items-center">
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

                <button className="btn btn-accent h-8" onClick={handleSave}>
                  Değiştir
                </button>
                <div className={" font-bold text-red-500 px-1"}>
                  {formError}
                </div>
              </div>
            )}

            {modalMode === "renumerate" && (
              <div className="grid gap-2 mt-5">
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
                <div>
                  <label>
                    <input
                      type="radio"
                      value="up"
                      checked={selectedIncrement === "up"}
                      onChange={(e) => setSelectedIncrement("up")}
                    />
                    Artarak
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      value="down"
                      checked={selectedIncrement === "down"}
                      onChange={(e) => setSelectedIncrement("down")}
                    />
                    Azalarak
                  </label>
                </div>
                <div className="flex justify-between items-center">
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
                <button className="btn btn-accent h-8" onClick={handleNumarete}>
                  Numaralandır
                </button>
                <div className={" font-bold text-red-500 px-1"}>
                  {formError}
                </div>
              </div>
            )}
          </div>

          <div
            className="modal-backdrop"
            onClick={() => setDialogueOpen(false)}
          />
        </dialog>
      )}
    </>
  );
}

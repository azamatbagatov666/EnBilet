import type { SeatCell } from "@/src/models/seatMap/SeatCell";
import { useState, useEffect, useRef } from "react";

interface Props {
  cell: SeatCell;
  onToggle: () => void;
  ID: string;
  deleteTheCell: (cellId: string) => void;
  updateSeatLabel: (cellId: string, newLabel: string) => void;
  renumerateFromCell: (cellId: string, step: number) => void;
  addCellToLeft: (cellId: string) => void;

}

export function Cell({
  cell,
  onToggle,
  ID,
  deleteTheCell,
  updateSeatLabel,
  renumerateFromCell,
  addCellToLeft,
}: Props) {
  const isSeat = cell.type === "seat";
  const [menuOpen, setMenuOpen] = useState(false);
  const [desiredLabel, setDesiredLabel] = useState("");
  const [steps, SetSteps] = useState<number>(1);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renumerateOpen, SetRenumerateOpen] = useState(false);
  const [renumerateError, SetRenumerateError] = useState(false);

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

  const handleSave = () => {
    if (desiredLabel != "") {
      updateSeatLabel(cell.id, desiredLabel);
      setRenameOpen(false);
    }
  };

  const handleNumarete = () => {
    if (!renumerateError) {
      renumerateFromCell(cell.id, steps);
      SetRenumerateOpen(false);
      SetSteps(1);
    }
  };

  useEffect(() => {
    if (typeof cell.label === "string" && !Number.isNaN(Number(cell.label))) {
      SetRenumerateError(false);
    } else {
      SetRenumerateError(true);
    }
  }, [cell.label]);

  return (
    <>
      <div className="relative">
        <button
          onContextMenu={(e) => {
            setMenuOpen(true);
          }}
          onClick={onToggle}
          className={`
        ${menuOpen ? "!bg-red-500" : ""} 
      
        w-10 h-10 text-xs border-2 border-b-8 rounded border-black transition-colors 
        flex items-center justify-center hover:bg-gray-500
        ${isSeat ? "bg-gray-300 text-black duration-200" : "bg-transparent border-none"}
      `}
        >
          {isSeat ? ID + cell.label : ""}
        </button>
        {menuOpen && (
          <ul
            className="menu bg-base-200 rounded-box w-56 top-11  absolute z-50 border-2 border-black"
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
                    setRenameOpen(true);
                    setMenuOpen(false);
                    setDesiredLabel(cell.label ?? "");
                  }}
                >
                  <a>Yeniden İsimlendir</a>
                </li>
                <li
                  onClick={() => {
                    SetRenumerateOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  <a>Sağa Doğru Numaralandır</a>
                </li>
              </>
            )}
          </ul>
        )}
      </div>

      {renameOpen && (
        <dialog
          open
          className="modal modal-open"
          onClose={() => setRenameOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setRenameOpen(false);
            }
          }}
        >
          {/* MODAL BOX */}
          <div className="modal-box max-w-48">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setRenameOpen(false)}
            >
              ✕
            </button>

            <div className="grid gap-2 mt-5">
              <div className="flex justify-between items-center">
                <span>Yeni İsim:</span>
                <input
                  value={desiredLabel}
                  onChange={(e) => setDesiredLabel(e.target.value)}
                  className="w-16 h-6 text-black rounded-md px-1 border border-gray-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                  }}
                />
              </div>

              <button
                className="btn btn-accent h-8"
                onClick={() => {
                  handleSave();
                }}
              >
                Değiştir
              </button>
            </div>
          </div>

          {/* DARK BACKDROP */}
          <div
            className="modal-backdrop"
            onClick={() => setRenameOpen(false)}
          />
        </dialog>
      )}

      {renumerateOpen && (
        <dialog
          open
          className="modal modal-open"
          onClose={() => SetRenumerateOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              SetRenumerateOpen(false);
            }
          }}
        >
          {/* MODAL BOX */}
          <div className="modal-box max-w-56">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => SetRenumerateOpen(false)}
            >
              ✕
            </button>

            <div className="grid gap-2 mt-5">
              <div className="flex justify-between items-center">
                <span>Başlangıç:</span>
                <span
                  className={`w-12
              ${renumerateError ? "border-red-500 border-2 text-red-500 px-1  " : ""} 
              `}
                >
                  {cell.label}
                </span>
              </div>
              {renumerateError && (
                <div className="text-red-500 font-bold text-xs">
                  Numaralandırmaya başlayacağınız hücre, sadece sayılardan
                  oluşmalıdır.
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Artış Sayısı:</span>
                <input
                  type="number"
                  value={steps}
                  onChange={(e) => SetSteps(+e.target.value)}
                  max={50}
                  min={1}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNumarete();
                  }}
                  className="w-12 h-8 text-black rounded-md px-1 border-2"
                  name=""
                  id=""
                />
              </div>

              <button
                className="btn btn-accent h-8"
                onClick={() => {
                  handleNumarete();
                }}
              >
                Numaralandır
              </button>
            </div>
          </div>

          {/* DARK BACKDROP */}
          <div
            className="modal-backdrop"
            onClick={() => SetRenumerateOpen(false)}
          />
        </dialog>
      )}
    </>
  );
}

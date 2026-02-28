import type { SeatCell } from "@/src/models/seatMap/SeatCell";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
interface Props {
  cell: SeatCell;
  onToggle: () => void;
  ID: string;
  deleteTheCell: (cellId: string) => void;
  updateSeatLabel: (cellId: string, newLabel: string) => void;
  renumerateFromCell: (cellId: string, step: number) => void;
  addCellToLeft: (cellId: string) => void;
  toggleHandicappedSeat: (cellId: string) => void;
      menuVersion?: number; // ✅ new


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
  menuVersion,
}: Props) {
  const isSeat = cell.type === "seat";
  const isHandicapped = cell.seatKind === "handicapped";
  const [menuOpen, setMenuOpen] = useState(false);
  const [desiredLabel, setDesiredLabel] = useState("");
  const [steps, SetSteps] = useState<number>(1);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renumerateOpen, SetRenumerateOpen] = useState(false);
  const [renumerateError, SetRenumerateError] = useState(false);

  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });

  const ref = useRef<HTMLUListElement | null>(null);



 useEffect(() => {
    if (menuOpen) setMenuOpen(false); // close menu when version changes
  }, [menuVersion]);

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

const bgClass =
  menuOpen
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
  setContextPos({ x: e.clientX, y: e.clientY });
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
            <span className="absolute bottom-1 inset-0 flex items-center justify-center pointer-events-none opacity-35">
              <svg
                fill="white"
                width="26px"
                height="26px"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
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
        {menuOpen && createPortal(
          <ul
          style={{
  top: contextPos.y,
  left: contextPos.x,
}}
            className="menu bg-base-200 rounded-box w-56 top-11  absolute z-[9999] border-2 border-black"
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
                <li
                  onClick={() => {
                    toggleHandicappedSeat(cell.id);
                    setMenuOpen(false);
                  }}
                >
                  <a className="flex justify-between">
                    <span>Engelli Koltuğu</span>{" "}
                    {isHandicapped && (
                      <span className="font-bold text-[25px] text-green-500">
                        {"\u2713"}
                      </span>
                    )}
                  </a>
                </li>
              </>
            )}
          </ul>, document.body
        )}
      </div>

      {renameOpen && createPortal(
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
          <div className="modal-box max-w-48 border">
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
                  className="w-16 h-6 rounded-md px-1 border border-gray-500 input"
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
        </dialog>, document.body
      )}

      {renumerateOpen && createPortal(
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
                  className="w-12 h-8 text-black dark:text-white rounded-md px-1 border-2"
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
        </dialog>, document.body
      )}
    </>
  );
}

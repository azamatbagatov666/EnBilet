import type { SeatRow } from "@/src/models/seatMap/SeatRow";
import { Cell } from "./Cell";
import { useState, useEffect, useRef } from "react";

import { createPortal } from "react-dom";
import Drag2Svg from "@/src/components/svg/Drag2Svg";
import EditSvg from "@/src/components/svg/EditSvg";


interface Props {
  row: SeatRow;
  index: number;
  dragHandleProps: any;
  totalRows: number;
  toggleCell: (cellId: string) => void;
  toggleHandicappedSeat: (cellId: string) => void;
  addCellToEnd: (rowId: string) => void;
  copyRow: (rowId: string) => void;

  deleteRow: (id: string) => void;
  deleteTheCell: (cellId: string) => void;
  updateSeatLabel: (cellId: string, newLabel: string) => boolean;
  updateRowLabel: (rowId: string, newLabel: string) => boolean;
  renumerateFromCell: (
    cellId: string,
    step: number,
    selectedIncrement: string,
  ) => string;
  addCellToLeft: (cellId: string) => void;
}

export default function Row({
  index,
  row,
  dragHandleProps,
  totalRows,
  toggleCell,
  deleteRow,
  addCellToEnd,
  deleteTheCell,
  updateSeatLabel,
  updateRowLabel,
  renumerateFromCell,
  addCellToLeft,
  copyRow,
  toggleHandicappedSeat,
}: Props) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [desiredLabel, setDesiredLabel] = useState("");

  const [formError, setFormError] = useState("");

  const handleSave = () => {
    if (desiredLabel.trim() != "") {
      const success = updateRowLabel(row.id, desiredLabel);
      if (!success) {
        setRenameOpen(false);
      } else {
        setFormError("Bu isimde bir sıra zaten bulunmaktadır.");
      }
    } else {
      setFormError("Sıra ismi boş olamaz.");
    }
  };

     const inputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
    if (!renameOpen) return;
  
      inputRef.current?.focus();
      inputRef.current?.select();
  }, [renameOpen]);

  return (
    <div className="flex items-center gap-2 mb-2 select-none">
      <div className="tooltip inline-flex" data-tip="Sırayı Sil">
        <button
          onClick={() => deleteRow(row.id)}
          className="bg-white  dark:bg-zinc-700 p-1 rounded-md hover:bg-red-500! duration-200 transition-colors border border-black"
        >
          <svg
            width="32px"
            height="32px"
            viewBox="0 0 32 32"
            version="1.1"
            className="fill-black dark:fill-white "
            >
            <path d="M30 7.249h-5.598l-3.777-5.665c-0.137-0.202-0.366-0.334-0.625-0.334h-8c-0 0-0.001 0-0.001 0-0.259 0-0.487 0.131-0.621 0.331l-0.002 0.003-3.777 5.665h-5.599c-0.414 0-0.75 0.336-0.75 0.75s0.336 0.75 0.75 0.75v0h3.315l1.938 21.319c0.036 0.384 0.356 0.682 0.747 0.682 0 0 0 0 0.001 0h16c0 0 0.001 0 0.001 0 0.39 0 0.71-0.298 0.745-0.679l0-0.003 1.938-21.319h3.316c0.414 0 0.75-0.336 0.75-0.75s-0.336-0.75-0.75-0.75v0zM12.401 2.75h7.196l2.999 4.499h-13.195zM23.314 29.25h-14.63l-1.863-20.5 18.358-0.001zM11 11.25c-0.414 0-0.75 0.336-0.75 0.75v0 14c0 0.414 0.336 0.75 0.75 0.75s0.75-0.336 0.75-0.75v0-14c-0-0.414-0.336-0.75-0.75-0.75v0zM16 11.25c-0.414 0-0.75 0.336-0.75 0.75v0 14c0 0.414 0.336 0.75 0.75 0.75s0.75-0.336 0.75-0.75v0-14c-0-0.414-0.336-0.75-0.75-0.75v0zM21 11.25c-0.414 0-0.75 0.336-0.75 0.75v0 14c0 0.414 0.336 0.75 0.75 0.75s0.75-0.336 0.75-0.75v0-14c-0-0.414-0.336-0.75-0.75-0.75v0z"></path>
          </svg>
        </button>
      </div>

      {row.type != "empty" ? (<>      <div className="tooltip inline-flex" data-tip="Sıra İsmini Düzenle">
        <button
          onClick={() => {
            setRenameOpen(true);
            setDesiredLabel(row.label);
          }}
          className="bg-white  dark:bg-zinc-700 p-1 rounded-md hover:bg-red-500! duration-200 transition-colors border border-black"

        >
         <EditSvg className="size-9!"/>
        </button>
      </div>
      <div className="tooltip inline-flex" data-tip="Sırayı Kopyala">
        <button
          onClick={() => {copyRow(row.id)}}
          className="bg-white  dark:bg-zinc-700 p-1 rounded-md hover:bg-red-500! duration-200 transition-colors border border-black"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-8 stroke-black dark:stroke-white"
            fill="none"
          >
              <path
                d="M6 11C6 8.17157 6 6.75736 6.87868 5.87868C7.75736 5 9.17157 5 12 5H15C17.8284 5 19.2426 5 20.1213 5.87868C21 6.75736 21 8.17157 21 11V16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H12C9.17157 22 7.75736 22 6.87868 21.1213C6 20.2426 6 18.8284 6 16V11Z"
                strokeWidth="1.5"
              ></path>
              <path
                d="M6 19C4.34315 19 3 17.6569 3 16V10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H15C16.6569 2 18 3.34315 18 5"
                strokeWidth="1.5"
              ></path>
          </svg>
        </button>
      </div>
      </>) : (<><div className="min-w-8 min-h-10"></div> <div className="size-10"></div></>)}



      <div className="tooltip inline-flex" data-tip="Sırayı Taşı">
        <div
          {...dragHandleProps}
          className="hover:bg-red-500 text-black bg-white duration-200 cursor-move font-bold w-20 h-10 flex justify-center items-center border-2 border-gray-500 rounded-md px-4!"
        >
          <div className="min-w-8!">
            
            {row.type != "empty" && <span>{row.label}</span>}
          </div>
   <Drag2Svg/>
        </div>
      </div>

      <div className="grid grid-flow-col gap-1 shrink-0 auto-cols-max ">
        {row.cells.map((cell, i) => (
          <Cell
            key={cell.id}
            cell={cell}
            onToggle={() => toggleCell(cell.id)}
            ID={row.label}
            deleteTheCell={deleteTheCell}
            updateSeatLabel={updateSeatLabel}
            renumerateFromCell={renumerateFromCell}
            addCellToLeft={addCellToLeft}
            toggleHandicappedSeat={toggleHandicappedSeat}
          />
        ))}
        {row.type != "empty" && (
          <>
            <div className="tooltip inline-flex" data-tip="Yeni Hücre">
              <button
                onClick={() => addCellToEnd(row.id)}
                className="w-10 h-10 text-lg border rounded
        flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white"
              >
                +
              </button>
            </div>
          </>
        )}
      </div>

      {renameOpen &&
        createPortal(
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
            <div className="modal-box max-w-56 border">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setRenameOpen(false)}
              >
                ✕
              </button>

              <div className="grid gap-4 mt-5">
                <div className="flex justify-between items-center">
                  <span>Yeni İsim:</span>
                  <input
                    value={desiredLabel}
                    onChange={(e) => setDesiredLabel(e.target.value)}
                    className="w-16 h-6 input rounded-md px-1 border border-gray-500"
                    ref={inputRef}
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
                <div className={" font-bold text-red-500 px-1"}>
                  {formError}
                </div>
              </div>
            </div>

            {/* DARK BACKDROP */}
            <div
              className="modal-backdrop"
              onClick={() => setRenameOpen(false)}
            />
          </dialog>,
          document.body,
        )}
    </div>
  );
}

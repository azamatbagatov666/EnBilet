import type { SeatRow } from "@/src/models/seatMap/SeatRow";
import { Cell } from "./Cell";
import { useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  row: SeatRow;
  index: number;
  dragHandleProps: any;
  totalRows: number;
  toggleCell: (cellId: string) => void;
  toggleHandicappedSeat: (cellId: string) => void;
  addCellToEnd: (rowId: string) => void;

  deleteRow: (id: string) => void;
  deleteTheCell: (cellId: string) => void;
  updateSeatLabel: (cellId: string, newLabel: string) => void;
  updateRowLabel: (rowId: string, newLabel: string) => void;
  renumerateFromCell: (cellId: string, step: number) => void;
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
  toggleHandicappedSeat,

}: Props) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [desiredLabel, setDesiredLabel] = useState("");

  const handleSave = () => {
    if (desiredLabel != "") {
      updateRowLabel(row.id, desiredLabel);
      setRenameOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-2 select-none">
      <div className="tooltip inline-flex" data-tip="Sırayı Sil">
        <button
          onClick={() => deleteRow(row.id)}
          className=" hover:bg-red-500 rounded-md duration-200 border-gray-500 hover:border-black border-2 min-w-8 min-h-10 bg-white"
        >
          <svg
            fill="#000000"
            width="32px"
            height="32px"
            viewBox="0 0 32 32"
            version="1.1"
          >
            <path d="M30 7.249h-5.598l-3.777-5.665c-0.137-0.202-0.366-0.334-0.625-0.334h-8c-0 0-0.001 0-0.001 0-0.259 0-0.487 0.131-0.621 0.331l-0.002 0.003-3.777 5.665h-5.599c-0.414 0-0.75 0.336-0.75 0.75s0.336 0.75 0.75 0.75v0h3.315l1.938 21.319c0.036 0.384 0.356 0.682 0.747 0.682 0 0 0 0 0.001 0h16c0 0 0.001 0 0.001 0 0.39 0 0.71-0.298 0.745-0.679l0-0.003 1.938-21.319h3.316c0.414 0 0.75-0.336 0.75-0.75s-0.336-0.75-0.75-0.75v0zM12.401 2.75h7.196l2.999 4.499h-13.195zM23.314 29.25h-14.63l-1.863-20.5 18.358-0.001zM11 11.25c-0.414 0-0.75 0.336-0.75 0.75v0 14c0 0.414 0.336 0.75 0.75 0.75s0.75-0.336 0.75-0.75v0-14c-0-0.414-0.336-0.75-0.75-0.75v0zM16 11.25c-0.414 0-0.75 0.336-0.75 0.75v0 14c0 0.414 0.336 0.75 0.75 0.75s0.75-0.336 0.75-0.75v0-14c-0-0.414-0.336-0.75-0.75-0.75v0zM21 11.25c-0.414 0-0.75 0.336-0.75 0.75v0 14c0 0.414 0.336 0.75 0.75 0.75s0.75-0.336 0.75-0.75v0-14c-0-0.414-0.336-0.75-0.75-0.75v0z"></path>
          </svg>
        </button>
      </div>

      <div className="tooltip inline-flex" data-tip="Sıra İsmini Düzenle">
        <button
          onClick={() => {
            setRenameOpen(true);
            setDesiredLabel(row.label);
          }}
          className="  hover:bg-red-500 rounded-md duration-200 border-gray-500 hover:border-black border-2 min-w-8 min-h-10 bg-white"
        >
          <svg
            width="32px"
            height="32px"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 3.99997H6C4.89543 3.99997 4 4.8954 4 5.99997V18C4 19.1045 4.89543 20 6 20H18C19.1046 20 20 19.1045 20 18V12M18.4142 8.41417L19.5 7.32842C20.281 6.54737 20.281 5.28104 19.5 4.5C18.7189 3.71895 17.4526 3.71895 16.6715 4.50001L15.5858 5.58575M18.4142 8.41417L12.3779 14.4505C12.0987 14.7297 11.7431 14.9201 11.356 14.9975L8.41422 15.5858L9.00257 12.6441C9.08001 12.2569 9.27032 11.9013 9.54951 11.6221L15.5858 5.58575M18.4142 8.41417L15.5858 5.58575"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="tooltip inline-flex" data-tip="Sırayı Taşı">
        <div
          {...dragHandleProps}
          className="hover:bg-red-500 text-black bg-white duration-200 cursor-move font-bold w-20 h-10 flex justify-center items-center border-2 border-gray-500 rounded-md !px-4"
        >
          <div className="!min-w-8">
            {" "}
            {row.type != "empty" && <span>{row.label}</span>}
          </div>
          <svg className="!min-w-8" viewBox="0 0 512 512">
            <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
          </svg>
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
                    className="w-16 h-6 input rounded-md px-1 border border-gray-500"
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
          </dialog>,
          document.body,
        )}
    </div>
  );
}

import type { SeatRow } from "@/src/models/seatMap/SeatRow";
import { Cell } from "./Cell";
import { useState, useEffect, useRef } from "react";

import DialogModal from "@/src/components/alerts/DialogModal";
import type { seatState } from "@/src/models/seatMap/seatState";
import PriceInput from "@/src/components/forms/PriceInput";


interface Props {
  row: SeatRow;
  eventSeats: Record<string, seatState>;
  onSeatClick: (seatId: string) => void;
  toggleRow: (rowID: SeatRow) => void;
  setRowPrice: (rowID: SeatRow, price: number) => void;
  setSeatPrice: (seatID: string, price: number) => void;
}

export default function Row({
  row,
  eventSeats,
  onSeatClick,
  toggleRow,
  setRowPrice,
  setSeatPrice,
}: Props) {
  const [dialogueOpen, setDialogueOpen] = useState(false);

  const [desiredPrice, setDesiredPrice] = useState("");

  const [formError, setFormError] = useState("");

  const handleSavePrices = () => {
    const price = Number(desiredPrice.replace(",", "."));

    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Lütfen geçerli bir fiyat giriniz.");
      return;
    }
    setRowPrice(row, Number(desiredPrice));
    setDesiredPrice("");
    setDialogueOpen(false);
  };

  const openDialogue = () => {
    setFormError("");
    setDesiredPrice("");
    setDialogueOpen(true);
  };

  return (
    <div className="flex items-center gap-2 mb-2  select-none">
      {row.type != "empty" ? (
        <>
          {" "}
          <div className="tooltip inline-flex">
  <div className="tooltip-content">
    <div className="">Bütün Sırayı Aç/Kapat</div>
  </div>
            <button
              onClick={() => {
                toggleRow(row);
              }}
              className="  hover:bg-red-500 rounded-md duration-200 border-gray-500 hover:border-black border-2 place-items-center min-w-10 min-h-10 bg-white"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-8">
                <path
                  d="M18.364 5.63604C19.9926 7.26472 21 9.51472 21 12C21 16.9706 16.9706 21 12 21C9.51472 21 7.26472 19.9926 5.63604 18.364M18.364 5.63604C16.7353 4.00736 14.4853 3 12 3C7.02944 3 3 7.02944 3 12C3 14.4853 4.00736 16.7353 5.63604 18.364M18.364 5.63604L5.63604 18.364"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </button>
          </div>
          <div
            className="tooltip inline-flex"
            data-tip="Sıraya Toplu Fiyat Gir"
          >
            <button
              onClick={() => {
                openDialogue();
              }}
              className="  hover:bg-red-500 rounded-md duration-200 border-gray-500 hover:border-black border-2 place-items-center min-w-10 min-h-10 bg-white"
            >
              <svg viewBox="0 0 24 24" className="size-8" fill="none">
                <path
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 8c0-1.657-3.134-3-7-3S7 6.343 7 8m14 0v4c0 1.02-1.186 1.92-3 2.462-1.134.34-2.513.538-4 .538s-2.866-.199-4-.538C8.187 13.92 7 13.02 7 12V8m14 0c0 1.02-1.186 1.92-3 2.462-1.134.34-2.513.538-4 .538s-2.866-.199-4-.538C8.187 9.92 7 9.02 7 8"
                ></path>
                <path
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12v4c0 1.02 1.187 1.92 3 2.462 1.134.34 2.513.538 4 .538s2.866-.199 4-.538c1.813-.542 3-1.442 3-2.462v-1M3 12c0-1.197 1.635-2.23 4-2.711M3 12c0 1.02 1.187 1.92 3 2.462 1.134.34 2.513.538 4 .538.695 0 1.366-.043 2-.124"
                ></path>
              </svg>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="size-10"></div> <div className="size-10"></div>
        </>
      )}

      <div className="tooltip inline-flex" data-tip="Sıra İsmi">
        <div className=" text-black bg-white duration-200 font-bold h-10 flex w-10 text-2xl justify-center items-center border-2 border-gray-500 rounded-md px-4!">
          {row.type != "empty" && <span>{row.label}</span>}
        </div>
      </div>

      <div className="grid grid-flow-col gap-1 shrink-0 auto-cols-max">
        {row.cells.map((cell) => {
          const seatState =
            cell.type === "seat" ? eventSeats[cell.id] : undefined;

          return (
            <Cell
              key={cell.id}
              cell={cell}
              rowLabel={row.label}
              seatState={seatState}
              setSeatPrice={setSeatPrice}
              onClick={
                cell.type === "seat" ? () => onSeatClick(cell.id) : undefined
              }
            />
          );
        })}
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
    </div>
  );
}

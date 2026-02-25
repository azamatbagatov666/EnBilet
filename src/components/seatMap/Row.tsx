import type { SeatRow } from "@/src/models/seatMap/SeatRow";
import { Cell } from "./Cell";
import { useState } from "react";

interface Props {
  row: SeatRow;
  index: number;
  dragHandleProps: any;
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
  row,
  dragHandleProps,
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
if(desiredLabel!=""){
            updateRowLabel(row.id, desiredLabel)
            setRenameOpen(false);}
          
    };

  
  return (
    <div 

    
    className="flex items-center gap-2 mb-2 select-none">

      <div className="tooltip inline-flex" data-tip="Sırayı Sil">
                    <button
        onClick={() => deleteRow(row.id)}
        className=" hover:bg-red-500 rounded-md duration-200 border-gray-500 hover:border-black border-2 min-w-8 min-h-10 bg-white"
      >
                             <img draggable={false}
                        src={`/account/images/trash.png`}
                        alt="Sırayı Sil Butonu"
                        className="size-8"
                      />
      </button>

</div>

      <div className="tooltip inline-flex" data-tip="Sıra İsmini Düzenle">
                          <button
        onClick={() => {setRenameOpen(true)
          setDesiredLabel(row.label);

        }}
        className="  hover:bg-red-500 rounded-md duration-200 border-gray-500 hover:border-black border-2 min-w-8 min-h-10 bg-white"
      >
                             <img draggable={false}
                        src={`/account/images/edit2.png`}
                        alt="Sırayı Yeniden Adlandır Butonu"
                        className="size-8"
                      />
      </button>
</div>

      <div className="tooltip inline-flex" data-tip="Sırayı Taşı">

      <div {...dragHandleProps} className="hover:bg-red-500 text-black bg-white duration-200 cursor-move font-bold w-20 h-10 flex justify-center items-center border-2 border-gray-500 rounded-md !px-4">
<div className="!min-w-8">        {row.type != "empty" && <span>{row.label}</span>}</div>

          <svg className="!min-w-8"
    viewBox="0 0 512 512">
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
            ID = {row.label}
              deleteTheCell={deleteTheCell}
              updateSeatLabel={updateSeatLabel}
              renumerateFromCell={renumerateFromCell}
              addCellToLeft={addCellToLeft}
              toggleHandicappedSeat={toggleHandicappedSeat}


          />
        ))}
        {row.type != "empty" && <>
        <div className="tooltip inline-flex" data-tip="Yeni Hücre">
           <button onClick={() => addCellToEnd(row.id)} className="w-10 h-10 text-lg border rounded
        flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white" >+</button>
</div>
       </>}
      

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
        if (e.key === "Enter")
            handleSave();
        }}
          />
        </div>

        <button
          className="btn btn-accent h-8"

                    onClick={() => { handleSave();
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



    </div>
  );
}

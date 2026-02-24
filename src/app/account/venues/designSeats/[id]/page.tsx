"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import useSeatMapCreator from "@/src/hooks/useSeatMapCreator";
import Row from "@/src/components/seatMap/Row";
import { useState } from "react";

export default function SeatMapCreatorPage() {
  const {
    rows,
    addEmptyRow,
    addSeatedRow,
    deleteRow,
    toggleCell,
    handleOnDragEnd,
    addCellToEnd,
    saveMap,
    deleteTheCell,
    updateSeatLabel,
    updateRowLabel,
    renumerateFromCell,
    addCellToLeft,
  } = useSeatMapCreator();

  const [numberOfSeats, SetNumberOfSeats] = useState<number>(12);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Seat Map Creator</h1>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="rows" direction="vertical">
          {(provided) => (
            <div
              onContextMenu={(e) => {
                e.preventDefault();
              }}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {rows.map((row, index) => (
                <Draggable key={row.id} draggableId={row.id} index={index}>
                  {(provided) => (
                    <div
                      className="flex"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <Row
                        row={row}
                        index={index}
                        dragHandleProps={provided.dragHandleProps}
                        toggleCell={toggleCell}
                        deleteRow={deleteRow}
                        addCellToEnd={addCellToEnd}
                        deleteTheCell={deleteTheCell}
                        updateSeatLabel={updateSeatLabel}
                        updateRowLabel={updateRowLabel}
                        renumerateFromCell={renumerateFromCell}
                        addCellToLeft={addCellToLeft}
                      />
                    </div>
                  )}
                </Draggable>
                
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      

      <div className="mt-4 flex gap-2">
        <div className="flex group bg-[#4a00ff] hover:bg-[#3f00e7] duration-200 rounded-md">
          <div className=" px-2 rounded-l-md flex  items-center ">
            <input
              type="number"
              value={numberOfSeats}
              onChange={(e) => SetNumberOfSeats(+e.target.value)}
              max={50}
              min={1}
              className="w-10 h-6 text-black rounded-md px-1"
              name=""
              id=""
            />
          </div>
          <button
            onClick={() => addSeatedRow(numberOfSeats)}
            className="btn btn-primary rounded-l-none group-hover:bg-[#3f00e7] outline-none"
          >
            + Koltuklu Sıra
          </button>
        </div>
        <button onClick={addEmptyRow} className="btn btn-secondary">
          + Boş Sıra
        </button>
        <button onClick={saveMap} className="btn btn-success text-white">
          Kaydet
        </button>
      </div>
    </div>
  );
}
